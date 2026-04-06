"use client";
// PDF Editor — renders pages via pdfjs, overlays editable text, saves via pdf-lib API
import { useEffect, useRef, useState, useCallback } from "react";

interface TextItem {
  pageIndex: number;
  itemIndex: number;
  text: string;
  x: number;      // PDF coordinate space
  y: number;
  width: number;
  height: number;
  fontSize: number;
  canvasX: number; // screen coordinate space
  canvasY: number;
  canvasWidth: number;
  canvasHeight: number;
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
}

interface Props {
  pdfUrl: string;
  documentId: string;
  fileName: string;
}

const SCALE = 1.5;

export default function PDFEditor({ pdfUrl, documentId, fileName }: Props) {
  const [pages, setPages] = useState<{ canvas: HTMLCanvasElement; textItems: TextItem[] }[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [activeEdit, setActiveEdit] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editKey = (item: TextItem) => `${item.pageIndex}-${item.itemIndex}`;

  // Load and render the PDF
  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      // Dynamically import pdfjs to avoid SSR issues
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const renderedPages: { canvas: HTMLCanvasElement; textItems: TextItem[] }[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (cancelled) break;
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: SCALE });

        // Render page to canvas
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await (page.render as any)({ canvas, viewport }).promise;

        // Extract text items with positions
        const textContent = await page.getTextContent();
        const textItems: TextItem[] = [];

        (textContent.items as any[]).forEach((item, idx) => {
          if (!item.str?.trim()) return;

          // Transform from PDF coords to canvas coords
          const tx = pdfjs.Util.transform(viewport.transform, item.transform);
          const canvasX = tx[4];
          const canvasY = tx[5] - (item.height ?? 10) * SCALE;
          const canvasWidth = item.width * SCALE;
          const canvasHeight = (item.height ?? 10) * SCALE;

          // PDF coordinate (for pdf-lib, origin is bottom-left)
          const pdfViewport = page.getViewport({ scale: 1 });
          const rawTx = pdfjs.Util.transform(pdfViewport.transform, item.transform);

          textItems.push({
            pageIndex: pageNum - 1,
            itemIndex: idx,
            text: item.str,
            x: rawTx[4],
            y: rawTx[5] - (item.height ?? 10),
            width: item.width,
            height: item.height ?? 10,
            fontSize: Math.abs(rawTx[3]) || 12,
            canvasX,
            canvasY,
            canvasWidth,
            canvasHeight: Math.max(canvasHeight, 14),
          });
        });

        renderedPages.push({ canvas, textItems });
      }

      if (!cancelled) {
        setPages(renderedPages);
        setLoading(false);
      }
    }

    loadPDF().catch((err) => {
      console.error("PDF load error:", err);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [pdfUrl]);

  function handleTextChange(item: TextItem, value: string) {
    setEdits((prev) => ({ ...prev, [editKey(item)]: value }));
  }

  function getCurrentText(item: TextItem) {
    const key = editKey(item);
    return key in edits ? edits[key] : item.text;
  }

  function hasChanges() {
    return Object.entries(edits).some(([key, val]) => {
      const [pageIndex, itemIndex] = key.split("-").map(Number);
      const item = pages[pageIndex]?.textItems[itemIndex];
      return item && val !== item.text;
    });
  }

  async function handleSave() {
    if (!hasChanges()) return;
    setSaving(true);

    // Build list of actual changes
    const changes: Edit[] = Object.entries(edits)
      .filter(([key, val]) => {
        const [pi, ii] = key.split("-").map(Number);
        return pages[pi]?.textItems[ii]?.text !== val;
      })
      .map(([key, newText]) => {
        const [pi, ii] = key.split("-").map(Number);
        const item = pages[pi].textItems[ii];
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
              editMode
                ? "gradient-bg text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {editMode ? "✏️ Editing" : "✏️ Edit Mode"}
          </button>
          {editMode && (
            <p className="text-xs text-gray-400">Click any highlighted text to edit it</p>
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
      <div ref={containerRef} className="space-y-4">
        {pages.map(({ canvas, textItems }, pageIdx) => (
          <div key={pageIdx} className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            {/* Page label */}
            <div className="bg-gray-900 text-gray-400 text-xs px-3 py-1.5">
              Page {pageIdx + 1}
            </div>

            {/* Canvas + overlay */}
            <div className="relative" style={{ width: canvas.width, maxWidth: "100%" }}>
              {/* Rendered PDF page */}
              <canvas
                ref={(el) => {
                  if (el && el !== canvas) {
                    el.width = canvas.width;
                    el.height = canvas.height;
                    el.getContext("2d")!.drawImage(canvas, 0, 0);
                  } else if (el === canvas) {
                    el.style.display = "block";
                  }
                }}
                width={canvas.width}
                height={canvas.height}
                style={{ display: "block", maxWidth: "100%", height: "auto" }}
              />

              {/* Text overlays — only visible in edit mode */}
              {editMode && textItems.map((item) => {
                const key = editKey(item);
                const isActive = activeEdit === key;
                const isEdited = key in edits && edits[key] !== item.text;

                return (
                  <div
                    key={key}
                    style={{
                      position: "absolute",
                      left: item.canvasX,
                      top: item.canvasY,
                      width: Math.max(item.canvasWidth, 40),
                      height: Math.max(item.canvasHeight, 14),
                      fontSize: item.fontSize * SCALE * 0.75,
                    }}
                  >
                    {isActive ? (
                      <input
                        autoFocus
                        value={getCurrentText(item)}
                        onChange={(e) => handleTextChange(item, e.target.value)}
                        onBlur={() => setActiveEdit(null)}
                        onKeyDown={(e) => e.key === "Enter" && setActiveEdit(null)}
                        className="w-full h-full bg-white border-2 border-indigo-500 rounded px-0.5 text-gray-900 outline-none"
                        style={{ fontSize: "inherit" }}
                      />
                    ) : (
                      <div
                        onClick={() => setActiveEdit(key)}
                        className={`w-full h-full cursor-text rounded px-0.5 transition ${
                          isEdited
                            ? "bg-yellow-200/70 border border-yellow-400"
                            : "hover:bg-indigo-100/50 hover:border hover:border-indigo-300"
                        }`}
                        title={isEdited ? `Edited: "${getCurrentText(item)}"` : `Click to edit: "${item.text}"`}
                      />
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
          You have unsaved edits. Click <strong>"Download Edited PDF"</strong> to apply and download your changes.
        </div>
      )}
    </div>
  );
}
