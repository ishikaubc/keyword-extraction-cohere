import { useState } from "react";
import axios from "axios";

const App = () => {
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState([]);

  // Extract keywords from the text
  const extractKeywords = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/extract-keywords",
        { text }
      );
      setKeywords(response.data.keywords); // Set keywords as an array
    } catch (error) {
      console.error("Error extracting keywords:", error);
    }
  };

  // Download extracted keywords as a file
  const downloadKeywords = () => {
    const element = document.createElement("a");
    const file = new Blob([keywords.join(", ")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "keywords.txt";
    document.body.appendChild(element);
    element.click();
  };

  // Highlight extracted keywords in the text
  const getHighlightedText = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text;

    const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      keywords.includes(part) ? (
        <span
          key={index}
          style={{
            backgroundColor: "#FFD700", 
            color: "#000", 
            fontWeight: "bold",
            padding: "0.2rem",
            borderRadius: "5px",
            margin: "0 0.2rem",
            display: "inline-block",
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text(); 
      setText(text); 
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Keyword Extraction Tool</h1>

      {/* Text Input Area */}
      <textarea
        rows="6"
        cols="50"
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: "1rem", padding: "1rem" }}
      />
      <br />

      {/* File Upload */}
      <input
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
        style={{ marginBottom: "1rem" }}
      />
      <br />

      {/* Extract Keywords Button */}
      <button
        onClick={extractKeywords}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          marginRight: "1rem",
        }}
      >
        Extract Keywords
      </button>

      {/* Download Keywords Button */}
      <button
        onClick={downloadKeywords}
        style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
      >
        Download Keywords
      </button>

      {/* Extracted Keywords Display */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Extracted Keywords:</h3>
        <ul>
          {keywords.map((keyword, index) => (
            <li key={index}>{keyword}</li>
          ))}
        </ul>
      </div>

      {/* Highlighted Text Display */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Highlighted Text:</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {getHighlightedText(text, keywords)}
        </p>
      </div>
    </div>
  );
};

export default App;


