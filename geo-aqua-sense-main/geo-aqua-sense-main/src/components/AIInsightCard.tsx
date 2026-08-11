import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, RefreshCw, Bot } from 'lucide-react';
import { generateAIInsight } from '@/utils/aiInsights';
import type { WaterSample } from '@/types';

interface AIInsightCardProps {
  sample: WaterSample;
}

const BIS_LIMITS = { Arsenic: 10, Lead: 10, Cadmium: 3, Chromium: 50, Mercury: 1, Nickel: 20 };

export const AIInsightCard = ({ sample }: AIInsightCardProps) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    const result = await generateAIInsight({
      sampleId: sample.sampleId,
      location: sample.wellId,
      pH: sample.pH,
      hpi: sample.hpi || 0,
      hi: sample.hi || 0,
      metals: [
        { name: 'Arsenic', value: sample.as, limit: BIS_LIMITS.Arsenic },
        { name: 'Lead', value: sample.pb, limit: BIS_LIMITS.Lead },
        { name: 'Cadmium', value: sample.cd, limit: BIS_LIMITS.Cadmium },
        { name: 'Chromium', value: sample.cr, limit: BIS_LIMITS.Chromium },
        { name: 'Mercury', value: sample.hg || 0, limit: BIS_LIMITS.Mercury },
      ],
    });
    setInsight(result);
    setLoading(false);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                AI Expert Analysis
                <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />
                  LLM-powered
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">Hydrogeochemistry insights via GeoAI model</CardDescription>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={fetchInsight} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : insight ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            {!loading && !insight && 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insight && !loading && (
          <div className="text-sm text-muted-foreground italic text-center py-6 border border-dashed rounded-lg">
            Click <strong>Generate</strong> to get an AI-powered expert analysis of this sample.
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Analyzing sample with GeoAI model...
          </div>
        )}
        {insight && !loading && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 p-3 rounded-md bg-background/60 border">
            {insight}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
