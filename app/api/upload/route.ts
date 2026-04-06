// API route — handles PDF upload, Claude analysis, and Supabase storage
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { anthropic } from "@/lib/anthropic";

const FREE_UPLOAD_LIMIT = 3;

export async function POST(req: NextRequest) {
  // 1. Verify user is authenticated
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Check upload limit
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const isPaid = profile.plan === "paid";
  if (!isPaid && profile.uploads_this_week >= FREE_UPLOAD_LIMIT) {
    return NextResponse.json({ error: "Upload limit reached. Upgrade to Pro." }, { status: 403 });
  }

  // 3. Parse the uploaded file
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Please upload a valid PDF file." }, { status: 400 });
  }

  const fileBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(fileBuffer);
  const base64Pdf = Buffer.from(fileBytes).toString("base64");

  // 4. Upload PDF to Supabase Storage
  const filePath = `${userId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from("pdfs")
    .upload(filePath, fileBytes, { contentType: "application/pdf" });

  if (uploadError) {
    return NextResponse.json({ error: "Failed to store PDF." }, { status: 500 });
  }

  // 5. Send PDF to Claude for analysis
  let summary = "";
  let insights: string[] = [];
  let recommendations: string[] = [];

  try {
    const message = await (anthropic as any).beta.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      betas: ["pdfs-2024-09-25"],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: `Analyze this PDF document and respond ONLY with a valid JSON object in this exact format:
{
  "summary": "A concise 3-5 sentence executive summary of the document",
  "insights": ["Key insight 1", "Key insight 2", "Key insight 3", "Key insight 4", "Key insight 5"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}
Do not include any text outside the JSON object.`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(responseText);
    summary = parsed.summary ?? "";
    insights = parsed.insights ?? [];
    recommendations = parsed.recommendations ?? [];
  } catch (err) {
    // If Claude analysis fails, continue with empty analysis
    console.error("Claude analysis failed:", err);
    summary = "Analysis unavailable for this document.";
  }

  // 6. Save document record to Supabase
  const { data: document, error: dbError } = await supabaseAdmin
    .from("documents")
    .insert({
      clerk_user_id: userId,
      file_name: file.name,
      file_path: filePath,
      ai_summary: summary,
      ai_insights: insights,
      ai_recommendations: recommendations,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: "Failed to save document record." }, { status: 500 });
  }

  // 7. Increment upload count
  await supabaseAdmin
    .from("profiles")
    .update({ uploads_this_week: profile.uploads_this_week + 1 })
    .eq("clerk_user_id", userId);

  return NextResponse.json({ document });
}

// Allow up to 10MB uploads
export const maxDuration = 60;
