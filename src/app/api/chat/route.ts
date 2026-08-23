import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { retrieveContext, ragAnswer } from "@/lib/rag/knowledge";

const SYSTEM_PROMPT = `You are the NaijaPass help desk — a plain-spoken guide to Nigeria's civic portal.
You help people find emergency contacts, state laws, open tenders, and verified businesses.

Tone: direct, warm, Nigerian. No corporate jargon. No "I'm an AI" disclaimers.
Use ₦ for money, mention LGAs and states by name.
If the provided context has the answer, use it. Cite the source section (State Hub, Procurement, Emergency).
Never invent phone numbers or tender IDs not in the context.
Keep answers under 120 words unless listing contacts.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      message?: string;
      state?: string;
      history?: { role: "user" | "assistant"; text: string }[];
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const state = body.state || "Lagos";
    const history = body.history || [];
    const context = retrieveContext(message, state, 6);

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      const reply = ragAnswer(message, state);
      return NextResponse.json({ reply, configured: false, source: "rag" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `${SYSTEM_PROMPT}\n\nUser's state: ${state}\n\nRelevant context:\n${context}`,
    });

    const chatHistory = history.slice(-6).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.text }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return NextResponse.json({ reply, configured: true, source: "gemini" });
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json(
      {
        reply: "Something went wrong. Try again, or open State Hub / Emergency in the portal.",
        error: true,
        source: "error",
      },
      { status: 200 },
    );
  }
}
