import { runLocalCodeAsync } from "../src/services/runner";

async function runTest(testName: string, lang: string, code: string, input: string) {
  console.log(`\n==================================================`);
  console.log(`TEST: ${testName} (${lang})`);
  console.log(`==================================================`);
  const result = await runLocalCodeAsync(lang, code, input, 2000);
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
}

start().catch(console.error);
