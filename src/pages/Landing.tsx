import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Briefcase, Building2, Heart, Sparkles, Target, Users } from 'lucide-react';
import { Header } from '@/components/Layout/Header';

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">The Future of Job Matching</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Swipe Right on Your
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Dream Job</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Revolutionary job platform that connects talented professionals with innovative companies through intelligent matching and an intuitive swipe experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup?role=talent">
                <Button size="lg" className="gradient-primary text-lg px-8 shadow-elevated hover:shadow-glow transition-all">
                  I'm Looking for a Job
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signup?role=company">
                <Button size="lg" variant="outline" className="text-lg px-8 border-2">
                  I'm Hiring Talent
                  <Building2 className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose JobSwipe?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the most efficient and enjoyable way to find your perfect match
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-elevated transition-all border-2 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Smart Matching</h3>
                <p className="text-muted-foreground">
                  AI-powered algorithm matches you with opportunities based on skills, experience, and preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all border-2 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Intuitive Interface</h3>
                <p className="text-muted-foreground">
                  Swipe right to apply, left to pass. Simple, fast, and incredibly satisfying.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all border-2 hover:border-primary/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Real-Time Updates</h3>
                <p className="text-muted-foreground">
                  Get instant notifications when companies view your profile or respond to your applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Talents Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 mb-6">
                <Briefcase className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">For Job Seekers</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">Your Next Career Move is Just a Swipe Away</h2>
              <ul className="space-y-4 mb-8">
                {[
                  'Create your comprehensive profile with CV, portfolio, and skills',
                  'Get matched with jobs that fit your experience and goals',
                  'Apply instantly with a single swipe',
                  'Track all your applications in one place',
                  'Total privacy - only companies you apply to see your profile'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup?role=talent">
                <Button size="lg" className="gradient-primary shadow-elevated">
                  Start Swiping Jobs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl"></div>
              <Card className="relative shadow-elevated border-2">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-32 w-32 text-primary/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl"></div>
              <Card className="relative shadow-elevated border-2">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-32 w-32 text-secondary/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="animate-fade-in-up order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 mb-6">
                <Building2 className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">For Employers</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">Find Top Talent Faster Than Ever</h2>
              <ul className="space-y-4 mb-8">
                {[
                  'Post jobs in minutes with our streamlined interface',
                  'Get instant applications from qualified candidates',
                  'View detailed profiles of interested talents',
                  'Manage application status and communicate efficiently',
                  'Real-time notifications for new applications'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup?role=company">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 shadow-elevated">
                  Start Hiring Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="relative overflow-hidden shadow-elevated border-2">
            <div className="absolute inset-0 gradient-hero opacity-10"></div>
            <CardContent className="relative p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Job Search?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of professionals and companies already using JobSwipe to find their perfect match.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup?role=talent">
                  <Button size="lg" className="gradient-primary text-lg px-8 shadow-elevated">
                    Get Started as Talent
                  </Button>
                </Link>
                <Link to="/signup?role=company">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-2">
                    Get Started as Company
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container text-center text-muted-foreground">
          <p className="text-lg mb-4">© 2025 JobSwipe. All rights reserved.</p>
          <p>Making job matching simple, fast, and enjoyable.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
