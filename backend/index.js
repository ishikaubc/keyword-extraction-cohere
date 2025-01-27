import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: "MGZcYg81CW3lCcr7JptECr8YC6TVQsmDN3lFyUAS", // Replace with your actual API key
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post("/extract-keywords", async (req, res) => {
  const { text } = req.body;

  try {
    console.log("Request Text:", text);

    const response = await cohere.generate({
      model: "command-xlarge-nightly",
      prompt: `Extract keywords from the following text:\n"${text}"\n\nKeywords:`,
      max_tokens: 50,
      temperature: 0.7,
    });

    console.log("Raw Response:", response);

    // Check if generations exist in the response
    if (
      response.generations &&
      Array.isArray(response.generations) &&
      response.generations.length > 0
    ) {
      const rawText = response.generations[0].text.trim();
      const keywords = rawText
        .split("\n") // Split by lines
        .map(line => line.replace(/^-/, "").trim()) // Remove dashes and trim spaces
        .filter(Boolean); // Remove empty lines

      console.log("Extracted Keywords:", keywords);
      res.json({ keywords });
    } else {
      console.error("Unexpected response structure:", response);
      throw new Error("API response structure is not as expected");
    }
  } catch (error) {
    console.error("Error extracting keywords:", error);
    res.status(500).json({ error: "Failed to extract keywords" });
  }
});


const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
