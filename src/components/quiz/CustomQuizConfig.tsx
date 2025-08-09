import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import { ArrowLeft, Play, Timer, Hash, BookOpen, Heart, FileText } from 'lucide-react';
import { medicalSubjects, bodySystems, systemTopics } from '../../data/medicalCategories';
import { getFilteredQuestions } from '../../services/questionService';
import { cn } from '../../lib/utils';

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

type CategoryTab = 'subjects' | 'systems' | 'topics';

export const CustomQuizConfig: React.FC<CustomQuizConfigProps> = ({ onStartQuiz, onBack }) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('subjects');
  const [config, setConfig] = useState<QuizConfig>({
    subjects: [],
    systems: [],
    topics: [],
    questionCount: 15,
    difficulty: ['easy', 'medium', 'hard'],
    timeLimit: undefined
  });
  
  const [availableQuestions, setAvailableQuestions] = useState(0);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  // Update available questions count when config changes
  useEffect(() => {
    const updateQuestionCount = async () => {
      const questions = await getFilteredQuestions({
        subjects: config.subjects.length > 0 ? config.subjects : undefined,
        systems: config.systems.length > 0 ? config.systems : undefined,
        topics: config.topics.length > 0 ? config.topics : undefined,
        difficulty: config.difficulty
      });
      setAvailableQuestions(questions.length);
    };
    
    updateQuestionCount();
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

  const handleItemToggle = (category: CategoryTab, item: string) => {
    setConfig(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
  };

  const canStartQuiz = config.subjects.length > 0 && availableQuestions >= config.questionCount;

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'subjects':
        return Object.values(medicalSubjects);
      case 'systems':
        return Object.values(bodySystems);
      case 'topics':
        return availableTopics;
      default:
        return [];
    }
  };

  const getSelectedItems = () => {
    return config[activeTab];
  };

  const tabs = [
    { id: 'subjects' as CategoryTab, label: 'Subjects', count: config.subjects.length, icon: BookOpen },
    { id: 'systems' as CategoryTab, label: 'Systems', count: config.systems.length, icon: Heart },
    { id: 'topics' as CategoryTab, label: 'Topics', count: config.topics.length, icon: FileText },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Custom Quiz</h1>
          <p className="text-sm text-gray-600">Configure your study session</p>
        </div>
      </div>

      {/* Quick Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Questions:</span>
              <span className="font-medium">{config.questionCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Available:</span>
              <span className="font-medium text-blue-600">{availableQuestions}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config.questionCount > availableQuestions && availableQuestions > 0 && (
              <Badge variant="outline" className="text-xs text-amber-600">
                Reduce to {availableQuestions}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Horizontal Toggle Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Selection Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {getCurrentItems().map((item) => {
            const isSelected = getSelectedItems().includes(item);
            const isDisabled = activeTab === 'topics' && availableTopics.length === 0;
            
            return (
              <button
                key={item}
                onClick={() => !isDisabled && handleItemToggle(activeTab, item)}
                disabled={isDisabled}
                className={cn(
                  "p-2 text-left text-xs rounded-lg border transition-all",
                  isSelected
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded border-2 flex-shrink-0",
                    isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                  )}>
                    {isSelected && (
                      <svg className="w-2 h-2 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{item}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        {activeTab === 'topics' && availableTopics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Select body systems first to see available topics</p>
          </div>
        )}
      </Card>

      {/* Selected Items Summary */}
      {getSelectedItems().length > 0 && (
        <Card className="p-3">
          <div className="flex flex-wrap gap-1">
            {getSelectedItems().map(item => (
              <Badge
                key={item}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-gray-100"
                onClick={() => handleItemToggle(activeTab, item)}
              >
                {item} ×
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Quiz Settings */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Questions: {config.questionCount}</label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={config.questionCount}
              onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>15</span>
              <span>30</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Time Limit</label>
            <select
              value={config.timeLimit || 'none'}
              onChange={(e) => setConfig(prev => ({ ...prev, timeLimit: e.target.value === 'none' ? undefined : parseInt(e.target.value) }))}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="none">No limit</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Start Quiz Button */}
      <Card className="p-4">
        <div className="flex gap-3">
          <Button
            onClick={() => onStartQuiz(config)}
            disabled={!canStartQuiz}
            className="flex-1"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Custom Quiz
          </Button>
          
          {!canStartQuiz && (
            <div className="flex items-center text-sm text-amber-600">
              {config.subjects.length === 0 ? "Select subjects first" : 
               availableQuestions < config.questionCount ? "Reduce question count" : ""}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};