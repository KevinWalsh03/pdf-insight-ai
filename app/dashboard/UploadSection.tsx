"use client";
// Client component — handles file selection and upload
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  atLimit: boolean;
  uploadsRemaining: number | string;
  isPaid: boolean;
}

export default function UploadSection({ atLimit, uploadsRemaining, isPaid }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload failed. Please try again.");
      return;
    }

    // Navigate to document viewer
    router.push(`/document/${data.document.id}`);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`bg-white rounded-2xl border-2 border-dashed p-16 text-center shadow-sm transition-all ${
          atLimit
            ? "border-red-200 opacity-60"
            : dragging
            ? "border-indigo-400 bg-indigo-50"
            : "border-indigo-200"
        }`}
      >
        <div className="text-5xl mb-4">{uploading ? "⏳" : "📄"}</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {uploading ? "Analyzing your PDF..." : "Upload a PDF"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {uploading
            ? "Claude is reading your document. This takes about 15 seconds."
            : atLimit
            ? "You've reached your free limit. Upgrade to Pro for unlimited uploads."
            : "Drag and drop your PDF here, or click to browse."}
        </p>

        {uploading && (
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!uploading && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
              disabled={atLimit}
              onClick={() => fileRef.current?.click()}
              className={`font-semibold px-6 py-2.5 rounded-lg transition ${
                atLimit
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "gradient-bg text-white hover:opacity-90"
              }`}
            >
              {atLimit ? "Upgrade to Upload" : "Choose PDF"}
            </button>
          </>
        )}

        {!isPaid && !uploading && (
          <p className="text-gray-400 text-xs mt-4">
            Free plan: {uploadsRemaining} upload{uploadsRemaining === 1 ? "" : "s"} remaining this week
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
