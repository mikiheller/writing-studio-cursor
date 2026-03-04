import { Project, VoiceProfile, Version, ChatThread } from "./types";

const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  return fetchJson<Project[]>(`${API_BASE}/projects`);
}

export async function getProject(id: string): Promise<Project | undefined> {
  try {
    return await fetchJson<Project>(`${API_BASE}/projects/${id}`);
  } catch {
    return undefined;
  }
}

export async function saveProject(project: Project): Promise<void> {
  await fetchJson(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await Promise.all(projects.map((p) => saveProject(p)));
}

export async function deleteProject(id: string): Promise<void> {
  await fetchJson(`${API_BASE}/projects/${id}`, { method: "DELETE" });
}

export async function getVoiceProfile(): Promise<VoiceProfile> {
  return fetchJson<VoiceProfile>(`${API_BASE}/voice-profile`);
}

export async function saveVoiceProfile(profile: VoiceProfile): Promise<void> {
  await fetchJson(`${API_BASE}/voice-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
}

export async function getVersions(): Promise<Version[]> {
  return fetchJson<Version[]>(`${API_BASE}/versions`);
}

export async function getProjectVersions(projectId: string): Promise<Version[]> {
  return fetchJson<Version[]>(`${API_BASE}/versions?projectId=${projectId}`);
}

export async function saveVersion(version: Version): Promise<void> {
  await fetchJson(`${API_BASE}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(version),
  });
}

export async function getChatThreads(): Promise<ChatThread[]> {
  return fetchJson<ChatThread[]>(`${API_BASE}/chat-threads`);
}

export async function getProjectChatThreads(projectId: string): Promise<ChatThread[]> {
  return fetchJson<ChatThread[]>(`${API_BASE}/chat-threads?projectId=${projectId}`);
}

export async function saveChatThread(thread: ChatThread): Promise<void> {
  await fetchJson(`${API_BASE}/chat-threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(thread),
  });
}
