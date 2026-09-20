import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const apiKey = process.env.ANTHROPIC_API_KEY || '';
const isKeyConfigured = apiKey && apiKey !== 'your_anthropic_api_key_here';

const anthropic = isKeyConfigured
  ? new Anthropic({ apiKey })
  : null;

console.log(`[ScrollGuard Server] Anthropic API Key Configured: ${!!isKeyConfigured}`);

// Helper to strip markdown formatting blocks if Claude includes them
function cleanAndParseJSON(text: string) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

// 1. Daily Coach report
app.post('/api/coach/daily', async (req, res) => {
  const { aggregate, dopamineScore, doomscrollCount } = req.body;

  if (!aggregate) {
    return res.status(400).json({ error: 'Missing daily aggregate data' });
  }

  if (!anthropic) {
    console.log('[ScrollGuard Server] API Key missing. Returning sandbox Daily Coach report.');
    return res.json({
      summary: `You swiped ${aggregate.totalVideos} clips over ${Math.round(aggregate.totalWatchTimeMs / 60000)} minutes today. Your pace indicates steady patterns.`,
      topInsight: `Your average dopamine index sat at ${dopamineScore}/100 with ${doomscrollCount} doomscroll warning events triggered.`,
      oneActionSuggestion: 'Try setting your daily limit to 30 clips before starting tomorrow.',
      encouragement: 'Every conscious limit check helps strengthen your focus baseline. Keep it up!',
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 800,
      system: `You are a supportive, empathetic wellbeing coach for ScrollGuard.
Your tone must be non-judgmental, positive, and constructive. Never shame. Celebrate positive change, even minor ones.
Analyze the user's aggregate stats and return a valid JSON object matching exactly:
{
  "summary": "Brief empathetic summary of today's viewing patterns.",
  "topInsight": "A key observation about their scroll speed, platform distribution, or dopamine triggers.",
  "oneActionSuggestion": "One clear, concrete, actionable step they can take today to reduce scrolling.",
  "encouragement": "A supportive closing sentence."
}
Return ONLY valid raw JSON. Do not wrap in markdown or prefix/suffix text.`,
      messages: [
        {
          role: 'user',
          content: `Here are my statistics for today:
- Videos Watched: ${aggregate.totalVideos} clips
- Screen Time: ${Math.round(aggregate.totalWatchTimeMs / 60000)} minutes
- Dopamine Index: ${dopamineScore}/100
- Doomscroll warnings: ${doomscrollCount} sessions
- Platform split: ${JSON.stringify(aggregate.byPlatform)}`,
        },
      ],
    });

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const report = cleanAndParseJSON(textContent);
    res.json(report);
  } catch (error: any) {
    console.error('[ScrollGuard Server] Error generating daily report:', error);
    res.status(500).json({ error: 'Failed to communicate with Claude API', details: error.message });
  }
});

// 2. Weekly Coach report
app.post('/api/coach/weekly', async (req, res) => {
  const { aggregates, avgDopamineScore, totalDoomscrollSessions } = req.body;

  if (!aggregates || !Array.isArray(aggregates)) {
    return res.status(400).json({ error: 'Missing weekly aggregates list' });
  }

  if (!anthropic) {
    console.log('[ScrollGuard Server] API Key missing. Returning sandbox Weekly Coach report.');
    return res.json({
      summary: `Across the past 7 days, you watched a total of ${aggregates.reduce((sum, curr) => sum + curr.totalVideos, 0)} clips.`,
      topInsight: `Your average weekly dopamine score stayed steady at ${Math.round(avgDopamineScore)}/100, showing positive habit consistency.`,
      oneActionSuggestion: 'Plan to block out a 2-hour offline focus period next Sunday afternoon.',
      encouragement: 'You had fewer late-night overrides this week. Great work protecting your sleep!',
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1200,
      system: `You are a supportive, empathetic weekly wellbeing coach for ScrollGuard.
Deliver a 3-4 sentence comprehensive analysis over 7 days of aggregates. Tone must be encouraging, concrete, and non-judgmental.
Return a valid JSON object matching exactly:
{
  "summary": "Brief empathetic summary of the week's scrolling trend.",
  "topInsight": "A weekly habit observation (e.g. platform dominance or late-night patterns).",
  "oneActionSuggestion": "One clear, concrete weekly goal suggestion.",
  "encouragement": "A supportive weekly closing statement."
}
Return ONLY valid raw JSON. Do not wrap in markdown or prefix/suffix text.`,
      messages: [
        {
          role: 'user',
          content: `Here are my weekly statistics:
- Weekly average dopamine score: ${avgDopamineScore}/100
- Total weekly doomscrolling warning flags: ${totalDoomscrollSessions} sessions
- Daily logs: ${JSON.stringify(aggregates)}`,
        },
      ],
    });

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const report = cleanAndParseJSON(textContent);
    res.json(report);
  } catch (error: any) {
    console.error('[ScrollGuard Server] Error generating weekly report:', error);
    res.status(500).json({ error: 'Failed to communicate with Claude API', details: error.message });
  }
});

// 3. AI habit predictions
app.post('/api/predict', async (req, res) => {
  const { triggerPatterns, currentHour, currentDay } = req.body;

  if (!triggerPatterns || !Array.isArray(triggerPatterns)) {
    return res.status(400).json({ error: 'Missing trigger pattern listings' });
  }

  if (!anthropic) {
    console.log('[ScrollGuard Server] API Key missing. Returning sandbox trigger prediction.');
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return res.json({
      prediction: `You tend to start scrolling around this time on ${weekdays[currentDay]}s—want to set a lighter limit today?`,
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 300,
      system: `You are a predictive behavior analyst for ScrollGuard.
Analyze the user's historical trigger patterns and the current day/hour context to evaluate if there is an imminent risk of compulsive scrolling.

If the current time/day matches or falls very close to a recurring high-confidence trigger pattern (confidence >= 0.5), generate a single-sentence predictive warning message. The message must be phrased as an observation, never a diagnosis, and should offer a gentle mindfulness reminder.
Example: "You tend to binge around this time on Fridays — want to set a lighter goal today?"

If there is no match or patterns are sparse, return null.

Return a valid JSON object matching exactly:
{
  "prediction": "The single-sentence warning message string, or null if no match"
}
Return ONLY valid raw JSON. Do not wrap in markdown or prefix/suffix text.`,
      messages: [
        {
          role: 'user',
          content: `Context:
- Current Hour: ${currentHour} (0-23)
- Current Day of Week: ${currentDay} (0 = Sunday, 6 = Saturday)
- Trigger habits list: ${JSON.stringify(triggerPatterns)}`,
        },
      ],
    });

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const report = cleanAndParseJSON(textContent);
    res.json(report);
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
