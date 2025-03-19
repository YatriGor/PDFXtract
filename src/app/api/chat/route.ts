import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, GoogleGenerativeAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Ensure Node.js runtime for compatibility

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    // Retrieve chat details from DB
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];

    // Retrieve context from embeddings
    const context = await getContext(lastMessage.content, fileKey);
    console.log("Retrieved Context:", context); // Debugging log

    // Handle case when no relevant context is found
    const contextMessage = context
      ? `Use the following retrieved context to answer the question accurately:\n\n${context}`
      : `There is no retrieved context available. Answer based only on known information.`;

    // Prepare messages for Gemini 2.0 Flash
    const geminiMessages = [
      {
        role: "user",
        parts: [{ text: `${contextMessage}\n\nUser: ${lastMessage.content}` }],
      },
      ...messages
        .filter((msg: Message) => msg.role === "user")
        .map((msg: Message) => ({
          role: "user",
          parts: [{ text: msg.content }],
        })),
    ];

    // Initialize Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Stream response from Gemini
    const responseStream = await model.generateContentStream({
      contents: geminiMessages,
    });

    // Handle streaming response via Vercel AI SDK
    const stream = GoogleGenerativeAIStream(responseStream, {
      onStart: async () => {
        // Save user message to DB
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
      },
      onCompletion: async (completion) => {
        // Save AI response to DB
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: "system",
        });
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in Gemini chat completion:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
