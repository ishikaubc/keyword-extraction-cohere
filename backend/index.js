import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
import pdf from "pdf-parse-new";
import fileUpload from "express-fileupload";

dotenv.config();
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const app = express();
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, 
    abortOnLimit: true,
  })
);
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// Default route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Extract keywords from plain text
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

    if (
      response.generations &&
      Array.isArray(response.generations) &&
      response.generations.length > 0
    ) {
      const rawText = response.generations[0].text.trim();
      const keywords = rawText
        .split("\n")
        .map((line) => line.replace(/^-/, "").trim())
        .filter(Boolean);

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


app.post("/upload-resume", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    console.log("Uploaded File Details:", file);

    let text = "";

    if (file.mimetype === "application/pdf") {
      console.log("Processing PDF file...");
      const pdfData = await pdf(file.data); 
      text = pdfData.text;
      console.log("Extracted Text from PDF:", text);
    } else if (file.mimetype === "text/plain") {
      console.log("Processing plain text file...");
      text = file.data.toString();
    } else {
      console.error("Unsupported file format:", file.mimetype);
      return res.status(400).json({ error: "Unsupported file format" });
    }

    const response = await cohere.generate({
      model: "command-xlarge-nightly",
      prompt: `Extract key skills from the following resume text:\n"${text}"\n\nSkills:`,
      max_tokens: 100,
      temperature: 0.5,
    });

    console.log("Cohere API Response:", response);

    const rawText = response.generations[0]?.text.trim();
    const skills = rawText
      .split("\n")
      .map((line) => line.replace(/^-/, "").trim())
      .filter(Boolean);

    console.log("Extracted Skills:", skills);
    res.json({ skills });
  } catch (error) {
    console.error("Error processing resume:", error);
    res.status(500).json({ error: "Failed to process resume" });
  }
});
app.post("/upload-job-description", async (req, res) => {
  const { text } = req.body;
  try {
    const response = await cohere.generate({
      model: "command-xlarge-nightly",
      prompt: `Extract required skills and keywords from the following job description:\n"${text}"\n\nSkills:`,
      max_tokens: 50,
      temperature: 0.7,
    });

    const rawText = response.generations[0].text.trim();
    const keywords = rawText.split("\n").map((line) => line.trim());
    res.json({ keywords });
  } catch (error) {
    console.error("Error processing job description:", error);
    res.status(500).json({ error: "Failed to process job description" });
  }
});


app.post("/compare-skills", (req, res) => {
  const { resumeSkills, jobDescSkills } = req.body;

  const normalizeSkills = (skills) =>
    skills.map((skill) => skill.trim().toLowerCase());

  const normalizedResumeSkills = normalizeSkills(resumeSkills);
  const normalizedJobDescSkills = normalizeSkills(jobDescSkills);

  
  const matchedSkills = normalizedJobDescSkills.filter((skill) =>
    normalizedResumeSkills.some(
      (resumeSkill) =>
        resumeSkill.includes(skill) || skill.includes(resumeSkill)
    )
  );
  const missingSkills = normalizedJobDescSkills.filter(
    (skill) => !matchedSkills.includes(skill)
  );


  const matchScore =
    (matchedSkills.length / normalizedJobDescSkills.length) * 100;

  res.json({ matchedSkills, missingSkills, matchScore });
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);

