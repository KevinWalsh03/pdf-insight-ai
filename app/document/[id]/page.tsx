// Document viewer — shows AI summary, insights, and recommendations
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch document — only if it belongs to this user
  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("id", params.id)
    .eq("clerk_user_id", userId)
    .single();

  if (error || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Document not found.</p>
          <Link href="/dashboard" className="gradient-bg text-white px-4 py-2 rounded-lg text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Get signed download URL
  const { data: urlData } = await supabaseAdmin.storage
    .from("pdfs")
    .createSignedUrl(doc.file_path, 3600);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition text-sm">
              ← Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-xs">{doc.file_name}</h1>
          </div>
          {urlData?.signedUrl && (
            <a
              href={urlData.signedUrl}
              download={doc.file_name}
              className="gradient-bg text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              Download PDF
            </a>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: PDF embed ── */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-900 flex items-center gap-1.5 px-4 py-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-gray-400 text-xs font-mono">{doc.file_name}</span>
            </div>
            {urlData?.signedUrl ? (
              <iframe
                src={urlData.signedUrl}
                className="w-full"
                style={{ height: "75vh" }}
                title={doc.file_name}
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                Unable to load PDF preview.
              </div>
            )}
          </div>

          {/* ── Right: AI Sidebar ── */}
          <div className="w-full lg:w-80 flex flex-col gap-4">

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚡</span>
                <h2 className="font-bold text-gray-900">AI Summary</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {doc.ai_summary || "No summary available."}
              </p>
            </div>

            {/* Key Insights */}
            {doc.ai_insights?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💡</span>
                  <h2 className="font-bold text-gray-900">Key Insights</h2>
                </div>
                <ul className="space-y-2">
                  {doc.ai_insights.map((insight: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-indigo-500 font-bold flex-shrink-0">{i + 1}.</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {doc.ai_recommendations?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎯</span>
                  <h2 className="font-bold text-gray-900">Recommendations</h2>
                </div>
                <ul className="space-y-2">
                  {doc.ai_recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-cyan-500 flex-shrink-0">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Uploaded date */}
            <p className="text-center text-gray-400 text-xs">
              Uploaded {new Date(doc.created_at).toLocaleDateString()}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
