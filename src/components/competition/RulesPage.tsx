import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Shield, Zap, AlertTriangle } from 'lucide-react';
import { useCompetitionStore } from '@/store/competitionStore';
import { supabase } from '@/lib/supabaseClient';
import { WaitingArea } from './WaitingArea';

export const RulesPage = () => {
  const [accepted, setAccepted] = useState(false);
  const { acceptRules, currentRound } = useCompetitionStore();
  const [rules, setRules] = useState<any[]>([]); // Dynamic Rules

  // If the user has already accepted the rules and moved to the
  // waiting round, show the WaitingArea instead of the rules screen.
  if (currentRound === 'waiting') {
    return <WaitingArea />;
  }

  // 1. FETCH DYNAMIC RULES
  useEffect(() => {
    const fetchRules = async () => {
        const { data } = await supabase.from('competition_rules').select('*');
        if (data && data.length > 0) setRules(data);
        else {
            // Fallback hardcoded if DB empty
            setRules([
                { title: "No Cheating", description: "AI usage is strictly prohibited." },
                { title: "Tab Monitoring", description: "Switching tabs logs a warning." }
            ]);
        }
    };
    fetchRules();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 text-white">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-display">Competition Rules</h1>
        <p className="text-slate-400">Please read carefully before proceeding.</p>
      </div>

      {/* Dynamic Rules List */}
      <div className="grid md:grid-cols-2 gap-4">
        {rules.map((rule, i) => (
            <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex gap-3"
            >
                <div className="bg-indigo-500/10 p-2 rounded-lg h-fit">
                    <Shield className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-200">{rule.title}</h3>
                    <p className="text-sm text-slate-400">{rule.description}</p>
                </div>
            </motion.div>
        ))}
      </div>

      <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex gap-3 items-center">
        <AlertTriangle className="text-red-500 w-6 h-6" />
        <p className="text-red-200 text-sm">
            Warning: This exam is proctored. Your tab switches, mouse movements, and IP address are being logged.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 mt-8">
        <div className="flex items-center gap-2">
            <Checkbox 
                id="terms" 
                checked={accepted} 
                onCheckedChange={(c) => setAccepted(c === true)} 
                className="border-white/50 data-[state=checked]:bg-indigo-500"
            />
            <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer select-none">
                I accept the rules and consent to monitoring.
            </label>
        </div>

        <Button 
            disabled={!accepted} 
            onClick={acceptRules}
            className="w-full md:w-64 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12"
        >
            Enter Waiting Area
        </Button>
      </div>
    </div>
  );
};