import React, { useState, useEffect } from "react";
import { useAppStore } from "../src/modules/store";
import IndexedDBService from "../src/modules/indexedDB/service";
import { Button } from "../src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../src/components/ui/card";
import { Progress } from "../src/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/components/ui/tabs";
import { Award, Book, CheckCircle, Star, Trophy, XCircle } from "lucide-react";

// LanguageDashboard component for displaying available units
export const LanguageDashboard: React.FC<{
  data: {
    title: string;
    subtitle: string;
    configKey: string;
    unitsDataKey: string;
  };
  onSelect: (unitId: string) => void;
}> = ({ data, onSelect }) => {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<any>(null);

  const getContextItemByTitle = useAppStore((state) => state.getContextItemByTitle);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Get config from context
        const configItem = getContextItemByTitle(data.configKey);
        if (configItem?.type === "indexedDB") {
          const configData = await IndexedDBService.getItem("app_config", "config");
          
          if (configData && configData.available_units) {
            setUnits(configData.available_units);
          }
        }
        
        // Get user progress from IndexedDB
        const progressData = await IndexedDBService.getItem("user_progress", "new_user");
        if (progressData) {
          setUserProgress(progressData);
        }
        
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [data.configKey, data.unitsDataKey, getContextItemByTitle]);

  const handleUnitSelect = (unitId: string) => {
    // Update selected unit in context
    const addContextItem = useAppStore.getState().addContextItem;
    addContextItem({
      title: "selected_unit",
      content: unitId,
      type: "text",
      persistent: true
    });
    
    onSelect(unitId);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">{data.title}</CardTitle>
            <CardDescription>{data.subtitle}</CardDescription>
          </div>
          {userProgress && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium">{userProgress.xp_points} XP</span>
              </div>
              <div className="flex flex-col items-center">
                <Trophy className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Level {userProgress.level}</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {units.map((unit) => (
            <Card 
              key={unit.id} 
              className={`cursor-pointer transition-shadow hover:shadow-md ${!unit.active ? 'opacity-60' : ''}`}
              onClick={() => unit.active && handleUnitSelect(unit.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{unit.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{unit.title}</h3>
                        <p className="text-sm text-muted-foreground">{unit.description}</p>
                      </div>
                      {!unit.active && (
                        <div className="bg-muted px-2 py-1 rounded text-xs">
                          Locked
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <Progress value={unit.progress} className="h-2" />
                      <div className="flex justify-between mt-1 text-xs">
                        <span>{unit.progress}% complete</span>
                        <span>{unit.lessons_count} lessons</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// MultipleChoiceExercise component for multiple choice questions
export const MultipleChoiceExercise: React.FC<{
  data: {
    exerciseData: {
      question: string;
      options: string[];
      correct_answer: number;
      explanation: string;
    };
    feedback: {
      status: string;
      message: string;
    };
    progress: {
      current_index: number;
      total: number;
    };
  };
  onAnswer: (isCorrect: boolean, selectedIndex: number) => void;
}> = ({ data, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const { exerciseData, feedback, progress } = data;

  const handleOptionSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedOption(index);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === exerciseData.correct_answer;
    setHasAnswered(true);
    onAnswer(isCorrect, selectedOption);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Exercise {progress.current_index + 1} of {progress.total}</CardTitle>
          <Progress value={((progress.current_index + 1) / progress.total) * 100} className="w-32 h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">{exerciseData.question}</div>
        
        <div className="space-y-3">
          {exerciseData.options.map((option, index) => (
            <div
              key={index}
              className={`p-4 border rounded-md cursor-pointer transition-colors ${
                selectedOption === index 
                  ? hasAnswered
                    ? index === exerciseData.correct_answer 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-primary bg-primary/10'
                  : hasAnswered && index === exerciseData.correct_answer
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  selectedOption === index 
                    ? hasAnswered
                      ? index === exerciseData.correct_answer
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-primary text-white'
                    : hasAnswered && index === exerciseData.correct_answer
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-foreground'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div>{option}</div>
                {hasAnswered && (
                  index === exerciseData.correct_answer ? (
                    <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                  ) : selectedOption === index ? (
                    <XCircle className="ml-auto h-5 w-5 text-red-500" />
                  ) : null
                )}
              </div>
            </div>
          ))}
        </div>
        
        {hasAnswered && (
          <div className={`p-4 rounded-md ${
            selectedOption === exerciseData.correct_answer 
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <p className="font-medium mb-1">
              {selectedOption === exerciseData.correct_answer ? 'Correct!' : 'Incorrect!'}
            </p>
            <p className="text-sm">{exerciseData.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!hasAnswered ? (
          <Button 
            onClick={handleCheck} 
            disabled={selectedOption === null}
            className="w-full"
          >
            Check Answer
          </Button>
        ) : (
          <Button 
            onClick={() => onAnswer(selectedOption === exerciseData.correct_answer, selectedOption!)}
            className="w-full"
          >
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// TranslationExercise component for translation questions
export const TranslationExercise: React.FC<{
  data: {
    exerciseData: {
      question: string;
      answer: string;
      alternatives?: string[];
      explanation: string;
    };
    feedback: {
      status: string;
      message: string;
    };
    progress: {
      current_index: number;
      total: number;
    };
  };
  onAnswer: (isCorrect: boolean, answer: string) => void;
}> = ({ data, onAnswer }) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { exerciseData, progress } = data;

  const handleCheck = () => {
    if (!userAnswer.trim()) return;
    
    // Check if answer matches any acceptable answers
    const correctAnswers = [
      exerciseData.answer.toLowerCase(),
      ...(exerciseData.alternatives || []).map(alt => alt.toLowerCase())
    ];
    
    const cleanUserAnswer = userAnswer.toLowerCase().trim();
    const correct = correctAnswers.some(answer => 
      // Flexible matching - allow for minor differences
      cleanUserAnswer === answer.toLowerCase() || 
      levenshteinDistance(cleanUserAnswer, answer.toLowerCase()) <= 2
    );
    
    setIsCorrect(correct);
    setHasAnswered(true);
  };

  const handleContinue = () => {
    onAnswer(isCorrect, userAnswer);
    setUserAnswer("");
    setHasAnswered(false);
  };

  // Levenshtein distance for fuzzy matching
  const levenshteinDistance = (a: string, b: string) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
  
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
  
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1, 
          matrix[i - 1][j - 1] + cost
        );
      }
    }
  
    return matrix[a.length][b.length];
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Exercise {progress.current_index + 1} of {progress.total}</CardTitle>
          <Progress value={((progress.current_index + 1) / progress.total) * 100} className="w-32 h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">{exerciseData.question}</div>
        
        <div>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={hasAnswered}
            placeholder="Type your answer here..."
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        {hasAnswered && (
          <div className={`p-4 rounded-md ${
            isCorrect
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2 font-medium mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>Incorrect!</span>
                </>
              )}
            </div>
            {!isCorrect && (
              <p className="text-sm mb-2">
                Correct answer: <span className="font-medium">{exerciseData.answer}</span>
                {exerciseData.alternatives && exerciseData.alternatives.length > 0 && (
                  <> (or: {exerciseData.alternatives.join(", ")})</>
                )}
              </p>
            )}
            <p className="text-sm">{exerciseData.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!hasAnswered ? (
          <Button 
            onClick={handleCheck} 
            disabled={!userAnswer.trim()}
            className="w-full"
          >
            Check Answer
          </Button>
        ) : (
          <Button 
            onClick={handleContinue}
            className="w-full"
          >
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// LessonComplete component for lesson completion
export const LessonComplete: React.FC<{
  data: {
    lesson: {
      title: string;
      description: string;
    };
    stats: {
      correct: number;
      total: number;
      xp_earned: number;
    };
  };
  onNext: () => void;
  onDashboard: () => void;
}> = ({ data, onNext, onDashboard }) => {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Lesson Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="inline-flex bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 p-6 rounded-full">
          <Award className="h-12 w-12" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold">{data.lesson.title}</h3>
          <p className="text-muted-foreground">{data.lesson.description}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold">{data.stats.correct}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{Math.round((data.stats.correct / data.stats.total) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{data.stats.xp_earned}</div>
            <div className="text-sm text-muted-foreground">XP Earned</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3 justify-center">
        <Button onClick={onDashboard} variant="outline">
          <Book className="h-4 w-4 mr-2" /> Dashboard
        </Button>
        <Button onClick={onNext}>
          Next Lesson
        </Button>
      </CardFooter>
    </Card>
  );
};

// Export all components
export default {
  LanguageDashboard,
  MultipleChoiceExercise,
  TranslationExercise,
  LessonComplete
};