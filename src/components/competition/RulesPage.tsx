import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, AlertTriangle, Code, GitBranch, CheckCircle2, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCompetitionStore } from '@/store/competitionStore';

const rules = [
  {
    icon: Shield,
    title: 'Protocol Compliance',
    description: 'Any breach of security protocols, including unauthorized resource access, AI assistance, or external communication will trigger immediate system lockout and disqualification.',
  },
  {
    icon: Clock,
    title: 'Time Constraints',
    description: 'Each containment round has a critical time window. The countdown begins upon entry and cannot be paused. Gate stability decreases over time.',
  },
  {
    icon: AlertTriangle,
    title: 'Surveillance Active',
    description: 'All activity is monitored. Tab switching, window minimization, and focus changes are logged. 3 violations result in automatic disqualification.',
  },
  {
    icon: Code,
    title: 'Sandboxed Execution',
    description: 'All code runs in an isolated containment environment. CPU and memory limits are enforced. Infinite loops or resource abuse will terminate execution.',
  },
  {
    icon: GitBranch,
    title: 'Sequential Unlock',
    description: 'Gate sealing requires completing all protocols in sequence. Round II unlocks only after Round I success. No skipping allowed.',
  },
  {
    icon: Trophy,
    title: 'Performance Metrics',
    description: 'Scoring factors: correctness (60%), time efficiency (25%), code quality (15%). Faster solutions earn exponential bonus points.',
  },
];

const roundInfo = [
  {
    round: 'Round I: Aptitude Assessment',
    duration: '30 minutes',
    description: 'Logic puzzles and scenario-based reasoning under pressure',
    color: 'primary',
  },
  {
    round: 'Round II: Flowchart Design',
    duration: '45 minutes',
    description: 'Map algorithmic pathways to contain the breach',
    color: 'secondary',
  },
  {
    round: 'Round III: DSA Implementation',
    duration: '60 minutes',
    description: 'Code the solution that seals the gate forever',
    color: 'accent',
  },
];

export const RulesPage = () => {
  const [accepted, setAccepted] = useState(false);
  const { completeRound } = useCompetitionStore();

  const handleBeginCompetition = () => {
    if (accepted) {
      completeRound('rules');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-pulse">
          <Shield className="w-4 h-4" />
          <span>SECURITY PROTOCOL BRIEFING</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold">
          <span className="gradient-text">THE GATEKEEPER'S PROTOCOL</span>
        </h1>

        <p className="text-red-200/80 text-lg max-w-2xl mx-auto">
          Before entering the containment zone, all operatives must acknowledge and accept the security protocols.
          The gate will not stabilize without your compliance.
        </p>
      </motion.div>

      {/* Round Overview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-4"
      >
        {roundInfo.map((info, index) => (
          <motion.div
            key={info.round}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass rounded-xl p-5 space-y-3 hover:glow-primary transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                {info.duration}
              </span>
            </div>
            <h3 className="font-display font-bold text-lg">{info.round}</h3>
            <p className="text-sm text-muted-foreground">{info.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Rules List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-strong rounded-xl p-6"
      >
        <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Competition Rules & Guidelines
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.title}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex gap-4 p-4 rounded-lg bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <rule.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{rule.title}</h4>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Protection Notice */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6 border-destructive/30 bg-destructive/5"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-destructive mb-2">
              AI Protection System Active
            </h3>
            <p className="text-sm text-muted-foreground">
              This competition employs an advanced AI guardrail system. Any attempt to use AI assistants 
              (ChatGPT, Claude, Copilot, etc.) with competition content will be detected, blocked, and logged. 
              Such attempts are considered cheating and will result in immediate disqualification.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Accept & Start */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-strong rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="accept-rules"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor="accept-rules"
              className="text-sm cursor-pointer select-none"
            >
              <span className="font-semibold">I have read and agree to all competition rules.</span>
              <br />
              <span className="text-muted-foreground">
                I understand that any violation may result in disqualification.
              </span>
            </label>
          </div>
          
          <Button
            onClick={handleBeginCompetition}
            disabled={!accepted}
            className="min-w-[200px] h-12 font-display font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 glow-primary"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Begin Competition
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
