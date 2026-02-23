export type ProjectFormat = "tweet" | "thread" | "short-post" | "long-post";

export type ProjectStatus =
  | "idea"
  | "drafting"
  | "editing"
  | "ready"
  | "published";

export interface Project {
  id: string;
  title: string;
  summary: string;
  format: ProjectFormat;
  status: ProjectStatus;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VoiceProfile {
  generalStyle: string;
  tweetStyle: string;
  longFormStyle: string;
  exampleWriting: string;
  topics: string[];
  personality: string;
}

export interface Version {
  id: string;
  projectId: string;
  content: string;
  name: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  projectId: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
}

export const FORMAT_LABELS: Record<ProjectFormat, string> = {
  tweet: "Tweet",
  thread: "Thread",
  "short-post": "Short Post",
  "long-post": "Long Post",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  idea: "Idea",
  drafting: "Drafting",
  editing: "Editing",
  ready: "Ready",
  published: "Published",
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  idea: "bg-amber-100 text-amber-700",
  drafting: "bg-blue-100 text-blue-700",
  editing: "bg-violet-100 text-violet-700",
  ready: "bg-emerald-100 text-emerald-700",
  published: "bg-stone-100 text-stone-500",
};

export const FORMAT_ICONS: Record<ProjectFormat, string> = {
  tweet: "MessageCircle",
  thread: "MessagesSquare",
  "short-post": "FileText",
  "long-post": "BookOpen",
};
