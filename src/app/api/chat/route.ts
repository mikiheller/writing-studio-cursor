import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VoiceProfile {
  generalStyle: string;
  tweetStyle: string;
  longFormStyle: string;
  exampleWriting: string;
  topics: string[];
  personality: string;
}

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  draftContent: string;
  projectFormat: string;
  projectTitle: string;
  voiceProfile: VoiceProfile;
}

function buildSystemPrompt(
  draftContent: string,
  projectFormat: string,
  projectTitle: string,
  voiceProfile: VoiceProfile
): string {
  let prompt = `You are a skilled writing assistant helping a writer craft their work. You're collaborative, not preachy — think trusted editor, not English teacher. Be direct and useful.

PROJECT: "${projectTitle}" (format: ${projectFormat})
`;

  if (voiceProfile.personality || voiceProfile.generalStyle) {
    prompt += `\n## THE WRITER'S VOICE\n`;
    if (voiceProfile.personality) {
      prompt += `Personality: ${voiceProfile.personality}\n`;
    }
    if (voiceProfile.generalStyle) {
      prompt += `General style: ${voiceProfile.generalStyle}\n`;
    }
    if (
      projectFormat === "tweet" || projectFormat === "thread"
        ? voiceProfile.tweetStyle
        : voiceProfile.longFormStyle
    ) {
      const formatStyle =
        projectFormat === "tweet" || projectFormat === "thread"
          ? voiceProfile.tweetStyle
          : voiceProfile.longFormStyle;
      if (formatStyle) {
        prompt += `Style for this format: ${formatStyle}\n`;
      }
    }
    if (voiceProfile.exampleWriting) {
      prompt += `\nExample writing they like:\n${voiceProfile.exampleWriting}\n`;
    }
    if (voiceProfile.topics.length > 0) {
      prompt += `\nTopics they write about: ${voiceProfile.topics.join(", ")}\n`;
    }
  }

  if (draftContent && draftContent !== "<p></p>" && draftContent.trim()) {
    prompt += `\n## CURRENT DRAFT\n${draftContent}\n`;
  } else {
    prompt += `\nThe draft is currently empty — the writer hasn't started yet.\n`;
  }

  prompt += `
## YOUR ROLE
- Help brainstorm, write, rewrite, structure, and refine
- Match their voice and style — don't make it sound generic or AI-ish
- When suggesting text, write it in their voice, not yours
- Be concise in your explanations but generous with actual writing help
- If they ask you to write or rewrite something, just do it — don't over-explain
- For tweets: keep it punchy, respect character limits
- For long-form: help with structure, flow, hooks, and pacing`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body: ChatRequestBody = await request.json();
    const { messages, draftContent, projectFormat, projectTitle, voiceProfile } =
      body;

    const systemPrompt = buildSystemPrompt(
      draftContent,
      projectFormat,
      projectTitle,
      voiceProfile
    );

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ content: reply });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get AI response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
