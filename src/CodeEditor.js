import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import Terminal from "./Terminal";

const CodeEditor = () => {
  const [code, setCode] = useState(""); // Editor content
  const [theme, setTheme] = useState("vs-dark");
  const [output, setOutput] = useState(""); // Terminal output
  const [language, setLanguage] = useState("javascript"); // Selected language

  // Toggle Editor Theme
  const toggleTheme = () => {
    setTheme(theme === "vs-dark" ? "light" : "vs-dark");
  };

  // Update Editor Code
  const handleEditorChange = (value) => {
    setCode(value);
  };

  // Run Code from Editor
  const runCode = async () => {
    try {
      const response = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const result = await response.json();
      setOutput(result.output);
    } catch (error) {
      setOutput(
        "Error: Unable to run the code. Please check your backend server."
      );
    }
  };

  // Save File Locally
  const saveFile = () => {
    const blob = new Blob([code], {
      type: "text/plain;charset=utf-8",
    });
    const fileExtension = language === "python" ? ".py" : ".js";
    const fileName = `code${fileExtension}`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Handle File Upload and Display in Editor
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (!file) {
      setOutput("No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result; // Read file content
      setCode(fileContent); // Display file content in the editor
    };
    reader.readAsText(file); // Read the file as text
  };

  // Handle Language Change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-900 text-white p-3 flex items-center space-x-4">
        <button onClick={toggleTheme} className="bg-gray-700 px-4 py-2 rounded">
          Toggle Theme
        </button>
        <select
          onChange={handleLanguageChange}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button
          onClick={runCode}
          className="bg-green-600 px-4 py-2 rounded text-white"
        >
          Run Code
        </button>
        <button
          onClick={saveFile}
          className="bg-blue-600 px-4 py-2 rounded text-white"
        >
          Save File
        </button>
        <input
          type="file"
          onChange={handleFileUpload}
          className="bg-gray-700 px-4 py-2 rounded text-white"
        />
      </div>

      {/* Code Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={code} // Show the current code in the editor
          onChange={handleEditorChange}
        />
      </div>

      {/* Terminal */}
      <Terminal output={output} />
    </div>
  );
};

export default CodeEditor;
