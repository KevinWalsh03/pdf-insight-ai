"use client";
import { useState } from "react";

export function UpgradeBanner() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  return (
    <div className="mt-6 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-white font-bold text-lg">Upgrade to Pro</p>
        <p className="text-indigo-100 text-sm">Unlimited uploads, priority AI processing, and advanced insights.</p>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-white text-indigo-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-50 transition flex-shrink-0 disabled:opacity-70"
      >
        {loading ? "Redirecting..." : "Upgrade Now →"}
      </button>
    </div>
  );
}

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="text-sm text-indigo-600 hover:underline disabled:opacity-70"
    >
      {loading ? "Loading..." : "Manage subscription →"}
    </button>
  );
}
