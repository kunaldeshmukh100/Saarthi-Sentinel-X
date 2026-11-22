const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function apiPost(endpoint: string, body: object) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    // Return mock response for offline mode
    return { error: "offline", message: "System is in offline mode. Data cached locally." };
  }
}

export async function apiGet(endpoint: string) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    return { error: "offline", message: "Unable to reach server." };
  }
}

// Offline queue for emergency events
const OFFLINE_KEY = "saarthi_offline_queue";

export function queueOfflineEvent(event: object) {
  const existing = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  existing.push({ ...event, timestamp: new Date().toISOString() });
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(existing));
}

export async function syncOfflineEvents() {
  const events = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  if (events.length === 0) return { synced: 0 };

  try {
    const result = await apiPost("/emergency/offline-sync", { events });
    if (!result.error) {
      localStorage.removeItem(OFFLINE_KEY);
    }
    return result;
  } catch {
    return { error: "Still offline" };
  }
}

export function getOfflineQueueSize(): number {
  if (typeof window === "undefined") return 0;
  const events = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  return events.length;
}
