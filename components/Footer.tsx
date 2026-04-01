// Site-wide footer
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between gap-8">
        {/* Brand */}
        <div>
          <p className="text-white font-extrabold text-lg mb-1">PDF Insight AI</p>
          <p className="text-sm max-w-xs">
            Edit, understand, and improve your PDFs instantly — without ruining
            formatting.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-12">
          <div>
            <p className="text-white text-sm font-semibold mb-3">Product</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
              <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
              <li><Link href="/#early-access" className="hover:text-white transition">Early Access</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white text-sm font-semibold mb-3">Company</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-gray-800 text-xs text-center">
        © {new Date().getFullYear()} PDF Insight AI. All rights reserved.
      </div>
    </footer>
  );
}
