async function run() {
  try {
    const payload = {
      language: "c",
      version: "*",
      files: [{ content: "#include <stdio.h>\nint main() { printf(\"hello\"); return 0; }" }]
    };
    
    console.log("Sending payload to Piston API...");
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Raw Response:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
