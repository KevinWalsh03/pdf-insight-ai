// Chat API — answers questions about a document using Claude + stored document context
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { anthropic } from "@/lib/anthropic";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId, message, history } = await req.json() as {
    documentId: string;
    message: string;
    history: Message[];
  };

  // Fetch document context from Supabase
  const { data: doc } = await supabaseAdmin
    .from("documents")
    .select("file_name, ai_summary, ai_insights, ai_recommendations")
    .eq("id", documentId)
    .eq("clerk_user_id", userId)
    .single();

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const systemPrompt = `You are a helpful AI assistant answering questions about a document called "${doc.file_name}".

Here is what is known about this document:

SUMMARY:
${doc.ai_summary}

KEY INSIGHTS:
${(doc.ai_insights as string[]).map((ins: string, i: number) => `${i + 1}. ${ins}`).join("\n")}

RECOMMENDATIONS:
${(doc.ai_recommendations as string[]).map((rec: string) => `- ${rec}`).join("\n")}

Answer the user's questions based on this document. Be concise and helpful. If a question is outside the scope of this document, say so politely.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      ...history.slice(-10), // keep last 10 messages for context
      { role: "user", content: message },
    ],
  });

  const reply = response.content[0].type === "text" ? response.content[0].text : "";
  return NextResponse.json({ reply });
}
