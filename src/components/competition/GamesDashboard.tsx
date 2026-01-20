import { motion } from 'framer-motion';
import { Shield, Zap, Clock, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { useCompetitionStore } from '@/store/competitionStore';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export const GamesDashboard = () => {
  const { currentRound, roundStatus, participantName, tabSwitchCount } = useCompetitionStore();
  const [gateStability, setGateStability] = useState(100);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);

      const baseDecay = 0.15;
      const tabSwitchPenalty = tabSwitchCount * 5;
      const totalDecay = baseDecay + (tabSwitchPenalty * 0.1);

      setGateStability(prev => Math.max(0, prev - totalDecay));
    }, 1000);

    return () => clearInterval(interval);
  }, [tabSwitchCount]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStabilityColor = (stability: number) => {
    if (stability > 70) return 'from-green-600 to-green-800';
    if (stability > 40) return 'from-yellow-600 to-orange-600';
    return 'from-red-600 to-red-800';
  };

  const getStabilityStatus = (stability: number) => {
    if (stability > 70) return 'STABLE';
    if (stability > 40) return 'WARNING';
    return 'CRITICAL';
  };

  const getRoundProgress = () => {
    const rounds = ['rules', 'mcq', 'flowchart', 'coding', 'completed'];
    const currentIndex = rounds.indexOf(currentRound);
    return ((currentIndex) / (rounds.length - 1)) * 100;
  };

  return (
    <div className="glass-strong rounded-xl p-6 space-y-6 border-2 border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-destructive flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold gradient-text">GATEKEEPER STATUS</h3>
            <p className="text-xs text-muted-foreground">Real-time Protocol Monitor</p>
          </div>
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-success font-mono">ACTIVE</span>
        </motion.div>
      </div>

      {/* Gate Stability */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={cn(
              "w-5 h-5",
              gateStability > 70 && "text-success",
              gateStability > 40 && gateStability <= 70 && "text-warning",
              gateStability <= 40 && "text-destructive animate-pulse"
            )} />
            <span className="font-display text-sm font-semibold">GATE STABILITY</span>
          </div>
          <span className={cn(
            "font-mono text-sm font-bold",
            gateStability > 70 && "text-success",
            gateStability > 40 && gateStability <= 70 && "text-warning",
            gateStability <= 40 && "text-destructive"
          )}>
            {gateStability.toFixed(1)}%
          </span>
        </div>

        <div className="relative h-8 bg-black/50 rounded-lg overflow-hidden border border-primary/20">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 bg-gradient-to-r rounded-lg",
              getStabilityColor(gateStability)
            )}
            initial={{ width: '100%' }}
            animate={{ width: `${gateStability}%` }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "font-display text-xs font-bold",
              gateStability > 50 ? "text-white" : "text-white/80"
            )}>
              {getStabilityStatus(gateStability)}
            </span>
          </div>
        </div>

        {gateStability < 40 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/30"
          >
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>Gate integrity compromised! Complete rounds quickly!</span>
          </motion.div>
        )}
      </div>

      {/* Player Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-lg p-3 space-y-1">
          <p className="text-xs text-muted-foreground">OPERATIVE</p>
          <p className="font-mono text-sm font-semibold truncate">
            {participantName || 'GATEKEEPER-001'}
          </p>
        </div>
        <div className="glass rounded-lg p-3 space-y-1">
          <p className="text-xs text-muted-foreground">SESSION TIME</p>
          <p className="font-mono text-sm font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(elapsedTime)}
          </p>
        </div>
      </div>

      {/* Current Round */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold">PROTOCOL PROGRESS</span>
          <span className="text-xs text-muted-foreground">{Math.round(getRoundProgress())}%</span>
        </div>

        <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-primary/20">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getRoundProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'mcq', label: 'APTITUDE', icon: CheckCircle2 },
            { id: 'flowchart', label: 'DESIGN', icon: CheckCircle2 },
            { id: 'coding', label: 'CODING', icon: CheckCircle2 },
          ].map((round) => {
            const status = roundStatus[round.id as keyof typeof roundStatus];
            return (
              <div
                key={round.id}
                className={cn(
                  "flex items-center gap-1.5 p-2 rounded text-xs border",
                  status === 'completed' && "bg-success/10 border-success/30 text-success",
                  status === 'active' && "bg-primary/10 border-primary/30 text-primary animate-pulse",
                  status === 'locked' && "bg-muted/10 border-muted text-muted-foreground"
                )}
              >
                {status === 'completed' && <round.icon className="w-3 h-3" />}
                {status === 'active' && <Zap className="w-3 h-3" />}
                {status === 'locked' && <Lock className="w-3 h-3" />}
                <span className="font-mono truncate">{round.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Warnings */}
      {tabSwitchCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-lg p-3 border border-destructive/30 bg-destructive/5"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-destructive mb-1">SECURITY BREACH DETECTED</p>
              <p className="text-xs text-muted-foreground">
                Tab switches: <span className="font-mono font-bold text-destructive">{tabSwitchCount}/3</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Protocol Status */}
      <div className="pt-4 border-t border-primary/20">
        <p className="text-xs text-center text-muted-foreground">
          HAWKINS LAB PROTOCOL v2.0 | ALL SYSTEMS MONITORED
        </p>
      </div>
    </div>
  );
};
