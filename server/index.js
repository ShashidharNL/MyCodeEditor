const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Multer configuration for file uploads
const upload = multer({ dest: "uploads/" });

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Endpoint to run code directly from the editor
app.post("/run", (req, res) => {
  const { language, code } = req.body;

  if (!code || !language) {
    return res.status(400).json({ output: "Code or language not provided." });
  }

  if (language === "python") {
    // Write Python code to a temporary file
    const tempFilePath = path.join(__dirname, "temp_code.py");
    fs.writeFileSync(tempFilePath, code);

    // Execute the Python script
    exec(`python ${tempFilePath}`, (error, stdout, stderr) => {
      fs.unlinkSync(tempFilePath); // Clean up temp file
      if (error) {
        return res.json({ output: stderr });
      }
      res.json({ output: stdout });
    });
  } else if (language === "javascript") {
    // Execute JavaScript code using Node.js
    const command = `node -e "${code
      .replace(/"/g, '\\"')
      .replace(/\n/g, " ")}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.json({ output: stderr });
      }
      res.json({ output: stdout });
    });
  } else {
    res.status(400).json({ output: "Unsupported language." });
  }
});

// Endpoint to upload and run a file
app.post("/run-file", upload.single("file"), (req, res) => {
  const { file } = req;
  const { language } = req.body;

  if (!file || !language) {
    return res.status(400).json({ output: "File or language not provided." });
  }

  const filePath = file.path; // Path to the uploaded file
  let command = "";

  if (language === "python") {
    command = `python ${filePath}`;
  } else if (language === "javascript") {
    command = `node ${filePath}`;
  } else {
    return res.status(400).json({ output: "Unsupported language." });
  }

  // Execute the uploaded file
  exec(command, (error, stdout, stderr) => {
    fs.unlinkSync(filePath); // Delete the uploaded file after execution
    if (error) {
      return res.json({ output: stderr });
    }
    res.json({ output: stdout });
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
