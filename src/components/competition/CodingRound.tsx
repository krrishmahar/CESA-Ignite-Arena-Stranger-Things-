import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Play, Send, RefreshCw, Terminal, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompetitionTimer } from './CompetitionTimer';
import { useCompetitionStore } from '@/store/competitionStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const languages = [
  { id: 'python', name: 'Python 3', extension: 'py' },
  { id: 'cpp', name: 'C++17', extension: 'cpp' },
  { id: 'c', name: 'C11', extension: 'c' },
  { id: 'java', name: 'Java 17', extension: 'java' },
];

const defaultCode: Record<string, string> = {
  python: `def firstNonRepeatingChar(s):
    """
    Find the first non-repeating character in a string.
    Return the character. If none exists, return '_'.

    MISSION: Decode the signal pattern to unlock the gate.
    """
    # Your code here
    pass

# DO NOT MODIFY BELOW THIS LINE
if __name__ == "__main__":
    s = input().strip()
    result = firstNonRepeatingChar(s)
    print(result)
`,
  cpp: `#include <iostream>
#include <string>
using namespace std;

class Solution {
public:
    char firstNonRepeatingChar(string s) {
        // Your code here
        // Return '_' if no non-repeating character exists
        return '_';
    }
};

// DO NOT MODIFY BELOW THIS LINE
int main() {
    Solution sol;
    string s;
    getline(cin, s);
    cout << sol.firstNonRepeatingChar(s) << endl;
    return 0;
}
`,
  c: `#include <stdio.h>
#include <string.h>

char firstNonRepeatingChar(char* s) {
    // Your code here
    // Return '_' if no non-repeating character exists
    return '_';
}

// DO NOT MODIFY BELOW THIS LINE
int main() {
    char s[100001];
    scanf("%s", s);
    printf("%c\\n", firstNonRepeatingChar(s));
    return 0;
}
`,
  java: `import java.util.*;

class Solution {
    public char firstNonRepeatingChar(String s) {
        // Your code here
        // Return '_' if no non-repeating character exists
        return '_';
    }
}

// DO NOT MODIFY BELOW THIS LINE
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.firstNonRepeatingChar(s));
    }
}
`,
};

const problemStatement = {
  title: 'Gate Signal Decoder',
  difficulty: 'Medium',
  description: `MISSION CRITICAL: The gate's locking mechanism requires a unique signal pattern.

Given a string representing the signal transmission, find the FIRST character that appears exactly once. This character is the key to stabilizing the gate.

If no such character exists, the gate cannot be sealed. Return '_' to indicate failure.

Your solution must be efficient - the gate is collapsing and time is running out.`,
  examples: [
    {
      input: 's = "hawkins"',
      output: 'h',
      explanation: "'h' is the first character that appears only once in the signal.",
    },
    {
      input: 's = "laboratory"',
      output: 'l',
      explanation: "'l' appears first and only once. Other characters repeat.",
    },
    {
      input: 's = "aabbcc"',
      output: '_',
      explanation: 'All characters repeat. Gate cannot be sealed.',
    },
  ],
  constraints: [
    '1 <= s.length <= 10^5',
    's consists of lowercase English letters only',
    'Time limit: 1 second',
    'Memory limit: 256 MB',
  ],
};

interface TestResult {
  id: number;
  status: 'passed' | 'failed' | 'tle' | 'error';
  input: string;
  expected: string;
  output?: string;
  time?: number;
}

export const CodingRound = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(defaultCode.python);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState('problem');
  
  const { completeRound, startCoding, codingStartTime, setCurrentCode, submitCode } = useCompetitionStore();

  useEffect(() => {
    if (!codingStartTime) {
      startCoding();
    }
  }, [codingStartTime, startCoding]);

  useEffect(() => {
    setCode(defaultCode[language] || '');
  }, [language]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setActiveTab('output');
    setConsoleOutput('Running test cases...\n');

    // Simulate running code
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockResults: TestResult[] = [
      {
        id: 1,
        status: 'passed',
        input: 'nums = [2,7,11,15], target = 9',
        expected: '[0, 1]',
        output: '[0, 1]',
        time: 12,
      },
      {
        id: 2,
        status: 'passed',
        input: 'nums = [3,2,4], target = 6',
        expected: '[1, 2]',
        output: '[1, 2]',
        time: 8,
      },
    ];

    setTestResults(mockResults);
    setConsoleOutput('Execution completed.\n\nTest 1: PASSED (12ms)\nTest 2: PASSED (8ms)\n\n✓ All sample tests passed!');
    setIsRunning(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setActiveTab('output');
    setConsoleOutput('Submitting solution...\nRunning against all test cases...\n');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResults: TestResult[] = [
      { id: 1, status: 'passed', input: 'Sample 1', expected: '[0, 1]', output: '[0, 1]', time: 10 },
      { id: 2, status: 'passed', input: 'Sample 2', expected: '[1, 2]', output: '[1, 2]', time: 8 },
      { id: 3, status: 'passed', input: 'Hidden 1', expected: 'hidden', time: 15 },
      { id: 4, status: 'passed', input: 'Hidden 2', expected: 'hidden', time: 12 },
      { id: 5, status: 'passed', input: 'Hidden 3', expected: 'hidden', time: 18 },
    ];

    setTestResults(mockResults);
    setConsoleOutput('Submission complete!\n\n✅ ACCEPTED\n\nRuntime: 12ms (beats 85%)\nMemory: 14.2 MB (beats 72%)\n\nTest cases: 5/5 passed');
    
    submitCode({
      language,
      code,
      submittedAt: new Date(),
      verdict: 'accepted',
    });

    setCurrentCode(code);
    
    setTimeout(() => {
      completeRound('coding');
      toast.success('🎉 Congratulations! You have completed all rounds!');
    }, 1500);
    
    setIsSubmitting(false);
  }, [code, language, completeRound, submitCode, setCurrentCode]);

  const handleTimeUp = useCallback(() => {
    toast.error("Time's up! Auto-submitting your solution...");
    handleSubmit();
  }, [handleSubmit]);

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr,1fr,260px] gap-4 h-full">
      {/* Problem Panel */}
      <div className="glass-strong rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-xl">{problemStatement.title}</h2>
            <span className={cn("px-2 py-1 rounded text-xs font-bold", getDifficultyColor(problemStatement.difficulty))}>
              {problemStatement.difficulty}
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {problemStatement.description}
          </p>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Examples:</h3>
            {problemStatement.examples.map((ex, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-1 font-mono text-xs">
                <div><span className="text-muted-foreground">Input:</span> {ex.input}</div>
                <div><span className="text-muted-foreground">Output:</span> {ex.output}</div>
                <div className="text-muted-foreground">{ex.explanation}</div>
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2">Constraints:</h3>
            <ul className="text-xs text-muted-foreground space-y-1 font-mono">
              {problemStatement.constraints.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="flex flex-col gap-4">
        {/* Editor */}
        <div className="glass-strong rounded-xl overflow-hidden flex-1 flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] h-8 bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="gap-2"
              >
                {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Run
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="gap-2 bg-success hover:bg-success/90"
              >
                {isSubmitting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Submit
              </Button>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="glass rounded-xl overflow-hidden h-[200px] flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-10 px-2">
              <TabsTrigger value="output" className="gap-2 text-xs">
                <Terminal className="w-3 h-3" />
                Output
              </TabsTrigger>
              <TabsTrigger value="testcases" className="gap-2 text-xs">
                <CheckCircle2 className="w-3 h-3" />
                Test Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="output" className="flex-1 m-0 p-3 overflow-auto">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {consoleOutput || 'Click "Run" to execute your code with sample inputs.'}
              </pre>
            </TabsContent>
            
            <TabsContent value="testcases" className="flex-1 m-0 p-3 overflow-auto">
              {testResults.length > 0 ? (
                <div className="space-y-2">
                  {testResults.map((result) => (
                    <div
                      key={result.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded text-xs",
                        result.status === 'passed' && "bg-success/10",
                        result.status === 'failed' && "bg-destructive/10",
                        result.status === 'tle' && "bg-warning/10",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {result.status === 'passed' && <CheckCircle2 className="w-3 h-3 text-success" />}
                        {result.status === 'failed' && <XCircle className="w-3 h-3 text-destructive" />}
                        {result.status === 'tle' && <Clock className="w-3 h-3 text-warning" />}
                        <span>Test {result.id}</span>
                      </div>
                      {result.time && <span className="text-muted-foreground">{result.time}ms</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Run your code to see test results.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-4">
        <CompetitionTimer
          totalSeconds={60 * 60}
          onTimeUp={handleTimeUp}
        />
        
        {/* Quick Stats */}
        <div className="glass rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold">Submission Stats</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attempts</span>
              <span className="font-mono">0/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Runtime</span>
              <span className="font-mono text-muted-foreground">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
