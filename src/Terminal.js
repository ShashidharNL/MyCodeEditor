import React from "react";

const Terminal = ({ output }) => {
  return (
    <div
      className="bg-gray-800 text-white p-4 overflow-y-auto border-t border-gray-700"
      style={{
        height: "150px",
        resize: "vertical",
        minHeight: "100px",
        maxHeight: "400px",
      }}
    >
      <h3 className="text-sm font-bold mb-2">Terminal</h3>
      <pre className="text-xs whitespace-pre-wrap">{output}</pre>
    </div>
  );
};

export default Terminal;
