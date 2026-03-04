"use client";

import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";
import { VoiceProfile } from "@/lib/types";
import { getVoiceProfile, saveVoiceProfile } from "@/lib/store";

export default function SettingsPage() {
  const [profile, setProfile] = useState<VoiceProfile>({
    generalStyle: "",
    tweetStyle: "",
    longFormStyle: "",
    exampleWriting: "",
    topics: [],
    personality: "",
  });
  const [topicInput, setTopicInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVoiceProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    await saveVoiceProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addTopic() {
    const topic = topicInput.trim();
    if (topic && !profile.topics.includes(topic)) {
      setProfile({ ...profile, topics: [...profile.topics, topic] });
      setTopicInput("");
    }
  }

  function removeTopic(topic: string) {
    setProfile({ ...profile, topics: profile.topics.filter((t) => t !== topic) });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Voice Profile</h1>
          <p className="mt-1 text-sm text-stone-500">
            Define your writing style. This gets fed to the AI every time it helps you.
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            saved
              ? "bg-emerald-600 text-white"
              : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save profile"}
        </button>
      </div>

      <div className="mt-8 space-y-8">
        <section>
          <label className="block text-sm font-semibold text-stone-800">Personality & Tone</label>
          <p className="mt-1 text-xs text-stone-500">
            How would you describe your writing personality? (e.g., witty, direct, irreverent, thoughtful, conversational)
          </p>
          <textarea
            value={profile.personality}
            onChange={(e) => setProfile({ ...profile, personality: e.target.value })}
            placeholder="I'm conversational and a bit irreverent. I like making people laugh while making a real point. I avoid being preachy..."
            rows={3}
            className="mt-2 w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
          />
        </section>

        <section>
          <label className="block text-sm font-semibold text-stone-800">General Writing Style</label>
          <p className="mt-1 text-xs text-stone-500">
            Describe how you like to write overall — sentence structure, vocabulary, level of formality.
          </p>
          <textarea
            value={profile.generalStyle}
            onChange={(e) => setProfile({ ...profile, generalStyle: e.target.value })}
            placeholder="I write in a conversational, first-person style. I use short sentences and paragraphs. I like parenthetical asides..."
            rows={4}
            className="mt-2 w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
          />
        </section>

        <section>
          <label className="block text-sm font-semibold text-stone-800">Tweet Style</label>
          <p className="mt-1 text-xs text-stone-500">
            How do you like your tweets specifically? (punchier? more provocative? emoji usage?)
          </p>
          <textarea
            value={profile.tweetStyle}
            onChange={(e) => setProfile({ ...profile, tweetStyle: e.target.value })}
            placeholder="Punchy and provocative. I like hot takes that make people think. Minimal emojis. Sometimes all-caps for emphasis..."
            rows={3}
            className="mt-2 w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
          />
        </section>

        <section>
          <label className="block text-sm font-semibold text-stone-800">Long-Form Style</label>
          <p className="mt-1 text-xs text-stone-500">
            How should longer posts and articles sound?
          </p>
          <textarea
            value={profile.longFormStyle}
            onChange={(e) => setProfile({ ...profile, longFormStyle: e.target.value })}
            placeholder="More nuanced but still conversational. I like starting with a hook, using personal anecdotes, and building to a conclusion..."
            rows={3}
            className="mt-2 w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
          />
        </section>

        <section>
          <label className="block text-sm font-semibold text-stone-800">Example Writing</label>
          <p className="mt-1 text-xs text-stone-500">
            Paste examples of writing you like — yours or someone else&apos;s. The AI will learn from these.
          </p>
          <textarea
            value={profile.exampleWriting}
            onChange={(e) => setProfile({ ...profile, exampleWriting: e.target.value })}
            placeholder="Paste examples here..."
            rows={6}
            className="mt-2 w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
          />
        </section>

        <section>
          <label className="block text-sm font-semibold text-stone-800">Topics You Write About</label>
          <p className="mt-1 text-xs text-stone-500">
            Add topics so the AI understands your interests and can reference them.
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
              placeholder="Add a topic..."
              className="flex-1 rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              onClick={addTopic}
              className="rounded-lg bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-200"
            >
              Add
            </button>
          </div>
          {profile.topics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.topics.map((topic) => (
                <span
                  key={topic}
                  className="flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700"
                >
                  {topic}
                  <button
                    onClick={() => removeTopic(topic)}
                    className="text-violet-400 hover:text-violet-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-stone-200 bg-stone-50 p-5">
          <label className="block text-sm font-semibold text-stone-800">API Keys</label>
          <p className="mt-1 text-xs text-stone-500">
            API keys are configured in the server&apos;s <code className="rounded bg-stone-200 px-1 py-0.5 text-[11px]">.env.local</code> file for security.
            Currently using <span className="font-medium text-emerald-600">OpenAI GPT-5.2</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
