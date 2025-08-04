import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Award, Users, Stethoscope } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="glass-effect border-b sticky top-0 z-50 animate-slide-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-9 w-9 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">MedQuiz Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
                Sign in
              </Link>
              <Link to="/register">
                <Button variant="gradient" size="lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Master the <span className="text-primary">USMLE</span> with
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Interactive Quiz Practice
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
              Join thousands of medical students who trust MedQuiz Pro for comprehensive 
              USMLE preparation. Practice with realistic questions, track your progress, 
              and achieve your best score.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button variant="gradient" size="large" className="min-w-56 h-14 text-lg shadow-custom-md hover:shadow-custom-lg">
                  Start Free Trial
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="large" className="min-w-56 h-14 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-up">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Why Medical Students Choose MedQuiz Pro
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive features designed specifically for USMLE success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl border bg-card shadow-custom hover:shadow-custom-md transition-all duration-300 animate-in group">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="h-9 w-9 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                USMLE-Style Questions
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Practice with authentic clinical scenarios that mirror the actual USMLE exam format
              </p>
            </div>

            <div className="text-center p-8 rounded-xl border bg-card shadow-custom hover:shadow-custom-md transition-all duration-300 animate-in group">
              <div className="bg-green-100 dark:bg-green-900/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Award className="h-9 w-9 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Progress Tracking
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Monitor your improvement with detailed analytics and performance insights
              </p>
            </div>

            <div className="text-center p-8 rounded-xl border bg-card shadow-custom hover:shadow-custom-md transition-all duration-300 animate-in group">
              <div className="bg-purple-100 dark:bg-purple-900/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Users className="h-9 w-9 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Study Community
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Join a community of medical students and share your learning journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="animate-fade-up">
              <div className="text-5xl lg:text-6xl font-bold mb-4 text-white">10,000+</div>
              <div className="text-white/80 text-lg font-medium">Practice Questions</div>
            </div>
            <div className="animate-fade-up">
              <div className="text-5xl lg:text-6xl font-bold mb-4 text-white">95%</div>
              <div className="text-white/80 text-lg font-medium">Pass Rate</div>
            </div>
            <div className="animate-fade-up">
              <div className="text-5xl lg:text-6xl font-bold mb-4 text-white">50,000+</div>
              <div className="text-white/80 text-lg font-medium">Students Trust Us</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fade-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Ready to Ace Your USMLE?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Join thousands of successful medical students who used MedQuiz Pro to achieve their goals.
          </p>
          <Link to="/register">
            <Button variant="gradient" size="large" className="min-w-72 h-16 text-xl shadow-custom-lg hover:shadow-custom-xl">
              Start Your Free Trial Today
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <Stethoscope className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">MedQuiz Pro</span>
            </div>
            <div className="text-muted-foreground">
              © 2025 MedQuiz Pro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};