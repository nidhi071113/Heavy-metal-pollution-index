// AI Insights via OpenRouter (demo API key — frontend only)
// NOTE: For production, this key should be moved to an edge function.
const OPENROUTER_API_KEY = import.meta.env.VITE1_OPENROUTER_API_KEY;

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface AIInsightRequest {
  sampleId: string;
  location: string;
  pH: number;
  hpi: number;
  hi: number;
  metals: { name: string; value: number; limit: number }[];
}

export async function generateAIInsight(req: AIInsightRequest): Promise<string> {
  const exceedances = req.metals
    .filter(m => m.value > m.limit)
    .map(m => `${m.name}: ${m.value.toFixed(2)} μg/L (limit ${m.limit} μg/L, ${((m.value / m.limit) * 100).toFixed(0)}%)`)
    .join(', ');

  const prompt = `You are a hydrogeochemistry expert analyzing groundwater for the Central Ground Water Board (CGWB) in Pune, India.

Sample: ${req.sampleId} at ${req.location}
- pH: ${req.pH.toFixed(2)}
- HPI (Heavy Metal Pollution Index): ${req.hpi.toFixed(1)}
- HI (Hazard Index): ${req.hi.toFixed(3)}
- Exceedances: ${exceedances || 'None — all metals within BIS limits'}

Provide a concise expert analysis (max 120 words) covering:
1. Drinking water safety verdict
2. Likely contamination source (industrial, geogenic, agricultural)
3. Top health concern with affected organ system
4. ONE specific actionable recommendation

Be precise, scientific, and direct. No disclaimers.`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'HMPI Platform',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('OpenRouter error:', res.status, errText);
      throw new Error(`API ${res.status}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || 'No analysis available.';
  } catch (e) {
    console.error('AI insight failed:', e);
    return generateFallbackInsight(req);
  }
}

function generateFallbackInsight(req: AIInsightRequest): string {
  const exceeded = req.metals.filter(m => m.value > m.limit);
  if (exceeded.length === 0) {
    return `Sample ${req.sampleId} from ${req.location} shows all heavy metals within BIS-2012 permissible limits. HPI of ${req.hpi.toFixed(1)} indicates ${req.hpi < 50 ? 'low' : 'moderate'} pollution. Water is suitable for drinking after standard disinfection. Continue routine quarterly monitoring.`;
  }
  const top = exceeded.sort((a, b) => b.value / b.limit - a.value / a.limit)[0];
  const sources: Record<string, string> = {
    Arsenic: 'geogenic dissolution from aquifer sediments or industrial discharge',
    Lead: 'plumbing corrosion or vehicular emissions infiltration',
    Cadmium: 'industrial effluent or phosphate fertilizer runoff',
    Chromium: 'tanning industry or electroplating waste',
    Mercury: 'industrial discharge or atmospheric deposition',
  };
  const organs: Record<string, string> = {
    Arsenic: 'skin lesions, cardiovascular disease, and bladder cancer',
    Lead: 'neurological damage, especially in children, and renal toxicity',
    Cadmium: 'kidney damage and skeletal demineralization (Itai-Itai disease)',
    Chromium: 'gastrointestinal ulceration and lung carcinogenesis',
    Mercury: 'central nervous system damage and renal failure',
  };
  return `Sample ${req.sampleId} at ${req.location} is UNSAFE for drinking. ${top.name} at ${top.value.toFixed(2)} μg/L exceeds BIS limit by ${(((top.value - top.limit) / top.limit) * 100).toFixed(0)}%. Likely source: ${sources[top.name] || 'anthropogenic activity'}. Chronic exposure risks ${organs[top.name] || 'multi-organ toxicity'}. RECOMMENDATION: Immediately switch to alternate water source; install RO+UV filtration; conduct medical screening for chronic exposure markers in residents using this well over 6+ months.`;
}
