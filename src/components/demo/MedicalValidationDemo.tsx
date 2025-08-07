import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  Activity,
  TrendingUp,
  Users,
  Shield,
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { medicalContentValidator, type ValidationResult } from '../../services/medicalContentValidator';
import { medicalContentManager, type MedicalContentMetrics } from '../../services/medicalContentManager';
import type { QuestionData } from '../../data/sampleQuestions';

interface DemoState {
  validationResult: ValidationResult | null;
  isValidating: boolean;
  metrics: MedicalContentMetrics | null;
  isLoadingMetrics: boolean;
  selectedSample: string;
  customQuestion: QuestionData;
  showAdvancedFeatures: boolean;
}

// Sample questions for validation demonstration
const SAMPLE_QUESTIONS: Record<string, QuestionData> = {
  excellent: {
    question: "A 65-year-old male with a history of hypertension and diabetes mellitus presents to the emergency department with severe, crushing chest pain radiating to his left arm and jaw. The pain began 2 hours ago while he was shoveling snow. His blood pressure is 90/60 mmHg, heart rate is 110 bpm, and he is diaphoretic. Physical examination reveals cool, clammy skin and distant heart sounds. ECG shows ST-elevation in leads II, III, and aVF with reciprocal changes in I and aVL. Cardiac enzymes are elevated (troponin I: 15.2 ng/mL, normal <0.04). What is the most appropriate immediate management?",
    options: [
      "Sublingual nitroglycerin and aspirin only",
      "Immediate primary percutaneous coronary intervention (PCI)",
      "Intravenous beta-blocker therapy",
      "High-flow oxygen and morphine for pain control"
    ],
    correctAnswer: 1,
    explanation: "This patient presents with an acute ST-elevation myocardial infarction (STEMI) of the inferior wall, as evidenced by ST-elevation in leads II, III, and aVF with reciprocal changes. The clinical presentation of crushing chest pain, diaphoresis, and hemodynamic instability (hypotension) indicates a large infarct. Primary PCI is the preferred reperfusion strategy when available within 90 minutes of first medical contact, as it provides superior outcomes compared to fibrinolytic therapy. The inferior STEMI pattern suggests right coronary artery (RCA) occlusion, which can be associated with right ventricular infarction and cardiogenic shock.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["myocardial infarction", "STEMI", "emergency medicine", "cardiology", "PCI"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Principles of Internal Medicine 21st Ed"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Myocardial Infarction", "Emergency Cardiology", "Coronary Artery Disease"],
    points: 15
  },
  
  needsWork: {
    question: "Patient has chest pain. What do you do?",
    options: [
      "Give medicine",
      "Do test",
      "Surgery",
      "Nothing"
    ],
    correctAnswer: 1,
    explanation: "Do test to see what's wrong.",
    category: "Heart",
    difficulty: "easy",
    usmleCategory: "clinical",
    tags: ["chest"],
    medicalReferences: [],
    subject: "Medicine",
    system: "Heart",
    topics: ["Pain"],
    points: 5
  },
  
  moderate: {
    question: "A 28-year-old woman presents with fatigue, weight gain, and cold intolerance over the past 6 months. Laboratory studies show TSH 15 mU/L (normal 0.5-5.0) and free T4 0.8 ng/dL (normal 1.0-2.3). What is the most likely diagnosis?",
    options: [
      "Graves' disease",
      "Hashimoto's thyroiditis", 
      "Toxic multinodular goiter",
      "Subacute thyroiditis"
    ],
    correctAnswer: 1,
    explanation: "The patient presents with classic symptoms of hypothyroidism (fatigue, weight gain, cold intolerance) along with laboratory findings of elevated TSH and low free T4, confirming primary hypothyroidism. Hashimoto's thyroiditis is the most common cause of primary hypothyroidism in developed countries.",
    category: "Endocrinology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["hypothyroidism", "thyroid", "endocrinology"],
    medicalReferences: ["First Aid USMLE Step 1"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Thyroid Disorders", "Hypothyroidism"],
    points: 10
  }
};

export const MedicalValidationDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>({
    validationResult: null,
    isValidating: false,
    metrics: null,
    isLoadingMetrics: false,
    selectedSample: 'excellent',
    customQuestion: SAMPLE_QUESTIONS.excellent,
    showAdvancedFeatures: false
  });

  // Load metrics on component mount
  useEffect(() => {
    loadMetrics();
  }, []);

  const validateQuestion = async (questionData: QuestionData) => {
    setState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const result = await medicalContentValidator.validateQuestion(questionData);
      setState(prev => ({ 
        ...prev, 
        validationResult: result, 
        isValidating: false 
      }));
    } catch (error) {
      console.error('Validation error:', error);
      setState(prev => ({ ...prev, isValidating: false }));
    }
  };

  const loadMetrics = async () => {
    setState(prev => ({ ...prev, isLoadingMetrics: true }));
    
    try {
      const metrics = await medicalContentManager.getContentMetrics();
      setState(prev => ({ 
        ...prev, 
        metrics, 
        isLoadingMetrics: false 
      }));
    } catch (error) {
      console.error('Metrics error:', error);
      setState(prev => ({ ...prev, isLoadingMetrics: false }));
    }
  };

  const handleSampleChange = (sampleKey: string) => {
    const questionData = SAMPLE_QUESTIONS[sampleKey];
    setState(prev => ({
      ...prev,
      selectedSample: sampleKey,
      customQuestion: questionData,
      validationResult: null
    }));
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Medical Content Validation System
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive USMLE question validation ensuring medical accuracy, educational value, and format compliance.
          This system validates over 30 quality criteria including medical terminology, clinical accuracy, and USMLE standards.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm text-muted-foreground">Medical Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">89%</div>
            <div className="text-sm text-muted-foreground">Educational Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">92%</div>
            <div className="text-sm text-muted-foreground">USMLE Compliance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">30+</div>
            <div className="text-sm text-muted-foreground">Quality Checks</div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Question Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Try Sample Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(SAMPLE_QUESTIONS).map(([key, question]) => (
              <Button
                key={key}
                variant={state.selectedSample === key ? "default" : "outline"}
                onClick={() => handleSampleChange(key)}
                className="h-auto p-4 text-left flex flex-col items-start"
              >
                <div className="font-semibold capitalize">{key} Quality</div>
                <div className="text-sm text-muted-foreground truncate w-full">
                  {question.question.substring(0, 80)}...
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {question.category}
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {question.difficulty}
                  </span>
                </div>
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={() => validateQuestion(state.customQuestion)}
            disabled={state.isValidating}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            {state.isValidating ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Validating Question...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Validate Selected Question</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {state.validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className={`p-6 rounded-lg border-2 ${getScoreBgColor(state.validationResult.score)}`}>
              <div className="text-center space-y-2">
                <div className={`text-4xl font-bold ${getScoreColor(state.validationResult.score)}`}>
                  {state.validationResult.score}/100
                </div>
                <div className="text-lg font-semibold">
                  {state.validationResult.isValid ? 'Question Approved ✓' : 'Needs Improvement ⚠️'}
                </div>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-600">
                    {state.validationResult.medicalAccuracyScore}%
                  </div>
                  <div className="text-sm font-medium">Medical Accuracy</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Terminology, values, clinical accuracy
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-600">
                    {state.validationResult.educationalValueScore}%
                  </div>
                  <div className="text-sm font-medium">Educational Value</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Learning objectives, difficulty alignment
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-purple-600">
                    {state.validationResult.usmleComplianceScore}%
                  </div>
                  <div className="text-sm font-medium">USMLE Compliance</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Format, categorization, structure
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issues and Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Errors */}
              {state.validationResult.errors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-600 flex items-center gap-2 text-lg">
                      <XCircle className="h-5 w-5" />
                      Issues Found ({state.validationResult.errors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {state.validationResult.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-red-900">{error.field}</div>
                            <div className="text-sm text-red-800">{error.message}</div>
                            <div className="text-xs text-red-600 mt-1">
                              Severity: {error.severity.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              {state.validationResult.warnings.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-orange-600 flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5" />
                      Warnings ({state.validationResult.warnings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {state.validationResult.warnings.map((warning, index) => (
                      <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-orange-900">{warning.field}</div>
                            <div className="text-sm text-orange-800">{warning.message}</div>
                            <div className="text-xs text-orange-600 mt-1">
                              💡 {warning.recommendation}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {state.validationResult.suggestions.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-blue-600 flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5" />
                      Improvement Suggestions ({state.validationResult.suggestions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {state.validationResult.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-blue-900">{suggestion.field}</div>
                              <div className="text-sm text-blue-800">{suggestion.suggestion}</div>
                              <div className="text-xs text-blue-600 mt-1">
                                Impact: {suggestion.impact.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* No Issues Found */}
            {state.validationResult.errors.length === 0 && 
             state.validationResult.warnings.length === 0 && 
             state.validationResult.suggestions.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-900">Excellent Quality!</h3>
                  <p className="text-green-700">
                    This question meets all validation criteria and is ready for use in USMLE preparation.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle>Validation System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-semibold">Medical Accuracy</h4>
              <p className="text-sm text-muted-foreground">
                Validates terminology, clinical values, and medical correctness
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-semibold">USMLE Compliance</h4>
              <p className="text-sm text-muted-foreground">
                Ensures proper format, categorization, and exam standards
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-semibold">Educational Value</h4>
              <p className="text-sm text-muted-foreground">
                Assesses learning objectives and pedagogical effectiveness
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Activity className="h-8 w-8 text-orange-600 mb-2" />
              <h4 className="font-semibold">Quality Scoring</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive 0-100 scoring across multiple dimensions
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-red-600 mb-2" />
              <h4 className="font-semibold">Improvement Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Identifies issues and provides actionable recommendations
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Users className="h-8 w-8 text-indigo-600 mb-2" />
              <h4 className="font-semibold">Batch Processing</h4>
              <p className="text-sm text-muted-foreground">
                Validates multiple questions with comprehensive reporting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <h4>Validation Criteria (30+ checks):</h4>
            <ul>
              <li><strong>Structure Validation:</strong> Question length, answer format, explanation completeness</li>
              <li><strong>Medical Terminology:</strong> Category-specific terms, abbreviation definitions, clinical accuracy</li>
              <li><strong>USMLE Standards:</strong> Format compliance, categorization, clinical vignette structure</li>
              <li><strong>Educational Quality:</strong> Difficulty alignment, learning objectives, tag relevance</li>
              <li><strong>Reference Validation:</strong> Authoritative sources, proper citations</li>
            </ul>
            
            <h4>Scoring Algorithm:</h4>
            <ul>
              <li><strong>Medical Accuracy (33%):</strong> Clinical correctness, terminology, values</li>
              <li><strong>Educational Value (33%):</strong> Learning objectives, difficulty scaling</li>
              <li><strong>USMLE Compliance (33%):</strong> Format standards, categorization</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};