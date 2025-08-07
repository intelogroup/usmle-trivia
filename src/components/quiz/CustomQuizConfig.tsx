import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Slider } from '../ui/Slider';
import { AlertTriangle, Settings, Filter, CheckCircle2 } from 'lucide-react';
import { medicalSubjects, bodySystems, systemTopics, getFilteredQuestions } from '../../data/sampleQuestions';

interface QuizConfig {
  subjects: string[];
  systems: string[];
  topics: string[];
  questionCount: number;
  difficulty: ('easy' | 'medium' | 'hard')[];
  timeLimit?: number;
}

interface CustomQuizConfigProps {
  onStartQuiz: (config: QuizConfig) => void;
  onBack: () => void;
}

export const CustomQuizConfig: React.FC<CustomQuizConfigProps> = ({ onStartQuiz, onBack }) => {
  const [config, setConfig] = useState<QuizConfig>({
    subjects: [],
    systems: [],
    topics: [],
    questionCount: 20,
    difficulty: ['easy', 'medium', 'hard'],
    timeLimit: undefined
  });
  
  const [availableQuestions, setAvailableQuestions] = useState(0);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update available questions count when config changes
  useEffect(() => {
    const questions = getFilteredQuestions({
      subjects: config.subjects.length > 0 ? config.subjects : undefined,
      systems: config.systems.length > 0 ? config.systems : undefined,
      topics: config.topics.length > 0 ? config.topics : undefined,
      difficulty: config.difficulty
    });
    setAvailableQuestions(questions.length);
    
    // Update validation
    if (config.subjects.length === 0) {
      setValidationError('Please select at least one subject');
    } else if (config.systems.length === 0) {
      setValidationError('Please select at least one system');
    } else if (questions.length === 0) {
      setValidationError('No questions available with current filters');
    } else if (questions.length < config.questionCount) {
      setValidationError(`Only ${questions.length} questions available. Reduce question count.`);
    } else {
      setValidationError(null);
    }
  }, [config]);

  // Update available topics when systems change
  useEffect(() => {
    if (config.systems.length > 0) {
      const topics = config.systems.flatMap(system => {
        const systemKey = Object.keys(bodySystems).find(
          key => bodySystems[key as keyof typeof bodySystems] === system
        );
        return systemKey ? systemTopics[systemKey as keyof typeof systemTopics] || [] : [];
      });
      setAvailableTopics([...new Set(topics)]);
    } else {
      setAvailableTopics([]);
      setConfig(prev => ({ ...prev, topics: [] }));
    }
  }, [config.systems]);

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      subjects: checked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleSystemChange = (system: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      systems: checked 
        ? [...prev.systems, system]
        : prev.systems.filter(s => s !== system)
    }));
  };

  const handleTopicChange = (topic: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      topics: checked 
        ? [...prev.topics, topic]
        : prev.topics.filter(t => t !== topic)
    }));
  };

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard', checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      difficulty: checked 
        ? [...prev.difficulty, difficulty]
        : prev.difficulty.filter(d => d !== difficulty)
    }));
  };

  const handleQuestionCountChange = (value: number[]) => {
    setConfig(prev => ({ ...prev, questionCount: value[0] }));
  };

  const handleTimeLimitChange = (value: string) => {
    if (value === 'no-limit') {
      setConfig(prev => ({ ...prev, timeLimit: undefined }));
    } else {
      setConfig(prev => ({ ...prev, timeLimit: parseInt(value) }));
    }
  };

  const canStartQuiz = !validationError && config.subjects.length > 0 && config.systems.length > 0;

  const handleStartQuiz = () => {
    if (canStartQuiz) {
      onStartQuiz(config);
    }
  };

  const resetToDefaults = () => {
    setConfig({
      subjects: [],
      systems: [],
      topics: [],
      questionCount: 20,
      difficulty: ['easy', 'medium', 'hard'],
      timeLimit: undefined
    });
    setShowAdvanced(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <div>
          <h1 className="text-3xl font-bold">Custom Quiz Configuration</h1>
          <p className="text-muted-foreground">
            Configure your personalized quiz experience
          </p>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700 font-medium">{validationError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Selection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Quiz Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Questions:</span>
              <span className="ml-2 font-medium">{config.questionCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Available:</span>
              <span className="ml-2 font-medium">{availableQuestions}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time Limit:</span>
              <span className="ml-2 font-medium">
                {config.timeLimit ? `${config.timeLimit} min` : 'No limit'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="ml-2 font-medium">{config.difficulty.length}/3 levels</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Selection - REQUIRED */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-red-500">*</span>
            Select Medical Subjects (Required)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose at least one medical subject area
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(medicalSubjects).map(([key, subject]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox 
                  id={`subject-${key}`}
                  checked={config.subjects.includes(subject)}
                  onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                />
                <label 
                  htmlFor={`subject-${key}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {subject}
                </label>
              </div>
            ))}
          </div>
          {config.subjects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {config.subjects.map(subject => (
                <Badge key={subject} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Selection - REQUIRED */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-red-500">*</span>
            Select Body Systems (Required)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose at least one body system
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(bodySystems).map(([key, system]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox 
                  id={`system-${key}`}
                  checked={config.systems.includes(system)}
                  onCheckedChange={(checked) => handleSystemChange(system, checked as boolean)}
                />
                <label 
                  htmlFor={`system-${key}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {system}
                </label>
              </div>
            ))}
          </div>
          {config.systems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {config.systems.map(system => (
                <Badge key={system} variant="outline" className="text-xs">
                  {system}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Topics Selection - OPTIONAL */}
      {availableTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Select Specific Topics (Optional)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Narrow down to specific topics within selected systems
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableTopics.map(topic => (
                <div key={topic} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`topic-${topic}`}
                    checked={config.topics.includes(topic)}
                    onCheckedChange={(checked) => handleTopicChange(topic, checked as boolean)}
                  />
                  <label 
                    htmlFor={`topic-${topic}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {topic}
                  </label>
                </div>
              ))}
            </div>
            {config.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {config.topics.map(topic => (
                  <Badge key={topic} variant="default" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quiz Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Count */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Number of Questions: {config.questionCount}
            </label>
            <Slider
              value={[config.questionCount]}
              onValueChange={handleQuestionCountChange}
              min={10}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10</span>
              <span>30</span>
              <span>50</span>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Difficulty Levels
            </label>
            <div className="flex space-x-4">
              {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                <div key={difficulty} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`difficulty-${difficulty}`}
                    checked={config.difficulty.includes(difficulty)}
                    onCheckedChange={(checked) => handleDifficultyChange(difficulty, checked as boolean)}
                  />
                  <label 
                    htmlFor={`difficulty-${difficulty}`}
                    className={`text-sm font-medium cursor-pointer capitalize ${
                      difficulty === 'easy' ? 'text-green-600' :
                      difficulty === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}
                  >
                    {difficulty} (10-20 pts)
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <Button 
            variant="outline" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </Button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Time Limit
                </label>
                <Select onValueChange={handleTimeLimitChange} defaultValue="no-limit">
                  <SelectTrigger>
                    <SelectValue placeholder="Select time limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-limit">No Time Limit</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleStartQuiz}
          disabled={!canStartQuiz}
          className="flex-1"
          size="lg"
        >
          Start Custom Quiz
          {canStartQuiz && (
            <CheckCircle2 className="ml-2 h-4 w-4" />
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="sm:w-auto"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};