# Writing Studio — Roadmap

## Instructions for AI Agents

**At the start of every new conversation about this project**, read this file first and briefly remind the user what's on the roadmap. Ask if they want to work on any of these items in this session. Keep the summary short — a few bullet points, not a wall of text.

The dev server command is `npm run dev` from the `writing-studio` directory. The app runs at http://localhost:3000.

GitHub repo: https://github.com/mikiheller/writing-studio-cursor

---

## Remaining Work

### High Priority

- **Database** — Currently all data (projects, versions, chat threads, voice profile) is stored in localStorage, which means it's lost on browser/cookie reset. Need to add a real database (e.g., Postgres via Supabase or PlanetScale) so data persists properly. This is the most important next step.

- **Export for publishing** — A way to go from "Ready" status to actually posting. Copy as plain text for Twitter, copy as formatted HTML for Substack. For tweets, a "Copy as tweet" button that strips all formatting and respects the 280-char limit. This closes the loop from writing to publishing.

### Medium Priority

- **Claude API integration** — The user has an OpenAI key set up (GPT-5.2). They also want Anthropic/Claude as an option. The API route (`src/app/api/chat/route.ts`) needs to support both, with a way to switch between them.

- **Side-by-side version comparison** — Version history currently supports preview and restore. Add the ability to compare any two versions side-by-side with diffs highlighted.

- **Quick-capture / Idea inbox** — A way to jot down a new idea while in the middle of writing something else, without leaving the current workspace. Could be a floating button or keyboard shortcut that opens a mini-modal.

- **Twitter thread formatting** — For the "Thread" format, help split a long piece into tweet-sized chunks with proper numbering (1/n, 2/n, etc.) and respect character limits per tweet.

### Lower Priority

- **Brainstorm mode** — A visually distinct chat mode (different color? separate panel?) specifically for brainstorming that's separate from the main writing-help chat but still has context of the draft.

- **Short story / book support** — The user has short story and book ideas. Longer formats might need chapters, sections, or other structural support beyond what's there now.

---

## What's Already Built

- Project library with search, filter, create, delete
- Rich text editor (Tiptap) with formatting toolbar
- Format-aware word/character counts (280 char limit for tweets, word targets for posts)
- AI chat panel powered by GPT-5.2 with full draft + voice profile context
- One-click insert/replace/copy from AI responses into the editor
- Multiple chat threads per project
- Voice profile settings (personality, style, examples, topics)
- Version history with auto-save, preview, restore, rename
- Auto-save every 30 seconds
- Deployed to Vercel (needs OPENAI_API_KEY env var)
