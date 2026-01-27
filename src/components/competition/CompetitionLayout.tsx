import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lock } from 'lucide-react';
import { useCompetitionStore } from '@/store/competitionStore';

// Components
import { CompetitionHeader } from './CompetitionHeader';
import { CompetitionTimeline } from './CompetitionTimeline';
import { AnimatedBackground } from './AnimatedBackground';
import { RulesPage } from './RulesPage'; 
import { WaitingArea } from './WaitingArea'; // ADDED
import { MCQRound } from './MCQRound';
import { FlowchartRound } from './FlowchartRound';
import { CodingRound } from './CodingRound';
import { CompletionPage } from './CompletionPage';

export const CompetitionLayout = () => {
  // 1. GET DATA FROM STORE (Updated to use new logTabSwitch action)
  const { 
    currentRound, 
    competitionStatus, 
    logTabSwitch, // ✅ Using DB logging action
    userId 
  } = useCompetitionStore();

  const renderRound = () => {
    switch (currentRound) {
      case 'rules': return <RulesPage />;
      case 'waiting': return <WaitingArea />; // ✅ ADDED
      case 'mcq': return <MCQRound />;
      case 'flowchart': return <FlowchartRound />;
      case 'coding': return <CodingRound />;
      case 'completed': return <CompletionPage />;
      default: return <RulesPage />;
    }
  };

  // 2. ANTI-CHEAT LOGIC
  useEffect(() => {
    // Debugging logs
    console.log("Current Round:", currentRound);
    console.log("Status:", competitionStatus);

    // Define "Safe Zones" - Added 'waiting' so users don't get penalized in lobby
    const isSafeZone = currentRound === 'rules' || currentRound === 'waiting' || currentRound === 'completed';

    if (isSafeZone) {
        console.log("Safe Zone - Anti-Cheat Inactive");
        return;
    }

    if (competitionStatus !== 'active') {
        console.log("Status not active - Anti-Cheat Inactive");
        return;
    }

    console.log("ANTI-CHEAT ARMED ⚠️"); 

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn(`[Anti-Cheat] Tab switch detected!`);
        // Calls the action that logs to Supabase
        if (logTabSwitch) {
            logTabSwitch(); 
        } else {
            // Fallback if store hasn't been updated yet
            console.error("logTabSwitch action not found in store!");
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentRound, competitionStatus, logTabSwitch]);


  // 3. CHECK FOR FREEZE STATUS (The "Penalty Box" Screen)
  if (competitionStatus === 'frozen') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-6 font-sans">
         <div className="absolute inset-0 bg-orange-500/10 z-0 animate-pulse" />
         
         <div className="z-10 text-center max-w-lg w-full p-8 bg-zinc-900/90 backdrop-blur-xl border border-orange-500/50 rounded-2xl shadow-2xl shadow-orange-500/20">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-orange-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3">Competition Frozen</h1>
            
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg mb-6">
              <p className="text-orange-200 font-medium flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Suspicious Activity Detected
              </p>
            </div>

            <p className="text-zinc-400 mb-8 leading-relaxed">
              We detected multiple tab switches or background activity. As a security measure, your competition interface has been <strong>temporarily locked</strong>.
            </p>
            
            <div className="bg-black/40 p-6 rounded-xl border border-zinc-800">
               <p className="text-sm text-white font-semibold mb-2">
                 HOW TO UNLOCK:
               </p>
               <p className="text-sm text-zinc-500">
                 Please raise your hand and contact an invigilator immediately. They will review your activity log and can unlock your screen from the Admin Panel.
               </p>
            </div>
            
            <div className="mt-6 text-xs text-zinc-600 font-mono">
              Session ID: <span className="text-zinc-400">{userId || 'Unknown'}</span>
            </div>
         </div>
      </div>
    );
  }

  // 4. CHECK FOR DISQUALIFIED STATUS (The "Game Over" Screen)
  if (competitionStatus === 'disqualified') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative p-6">
            <div className="text-center max-w-md">
                <AlertTriangle className="w-20 h-20 text-red-600 mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-red-600 mb-4 font-display">DISQUALIFIED</h1>
                <p className="text-zinc-400">
                    Your attempt has been terminated due to repeated violations of the competition rules.
                </p>
            </div>
        </div>
    );
  }

  // 5. NORMAL RENDER (With Stranger Things Styling)
  return (
    // bg-black and text-white added for seamless integration
    <div className="min-h-screen relative bg-black text-white selection:bg-indigo-500/30">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnimatedBackground />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <CompetitionHeader />
        
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-[280px,1fr] gap-8 h-full">
            
            {/* Sidebar - Timeline */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <CompetitionTimeline />
              </div>
            </div>
            
            {/* Main Content Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRound}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="min-h-[calc(100vh-10rem)] w-full"
              >
                {renderRound()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};