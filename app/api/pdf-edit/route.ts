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
  // Canvas-space coords for reliable PDF positioning
  canvasX: number;
  canvasBaselineY: number;
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
    const { height: pageH } = page.getSize();
    const fontSize = Math.max(edit.fontSize, 6);

    // Convert canvas coords (SCALE=1.5, y from top) → PDF coords (y from bottom)
    // canvasX and canvasBaselineY are the raw pdfjs-rendered positions we know are correct.
    const RENDER_SCALE = 1.5;
    const drawX = edit.canvasX / RENDER_SCALE;
    const drawY = pageH - edit.canvasBaselineY / RENDER_SCALE;

    // White rectangle — covers the original text
    page.drawRectangle({
      x: drawX - 2,
      y: drawY - fontSize * 0.3,
      width: edit.width + 4,
      height: fontSize * 1.6,
      color: rgb(1, 1, 1),
    });

    // Draw new text at the original baseline
    if (edit.newText.trim()) {
      page.drawText(edit.newText, {
        x: drawX,
        y: drawY,
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
