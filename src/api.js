import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
  }

  return supabase;
}

function toBucket(row) {
  return {
    id: row.id,
    group: row.name,
    items: Array.isArray(row.items) ? row.items : [],
  };
}

export async function getSession() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function login({ email, password }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signUp({ email, password }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  return data.session;
}

export async function logout() {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function listBuckets(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("shopping_buckets")
    .select("id,name,items")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data.map(toBucket);
}

export async function createBucket(payload, userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("shopping_buckets")
    .insert({
      user_id: userId,
      name: payload.name,
      items: payload.items || [],
    })
    .select("id,name,items")
    .single();

  if (error) throw error;
  return toBucket(data);
}

export async function deleteBucket(bucketId, userId) {
  const client = requireSupabase();
  const { error } = await client
    .from("shopping_buckets")
    .delete()
    .eq("id", bucketId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function updateBucket(bucketId, payload, userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("shopping_buckets")
    .update({
      name: payload.name,
      items: payload.items || [],
    })
    .eq("id", bucketId)
    .eq("user_id", userId)
    .select("id,name,items")
    .single();

  if (error) throw error;
  return toBucket(data);
}
