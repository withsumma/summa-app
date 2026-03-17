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
// Called after the setup flow is complete (screen 8 → 9)
// Returns { fund, error }
// ============================================================
export async function createFund(data) {
  if (!supabase) return { fund: null, error: "Supabase not configured" };

  const slug = generateSlug(data.title || "summa-fund");

  const { data: fund, error } = await supabase
    .from("funds")
    .insert({
      slug,
      fund_for: data.fundFor,
      first_name: data.firstName || "",
      last_name: data.lastName || "",
      recipient_name: data.recipientName || "",
      title: data.title,
      description: data.description || "",
      goal: Number(data.goal) || 0,
      target_date: data.targetDate || null,
      payment_handles: data.paymentHandles || {},
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
