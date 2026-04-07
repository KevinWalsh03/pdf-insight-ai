// Protected dashboard — fetches profile + documents, renders upload UI
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import UploadSection from "./UploadSection";
import { UpgradeBanner, ManageSubscriptionButton } from "./UpgradeBanner";
import Link from "next/link";

const FREE_UPLOAD_LIMIT = 3;

async function getOrCreateProfile(clerkUserId: string) {
  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (existing) {
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
  if (!user) return null;

  const [profile, { data: documents }] = await Promise.all([
    getOrCreateProfile(user.id),
    supabaseAdmin
      .from("documents")
      .select("*")
      .eq("clerk_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const isPaid = profile?.plan === "paid";
  const uploadsUsed = profile?.uploads_this_week ?? 0;
  const uploadsRemaining = isPaid ? "Unlimited" : Math.max(0, FREE_UPLOAD_LIMIT - uploadsUsed);
  const atLimit = !isPaid && uploadsUsed >= FREE_UPLOAD_LIMIT;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Welcome back, {user.firstName ?? "there"} 👋
            </h1>
            <p className="text-gray-500 mt-1">Upload a PDF to get started.</p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Plan badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isPaid ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
          }`}>
            {isPaid ? "⭐ Pro Plan" : "Free Plan"}
          </span>
          <span className="text-sm text-gray-500">
            {isPaid ? "Unlimited uploads" : `${uploadsUsed}/${FREE_UPLOAD_LIMIT} uploads used this week`}
            {atLimit && <span className="ml-2 text-red-500 font-medium">— Limit reached</span>}
          </span>
        </div>

        {/* Upload area */}
        <UploadSection atLimit={atLimit} uploadsRemaining={uploadsRemaining} isPaid={isPaid} />

        {/* Upgrade banner / manage subscription */}
        {!isPaid ? (
          <UpgradeBanner />
        ) : (
          <div className="mt-6 flex justify-end">
            <ManageSubscriptionButton />
          </div>
        )}

        {/* Recent documents */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Documents</h2>
          {documents && documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc: any) => (
                <Link
                  key={doc.id}
                  href={`/document/${doc.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📄</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{doc.file_name}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      {doc.ai_summary && (
                        <p className="text-gray-500 text-xs mt-2 line-clamp-2">{doc.ai_summary}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
              No documents yet — upload your first PDF above.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
