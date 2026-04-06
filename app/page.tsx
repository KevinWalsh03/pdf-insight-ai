"use client";
// Homepage — hero, features, social proof, sign up CTA
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

const features = [
  {
    icon: "✏️",
    title: "Smart Editing",
    desc: "Edit any text in your PDF without breaking fonts, spacing, or layout. Our AI locks in formatting so the document looks native.",
  },
  {
    icon: "⚡",
    title: "AI Summaries",
    desc: "Get a clear, concise summary of any report in seconds. Understand 50-page documents at a glance.",
  },
  {
    icon: "💡",
    title: "Insights & Recommendations",
    desc: "AI surfaces key findings, flags risks, and suggests improvements tailored to your document type.",
  },
  {
    icon: "🔍",
    title: "Highlighted References",
    desc: "Every AI insight links directly to the exact passage in your PDF — highlighted and ready to review.",
  },
];

const testimonials = [
  {
    quote: "I have spent so much time looking for PDF editors that are affordable and actually work. PDF Insight AI presents a unique solution to a familiar problem.",
    name: "Jeffrey W.",
    role: "Student, Penn State University",
  },
  {
    quote: "I am excited about finally being able to edit PDFs without losing formatting. The AI insight also offers a new perspective on reports.",
    name: "Mathew D.",
    role: "Commercial Lending Intern, Community Bank",
  },
  {
    quote: "My education requires me to read and annotate a lot of technical reports. PDF Insight AI shows promise to save me hours of work every week.",
    name: "P. Boles",
    role: "Engineering Student, Penn State University",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-gray-950 text-white">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500 opacity-20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500 opacity-20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-medium">
            Now in Early Access
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Edit, Understand &amp; Improve<br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Your PDFs Instantly
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
            AI-powered PDF editing that preserves every font, margin, and layout — plus
            instant summaries, smart insights, and highlighted references.
          </p>

          {/* CTA — sign up if logged out, go to dashboard if logged in */}
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="inline-block gradient-bg text-white font-semibold px-8 py-3.5 rounded-xl text-lg shadow-lg hover:opacity-90 transition hover:scale-105">
                Get Early Access — It's Free
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block gradient-bg text-white font-semibold px-8 py-3.5 rounded-xl text-lg shadow-lg hover:opacity-90 transition hover:scale-105"
            >
              Go to Dashboard →
            </Link>
          </SignedIn>

          {/* Mockup preview */}
          <div className="mt-16 relative mx-auto max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="bg-gray-900 flex items-center gap-1.5 px-4 py-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-gray-500 text-xs">PDF Insight AI — Q4 Report.pdf</span>
            </div>
            <div className="flex bg-gray-950 min-h-56">
              <div className="flex-1 p-6 space-y-3 border-r border-gray-800">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-indigo-900/60 border-l-4 border-indigo-500 rounded pl-2 w-full" />
                <div className="h-3 bg-gray-800 rounded w-5/6" />
                <div className="h-3 bg-yellow-900/40 border-l-4 border-yellow-400 rounded pl-2 w-full" />
                <div className="h-3 bg-gray-800 rounded w-4/5" />
                <div className="h-3 bg-cyan-900/40 border-l-4 border-cyan-400 rounded pl-2 w-11/12" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </div>
              <div className="w-56 p-4 space-y-3">
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wide">AI Summary</p>
                <div className="h-2 bg-gray-700 rounded w-full" />
                <div className="h-2 bg-gray-700 rounded w-5/6" />
                <div className="h-2 bg-gray-700 rounded w-4/6" />
                <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wide mt-4">Key Insights</p>
                <div className="h-2 bg-gray-700 rounded w-full" />
                <div className="h-2 bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Everything you need to{" "}
              <span className="gradient-text">master your PDFs</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built for engineers, analysts, and researchers who live inside complex documents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-12">
            Created for students, analysts &amp; researchers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 hover:shadow-md transition"
              >
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">
                  "{t.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-indigo-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-24 bg-gradient-to-br from-indigo-950 to-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to work smarter?
          </h2>
          <p className="text-indigo-300 mb-10 max-w-lg mx-auto">
            Create a free account and start editing, summarizing, and understanding your PDFs in seconds.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="gradient-bg text-white font-semibold px-8 py-3.5 rounded-xl text-lg shadow-lg hover:opacity-90 transition hover:scale-105">
                Create Free Account →
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block gradient-bg text-white font-semibold px-8 py-3.5 rounded-xl text-lg shadow-lg hover:opacity-90 transition hover:scale-105"
            >
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>
      </section>
    </>
  );
}
