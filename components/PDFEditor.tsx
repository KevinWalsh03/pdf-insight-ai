"use client";
// PDF Editor — renders pages via pdfjs, overlays editable text, saves via pdf-lib API
import { useEffect, useRef, useState } from "react";

interface TextItem {
  pageIndex: number;
  itemIndex: number;
  text: string;
  // PDF coordinate space (for pdf-lib)
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  // Canvas coordinate space (for overlay positioning)
  canvasX: number;
  canvasY: number;
  canvasWidth: number;
  canvasHeight: number;
  // Raw canvas baseline (tx[5] at SCALE) — used by API for reliable PDF positioning
  canvasBaselineY: number;
}

interface Edit {
  pageIndex: number;
  itemIndex: number;
  originalText: string;
  newText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  // Canvas-space coords sent to API for reliable coordinate conversion
  canvasX: number;
  canvasBaselineY: number;
}

interface PageData {
  width: number;
  height: number;
  textItems: TextItem[];
}

interface Props {
  pdfUrl: string;
  documentId: string;
  fileName: string;
}

const SCALE = 1.5;

export default function PDFEditor({ pdfUrl, documentId, fileName }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [pageData, setPageData] = useState<PageData[]>([]);
  const [pdfInstance, setPdfInstance] = useState<any>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [activeEdit, setActiveEdit] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // One ref per page canvas
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const editKey = (pageIndex: number, itemIndex: number) => `${pageIndex}-${itemIndex}`;

  // Step 1: Load the PDF and extract text data
  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const pdf = await pdfjs.getDocument({ url: pdfUrl, enableXfa: false }).promise;
      if (cancelled) return;

      setPdfInstance(pdf);
      setNumPages(pdf.numPages);

      // Extract text items for all pages
      const allPageData: PageData[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: SCALE });
        // Scale-1 viewport for reliable PDF user space coordinate extraction
        const viewport1 = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();

        const items: TextItem[] = [];
        (textContent.items as any[]).forEach((item, idx) => {
          if (!item.str?.trim()) return;

          // Screen coordinates for overlay
          const tx = pdfjs.Util.transform(viewport.transform, item.transform);
          const canvasX = tx[4];
          const canvasY = tx[5] - (item.height ?? 10) * SCALE;
          const canvasWidth = Math.max(item.width * SCALE, 20);
          const canvasHeight = Math.max((item.height ?? 10) * SCALE, 12);

          // PDF user space coordinates for pdf-lib
          // Apply scale-1 viewport transform then convert y: canvas-y is from top,
          // PDF user space y is from bottom. This handles PDFs with non-standard CTMs.
          const tx1 = pdfjs.Util.transform(viewport1.transform, item.transform);
          const pdfX = tx1[4];
          const pdfY = viewport1.height - tx1[5]; // canvas-y (top) → PDF-y (bottom)
          const pdfFontSize = Math.max(Math.abs(item.transform[3]) || 12, 6);

          items.push({
            pageIndex: pageNum - 1,
            itemIndex: idx,
            text: item.str,
            x: pdfX,
            y: pdfY,
            width: item.width,
            height: item.height ?? pdfFontSize,
            fontSize: pdfFontSize,
            canvasX,
            canvasY,
            canvasWidth,
            canvasHeight,
            canvasBaselineY: tx[5], // raw canvas baseline y at SCALE — used by API
          });
        });

        allPageData.push({
          width: viewport.width,
          height: viewport.height,
          textItems: items,
        });
      }

      if (!cancelled) {
        setPageData(allPageData);
        setLoading(false);
      }
    }

    loadPDF().catch((err) => {
      console.error("PDF load error:", err);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [pdfUrl]);

  // Step 2: Render each page onto its canvas once canvases are mounted
  useEffect(() => {
    if (!pdfInstance || pageData.length === 0) return;

    async function renderPages() {
      // pdfjs already initialized, just need it for the render call
      await import("pdfjs-dist");
      for (let i = 0; i < pageData.length; i++) {
        const canvas = canvasRefs.current[i];
        if (!canvas) continue;

        const page = await pdfInstance.getPage(i + 1);
        const viewport = page.getViewport({ scale: SCALE });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await (page.render as any)({ canvas, viewport }).promise;
      }
    }

    renderPages().catch(console.error);
  }, [pdfInstance, pageData]);

  function getCurrentText(pageIndex: number, itemIndex: number, originalText: string) {
    const key = editKey(pageIndex, itemIndex);
    return key in edits ? edits[key] : originalText;
  }

  function hasChanges() {
    return Object.entries(edits).some(([key, val]) => {
      const [pi, ii] = key.split("-").map(Number);
      return pageData[pi]?.textItems[ii]?.text !== val;
    });
  }

  async function handleSave() {
    if (!hasChanges()) return;
    setSaving(true);

    const changes: Edit[] = Object.entries(edits)
      .filter(([key, val]) => {
        const [pi, ii] = key.split("-").map(Number);
        return pageData[pi]?.textItems[ii]?.text !== val;
      })
      .map(([key, newText]) => {
        const [pi, ii] = key.split("-").map(Number);
        const item = pageData[pi].textItems[ii];
        return {
          pageIndex: item.pageIndex,
          itemIndex: item.itemIndex,
          originalText: item.text,
          newText,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          canvasX: item.canvasX,
          canvasBaselineY: item.canvasBaselineY,
        };
      });

    const res = await fetch("/api/pdf-edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, changes }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited_${fileName}`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert("Failed to save edits. Please try again.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-2xl border border-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading PDF editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition ${
              editMode ? "gradient-bg text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {editMode ? "✏️ Editing" : "✏️ Edit Mode"}
          </button>
          {editMode && (
            <p className="text-xs text-gray-400">Click any highlighted text to edit</p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges() || saving}
          className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition ${
            hasChanges() && !saving
              ? "gradient-bg text-white hover:opacity-90"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Download Edited PDF"}
        </button>
      </div>

      {/* Pages */}
      <div className="space-y-4">
        {pageData.map((page, pageIdx) => (
          <div key={pageIdx} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
            <div className="bg-gray-900 text-gray-400 text-xs px-3 py-1.5 font-mono">
              Page {pageIdx + 1} of {numPages}
            </div>

            {/* Canvas + text overlay container */}
            <div
              className="relative"
              style={{ width: page.width, maxWidth: "100%", height: page.height }}
            >
              <canvas
                ref={(el) => { canvasRefs.current[pageIdx] = el; }}
                style={{ display: "block", width: "100%", height: "100%" }}
              />

              {/* Text overlays — only in edit mode */}
              {editMode && page.textItems.map((item) => {

                const key = editKey(item.pageIndex, item.itemIndex);
                const isActive = activeEdit === key;
                const isEdited = key in edits && edits[key] !== item.text;

                return (
                  <div
                    key={key}
                    style={{
                      position: "absolute",
                      left: item.canvasX,
                      top: item.canvasY,
                      width: item.canvasWidth,
                      height: item.canvasHeight,
                      fontSize: item.fontSize * SCALE * 0.72,
                      zIndex: 10,
                    }}
                  >
                    {isActive ? (
                      <input
                        autoFocus
                        value={getCurrentText(item.pageIndex, item.itemIndex, item.text)}
                        onChange={(e) =>
                          setEdits((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        onBlur={() => setActiveEdit(null)}
                        onKeyDown={(e) => e.key === "Enter" && setActiveEdit(null)}
                        className="w-full h-full bg-white border-2 border-indigo-500 rounded px-0.5 text-gray-900 outline-none"
                        style={{ fontSize: "inherit", zIndex: 20, position: "relative" }}
                      />
                    ) : (
                      <div
                        onClick={() => setActiveEdit(key)}
                        className={`w-full h-full cursor-text rounded transition flex items-center overflow-hidden ${
                          isEdited
                            ? "bg-yellow-200/80 border border-yellow-400"
                            : "hover:bg-indigo-100/60 hover:border hover:border-indigo-400"
                        }`}
                        title={`Original: "${item.text}"${isEdited ? ` → Edited: "${getCurrentText(item.pageIndex, item.itemIndex, item.text)}"` : ""}`}
                      >
                        {isEdited && (
                          <span className="text-yellow-800 font-medium truncate px-0.5" style={{ fontSize: "inherit" }}>
                            {getCurrentText(item.pageIndex, item.itemIndex, item.text)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {hasChanges() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          You have unsaved edits. Click <strong>"Download Edited PDF"</strong> to apply and download.
        </div>
      )}
    </div>
  );
}
