import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [text, setText] = useState('');
  const [keywords, setKeywords] = useState('');

  const extractKeywords = async () => {
    try {
      const response = await axios.post('http://localhost:3001/extract-keywords', { text });
      setKeywords(response.data.keywords);
    } catch (error) {
      console.error('Error extracting keywords:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Keyword Extraction Tool</h1>
      <textarea
        rows="6"
        cols="50"
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: '1rem', padding: '1rem' }}
      />
      <br />
      <button onClick={extractKeywords} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
        Extract Keywords
      </button>
      <div style={{ marginTop: '2rem' }}>
        <h3>Extracted Keywords:</h3>
        <p>{keywords}</p>
      </div>
    </div>
  );
};

export default App;
