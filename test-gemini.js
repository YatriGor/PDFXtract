const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const api = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(api);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const prompt = "Explain how AI works";

async function generateResponse() {
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    console.log(result.response.text());
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

// Call the async function
generateResponse();
