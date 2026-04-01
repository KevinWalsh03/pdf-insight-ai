"use client";
// Sticky top navbar with logo and nav links
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="gradient-bg text-white rounded-lg px-2 py-0.5 text-sm font-extrabold tracking-tight">
            PDF
          </span>
          <span className="gradient-text font-extrabold">Insight AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                pathname === l.href ? "text-indigo-600" : "text-gray-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#early-access"
            className="ml-2 gradient-bg text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Get Early Access
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium ${
                pathname === l.href ? "text-indigo-600" : "text-gray-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#early-access"
            onClick={() => setOpen(false)}
            className="gradient-bg text-white text-sm font-semibold px-4 py-2 rounded-lg text-center"
          >
            Get Early Access
          </Link>
        </div>
      )}
    </header>
  );
}
