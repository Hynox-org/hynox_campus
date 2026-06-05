const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getTempDir() {
  return path.resolve("scratch", "submissions");
}

function ensureTempDir() {
  const tempDir = getTempDir();
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
}

function checkSecurityViolation(language, sourceCode) {
  const normCode = sourceCode.replace(/\s+/g, "");
  
  if (language === "javascript" || language === "typescript") {
    const forbiddenKeywords = ["child_process", "cluster", "process.exit", "eval", "Function(", "globalThis.process"];
    for (const pat of forbiddenKeywords) {
      if (sourceCode.includes(pat) || normCode.includes(pat.replace(/\s+/g, ""))) {
        return `Security violation: Use of forbidden keyword or library "${pat}" is blocked.`;
      }
    }

    const requireMatches = sourceCode.match(/require\s*\(([^)]+)\)/g);
    if (requireMatches) {
      for (const match of requireMatches) {
        const arg = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')')).trim().replace(/['"]/g, '');
        if (arg !== 'fs' && arg !== 'node:fs' && arg !== 'readline' && arg !== 'node:readline') {
          return `Security violation: Importing module "${arg}" is blocked. Only "fs" and "readline" imports are allowed.`;
        }
      }
    }

    const importMatches = sourceCode.match(/import\s+[^;]+;?/g);
    if (importMatches) {
      for (const match of importMatches) {
        const hasFs = match.includes("'fs'") || match.includes('"fs"') || match.includes("'node:fs'") || match.includes('"node:fs"');
        const hasReadline = match.includes("'readline'") || match.includes('"readline"') || match.includes("'node:readline'") || match.includes('"node:readline"');
        if (!hasFs && !hasReadline) {
          return `Security violation: Import statement "${match.trim()}" is blocked. Only "fs" and "readline" imports are allowed.`;
        }
      }
    }

    const blockedMethods = [".write", ".unlink", ".rm", ".mkdir", ".rename", ".append", ".createWriteStream", ".chmod", ".chown", ".copy"];
    for (const method of blockedMethods) {
      if (sourceCode.includes(method)) {
        return `Security violation: Calling file system modification method "${method}" is blocked.`;
      }
    }

    const readMatches = sourceCode.match(/(readFileSync|readFile|createReadStream)\s*\(([^)]+)\)/g);
    if (readMatches) {
      for (const match of readMatches) {
        const args = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')')).trim();
        const firstArg = args.split(',')[0].trim().replace(/['"]/g, '');
        if (firstArg !== '0' && firstArg !== '/dev/stdin' && firstArg !== 'process.stdin.fd') {
          return `Security violation: Reading from custom file path "${firstArg}" is blocked. Only standard input reading (0 or /dev/stdin) is allowed.`;
        }
      }
    }
  } else if (language === "python") {
    const forbiddenKeywords = ["os.system", "subprocess", "shutil", "eval", "exec", "__import__"];
    for (const pat of forbiddenKeywords) {
      if (sourceCode.includes(pat) || normCode.includes(pat.replace(/\s+/g, ""))) {
        return `Security violation: Use of forbidden keyword or library "${pat}" is blocked.`;
      }
    }

    const openMatches = sourceCode.match(/open\s*\(([^)]+)\)/g);
    if (openMatches) {
      for (const match of openMatches) {
        const args = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')')).trim().replace(/['"]/g, '');
        const firstArg = args.split(',')[0].trim();
        if (firstArg !== '0' && firstArg !== '/dev/stdin') {
          return `Security violation: File open operation on path "${firstArg}" is blocked. Only reading standard input (0 or /dev/stdin) is allowed.`;
        }
      }
    }

    const pyImportMatches = sourceCode.match(/(import|from)\s+(\w+)/g);
    if (pyImportMatches) {
      for (const match of pyImportMatches) {
        const parts = match.trim().split(/\s+/);
        const importedModule = parts[1];
        if (importedModule !== 'sys' && importedModule !== 'math' && importedModule !== 'collections' && importedModule !== 'bisect' && importedModule !== 'heapq' && importedModule !== 'json') {
          return `Security violation: Importing module "${importedModule}" is blocked.`;
        }
      }
    }
  } else if (language === "java") {
    const forbidden = ["Runtime.getRuntime", "ProcessBuilder", "System.exit", "java.nio.file", "java.io.File"];
    for (const pat of forbidden) {
      if (sourceCode.includes(pat) || normCode.includes(pat.replace(/\s+/g, ""))) {
        return `Security violation: Use of forbidden keyword or library "${pat}" is blocked.`;
      }
    }
  }
  return null;
}

async function runPistonCode(language, sourceCode, inputData, timeLimitMs = 2000) {
  let pistonLang = language;
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLang,
        version: "*",
        files: [{ content: sourceCode }],
        stdin: inputData,
        run_timeout: timeLimitMs,
        compile_timeout: 10000
      })
    });

    if (!response.ok) {
      throw new Error(`Piston API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.compile && data.compile.code !== 0) {
      return {
        stdout: data.compile.stdout || "",
        stderr: data.compile.stderr || data.compile.output || "",
        executionTimeMs: 0,
        status: "compile_error"
      };
    }

    const runInfo = data.run || {};
    if (runInfo.signal === "SIGKILL" || runInfo.signal === "SIGTERM" || runInfo.output?.includes("SIGKILL") || runInfo.output?.includes("SIGTERM")) {
      return {
        stdout: "",
        stderr: "Time Limit Exceeded",
        executionTimeMs: timeLimitMs,
        status: "timeout"
      };
    }

    if (runInfo.code !== 0) {
      return {
        stdout: runInfo.stdout || "",
        stderr: runInfo.stderr || runInfo.output || "",
        executionTimeMs: 0,
        status: "runtime_error"
      };
    }

    return {
      stdout: runInfo.stdout || "",
      stderr: runInfo.stderr || "",
      executionTimeMs: 50,
      status: "success"
    };

  } catch (error) {
    return {
      stdout: "",
      stderr: `Execution sandbox error: Compiler not found and Piston API was unreachable. Error: ${error.message}`,
      executionTimeMs: 0,
      status: "compile_error"
    };
  }
}

async function runLocalCodeAsync(language, sourceCode, inputData, timeLimitMs = 2000) {
  const securityMsg = checkSecurityViolation(language, sourceCode);
  if (securityMsg) {
    return {
      stdout: "",
      stderr: securityMsg,
      executionTimeMs: 0,
      status: "security_violation"
    };
  }

  ensureTempDir();
  const fileId = Math.random().toString(36).substring(7);

  if (language === "java") {
    const classMatch = sourceCode.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : "Main";
    const tempDir = getTempDir();
    const javaSubDir = path.join(tempDir, `java_${fileId}`);
    fs.mkdirSync(javaSubDir, { recursive: true });
    const javaFile = path.join(javaSubDir, `${className}.java`);
    
    fs.writeFileSync(javaFile, sourceCode, "utf-8");
    
    const compileStart = Date.now();
    const compileResult = spawnSync("javac", [javaFile], {
      encoding: "utf-8",
      shell: true
    });
    
    if (compileResult.status !== 0) {
      try { fs.rmSync(javaSubDir, { recursive: true, force: true }); } catch (e) {}
      return {
        stdout: compileResult.stdout || "",
        stderr: compileResult.stderr || "Java Compilation Failed",
        executionTimeMs: Date.now() - compileStart,
        status: "compile_error"
      };
    }
    
    const runStart = Date.now();
    const runResult = spawnSync("java", ["-cp", javaSubDir, className], {
      input: inputData,
      timeout: timeLimitMs,
      encoding: "utf-8",
      shell: true
    });
    const executionTimeMs = Date.now() - runStart;
    
    try { fs.rmSync(javaSubDir, { recursive: true, force: true }); } catch (e) {}
    
    if (runResult.error && runResult.error.code === "ETIMEDOUT") {
      return { stdout: "", stderr: "Time Limit Exceeded", executionTimeMs, status: "timeout" };
    }
    
    if (runResult.status !== 0) {
      return {
        stdout: runResult.stdout || "",
        stderr: runResult.stderr || "",
        executionTimeMs,
        status: "runtime_error"
      };
    }
    
    return {
      stdout: runResult.stdout || "",
      stderr: runResult.stderr || "",
      executionTimeMs,
      status: "success"
    };
  } else if (language === "c" || language === "cpp") {
    const tempDir = getTempDir();
    const cSubDir = path.join(tempDir, `c_${fileId}`);
    fs.mkdirSync(cSubDir, { recursive: true });
    
    const fileExt = language === "c" ? "c" : "cpp";
    const srcFile = path.join(cSubDir, `solution.${fileExt}`);
    const binFile = path.join(cSubDir, `solution.exe`);
    
    fs.writeFileSync(srcFile, sourceCode, "utf-8");
    const compilerCmd = language === "c" ? "gcc" : "g++";
    
    const wingetCompilerPath = "C:\\Users\\Akshaykumar\\AppData\\Local\\Microsoft\\WinGet\\Packages\\MartinStorsjo.LLVM-MinGW.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\\llvm-mingw-20260602-ucrt-x86_64\\bin";
    const runEnv = { ...process.env };
    if (fs.existsSync(wingetCompilerPath)) {
      runEnv.PATH = `${wingetCompilerPath};${runEnv.PATH || ""}`;
    }

    const checkCompiler = spawnSync(compilerCmd, ["--version"], { 
      env: runEnv,
      shell: true 
    });
    
    if (checkCompiler.status !== 0) {
      try { fs.rmSync(cSubDir, { recursive: true, force: true }); } catch (e) {}
      return runPistonCode(language, sourceCode, inputData, timeLimitMs);
    }
    
    const compileStart = Date.now();
    const compileResult = spawnSync(compilerCmd, [srcFile, "-o", binFile], {
      env: runEnv,
      encoding: "utf-8",
      shell: true
    });
    
    if (compileResult.status !== 0) {
      try { fs.rmSync(cSubDir, { recursive: true, force: true }); } catch (e) {}
      return {
        stdout: compileResult.stdout || "",
        stderr: compileResult.stderr || "C/C++ Compilation Failed",
        executionTimeMs: Date.now() - compileStart,
        status: "compile_error"
      };
    }
    
    const runStart = Date.now();
    const runResult = spawnSync(binFile, [], {
      input: inputData,
      timeout: timeLimitMs,
      env: runEnv,
      encoding: "utf-8",
      shell: true
    });
    const executionTimeMs = Date.now() - runStart;
    
    try { fs.rmSync(cSubDir, { recursive: true, force: true }); } catch (e) {}
    
    if (runResult.error && runResult.error.code === "ETIMEDOUT") {
      return { stdout: "", stderr: "Time Limit Exceeded", executionTimeMs, status: "timeout" };
    }
    
    if (runResult.status !== 0) {
      return {
        stdout: runResult.stdout || "",
        stderr: runResult.stderr || "",
        executionTimeMs,
        status: "runtime_error"
      };
    }
    
    return {
      stdout: runResult.stdout || "",
      stderr: runResult.stderr || "",
      executionTimeMs,
      status: "success"
    };
  }

  let fileExt = "";
  if (language === "javascript") fileExt = "js";
  else if (language === "typescript") fileExt = "ts";
  else if (language === "python") fileExt = "py";

  if (!fileExt) {
    return { stdout: "", stderr: "Unsupported language", executionTimeMs: 0, status: "compile_error" };
  }

  const fileName = `submission_${fileId}.${fileExt}`;
  const tempDir = getTempDir();
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, sourceCode, "utf-8");

  let cmd = "";
  let args = [];

  if (language === "javascript") {
    cmd = "node";
    args = [filePath];
  } else if (language === "typescript") {
    cmd = "node";
    const localTsNode = path.resolve("node_modules", "ts-node", "dist", "bin.js");
    args = [localTsNode, "--transpile-only", filePath];
  } else if (language === "python") {
    cmd = "python";
    args = [filePath];
  }

  const startTime = Date.now();
  const result = spawnSync(cmd, args, {
    input: inputData,
    timeout: timeLimitMs,
    encoding: "utf-8",
    shell: true
  });
  const executionTimeMs = Date.now() - startTime;

  try { fs.unlinkSync(filePath); } catch (e) {}

  if (result.error && result.error.code === "ETIMEDOUT") {
    return { stdout: "", stderr: "Time Limit Exceeded", executionTimeMs, status: "timeout" };
  }

  if (result.status !== 0) {
    const isCompileError = result.stderr?.includes("SyntaxError") || result.stderr?.includes("Unable to compile");
    return {
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      executionTimeMs,
      status: isCompileError ? "compile_error" : "runtime_error"
    };
  }

  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    executionTimeMs,
    status: "success"
  };
}

async function runTest(testName, lang, code, input) {
  console.log(`\n==================================================`);
  console.log(`TEST: ${testName} (${lang})`);
  console.log(`==================================================`);
  const result = await runLocalCodeAsync(lang, code, input, 10000);
  console.log(`Status: ${result.status}`);
  console.log(`Execution Time: ${result.executionTimeMs}ms`);
  if (result.stdout) console.log(`Stdout: "${result.stdout.trim()}"`);
  if (result.stderr) console.log(`Stderr/Error: "${result.stderr.trim()}"`);
}

async function start() {
  // 1. Python tests
  await runTest(
    "Python: Accepted Sum",
    "python",
    "import sys\nline = sys.stdin.read().strip()\na, b = map(int, line.split())\nprint(a + b)",
    "5 7"
  );
  await runTest(
    "Python: Wrong Answer",
    "python",
    "print(999)",
    "5 7"
  );
  await runTest(
    "Python: Runtime Error (Zero Division)",
    "python",
    "print(1 / 0)",
    ""
  );
  await runTest(
    "Python: Security Violation (import os)",
    "python",
    "import os\nos.system('echo hi')",
    ""
  );

  // 2. Java tests
  await runTest(
    "Java: Accepted Sum",
    "java",
    "import java.util.Scanner;\npublic class Adder {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(a + b);\n  }\n}",
    "10 20"
  );
  await runTest(
    "Java: Compile Error (missing semicolon)",
    "java",
    "public class ErrorClass {\n  public static void main(String[] args) {\n    System.out.println(42)\n  }\n}",
    ""
  );
  await runTest(
    "Java: Security Violation (File import)",
    "java",
    "import java.io.File;\npublic class SecurityTest {\n  public static void main(String[] args) {}\n}",
    ""
  );

  // 3. C tests (via Piston since local GCC is missing)
  await runTest(
    "C: Accepted Sum",
    "c",
    "#include <stdio.h>\nint main() {\n  int a, b;\n  if (scanf(\"%d %d\", &a, &b) == 2) {\n    printf(\"%d\", a + b);\n  }\n  return 0;\n}",
    "12 13"
  );
  await runTest(
    "C: Compile Error",
    "c",
    "#include <stdio.h>\nint main() {\n  printf(\"hello\")\n}",
    ""
  );

  // 4. C++ tests (via Piston since local G++ is missing)
  await runTest(
    "C++: Accepted Sum",
    "cpp",
    "#include <iostream>\nusing namespace std;\nint main() {\n  int a, b;\n  cin >> a >> b;\n  cout << (a + b);\n  return 0;\n}",
    "30 40"
  );

  // 5. JavaScript tests
  await runTest(
    "JavaScript: Accepted Sum",
    "javascript",
    "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst [a, b] = input.split(/\\s+/).map(Number);\nconsole.log(a + b);",
    "40 50"
  );
  await runTest(
    "JavaScript: Security Violation (child_process)",
    "javascript",
    "const child = require('child_process');\nchild.execSync('dir');",
    ""
  );

  // 6. TypeScript tests
  await runTest(
    "TypeScript: Accepted Sum",
    "typescript",
    "import * as fs from 'fs';\nconst input: string = fs.readFileSync(0, 'utf-8').trim();\nconst [a, b]: number[] = input.split(/\\s+/).map(Number);\nconsole.log(a + b);",
    "100 200"
  );
}

start().catch(console.error);
