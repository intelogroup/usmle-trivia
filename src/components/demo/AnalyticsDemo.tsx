/**
 * Analytics Integration Demo Component
 * Demonstrates production analytics capabilities with real examples
 * For testing and validation of the enhanced analytics system
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { analyticsService } from '../../services/analyticsEnhanced';

export const AnalyticsDemo: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState(analyticsService.getHealthStatus());
  const [demoActive, setDemoActive] = useState(false);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    // Initialize analytics with demo configuration
    const initDemo = async () => {
      await analyticsService.initialize('demo_user_123', {
        enableGA4: true,  // Will only work if GA4_MEASUREMENT_ID is configured
        enableMixpanel: true, // Will only work if MIXPANEL_TOKEN is configured  
        enablePostHog: true,  // Will only work if POSTHOG_API_KEY is configured
        enableOfflineQueue: true
      });
      
      // Set up demo medical student profile
      analyticsService.identifyMedicalStudent('demo_user_123', {
        email: 'demo@medschool.edu', // Will be anonymized
        school: 'Demo Medical University',
        year: 3,
        specialty_interest: 'cardiology',
        usmle_step: 'step_2_ck',
        study_goals: ['improve_accuracy', 'increase_speed', 'master_cardiology']
      });
      
      setHealthStatus(analyticsService.getHealthStatus());
    };

    initDemo();
  }, []);

  const handleStartDemo = () => {
    setDemoActive(true);
    
    // Demo: Quiz Start Event
    analyticsService.trackQuizStart('timed', 10, 'cardiology');
    setEventCount(prev => prev + 1);
    
    // Demo: Question View Events  
    setTimeout(() => {
      analyticsService.trackQuestionView('demo_q_001', 1, {
        difficulty: 'medium',
        category: 'cardiology',
        usmleCategory: 'step_2_ck'
      });
      setEventCount(prev => prev + 1);
    }, 1000);
    
    // Demo: Answer Selection
    setTimeout(() => {
      analyticsService.trackAnswerSelected('demo_q_001', 2, true, {
        difficulty: 'medium',
        category: 'cardiology'
      });
      setEventCount(prev => prev + 1);
    }, 3000);
    
    // Demo: Quiz Completion
    setTimeout(() => {
      analyticsService.trackQuizComplete(8, 10, 420, {
        subjects: ['cardiology'],
        difficultyDistribution: { easy: 2, medium: 6, hard: 2 }
      });
      setEventCount(prev => prev + 1);
    }, 5000);
    
    // Demo: Study Session Analytics
    setTimeout(() => {
      analyticsService.trackStudySession({
        duration: 1800, // 30 minutes
        questions_answered: 25,
        subjects: ['cardiology', 'pulmonology'],
        performance: 0.82
      });
      setEventCount(prev => prev + 1);
    }, 7000);
    
    // Demo: Learning Outcome
    setTimeout(() => {
      analyticsService.trackLearningOutcome({
        topic: 'myocardial_infarction',
        initial_score: 0.65,
        final_score: 0.85,
        attempts: 3,
        mastery_achieved: true
      });
      setEventCount(prev => prev + 1);
      
      setHealthStatus(analyticsService.getHealthStatus());
      setDemoActive(false);
    }, 9000);
  };

  const handleConsentDemo = (consent: 'granted' | 'denied') => {
    analyticsService.setUserConsent(consent);
    setHealthStatus(analyticsService.getHealthStatus());
  };

  const handleFlushEvents = async () => {
    await analyticsService.flush();
    setHealthStatus(analyticsService.getHealthStatus());
  };

  const handleEngagementMetrics = () => {
    analyticsService.trackEngagementMetrics();
    setEventCount(prev => prev + 1);
  };

  const handleMedicalError = () => {
    analyticsService.trackMedicalContentError({
      question_id: 'demo_q_002',
      error_type: 'outdated_reference',
      severity: 'medium',
      medical_accuracy: false
    });
    setEventCount(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Enhanced Analytics System Demo
            <span className="text-sm font-normal text-muted-foreground">
              Production-Ready Medical Education Analytics
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analytics Health Status */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Analytics Enabled:</span>
                    <span className={healthStatus.enabled ? "text-green-600" : "text-red-600"}>
                      {healthStatus.enabled ? "✅ Yes" : "❌ No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consent Status:</span>
                    <span className="capitalize font-medium">
                      {healthStatus.consent_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Events Tracked:</span>
                    <span className="font-mono">{eventCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Offline Queue:</span>
                    <span className="font-mono">{healthStatus.offline_queue_size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analytics Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {healthStatus.providers.map(provider => (
                    <div key={provider.name} className="flex justify-between">
                      <span>{provider.name}:</span>
                      <span className={provider.ready ? "text-green-600" : "text-yellow-600"}>
                        {provider.ready ? "✅ Ready" : "⚠️ Not Configured"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                  <p className="text-blue-800 dark:text-blue-200">
                    💡 Configure provider tokens in environment variables to enable tracking.
                    See .env.local for configuration examples.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demo Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  onClick={handleStartDemo}
                  disabled={demoActive}
                  className="w-full"
                >
                  {demoActive ? "Running Demo..." : "Start Analytics Demo"}
                </Button>
                
                <Button 
                  onClick={handleEngagementMetrics}
                  variant="outline"
                  className="w-full"
                >
                  Track Engagement
                </Button>
                
                <Button 
                  onClick={handleMedicalError}
                  variant="outline"
                  className="w-full"
                >
                  Track Medical Error
                </Button>
                
                <Button 
                  onClick={handleFlushEvents}
                  variant="outline"
                  className="w-full"
                >
                  Flush Events
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GDPR/HIPAA Compliance Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test user consent handling for medical education platform:
                </p>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleConsentDemo('granted')}
                    variant="outline"
                    size="sm"
                  >
                    Grant Consent
                  </Button>
                  <Button 
                    onClick={() => handleConsentDemo('denied')}
                    variant="outline"
                    size="sm"
                  >
                    Deny Consent
                  </Button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                  <p><strong>Privacy Features:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>User IDs are automatically hashed</li>
                    <li>PII is scrubbed from error messages</li>
                    <li>Offline event queuing with automatic retry</li>
                    <li>Medical school names are anonymized</li>
                    <li>Search queries are sanitized</li>
                    <li>Events are dropped when consent is denied</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Education Specific Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical Education Analytics Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Learning Analytics:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Quiz performance tracking by medical specialty</li>
                    <li>• Learning velocity and retention scoring</li>
                    <li>• Study session quality assessment</li>
                    <li>• USMLE preparation progress tracking</li>
                    <li>• Question difficulty adaptation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Medical Platform Features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Medical content error reporting</li>
                    <li>• Clinical accuracy validation</li>
                    <li>• Specialty-specific performance metrics</li>
                    <li>• HIPAA-compliant data handling</li>
                    <li>• Medical school anonymization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Developer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Usage in Components:</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                    <div>import {'{ analyticsService }'} from './services/analyticsEnhanced';</div>
                    <div className="mt-2">// Track quiz events</div>
                    <div>analyticsService.trackQuizStart('timed', 10, 'cardiology');</div>
                    <div className="mt-2">// Track medical student profile</div>
                    <div>analyticsService.identifyMedicalStudent(userId, profile);</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Environment Configuration:</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                    <div>VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX</div>
                    <div>VITE_MIXPANEL_TOKEN=your_mixpanel_token</div>
                    <div>VITE_POSTHOG_API_KEY=your_posthog_key</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};