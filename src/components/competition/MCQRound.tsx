import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompetitionStore } from '@/store/competitionStore';
import { CompetitionTimer } from './CompetitionTimer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  options: string[];
  multiCorrect: boolean;
}

// Story-based logic questions for Gatekeeper Protocol
const sampleQuestions: Question[] = [
  {
    id: 'q1',
    question: 'SCENARIO: Three backup generators power the lab perimeter. Generator A restarts every 12 minutes, Generator B every 18 minutes, and Generator C every 24 minutes. If all three generators restart simultaneously at 6:00 PM, when will they next restart together?',
    options: ['6:36 PM', '6:48 PM', '7:12 PM', '7:24 PM'],
    multiCorrect: false,
  },
  {
    id: 'q2',
    question: 'SCENARIO: The gate monitoring system processes 240 data points per second. If each analysis cycle requires exactly 16 data points, how many complete analysis cycles can be performed in 5 seconds?',
    options: ['60 cycles', '75 cycles', '80 cycles', '90 cycles'],
    multiCorrect: false,
  },
  {
    id: 'q3',
    question: 'LOGIC: A security protocol requires a 6-digit code where each digit is the sum of the previous two digits (starting with 1 and 1). What is the 6th digit?',
    options: ['8', '13', '21', '34'],
    multiCorrect: false,
  },
  {
    id: 'q4',
    question: 'SCENARIO: The dimensional scanner emits three frequency signals: Signal X every 8 seconds, Signal Y every 12 seconds, and Signal Z every 20 seconds. All signals emit simultaneously at time 0. After how many seconds will all three signals emit together again?',
    options: ['60 seconds', '80 seconds', '120 seconds', '240 seconds'],
    multiCorrect: false,
  },
  {
    id: 'q5',
    question: 'PATTERN RECOGNITION: The lab energy readings show this sequence: 2, 6, 12, 20, 30, __. What number comes next?',
    options: ['40', '42', '44', '48'],
    multiCorrect: false,
  },
  {
    id: 'q6',
    question: 'CRITICAL THINKING: If it takes 5 scientists 5 hours to analyze 5 specimens, how many hours will it take 100 scientists to analyze 100 specimens?',
    options: ['5 hours', '20 hours', '100 hours', '500 hours'],
    multiCorrect: false,
  },
  {
    id: 'q7',
    question: 'SCENARIO: The gate containment field requires power from two independent sources. Source A provides power for 45 minutes before requiring a 15-minute cooldown. Source B provides power for 30 minutes before requiring a 10-minute cooldown. If both start simultaneously, what is the first time interval where NEITHER source is providing power?',
    options: ['60-70 minutes', '70-75 minutes', 'Never occurs', '80-85 minutes'],
    multiCorrect: false,
  },
  {
    id: 'q8',
    question: 'LOGICAL DEDUCTION: Three lab technicians (Alex, Blake, Casey) are stationed at checkpoints. Alex is not at Checkpoint 1. Blake is at Checkpoint 3. Casey is not at Checkpoint 2. Where is Alex stationed?',
    options: ['Checkpoint 1', 'Checkpoint 2', 'Checkpoint 3', 'Cannot be determined'],
    multiCorrect: false,
  },
];

export const MCQRound = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { completeRound, incrementTabSwitch, tabSwitchCount, startMCQ, mcqStartTime } = useCompetitionStore();

  const questions = sampleQuestions;
  const currentQuestion = questions[currentIndex];

  // Start timer on mount
  useEffect(() => {
    if (!mcqStartTime) {
      startMCQ();
    }
  }, [mcqStartTime, startMCQ]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementTabSwitch();
        toast.warning('Tab switch detected! This has been logged.', {
          icon: <AlertTriangle className="w-4 h-4" />,
        });
      }
    };

    const handleBlur = () => {
      incrementTabSwitch();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [incrementTabSwitch]);

  // Disable copy/paste
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error('Copying is disabled during the competition');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error('Pasting is disabled during the competition');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => {
      const current = prev[currentQuestion.id] || [];
      
      if (currentQuestion.multiCorrect) {
        // Toggle for multi-select
        if (current.includes(optionIndex)) {
          return { ...prev, [currentQuestion.id]: current.filter(i => i !== optionIndex) };
        }
        return { ...prev, [currentQuestion.id]: [...current, optionIndex] };
      }
      
      // Single select
      return { ...prev, [currentQuestion.id]: [optionIndex] };
    });
  };

  const handleFlag = () => {
    setFlagged((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    // In production, send to backend
    setTimeout(() => {
      completeRound('mcq');
      toast.success('Round 1 completed! Moving to Flowchart Design...');
    }, 1000);
  }, [completeRound]);

  const handleTimeUp = useCallback(() => {
    toast.error("Time's up! Auto-submitting your answers...");
    handleSubmit();
  }, [handleSubmit]);

  const answeredCount = Object.keys(answers).length;
  const isCurrentAnswered = answers[currentQuestion.id]?.length > 0;
  const isCurrentFlagged = flagged.has(currentQuestion.id);

  return (
    <div className="grid lg:grid-cols-[1fr,300px] gap-6 h-full">
      {/* Main Content */}
      <div className="space-y-6">
        {/* Question Card */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-strong rounded-xl p-6"
        >
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary font-display font-bold text-sm">
                Q{currentIndex + 1}/{questions.length}
              </span>
              {currentQuestion.multiCorrect && (
                <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs">
                  Multi-select
                </span>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlag}
              className={cn(
                "gap-2",
                isCurrentFlagged && "text-warning bg-warning/10"
              )}
            >
              <Flag className={cn("w-4 h-4", isCurrentFlagged && "fill-warning")} />
              {isCurrentFlagged ? 'Flagged' : 'Flag'}
            </Button>
          </div>

          {/* Question Text */}
          <h2 className="text-xl font-semibold mb-6 leading-relaxed select-none">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id]?.includes(index);
              
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectOption(index)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-4 select-none",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-card"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <span className={cn(
                    "font-medium",
                    isSelected && "text-primary"
                  )}>
                    {option}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-secondary gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit All'}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                className="gap-2 bg-primary"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Question Navigator</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => {
              const isAnswered = answers[q.id]?.length > 0;
              const isFlagged = flagged.has(q.id);
              const isCurrent = index === currentIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 relative",
                    isCurrent && "ring-2 ring-primary",
                    isAnswered && !isCurrent && "bg-success/20 text-success",
                    !isAnswered && !isCurrent && "bg-muted text-muted-foreground hover:bg-muted/80",
                    isCurrent && isAnswered && "bg-success text-success-foreground",
                    isCurrent && !isAnswered && "bg-primary/20 text-primary"
                  )}
                >
                  {index + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-success/20" /> Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-muted" /> Unanswered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-warning" /> Flagged
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <CompetitionTimer
          totalSeconds={30 * 60}
          onTimeUp={handleTimeUp}
        />
        
        {/* Progress */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Answered</span>
              <span className="font-bold text-success">{answeredCount}/{questions.length}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
