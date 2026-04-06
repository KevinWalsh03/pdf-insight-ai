// Protected dashboard — only accessible when signed in
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Welcome back, {user?.firstName ?? "there"} 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's your PDF Insight AI dashboard.</p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Placeholder upload area */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Upload a PDF</h2>
          <p className="text-gray-500 text-sm mb-6">
            Drag and drop your PDF here, or click to browse.
          </p>
          <button className="gradient-bg text-white font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition">
            Choose File
          </button>
          <p className="text-gray-400 text-xs mt-4">
            Free plan: 3 uploads per week
          </p>
        </div>

        {/* Recent uploads placeholder */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Documents</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
            No documents yet — upload your first PDF above.
          </div>
        </div>
      </div>
    </div>
  );
}
