"use client";
// Contact page with form and confirmation state
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          Get In <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Have a question, partnership idea, or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Contact info */}
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">
              📧
            </div>
            <div>
              <p className="font-semibold text-gray-900">Email Us</p>
              <p className="text-gray-500 text-sm">hello@pdfinsightai.com</p>
            </div>
          </div>
       

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-indigo-900 font-semibold text-sm mb-1">Response time</p>
            <p className="text-indigo-700 text-sm">
              We typically reply within 24 hours on business days.
            </p>
          </div>
        </div>

        {/* Contact form */}
        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Message sent!</h3>
            <p className="text-green-700 text-sm">
              Thanks, {form.name}! We'll get back to you at {form.email} shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 shadow-md rounded-2xl p-8 flex flex-col gap-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us what's on your mind..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <button
              type="submit"
              className="gradient-bg text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition"
            >
              Send Message →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
