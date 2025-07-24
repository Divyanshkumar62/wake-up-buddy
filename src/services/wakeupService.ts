import supabase from "./supabaseClient";

export interface WakeLog {
  id: string;
  user_id: string;
  created_at: string; // UTC ISO string
}

const CUTOFF_HOUR = 8; // 8:00 AM local time

// Get all wake logs for the user, sorted descending
export async function getWakeLogs(userId: string): Promise<WakeLog[]> {
  const { data, error } = await supabase
    .from("wake_logs")
    .select("id, user_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// Log a new wake-up (created_at is set by Supabase)
export async function logWakeup(userId: string): Promise<void> {
  const { error } = await supabase
    .from("wake_logs")
    .insert({ user_id: userId });
  if (error) throw error;
}

// Check if user has already logged today before cutoff
export function hasLoggedToday(logs: WakeLog[]): boolean {
  const now = new Date();
  const today = now.toLocaleDateString();
  return logs.some((log) => {
    const logDate = new Date(log.created_at);
    // Only count logs before cutoff hour
    if (logDate.toLocaleDateString() !== today) return false;
    return logDate.getHours() < CUTOFF_HOUR;
  });
}

// Get the last valid wake log (before cutoff)
export function getLastWake(logs: WakeLog[]): string | null {
  for (const log of logs) {
    const logDate = new Date(log.created_at);
    if (logDate.getHours() < CUTOFF_HOUR) {
      return log.created_at;
    }
  }
  return null;
}

// Calculate streak based on consecutive days with valid logs before cutoff
export function calculateStreak(logs: WakeLog[]): number {
  if (!logs.length) return 0;
  let streak = 0;
  let current = new Date();
  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].created_at);
    if (logDate.getHours() >= CUTOFF_HOUR) continue;
    // Compare only date part
    if (logDate.toLocaleDateString() === current.toLocaleDateString()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (
      logDate.toLocaleDateString() ===
      new Date(current.setDate(current.getDate() - 1)).toLocaleDateString()
    ) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
