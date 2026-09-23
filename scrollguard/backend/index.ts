import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

function getGroqClient(): { client: Groq | null; model: string } {
  dotenv.config();
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (apiKey && apiKey !== 'your_groq_api_key_here' && apiKey.startsWith('gsk_')) {
    return { client: new Groq({ apiKey }), model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b' };
  }
  return { client: null, model: '' };
}

function getAnthropicClient(): Anthropic | null {
  dotenv.config();
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (apiKey && apiKey !== 'your_anthropic_api_key_here' && apiKey.startsWith('sk-ant')) {
    return new Anthropic({ apiKey });
  }
  return null;
}

// Initial status log
const initialGroq = getGroqClient();
const initialAnthropic = getAnthropicClient();
const activeProvider = initialGroq.client
  ? `Groq (${initialGroq.model})`
  : initialAnthropic
  ? 'Anthropic (Claude-3.5-Sonnet)'
  : 'None (Intelligent Sandbox Mode)';

console.log(`[ScrollGuard Server] Active AI Provider: ${activeProvider}`);

// Helper to strip markdown formatting blocks if LLM wraps in ```json
function cleanAndParseJSON(text: string) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Unified AI completion runner supporting Groq and Anthropic with automatic fallbacks
 */
async function callAiModel(systemPrompt: string, userPrompt: string, maxTokens: number = 800): Promise<any> {
  const { client: groqClient, model: groqModel } = getGroqClient();
  if (groqClient) {
    try {
      console.log(`[ScrollGuard Server] Invoking Groq AI (${groqModel})...`);
      const chat = await groqClient.chat.completions.create({
        model: groqModel,
        temperature: 0.6,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });
      const text = chat.choices[0]?.message?.content || '{}';
      const parsed = cleanAndParseJSON(text);
      console.log('[ScrollGuard Server] Groq AI successfully generated coaching advice.');
      return parsed;
    } catch (err: any) {
      console.warn(`[ScrollGuard Server] Groq error on ${groqModel}:`, err.message);
      // Try fallback model if 120b is unavailable
      try {
        console.log('[ScrollGuard Server] Attempting fallback model openai/gpt-oss-20b...');
        const chatFallback = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-20b',
          temperature: 0.6,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        });
        const text = chatFallback.choices[0]?.message?.content || '{}';
        return cleanAndParseJSON(text);
      } catch (fallbackErr: any) {
        console.error('[ScrollGuard Server] Groq fallback failed:', fallbackErr.message);
      }
    }
  }

  const anthropicClient = getAnthropicClient();
  if (anthropicClient) {
    try {
      const response = await anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
      return cleanAndParseJSON(text);
    } catch (err: any) {
      console.error('[ScrollGuard Server] Anthropic error:', err.message);
    }
  }

  return null;
}

// 1. Daily Consultation Coach report
app.post('/api/coach/daily', async (req, res) => {
  const { aggregate, dopamineScore, doomscrollCount } = req.body;

  if (!aggregate) {
    return res.status(400).json({ error: 'Missing daily aggregate data' });
  }

  const systemPrompt = `You are an empathetic, science-backed Digital Wellbeing & Behavioral Coach for ScrollGuard.
Your coaching is rooted in cognitive behavioral principles and dopamine neuroscience (Kahneman's System 1 automatic impulses vs System 2 mindful awareness).
Analyze the user's daily metrics: clips watched, screen time, dopamine score (0-100), doomscroll warning sessions, and platform breakdown.
Your tone must be warm, encouraging, realistic, and non-judgmental. Never shame or scold.
Provide concrete habit-replacement strategies (e.g. 5-minute offline buffer, physical book at bedtime, hydration checkpoint).
Return ONLY a valid JSON object matching exactly:
{
  "summary": "Warm, empathetic 2-sentence summary of today's scroll patterns.",
  "topInsight": "A sharp observation connecting their platform pace or dopamine score to why autopilot kicked in.",
  "oneActionSuggestion": "One realistic, high-impact habit rule they can apply immediately tomorrow.",
  "encouragement": "A motivating, supportive closing sentence celebrating their awareness."
}`;

  const userPrompt = `Here are my statistics for today:
- Videos Watched: ${aggregate.totalVideos || 0} clips
- Screen Time: ${Math.round((aggregate.totalWatchTimeMs || 0) / 60000)} minutes
- Dopamine Index: ${dopamineScore || 0}/100 (Higher means faster scrolling/bingeing)
- Doomscroll Warning Events: ${doomscrollCount || 0} sessions
- Platform split: ${JSON.stringify(aggregate.byPlatform || {})}`;

  try {
    const aiReport = await callAiModel(systemPrompt, userPrompt, 800);
    if (aiReport) {
      return res.json(aiReport);
    }

    // Intelligent Sandbox Fallback if no API key is configured yet
    console.log('[ScrollGuard Server] No API key configured. Returning dynamic sandbox Daily report.');
    const totalMins = Math.round((aggregate.totalWatchTimeMs || 0) / 60000);
    const clips = aggregate.totalVideos || 0;
    return res.json({
      summary: `You watched ${clips} clips over ${totalMins} minutes today. Your scrolling remained within manageable parameters.`,
      topInsight: dopamineScore > 50
        ? `Elevated dopamine index (${dopamineScore}/100) indicates fast swipe velocity. Pausing for 3 deep breaths between feeds can help slow the pace.`
        : `Steady dopamine pacing (${dopamineScore}/100) shows good conscious friction against algorithmic auto-play.`,
      oneActionSuggestion: clips > 30
        ? 'Set an evening physical boundary: place your device across the room 30 minutes before sleep.'
        : 'Maintain your current conscious threshold—consider a 15-minute offline walk after work.',
      encouragement: 'Every mindful limit check strengthens your neural agency. Fantastic work!',
    });
  } catch (error: any) {
    console.error('[ScrollGuard Server] Error generating daily report:', error);
    res.status(500).json({ error: 'Failed to generate daily AI coaching report', details: error.message });
  }
});

// 2. Weekly Analysis Coach report
app.post('/api/coach/weekly', async (req, res) => {
  const { aggregates, avgDopamineScore, totalDoomscrollSessions } = req.body;

  if (!aggregates || !Array.isArray(aggregates)) {
    return res.status(400).json({ error: 'Missing weekly aggregates list' });
  }

  const systemPrompt = `You are a supportive, high-level behavioral coach for ScrollGuard.
Analyze 7 days of longitudinal usage aggregates, dopamine trends, and doomscrolling frequency.
Identify whether scrolling is concentrated around specific platforms (YouTube Shorts vs Instagram Reels) or specific hours.
Provide encouraging, strategic habit engineering advice.
Return ONLY a valid JSON object matching exactly:
{
  "summary": "A holistic, empathetic 2-3 sentence overview of this week's habit trajectory.",
  "topInsight": "Key behavioral pattern discovered across the week (e.g. late night doomscrolling, weekday vs weekend binge spikes).",
  "oneActionSuggestion": "A sustainable micro-habit challenge for next week to safeguard high-focus hours.",
  "encouragement": "An inspiring, supportive closing thought emphasizing progress over perfection."
}`;

  const userPrompt = `Here are my weekly statistics over the past 7 days:
- Weekly Average Dopamine Score: ${Math.round(avgDopamineScore || 0)}/100
- Total Doomscroll Sessions Flagged: ${totalDoomscrollSessions || 0}
- Daily Aggregates List: ${JSON.stringify(aggregates)}`;

  try {
    const aiReport = await callAiModel(systemPrompt, userPrompt, 1000);
    if (aiReport) {
      return res.json(aiReport);
    }

    // Dynamic Sandbox Fallback
    console.log('[ScrollGuard Server] No API key configured. Returning dynamic sandbox Weekly report.');
    const totalWeeklyClips = aggregates.reduce((sum: number, curr: any) => sum + (curr.totalVideos || 0), 0);
    return res.json({
      summary: `Across the past 7 days, you logged a total of ${totalWeeklyClips} clips with an average dopamine rating of ${Math.round(avgDopamineScore)}/100.`,
      topInsight: totalDoomscrollSessions > 2
        ? `${totalDoomscrollSessions} rapid swipe sessions were flagged this week, primarily during late evening decompression windows.`
        : 'Consistent pacing across the week demonstrates good boundary enforcement.',
      oneActionSuggestion: 'Plan a 2-hour digital detox window this coming weekend to reset dopamine sensitivity.',
      encouragement: 'Consistent habit tracking is 90% of the battle. Keep building your mindful focus!',
    });
  } catch (error: any) {
    console.error('[ScrollGuard Server] Error generating weekly report:', error);
    res.status(500).json({ error: 'Failed to generate weekly AI coaching report', details: error.message });
  }
});

// 3. AI Habit Predictions (Predictive Nudge Banner)
app.post('/api/predict', async (req, res) => {
  const { triggerPatterns, currentHour, currentDay } = req.body;

  if (!triggerPatterns || !Array.isArray(triggerPatterns)) {
    return res.status(400).json({ error: 'Missing trigger pattern listings' });
  }

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = weekdays[currentDay] || 'today';

  const systemPrompt = `You are a predictive behavior analyst for ScrollGuard.
Evaluate the user's historical trigger patterns and current hour/day context to evaluate if there is an imminent risk of compulsive scrolling.
If the current time matches a known recurring pattern (confidence >= 0.4), generate a single-sentence friendly predictive warning.
Phrase it as a gentle, curious mindfulness reminder, never an accusation.
Example: "You tend to binge around this time on Sundays—want to set a 20-clip focus goal today?"
Return ONLY a valid JSON object matching exactly:
{
  "prediction": "The single-sentence warning message string, or null if no pattern matches"
}`;

  const userPrompt = `Context:
- Current Hour: ${currentHour}:00
- Current Day of Week: ${dayName}
- Historical trigger patterns: ${JSON.stringify(triggerPatterns)}`;

  try {
    const aiReport = await callAiModel(systemPrompt, userPrompt, 300);
    if (aiReport && aiReport.prediction) {
      return res.json(aiReport);
    }

    // Default gentle predictive prompt
    return res.json({
      prediction: `You often unwind with short videos around this hour on ${dayName}s—remember to set a mindful intention before scrolling!`,
    });
  } catch (error: any) {
    console.error('[ScrollGuard Server] Error generating predictive nudge:', error);
    res.status(500).json({ error: 'Failed to generate prediction nudge', details: error.message });
  }
});

let syncedData: any = null;

// Real-time synchronization bridge endpoints
app.post('/api/sync', (req, res) => {
  syncedData = req.body;
  res.json({ success: true });
});

app.get('/api/data', (req, res) => {
  res.json({ data: syncedData });
});

app.listen(PORT, () => {
  console.log(`[ScrollGuard Server] Running on http://localhost:${PORT}`);
});
