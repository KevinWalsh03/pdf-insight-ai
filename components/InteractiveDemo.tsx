"use client";
// Interactive fake PDF viewer with AI sidebar — frontend only
import { useState } from "react";

// Simulated PDF paragraphs with highlight categories
const paragraphs = [
  {
    id: 1,
    text: "Q4 2024 Revenue reached $4.2M, representing a 31% increase year-over-year driven primarily by enterprise subscription growth.",
    highlight: "key",
    insight: "Revenue Milestone",
  },
  {
    id: 2,
    text: "Operating expenses increased by 18% to $2.1M, largely attributed to expanded engineering headcount and infrastructure scaling costs.",
    highlight: "warning",
    insight: "Cost Pressure",
  },
  {
    id: 3,
    text: "Customer churn rate fell to 2.3%, the lowest recorded since founding, following the implementation of the new onboarding workflow.",
    highlight: "key",
    insight: "Retention Win",
  },
  {
    id: 4,
    text: "Net Promoter Score improved from 42 to 67, indicating strong product-market fit across the SMB segment.",
    highlight: "none",
    insight: null,
  },
  {
    id: 5,
    text: "Cash runway remains 14 months at current burn rate. Series A fundraising process to commence in Q1 2025.",
    highlight: "warning",
    insight: "Runway Alert",
  },
  {
    id: 6,
    text: "Engineering team velocity increased by 40% following adoption of the new CI/CD pipeline and automated testing framework.",
    highlight: "key",
    insight: "Efficiency Gain",
  },
];

const aiSummary =
  "Q4 2024 shows strong revenue growth (+31%) and improved retention (churn 2.3%), but cash runway of 14 months warrants close monitoring ahead of the planned Series A.";

const recommendations = [
  { icon: "🚨", text: "Initiate Series A process early — runway tightening." },
  { icon: "✅", text: "Replicate onboarding improvements across enterprise tier." },
  { icon: "📉", text: "Review OpEx growth vs. revenue to maintain margins." },
  { icon: "🎯", text: "Capitalize on NPS momentum for case study marketing." },
];

const highlightStyles: Record<string, string> = {
  key: "bg-indigo-100 border-l-4 border-indigo-500",
  warning: "bg-yellow-50 border-l-4 border-yellow-400",
  none: "",
};

export default function InteractiveDemo() {
  const [active, setActive] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [texts, setTexts] = useState<Record<number, string>>(
    Object.fromEntries(paragraphs.map((p) => [p.id, p.text]))
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-gray-950">
      {/* Window chrome */}
      <div className="bg-gray-900 flex items-center gap-1.5 px-4 py-3 border-b border-gray-800">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-4 text-gray-400 text-xs font-mono">
          PDF Insight AI — Q4_2024_Report.pdf
        </span>
        <span className="ml-auto text-xs text-green-400 font-semibold animate-pulse">
          ● AI Active
        </span>
      </div>

      <div className="flex flex-col md:flex-row" style={{ minHeight: 480 }}>
        {/* ── Left: Fake PDF Viewer ── */}
        <div className="flex-1 bg-white p-6 overflow-y-auto">
          {/* Fake document header */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              CONFIDENTIAL — Internal Report
            </p>
            <h2 className="text-xl font-bold text-gray-900">
              Q4 2024 Business Performance Review
            </h2>
            <p className="text-gray-400 text-xs mt-1">
              Prepared by Finance &amp; Strategy · January 2025
            </p>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Click any paragraph to select · Double-click to edit
          </p>

          <div className="space-y-3">
            {paragraphs.map((p) => (
              <div
                key={p.id}
                onClick={() => setActive(active === p.id ? null : p.id)}
                onDoubleClick={() => setEditingId(p.id)}
                className={`rounded-lg px-3 py-2.5 cursor-pointer transition-all text-sm leading-relaxed text-gray-700 select-none
                  ${highlightStyles[p.highlight]}
                  ${active === p.id ? "ring-2 ring-indigo-400 shadow-md" : "hover:bg-gray-50"}
                `}
              >
                {editingId === p.id ? (
                  <textarea
                    autoFocus
                    className="w-full bg-transparent resize-none outline-none text-sm text-gray-900 font-medium"
                    rows={3}
                    value={texts[p.id]}
                    onChange={(e) =>
                      setTexts({ ...texts, [p.id]: e.target.value })
                    }
                    onBlur={() => setEditingId(null)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    {texts[p.id]}
                    {p.highlight !== "none" && (
                      <span
                        className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                          p.highlight === "key"
                            ? "bg-indigo-200 text-indigo-700"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {p.insight}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-center text-gray-400">
            Double-click any paragraph to edit — formatting preserved automatically
          </p>
        </div>

        {/* ── Right: AI Sidebar ── */}
        <div className="w-full md:w-72 bg-gray-950 border-l border-gray-800 flex flex-col overflow-y-auto">
          {/* Summary */}
          <div className="p-5 border-b border-gray-800">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">
              AI Summary
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">{aiSummary}</p>
          </div>

          {/* Active context */}
          {active && (
            <div className="p-5 border-b border-gray-800 bg-indigo-950/50">
              <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2">
                Selected Passage
              </p>
              <p className="text-gray-300 text-xs leading-relaxed italic">
                "{texts[active]}"
              </p>
              {paragraphs.find((p) => p.id === active)?.insight && (
                <div className="mt-3 text-indigo-300 text-xs bg-indigo-900/40 rounded-lg px-3 py-2">
                  💡 {paragraphs.find((p) => p.id === active)?.insight} — this passage
                  is referenced in the AI analysis below.
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          <div className="p-5">
            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Recommendations
            </p>
            <ul className="space-y-3">
              {recommendations.map((r, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-300 leading-relaxed">
                  <span className="flex-shrink-0">{r.icon}</span>
                  {r.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Legend */}
          <div className="p-5 border-t border-gray-800 mt-auto">
            <p className="text-gray-500 text-xs font-semibold mb-2">Legend</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-sm bg-indigo-200 border-l-2 border-indigo-500 flex-shrink-0" />
                Key finding
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-sm bg-yellow-100 border-l-2 border-yellow-400 flex-shrink-0" />
                Risk / warning
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
