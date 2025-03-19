import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function getEmbeddings(text: string, retries = 3): Promise<number[]> {
  try {
    console.log("Requesting embedding for:", text);

    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    // Corrected: Pass text as an array
    const response = await model.embedContent([text.replace(/\n/g, " ")]);

    if (!response || !response.embedding) {
      throw new Error("Invalid response format from Gemini API");
    }

    return response.embedding.values as number[];
  } catch (error) {
    if (retries > 0) {
      console.warn(`Error occurred, retrying...`);
      return getEmbeddings(text, retries - 1);
    }
    console.error("Error calling Gemini embeddings API:", error);
    throw error;
  }
}
