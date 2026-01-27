// WaitingArea.tsx
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, Clock } from 'lucide-react';
import { useCompetitionStore } from '@/store/competitionStore';

export const WaitingArea = () => {
  const { email } = useCompetitionStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 p-4">
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30"
      >
        <ShieldCheck className="w-12 h-12 text-green-500" />
      </motion.div>

      <div className="space-y-4 max-w-lg">
        <h2 className="text-3xl font-display font-bold text-white">Rules Accepted</h2>
        <p className="text-slate-400">
          Welcome, <span className="text-white font-bold">{email || 'Candidate'}</span>. 
          You are now in the secure waiting lobby.
        </p>
        
        <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg flex items-center gap-3 text-left">
            <Clock className="w-8 h-8 text-indigo-400" />
            <div>
                <p className="text-indigo-300 font-bold text-sm">WAITING FOR SERVER</p>
                <p className="text-xs text-indigo-400/70">The exam will start automatically or when the administrator initiates Round 1.</p>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-500 text-sm animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin" />
        Synchronizing with CESA Server...
      </div>
    </div>
  );
};