"use client";
// Email capture form with confirmation state
import { useState } from "react";

export default function EmailCapture() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center max-w-md mx-auto">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-green-800 mb-1">You're on the list!</h3>
        <p className="text-green-700 text-sm">
          Thanks, <strong>{name}</strong>! We'll email you at{" "}
          <strong>{email}</strong> when early access opens.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 max-w-md mx-auto flex flex-col gap-4"
    >
      <h3 className="text-lg font-bold text-gray-900 text-center">
        Join the Early Access List
      </h3>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="gradient-bg text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition text-sm"
      >
        Get Early Access →
      </button>
      <p className="text-xs text-gray-400 text-center">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
