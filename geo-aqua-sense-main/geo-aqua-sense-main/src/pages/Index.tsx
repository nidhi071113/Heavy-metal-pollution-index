import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Droplets, BarChart3, Shield, MapPin, Sparkles, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="rounded-xl bg-gradient-primary p-4 shadow-elevated animate-pulse">
              <Droplets className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            Heavy Metal Pollution
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
              Index Platform
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered groundwater quality monitoring with automated pollution index computation, 
            real-time risk assessment, and explainable insights for safer water resources.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="shadow-elevated">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6 justify-center pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              <span>BIS/WHO/EPA Standards</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-success" />
              <span>Real-time Monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all">
            <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <Droplets className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">6+ Pollution Indices</h3>
            <p className="text-muted-foreground">
              Automated computation of HPI, HEI, Igeo, CF, EF, PLI, and Hazard Index with real-time classification.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all">
            <div className="rounded-lg bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">GeoAI Mapping</h3>
            <p className="text-muted-foreground">
              Interactive contamination heatmaps, hotspot detection, and smart sampling guidance powered by AI.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all">
            <div className="rounded-lg bg-warning/10 w-12 h-12 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-warning" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Explainable AI</h3>
            <p className="text-muted-foreground">
              Risk cards with clear explanations, feature importance, and recommended actions for every site.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-32">
        <div className="max-w-3xl mx-auto text-center bg-gradient-primary rounded-2xl p-12 shadow-elevated text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Monitor Water Quality?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join researchers, policymakers, and field teams using HMPI Platform for safer groundwater.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="shadow-lg"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
