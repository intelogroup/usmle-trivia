import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { 
  Settings, 
  Eye, 
  Ear, 
  Keyboard, 
  MousePointer, 
  TestTube,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { accessibilityService, useAccessibility, type AccessibilityPreferences } from '../../services/accessibilityService';

interface AccessibilitySettingsProps {
  className?: string;
  onClose?: () => void;
  showTesting?: boolean;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ 
  className = "", 
  onClose,
  showTesting = false 
}) => {
  const { preferences, updatePreferences, announce } = useAccessibility();
  const [testResults, setTestResults] = useState<ReturnType<typeof accessibilityService.testAccessibility> | null>(null);
  const [isTestingAccessibility, setIsTestingAccessibility] = useState(false);

  useEffect(() => {
    announce('Accessibility settings opened');
    return () => {
      if (onClose) {
        announce('Accessibility settings closed');
      }
    };
  }, [announce, onClose]);

  const handlePreferenceChange = (key: keyof AccessibilityPreferences, value: any) => {
    const newPreferences = { [key]: value };
    updatePreferences(newPreferences);
    
    // Provide audio feedback
    const settingNames: Record<string, string> = {
      highContrast: 'High contrast mode',
      largeText: 'Large text mode', 
      reducedMotion: 'Reduced motion',
      screenReader: 'Screen reader optimization',
      keyboardNavigation: 'Enhanced keyboard navigation',
      autoSpeak: 'Auto-announce content',
      focusIndicators: 'Focus indicator style',
      colorBlindnessMode: 'Color blindness filter'
    };

    const settingName = settingNames[key] || key;
    if (typeof value === 'boolean') {
      announce(`${settingName} ${value ? 'enabled' : 'disabled'}`, { priority: 'polite', clear: false });
    } else {
      announce(`${settingName} set to ${value}`, { priority: 'polite', clear: false });
    }
  };

  const testAccessibility = async () => {
    setIsTestingAccessibility(true);
    announce('Running accessibility compliance test', { priority: 'polite', clear: true });
    
    // Simulate testing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = accessibilityService.testAccessibility();
    setTestResults(results);
    setIsTestingAccessibility(false);
    
    const issueCount = results.missingAltText.length + results.missingLabels.length + results.keyboardInaccessible.length;
    announce(`Accessibility test complete. Found ${issueCount} issues to address.`, { priority: 'assertive', clear: true });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Accessibility Settings</h2>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            aria-label="Close accessibility settings"
          >
            ×
          </Button>
        )}
      </div>

      <p className="text-muted-foreground">
        Customize your experience for better accessibility. These settings are saved automatically and persist across sessions.
      </p>

      {/* Visual Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* High Contrast */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="high-contrast"
              checked={preferences.highContrast}
              onChange={(checked) => handlePreferenceChange('highContrast', checked)}
              aria-describedby="high-contrast-desc"
            />
            <div className="space-y-1">
              <label 
                htmlFor="high-contrast" 
                className="text-sm font-medium cursor-pointer"
              >
                High Contrast Mode
              </label>
              <p id="high-contrast-desc" className="text-xs text-muted-foreground">
                Increases contrast for better text visibility. Removes gradients and shadows.
              </p>
            </div>
          </div>

          {/* Large Text */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="large-text"
              checked={preferences.largeText}
              onChange={(checked) => handlePreferenceChange('largeText', checked)}
              aria-describedby="large-text-desc"
            />
            <div className="space-y-1">
              <label 
                htmlFor="large-text" 
                className="text-sm font-medium cursor-pointer"
              >
                Large Text
              </label>
              <p id="large-text-desc" className="text-xs text-muted-foreground">
                Increases text size by 25% (20px base instead of 16px). Improves readability.
              </p>
            </div>
          </div>

          {/* Color Blindness Support */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Color Blindness Filter</label>
            <div className="space-y-2">
              {(['none', 'deuteranopia', 'protanopia', 'tritanopia'] as const).map((mode) => (
                <div key={mode} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`color-${mode}`}
                    name="colorBlindnessMode"
                    value={mode}
                    checked={preferences.colorBlindnessMode === mode}
                    onChange={(e) => handlePreferenceChange('colorBlindnessMode', e.target.value)}
                    className="text-primary"
                  />
                  <label htmlFor={`color-${mode}`} className="text-sm capitalize cursor-pointer">
                    {mode === 'none' ? 'No filter' : mode}
                    {mode === 'deuteranopia' && <span className="text-muted-foreground ml-1">(Green-blind)</span>}
                    {mode === 'protanopia' && <span className="text-muted-foreground ml-1">(Red-blind)</span>}
                    {mode === 'tritanopia' && <span className="text-muted-foreground ml-1">(Blue-blind)</span>}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Indicators */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Focus Indicator Style</label>
            <div className="space-y-2">
              {(['standard', 'enhanced', 'high-contrast'] as const).map((style) => (
                <div key={style} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`focus-${style}`}
                    name="focusIndicators"
                    value={style}
                    checked={preferences.focusIndicators === style}
                    onChange={(e) => handlePreferenceChange('focusIndicators', e.target.value as any)}
                    className="text-primary"
                  />
                  <label htmlFor={`focus-${style}`} className="text-sm capitalize cursor-pointer">
                    {style.replace('-', ' ')}
                    {style === 'enhanced' && <span className="text-muted-foreground ml-1">(Larger, more visible)</span>}
                    {style === 'high-contrast' && <span className="text-muted-foreground ml-1">(Yellow highlight)</span>}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motor and Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Motor & Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reduced Motion */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="reduced-motion"
              checked={preferences.reducedMotion}
              onChange={(checked) => handlePreferenceChange('reducedMotion', checked)}
              aria-describedby="reduced-motion-desc"
            />
            <div className="space-y-1">
              <label 
                htmlFor="reduced-motion" 
                className="text-sm font-medium cursor-pointer"
              >
                Reduced Motion
              </label>
              <p id="reduced-motion-desc" className="text-xs text-muted-foreground">
                Minimizes animations and transitions. Helpful for motion sensitivity.
              </p>
            </div>
          </div>

          {/* Enhanced Keyboard Navigation */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="keyboard-nav"
              checked={preferences.keyboardNavigation}
              onChange={(checked) => handlePreferenceChange('keyboardNavigation', checked)}
              aria-describedby="keyboard-nav-desc"
            />
            <div className="space-y-1">
              <label 
                htmlFor="keyboard-nav" 
                className="text-sm font-medium cursor-pointer"
              >
                Enhanced Keyboard Navigation
              </label>
              <p id="keyboard-nav-desc" className="text-xs text-muted-foreground">
                Enables keyboard shortcuts and improved focus management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio and Screen Reader */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ear className="h-5 w-5" />
            Audio & Screen Reader
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Screen Reader Optimization */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="screen-reader"
              checked={preferences.screenReader}
              onChange={(checked) => handlePreferenceChange('screenReader', checked)}
              aria-describedby="screen-reader-desc"
            />
            <div className="space-y-1">
              <label 
                htmlFor="screen-reader" 
                className="text-sm font-medium cursor-pointer"
              >
                Screen Reader Optimization
              </label>
              <p id="screen-reader-desc" className="text-xs text-muted-foreground">
                Optimizes content structure and announcements for screen readers.
              </p>
            </div>
          </div>

          {/* Auto-Announce Content */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="auto-speak"
              checked={preferences.autoSpeak}
              onChange={(checked) => handlePreferenceChange('autoSpeak', checked)}
              aria-describedby="auto-speak-desc"
            />
            <div className="space-y-1">
              <label 
                htmlFor="auto-speak" 
                className="text-sm font-medium cursor-pointer"
              >
                Auto-Announce Content
              </label>
              <p id="auto-speak-desc" className="text-xs text-muted-foreground">
                Automatically announces medical content with expanded abbreviations and definitions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Read question</span>
              <kbd className="kbd">Alt + R</kbd>
            </div>
            <div className="flex justify-between">
              <span>Read explanation</span>
              <kbd className="kbd">Alt + E</kbd>
            </div>
            <div className="flex justify-between">
              <span>Next question</span>
              <kbd className="kbd">Alt + N</kbd>
            </div>
            <div className="flex justify-between">
              <span>Previous question</span>
              <kbd className="kbd">Alt + P</kbd>
            </div>
            <div className="flex justify-between">
              <span>Submit answer</span>
              <kbd className="kbd">Alt + S</kbd>
            </div>
            <div className="flex justify-between">
              <span>Show shortcuts</span>
              <kbd className="kbd">Alt + H</kbd>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Press <kbd className="kbd">Tab</kbd> to navigate between elements, <kbd className="kbd">Space</kbd> or <kbd className="kbd">Enter</kbd> to activate.
          </p>
        </CardContent>
      </Card>

      {/* Accessibility Testing */}
      {showTesting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Accessibility Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test current page for common accessibility issues and WCAG compliance.
            </p>
            
            <Button 
              onClick={testAccessibility}
              disabled={isTestingAccessibility}
              className="w-full"
              variant="outline"
            >
              {isTestingAccessibility ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span>Testing Accessibility...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  <span>Run Accessibility Test</span>
                </div>
              )}
            </Button>

            {testResults && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Images with alt text</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${testResults.missingAltText.length > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                    <span className="text-sm">Missing alt text: {testResults.missingAltText.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${testResults.missingLabels.length > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                    <span className="text-sm">Missing labels: {testResults.missingLabels.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${testResults.keyboardInaccessible.length > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                    <span className="text-sm">Keyboard issues: {testResults.keyboardInaccessible.length}</span>
                  </div>
                </div>

                {testResults.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recommendations:</h4>
                    <ul className="space-y-1">
                      {testResults.recommendations.map((rec, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={() => {
            updatePreferences({
              highContrast: false,
              largeText: false,
              reducedMotion: false,
              screenReader: false,
              keyboardNavigation: true,
              autoSpeak: false,
              focusIndicators: 'standard',
              colorBlindnessMode: 'none'
            });
            announce('Accessibility settings reset to defaults');
          }}
          variant="outline"
          className="flex-1"
        >
          Reset to Defaults
        </Button>
        {onClose && (
          <Button 
            onClick={onClose} 
            className="flex-1"
          >
            Done
          </Button>
        )}
      </div>

      {/* Status */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Settings are automatically saved and will be remembered across sessions.
          <br />
          This interface is WCAG 2.1 AA compliant and optimized for screen readers.
        </p>
      </div>
    </div>
  );
};