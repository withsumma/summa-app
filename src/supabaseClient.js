// ============================================================
// Supabase Client — shared across the app
// ============================================================
// After creating your Supabase project, add these to your .env file:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbG...
//
// And in Vercel → Project Settings → Environment Variables, add the same values.
// ============================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


// ============================================================
// AUTH: Sign up a new user
// Creates an account with email + password, stores name in metadata
// Returns { user, error }
// ============================================================
export async function signUpUser({ email, password, firstName, lastName }) {
  if (!supabase) return { user: null, error: "Supabase not configured" };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  });

  return { user: data?.user || null, session: data?.session || null, error };
}


// ============================================================
// AUTH: Sign in an existing user
// Returns { user, error }
// ============================================================
export async function signInUser({ email, password }) {
  if (!supabase) return { user: null, error: "Supabase not configured" };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data?.user || null, session: data?.session || null, error };
}


// ============================================================
// AUTH: Get the currently signed-in user (from stored session)
// Call on app load to restore session
// Returns { user, error }
// ============================================================
export async function getCurrentUser() {
  if (!supabase) return { user: null, error: "Supabase not configured" };

  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}


// ============================================================
// AUTH: Sign out
// ============================================================
export async function signOutUser() {
  if (!supabase) return { error: "Supabase not configured" };
  const { error } = await supabase.auth.signOut();
  return { error };
}


// ============================================================
// Helper: Generate a URL-friendly slug from a fund title
// "Help Jason Recover" → "help-jason-recover"
// Appends a short random suffix to avoid collisions
// ============================================================
export function generateSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-")             // collapse multiple hyphens
    .replace(/^-|-$/g, "")           // trim leading/trailing hyphens
    .slice(0, 48);                   // cap length

  // Add 4-char random suffix for uniqueness
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}


// ============================================================
// API: Create a new fund
// Links the fund to the authenticated user via creator_id
// Returns { fund, error }
// ============================================================
export async function createFund(data) {
  if (!supabase) return { fund: null, error: "Supabase not configured" };

  // Get the current user's ID to link this fund to their account
  const { data: { user } } = await supabase.auth.getUser();
  const creatorId = user?.id || null;

  const slug = generateSlug(data.title || "summa-fund");

  const { data: fund, error } = await supabase
    .from("funds")
    .insert({
      slug,
      creator_id: creatorId,
      fund_for: data.fundFor,
      first_name: data.firstName || "",
      last_name: data.lastName || "",
      recipient_name: data.recipientName || "",
      title: data.title,
      description: data.description || "",
      goal: Number(data.goal) || 0,
      target_date: data.targetDate || null,
      payment_handles: data.paymentHandles || {},
      cover_photo_url: data.coverImage || null,
      cover_image_position: data.coverImagePosition || { x: 50, y: 50 },
      content_blocks: data.contentBlocks || [],
    })
    .select()
    .single();

  return { fund, error };
}


// ============================================================
// API: Load a fund by its slug
// Called when a supporter visits /fund/{slug}
// Returns { fund, error }
// ============================================================
export async function loadFundBySlug(slug) {
  if (!supabase) return { fund: null, error: "Supabase not configured" };

  const { data: fund, error } = await supabase
    .from("funds")
    .select("*")
    .eq("slug", slug)
    .single();

  return { fund, error };
}


// ============================================================
// API: Load all funds created by the current user
// Used on GuardianHome dashboard
// Returns { funds, error }
// ============================================================
export async function loadFundsByCreator() {
  if (!supabase) return { funds: [], error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { funds: [], error: "Not signed in" };

  const { data: funds, error } = await supabase
    .from("funds")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return { funds: funds || [], error };
}


// ============================================================
// API: Update an existing fund
// Called from EditSummaFund to save changes
// Returns { fund, error }
// ============================================================
export async function updateFund(fundId, updates) {
  if (!supabase) return { fund: null, error: "Supabase not configured" };

  const { data: fund, error } = await supabase
    .from("funds")
    .update({
      title: updates.title,
      description: updates.description || "",
      goal: Number(updates.goal) || 0,
      target_date: updates.targetDate || null,
      payment_handles: updates.paymentHandles || {},
      cover_photo_url: updates.coverImage || null,
      cover_image_position: updates.coverImagePosition || { x: 50, y: 50 },
      content_blocks: updates.contentBlocks || [],
    })
    .eq("id", fundId)
    .select()
    .single();

  return { fund, error };
}


// ============================================================
// API: Delete a fund
// Called from EditSummaFund when user taps "Delete this fund"
// Returns { error }
// ============================================================
export async function deleteFund(fundId) {
  if (!supabase) return { error: "Supabase not configured" };

  // Delete associated contributions first (ignore errors — fund may have none)
  const { error: contribError } = await supabase
    .from("contributions")
    .delete()
    .eq("fund_id", fundId);
  if (contribError) console.warn("Error deleting contributions:", contribError);

  const { error, data: deleted } = await supabase
    .from("funds")
    .delete()
    .eq("id", fundId)
    .select();

  console.log("deleteFund result:", { fundId, error, deleted });

  // If RLS silently blocked the delete (no error but nothing deleted), surface it
  if (!error && (!deleted || deleted.length === 0)) {
    return { error: "Fund could not be deleted. You may need to enable DELETE in your Supabase RLS policies for the funds table." };
  }

  return { error };
}


// ============================================================
// API: Record a contribution
// Called when a supporter submits their name/message (screen 16)
// Returns { contribution, error }
// ============================================================
export async function recordContribution({ fundId, amount, paymentMethod, supporterName, message }) {
  if (!supabase) return { contribution: null, error: "Supabase not configured" };

  const { data: contribution, error } = await supabase
    .from("contributions")
    .insert({
      fund_id: fundId,
      amount,
      payment_method: paymentMethod,
      supporter_name: supporterName || "Anonymous",
      message: message || "",
    })
    .select()
    .single();

  return { contribution, error };
}


// ============================================================
// API: Get all contributions for a fund
// Used on the creator's fund page to show supporter activity
// Returns { contributions, error }
// ============================================================
export async function getContributions(fundId) {
  if (!supabase) return { contributions: [], error: "Supabase not configured" };

  const { data: contributions, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("fund_id", fundId)
    .order("created_at", { ascending: false });

  return { contributions: contributions || [], error };
}


// ============================================================
// API: Update a contribution's status (confirm or reject/ignore)
// Called when the guardian taps "Confirm" or "Ignore"
// Returns { error }
// ============================================================
export async function updateContributionStatus(contributionId, status) {
  if (!supabase) return { error: "Supabase not configured" };

  const { error } = await supabase
    .from("contributions")
    .update({ status })
    .eq("id", contributionId);

  return { error };
}
