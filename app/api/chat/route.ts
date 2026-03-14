/**
 * POST /api/chat
 *
 * Accepts a conversation history, enriches the system prompt with live
 * resort condition data, and returns a Gemini-generated reply.
 *
 * Body: { messages: Array<{ role: "user" | "model"; content: string }> }
 * Response: { reply: string } | { error: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { buildResortContextString } from "@/lib/chat/resortContext";

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
});

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[chat] GEMINI_API_KEY not set");
    return NextResponse.json(
      { error: "AI service not configured. Please add GEMINI_API_KEY to your environment." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request format.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { messages } = parsed.data;

  // Fetch live resort conditions to inject as context
  const resortContext = await buildResortContextString();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Denver",
  });

  const systemInstruction = `You are BestLine's resort conditions assistant — a friendly, knowledgeable ski advisor for Utah resorts. Help skiers choose the best resort for their day by answering questions about snow, weather, lift status, crowds, and drive times.

Today is ${today} (Mountain Time).

${resortContext}

Guidelines:
- Be concise: 2–4 sentences unless the user asks for detail.
- Base answers on the data above. If a data point is missing, say so — never invent conditions.
- When comparing resorts, cite specific numbers (temperature, open lift count, etc.).
- If the user mentions where they're starting from, factor in the approximate drive times.
- You can make reasonable inferences (e.g., "fresh snow + high lift count = great powder day") but flag them as your read, not a fact.
- Resorts covered: Deer Valley, Park City Mountain, Snowbird, Brighton, Solitude (all in Utah).`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    // All messages except the last form the history; the last is the new user turn.
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat] Gemini API error:", err);
    return NextResponse.json(
      { error: "Failed to get a response from the AI. Please try again." },
      { status: 500 }
    );
  }
}
