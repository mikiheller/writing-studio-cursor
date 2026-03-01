import { Project, VoiceProfile, Version, ChatThread } from "./types";

const STORAGE_KEYS = {
  projects: "writing-studio-projects",
  voiceProfile: "writing-studio-voice-profile",
  versions: "writing-studio-versions",
  chatThreads: "writing-studio-chat-threads",
} as const;

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProjects(): Project[] {
  return getFromStorage<Project[]>(STORAGE_KEYS.projects, []);
}

export function saveProjects(projects: Project[]): void {
  setToStorage(STORAGE_KEYS.projects, projects);
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  saveProjects(projects);
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
  const versions = getVersions().filter((v) => v.projectId !== id);
  setToStorage(STORAGE_KEYS.versions, versions);
  const threads = getChatThreads().filter((t) => t.projectId !== id);
  setToStorage(STORAGE_KEYS.chatThreads, threads);
}

export function getVoiceProfile(): VoiceProfile {
  return getFromStorage<VoiceProfile>(STORAGE_KEYS.voiceProfile, {
    generalStyle: "",
    tweetStyle: "",
    longFormStyle: "",
    exampleWriting: "",
    topics: [],
    personality: "",
  });
}

export function saveVoiceProfile(profile: VoiceProfile): void {
  setToStorage(STORAGE_KEYS.voiceProfile, profile);
}

export function getVersions(): Version[] {
  return getFromStorage<Version[]>(STORAGE_KEYS.versions, []);
}

export function getProjectVersions(projectId: string): Version[] {
  return getVersions()
    .filter((v) => v.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function saveVersion(version: Version): void {
  const versions = getVersions();
  versions.push(version);
  setToStorage(STORAGE_KEYS.versions, versions);
}

export function getChatThreads(): ChatThread[] {
  return getFromStorage<ChatThread[]>(STORAGE_KEYS.chatThreads, []);
}

export function getProjectChatThreads(projectId: string): ChatThread[] {
  return getChatThreads().filter((t) => t.projectId === projectId);
}

export function saveChatThread(thread: ChatThread): void {
  const threads = getChatThreads();
  const index = threads.findIndex((t) => t.id === thread.id);
  if (index >= 0) {
    threads[index] = thread;
  } else {
    threads.push(thread);
  }
  setToStorage(STORAGE_KEYS.chatThreads, threads);
}
