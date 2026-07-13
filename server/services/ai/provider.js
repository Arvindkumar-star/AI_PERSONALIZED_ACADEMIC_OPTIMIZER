import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';

export function aiEnabled() {
  const { provider, geminiApiKey, openaiApiKey } = env.ai;
  if (provider === 'gemini') return Boolean(geminiApiKey);
  if (provider === 'openai') return Boolean(openaiApiKey);
  return false;
}

// Extract the first JSON object from a possibly noisy LLM response.
function extractJSON(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callGemini(prompt) {
  const { geminiApiKey, geminiModel } = env.ai;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(502, `Gemini request failed: ${res.status}`, body.slice(0, 500));
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAI(prompt) {
  const { openaiApiKey, openaiModel } = env.ai;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an academic planning assistant. Respond ONLY with valid JSON. Never invent attendance or SGPA numbers; use the values provided.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(502, `OpenAI request failed: ${res.status}`, body.slice(0, 500));
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

// Runs the prompt against the configured provider and returns parsed JSON.
export async function generateJSON(prompt) {
  if (!aiEnabled()) {
    throw new ApiError(
      503,
      'AI provider is not configured. Set AI_PROVIDER and the matching API key.'
    );
  }
  const raw =
    env.ai.provider === 'gemini' ? await callGemini(prompt) : await callOpenAI(prompt);
  const parsed = extractJSON(raw);
  if (!parsed) {
    throw new ApiError(502, 'AI returned an unparseable response');
  }
  return parsed;
}
