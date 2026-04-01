// How It Works page — steps + interactive demo
import InteractiveDemo from "@/components/InteractiveDemo";

const steps = [
  {
    step: "01",
    icon: "📤",
    title: "Upload Your PDF",
    desc: "Drag and drop or browse to upload any PDF — reports, research papers, contracts, technical manuals. Up to 500 pages.",
    detail: "We support encrypted PDFs, scanned documents (via OCR), and complex multi-column layouts.",
  },
  {
    step: "02",
    icon: "🤖",
    title: "AI Processes the Document",
    desc: "Our AI reads and indexes every section, table, and figure — understanding the document's structure before generating any output.",
    detail: "Processing typically completes in under 10 seconds for a 50-page document.",
  },
  {
    step: "03",
    icon: "💡",
    title: "View Summary & Highlighted Insights",
    desc: "Get a plain-English executive summary alongside highlighted passages — every insight linked directly back to its source.",
    detail: "Click any recommendation to jump to the exact page and sentence it came from.",
  },
  {
    step: "04",
    icon: "✏️",
    title: "Edit Safely — Formatting Preserved",
    desc: "Click any text to edit it. Our layout engine locks fonts, margins, and spacing so your document always looks professional.",
    detail: "Export a pixel-perfect PDF when you're done — no reformatting required.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          How <span className="gradient-text">PDF Insight AI</span> Works
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          From upload to insight in seconds. Here's exactly what happens when you
          drop a document into our editor.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {steps.map((s) => (
          <div
            key={s.step}
            className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex gap-5"
          >
            {/* Step number badge */}
            <div className="flex-shrink-0 w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-extrabold text-sm">
              {s.step}
            </div>
            <div>
              <div className="text-2xl mb-2">{s.icon}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{s.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-2">{s.desc}</p>
              <p className="text-indigo-500 text-xs">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Demo */}
      <div className="mb-6 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
          Interactive Demo
        </span>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          Try It — Right Here
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto text-sm">
          This is a live preview of the PDF Insight AI editor. Click paragraphs to
          select them, double-click to edit, and watch the AI sidebar react in real time.
        </p>
      </div>

      <InteractiveDemo />

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-gray-500 mb-5 text-lg">Ready to try it on your own documents?</p>
        <a
          href="/#early-access"
          className="inline-block gradient-bg text-white font-semibold px-8 py-3.5 rounded-xl text-lg shadow-lg hover:opacity-90 transition hover:scale-105"
        >
          Get Early Access 
        </a>
      </div>
    </div>
  );
}
