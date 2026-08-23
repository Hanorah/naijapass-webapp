import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { formatChatReply, shouldUseFastReply } from "@/lib/chatFormat";
import { retrieveContext, ragAnswer } from "@/lib/rag/knowledge";

const SYSTEM_PROMPT = `You are the NaijaPass help desk — a clear guide to Nigeria's civic portal.
You help people find emergency contacts, state laws, open tenders, and verified businesses.

Tone: warm, direct, professional standard English. Do not use Pidgin or slang.
Format: plain text only. No markdown, no asterisks, no bold. Use "•" for bullet lists.
Use ₦ for money, mention LGAs and states by name.
If the provided context has the answer, use it. Cite the source section (State Hub, Procurement, Emergency).
Never invent phone numbers or tender IDs not in the context.
Keep answers under 120 words unless listing contacts.`;

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-3.6-flash"];
const GEMINI_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Gemini timeout")), ms);
    }),
  ]);
}

async function geminiReply(
  apiKey: string,
  message: string,
  state: string,
  context: string,
  history: { role: "user" | "assistant"; text: string }[],
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `${SYSTEM_PROMPT}\n\nUser's state: ${state}\n\nRelevant context:\n${context}`,
      });

      const recent = history.slice(-4);
      const transcript = recent.length
        ? `${recent.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n")}\nUser: ${message}`
        : message;

      const result = await withTimeout(model.generateContent(transcript), GEMINI_TIMEOUT_MS);
      const reply = result.response.text();
      if (reply?.trim()) return formatChatReply(reply);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("Gemini unavailable");
}

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
    const history = (body.history || []).filter(
      (m) => m.text && !m.text.startsWith("You're viewing"),
    );
    const context = retrieveContext(message, state, 6);
    const apiKey = process.env.GOOGLE_AI_API_KEY?.trim();

    if (shouldUseFastReply(message)) {
      return NextResponse.json({
        reply: formatChatReply(ragAnswer(message, state)),
        configured: !!apiKey,
        source: "fast",
      });
    }

    if (!apiKey) {
      return NextResponse.json({
        reply: formatChatReply(ragAnswer(message, state)),
        configured: false,
        source: "rag",
      });
    }

    try {
      const reply = await geminiReply(apiKey, message, state, context, history);
      return NextResponse.json({ reply, configured: true, source: "gemini" });
    } catch (err) {
      console.error("[chat] gemini failed, using RAG", err);
      return NextResponse.json({
        reply: formatChatReply(ragAnswer(message, state)),
        configured: true,
        source: "rag-fallback",
      });
    }
  } catch (err) {
    console.error("[chat]", err);
    try {
      const body = (await req.clone().json()) as { message?: string; state?: string };
      const reply = formatChatReply(ragAnswer(body.message?.trim() || "help", body.state || "Lagos"));
      return NextResponse.json({ reply, error: true, source: "rag-error" });
    } catch {
      return NextResponse.json({
        reply:
          "I couldn't process that just now. Try asking about emergency numbers, open tenders, or the governor — or open State Hub / Procurement in the portal.",
        error: true,
        source: "error",
      });
    }
  }
}
