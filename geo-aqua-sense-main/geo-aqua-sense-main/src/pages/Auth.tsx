import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, UserCircle, FlaskConical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/types';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('researcher');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('isAuthenticated', 'true');
      
      toast({
        title: 'Login successful',
        description: `Welcome! You are logged in as ${selectedRole}.`,
      });

      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  const roles = [
    { value: 'researcher', label: 'Researcher', icon: FlaskConical, description: 'Access all features including data analysis and AI tools' },
    { value: 'policymaker', label: 'Policymaker', icon: UserCircle, description: 'View reports and make informed policy decisions' },
    { value: 'student', label: 'Student', icon: UserCircle, description: 'Learn and explore water quality data' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-gradient-primary p-3 shadow-elevated">
              <Droplets className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                HMPI Platform
              </h1>
              <p className="text-sm text-muted-foreground">Heavy Metal Pollution Index</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Monitor Groundwater Quality with AI-Powered Insights
            </h2>
            <p className="text-lg text-muted-foreground">
              Automated computation of pollution indices, real-time risk assessment, 
              and explainable AI recommendations for safer water resources.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-muted-foreground">6+ Pollution Indices</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-muted-foreground">GeoAI Mapping</span>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access the HMPI monitoring platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="researcher@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Your Role</Label>
                    <div className="grid gap-2">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setSelectedRole(role.value as UserRole)}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                              selectedRole === role.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="researcher@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-org">Organization</Label>
                    <Input
                      id="signup-org"
                      type="text"
                      placeholder="Central Ground Water Board"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Your Role</Label>
                    <div className="grid gap-2">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setSelectedRole(role.value as UserRole)}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                              selectedRole === role.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
