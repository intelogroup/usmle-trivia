import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Accessibility,
  Eye,
  Ear, 
  Keyboard,
  MousePointer,
  Volume2,
  TestTube,
  PlayCircle,
  Settings,
  Check,
  AlertTriangle,
  Info,
  Heart,
  Brain,
  Stethoscope
} from 'lucide-react';
import { AccessibilitySettings } from '../accessibility/AccessibilitySettings';
import { useAccessibility, useQuizAccessibility, useMedicalContentAccessibility } from '../accessibility/AccessibilityProvider';

interface DemoState {
  showSettings: boolean;
  currentDemo: string | null;
  demoProgress: number;
  testResults: any[];
}

export const AccessibilityDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>({
    showSettings: false,
    currentDemo: null,
    demoProgress: 0,
    testResults: []
  });

  const { announce, preferences } = useAccessibility();
  const quizA11y = useQuizAccessibility();
  const medicalA11y = useMedicalContentAccessibility();
  const demoRef = useRef<HTMLDivElement>(null);

  // Demo scenarios
  const demoScenarios = [
    {
      id: 'quiz-navigation',
      title: 'Quiz Navigation Demo',
      description: 'Experience enhanced quiz interaction with screen reader support',
      icon: <Brain className="h-5 w-5" />,
      action: () => runQuizNavigationDemo()
    },
    {
      id: 'medical-terms',
      title: 'Medical Terminology Demo', 
      description: 'Hear medical terms with definitions and pronunciations',
      icon: <Stethoscope className="h-5 w-5" />,
      action: () => runMedicalTermsDemo()
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts Demo',
      description: 'Learn efficient keyboard navigation for the platform',
      icon: <Keyboard className="h-5 w-5" />,
      action: () => runKeyboardShortcutsDemo()
    },
    {
      id: 'focus-management',
      title: 'Focus Management Demo',
      description: 'See advanced focus indicators and keyboard trapping',
      icon: <MousePointer className="h-5 w-5" />,
      action: () => runFocusManagementDemo()
    },
    {
      id: 'visual-accessibility',
      title: 'Visual Accessibility Demo',
      description: 'Test high contrast, large text, and color blindness filters',
      icon: <Eye className="h-5 w-5" />,
      action: () => runVisualAccessibilityDemo()
    }
  ];

  const runQuizNavigationDemo = async () => {
    setState(prev => ({ ...prev, currentDemo: 'quiz-navigation', demoProgress: 0 }));
    
    // Simulate quiz start
    announce('Starting Quiz Navigation Demonstration', { priority: 'assertive', clear: true });
    await delay(1000);
    
    setState(prev => ({ ...prev, demoProgress: 20 }));
    quizA11y.announceQuizStart('Practice', 5, 300);
    await delay(2000);
    
    setState(prev => ({ ...prev, demoProgress: 40 }));
    quizA11y.announceQuestionChange(1, 5, 'Cardiology');
    await delay(2000);
    
    setState(prev => ({ ...prev, demoProgress: 60 }));
    quizA11y.announceAnswerSelection('A', 'Myocardial infarction');
    await delay(1500);
    
    setState(prev => ({ ...prev, demoProgress: 80 }));
    quizA11y.announceCorrectAnswer(true, 'Myocardial infarction', 
      'MI occurs when blood flow to the heart muscle is blocked, causing tissue death. This is commonly caused by coronary artery disease with plaque rupture.');
    await delay(3000);
    
    setState(prev => ({ ...prev, demoProgress: 100 }));
    announce('Quiz Navigation Demo completed. All interactions were announced with medical context.', { priority: 'polite', clear: true });
  };

  const runMedicalTermsDemo = async () => {
    setState(prev => ({ ...prev, currentDemo: 'medical-terms', demoProgress: 0 }));
    
    const medicalTerms = [
      { term: 'Hypertension', definition: 'High blood pressure - persistently elevated arterial pressure above 140/90 mmHg' },
      { term: 'Myocardial infarction', definition: 'Heart attack - death of heart muscle tissue due to blocked blood supply' },
      { term: 'Pneumonia', definition: 'Infection and inflammation of the lungs, typically caused by bacteria, viruses, or fungi' },
      { term: 'Arrhythmia', definition: 'Irregular heartbeat or abnormal heart rhythm that can be too fast, too slow, or irregular' }
    ];

    announce('Starting Medical Terminology Demo with expanded definitions', { priority: 'assertive', clear: true });
    
    for (let i = 0; i < medicalTerms.length; i++) {
      await delay(1000);
      setState(prev => ({ ...prev, demoProgress: ((i + 1) / medicalTerms.length) * 100 }));
      
      const { term, definition } = medicalTerms[i];
      medicalA11y.announceWithMedicalContext(`Medical term: ${term}, defined as ${definition}`, false);
      await delay(3000);
    }
    
    announce('Medical Terminology Demo completed. Medical terms were announced with full definitions for better understanding.', { priority: 'polite', clear: true });
  };

  const runKeyboardShortcutsDemo = async () => {
    setState(prev => ({ ...prev, currentDemo: 'keyboard-shortcuts', demoProgress: 0 }));
    
    const shortcuts = [
      'Alt + R: Read current question',
      'Alt + E: Read explanation',
      'Alt + N: Next question',
      'Alt + P: Previous question',
      'Alt + S: Submit answer',
      'Alt + H: Show shortcuts',
      'Alt + A: Accessibility settings'
    ];

    announce('Demonstrating keyboard shortcuts for efficient navigation', { priority: 'assertive', clear: true });
    await delay(1000);
    
    for (let i = 0; i < shortcuts.length; i++) {
      setState(prev => ({ ...prev, demoProgress: ((i + 1) / shortcuts.length) * 100 }));
      announce(shortcuts[i], { priority: 'polite', clear: false });
      await delay(1200);
    }
    
    announce('Keyboard shortcuts demonstration completed. These shortcuts work throughout the medical education platform.', { priority: 'polite', clear: true });
  };

  const runFocusManagementDemo = async () => {
    setState(prev => ({ ...prev, currentDemo: 'focus-management', demoProgress: 0 }));
    
    announce('Demonstrating focus management and keyboard trapping', { priority: 'assertive', clear: true });
    await delay(1000);
    
    // Simulate focus management
    setState(prev => ({ ...prev, demoProgress: 25 }));
    announce('Focus saved before opening modal', { priority: 'polite', clear: false });
    await delay(1500);
    
    setState(prev => ({ ...prev, demoProgress: 50 }));
    announce('Focus trapped within modal dialog for keyboard navigation', { priority: 'polite', clear: false });
    await delay(1500);
    
    setState(prev => ({ ...prev, demoProgress: 75 }));
    announce('Tab navigation cycles through modal elements only', { priority: 'polite', clear: false });
    await delay(1500);
    
    setState(prev => ({ ...prev, demoProgress: 100 }));
    announce('Focus restored to previous location after modal closes. Focus management demo completed.', { priority: 'polite', clear: true });
  };

  const runVisualAccessibilityDemo = async () => {
    setState(prev => ({ ...prev, currentDemo: 'visual-accessibility', demoProgress: 0 }));
    
    const visualFeatures = [
      'High contrast mode for better text visibility',
      'Large text scaling for improved readability', 
      'Reduced motion for users with vestibular disorders',
      'Color blindness filters for deuteranopia, protanopia, and tritanopia',
      'Enhanced focus indicators for keyboard navigation'
    ];

    announce('Demonstrating visual accessibility enhancements', { priority: 'assertive', clear: true });
    await delay(1000);
    
    for (let i = 0; i < visualFeatures.length; i++) {
      setState(prev => ({ ...prev, demoProgress: ((i + 1) / visualFeatures.length) * 100 }));
      announce(visualFeatures[i], { priority: 'polite', clear: false });
      await delay(1800);
    }
    
    announce('Visual accessibility demonstration completed. These features adapt the interface for various visual needs.', { priority: 'polite', clear: true });
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="space-y-8 p-6" ref={demoRef}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Advanced Accessibility Features Demo
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Experience comprehensive WCAG 2.1 AA compliant accessibility features specifically designed for medical education.
          This demo showcases screen reader support, keyboard navigation, visual enhancements, and medical content accessibility.
        </p>
      </div>

      {/* Current Settings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Accessibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${preferences.highContrast ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>High Contrast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${preferences.largeText ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Large Text</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${preferences.reducedMotion ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Reduced Motion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${preferences.screenReader ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Screen Reader</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setState(prev => ({ ...prev, showSettings: true }))}
            className="mt-4"
          >
            <Settings className="h-4 w-4 mr-2" />
            Open Accessibility Settings
          </Button>
        </CardContent>
      </Card>

      {/* Demo Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoScenarios.map((demo) => (
          <Card key={demo.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {demo.icon}
                {demo.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{demo.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress indicator */}
              {state.currentDemo === demo.id && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <PlayCircle className="h-4 w-4 text-primary" />
                    <span>Demo in progress...</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${state.demoProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {state.demoProgress}% complete
                  </div>
                </div>
              )}
              
              <Button 
                onClick={demo.action}
                disabled={state.currentDemo !== null && state.currentDemo !== demo.id}
                className="w-full"
                variant={state.currentDemo === demo.id ? "secondary" : "default"}
              >
                {state.currentDemo === demo.id ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    <span>Running Demo...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    <span>Start Demo</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Accessibility Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Medical Terms with Tooltips */}
          <div className="space-y-2">
            <h4 className="font-semibold">Medical Terms with Enhanced Accessibility:</h4>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm leading-relaxed">
                The patient presents with{' '}
                <span 
                  {...medicalA11y.createMedicalTermTooltip('hypertension', 'High blood pressure')}
                  tabIndex={0}
                >
                  hypertension
                </span>
                {' '}and signs of{' '}
                <span 
                  {...medicalA11y.createMedicalTermTooltip('myocardial ischemia', 'Reduced blood flow to heart muscle')}
                  tabIndex={0}
                >
                  myocardial ischemia
                </span>
                . The{' '}
                <abbr {...medicalA11y.createAbbreviationExpansion('ECG', 'Electrocardiogram')}>
                  ECG
                </abbr>
                {' '}shows concerning changes.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Hover or focus on medical terms and abbreviations for definitions.
              </p>
            </div>
          </div>

          {/* Keyboard Navigation Example */}
          <div className="space-y-2">
            <h4 className="font-semibold">Enhanced Keyboard Navigation:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Option A
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Brain className="h-4 w-4 mr-2" />
                Option B
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Stethoscope className="h-4 w-4 mr-2" />
                Option C
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <TestTube className="h-4 w-4 mr-2" />
                Option D
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use Tab to navigate, Arrow keys to move between options, Space or Enter to select.
            </p>
          </div>

          {/* Screen Reader Announcements */}
          <div className="space-y-2">
            <h4 className="font-semibold">Screen Reader Announcements:</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => announce('This is a test announcement for screen readers')}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Test Announcement
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => medicalA11y.announceWithMedicalContext('Patient has HTN and DM', true)}
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Medical Content
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => quizA11y.announceQuestionChange(3, 10, 'Cardiology')}
              >
                <Brain className="h-4 w-4 mr-2" />
                Quiz Navigation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Accessibility Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visual Accessibility
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• High contrast mode</li>
                <li>• Large text scaling (25% increase)</li>
                <li>• Color blindness filters</li>
                <li>• Enhanced focus indicators</li>
                <li>• Reduced motion support</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Ear className="h-4 w-4" />
                Audio Accessibility
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Screen reader optimization</li>
                <li>• Medical term definitions</li>
                <li>• Abbreviation expansions</li>
                <li>• Context-aware announcements</li>
                <li>• Quiz state narration</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Motor Accessibility
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Comprehensive keyboard shortcuts</li>
                <li>• Focus trap management</li>
                <li>• Skip navigation links</li>
                <li>• 44px minimum touch targets</li>
                <li>• Voice control compatibility</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <h4>WCAG 2.1 AA Compliance:</h4>
            <ul>
              <li><strong>Perceivable:</strong> Alt text, captions, high contrast, color alternatives</li>
              <li><strong>Operable:</strong> Keyboard accessible, no seizure triggers, navigation aids</li>
              <li><strong>Understandable:</strong> Clear language, medical term definitions, consistent navigation</li>
              <li><strong>Robust:</strong> Screen reader compatible, semantic HTML, ARIA attributes</li>
            </ul>
            
            <h4>Medical Education Specific Features:</h4>
            <ul>
              <li><strong>Medical Terminology:</strong> Automatic definition lookup and pronunciation guides</li>
              <li><strong>Quiz Accessibility:</strong> Enhanced navigation and progress announcements</li>
              <li><strong>Clinical Context:</strong> Structured content for medical scenarios</li>
              <li><strong>Learning Optimization:</strong> Customizable reading speeds and repetition</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Settings Modal */}
      {state.showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <AccessibilitySettings 
              className="p-6"
              onClose={() => setState(prev => ({ ...prev, showSettings: false }))}
              showTesting={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};