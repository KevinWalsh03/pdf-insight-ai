// API route — applies text edits to a PDF using pdf-lib and returns the modified file
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface Edit {
  pageIndex: number;
  originalText: string;
  newText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId, changes } = await req.json() as { documentId: string; changes: Edit[] };

  // Verify the document belongs to this user
  const { data: doc } = await supabaseAdmin
    .from("documents")
    .select("file_path, file_name")
    .eq("id", documentId)
    .eq("clerk_user_id", userId)
    .single();

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  // Download the original PDF from Supabase Storage
  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from("pdfs")
    .download(doc.file_path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: "Failed to download PDF" }, { status: 500 });
  }

  // Load PDF with pdf-lib
  const pdfBytes = await fileData.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  // Apply each edit
  for (const edit of changes) {
    if (edit.pageIndex >= pages.length) continue;

    const page = pages[edit.pageIndex];
    const fontSize = Math.max(edit.fontSize, 6);

    // Use fontSize as the most reliable measure of text height
    const textH = Math.max(edit.height, fontSize) * 1.5;

    // White rectangle — generous padding to ensure full coverage of original text
    page.drawRectangle({
      x: edit.x - 2,
      y: edit.y - textH * 0.4,
      width: edit.width + 4,
      height: textH,
      color: rgb(1, 1, 1),
    });

    // Draw new text at the original baseline
    if (edit.newText.trim()) {
      page.drawText(edit.newText, {
        x: edit.x,
        y: edit.y,
        size: fontSize,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
    }
  }

  // Serialize the modified PDF
  const modifiedPdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(modifiedPdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="edited_${doc.file_name}"`,
    },
  });
}
