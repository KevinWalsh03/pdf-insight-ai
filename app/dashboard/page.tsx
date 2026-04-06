// Protected dashboard — checks user plan and upload count from Supabase
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const FREE_UPLOAD_LIMIT = 3;

async function getOrCreateProfile(clerkUserId: string) {
  // Try to fetch existing profile
  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (existing) {
    // Reset weekly count if a new week has started
    const resetAt = new Date(existing.week_reset_at);
    const now = new Date();
    if (now > resetAt) {
      const { data: reset } = await supabaseAdmin
        .from("profiles")
        .update({
          uploads_this_week: 0,
          week_reset_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("clerk_user_id", clerkUserId)
        .select()
        .single();
      return reset;
    }
    return existing;
  }

  // Create new profile for first-time users
  const { data: created } = await supabaseAdmin
    .from("profiles")
    .insert({
      clerk_user_id: clerkUserId,
      plan: "free",
      uploads_this_week: 0,
      week_reset_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  return created;
}

export default async function DashboardPage() {
  const user = await currentUser();
  const profile = user ? await getOrCreateProfile(user.id) : null;

  const isPaid = profile?.plan === "paid";
  const uploadsUsed = profile?.uploads_this_week ?? 0;
  const uploadsRemaining = isPaid ? "Unlimited" : Math.max(0, FREE_UPLOAD_LIMIT - uploadsUsed);
  const atLimit = !isPaid && uploadsUsed >= FREE_UPLOAD_LIMIT;

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

        {/* Plan badge */}
        <div className="flex items-center gap-3 mb-8">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isPaid
              ? "bg-indigo-100 text-indigo-700"
              : "bg-gray-100 text-gray-600"
          }`}>
            {isPaid ? "⭐ Pro Plan" : "Free Plan"}
          </span>
          {!isPaid && (
            <span className="text-sm text-gray-500">
              {uploadsUsed}/{FREE_UPLOAD_LIMIT} uploads used this week
              {atLimit && (
                <span className="ml-2 text-red-500 font-medium">— Limit reached</span>
              )}
            </span>
          )}
          {isPaid && (
            <span className="text-sm text-gray-500">Unlimited uploads</span>
          )}
        </div>

        {/* Upload area */}
        <div className={`bg-white rounded-2xl border-2 border-dashed p-16 text-center shadow-sm ${
          atLimit ? "border-red-200 opacity-60" : "border-indigo-200"
        }`}>
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Upload a PDF</h2>
          <p className="text-gray-500 text-sm mb-6">
            {atLimit
              ? "You've reached your free limit. Upgrade to Pro for unlimited uploads."
              : "Drag and drop your PDF here, or click to browse."}
          </p>
          <button
            disabled={atLimit}
            className={`font-semibold px-6 py-2.5 rounded-lg transition ${
              atLimit
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "gradient-bg text-white hover:opacity-90"
            }`}
          >
            {atLimit ? "Upgrade to Upload" : "Choose File"}
          </button>
          {!isPaid && (
            <p className="text-gray-400 text-xs mt-4">
              Free plan: {uploadsRemaining} upload{uploadsRemaining === 1 ? "" : "s"} remaining this week
            </p>
          )}
        </div>

        {/* Upgrade banner for free users */}
        {!isPaid && (
          <div className="mt-6 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-lg">Upgrade to Pro</p>
              <p className="text-indigo-100 text-sm">Unlimited uploads, priority processing, and advanced AI insights.</p>
            </div>
            <button className="bg-white text-indigo-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-50 transition flex-shrink-0">
              Upgrade Now →
            </button>
          </div>
        )}

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
