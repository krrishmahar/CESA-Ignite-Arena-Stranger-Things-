import { useCompetitionStore } from '@/store/competitionStore';
import { CompetitionHeader } from './CompetitionHeader';
import { CompetitionTimeline } from './CompetitionTimeline';
import { AnimatedBackground } from './AnimatedBackground';
import { RulesPage } from './RulesPage';
import { MCQRound } from './MCQRound';
import { FlowchartRound } from './FlowchartRound';
import { CodingRound } from './CodingRound';
import { CompletionPage } from './CompletionPage';
import { motion, AnimatePresence } from 'framer-motion';

export const CompetitionLayout = () => {
  const { currentRound } = useCompetitionStore();

  const renderRound = () => {
    switch (currentRound) {
      case 'rules':
        return <RulesPage />;
      case 'mcq':
        return <MCQRound />;
      case 'flowchart':
        return <FlowchartRound />;
      case 'coding':
        return <CodingRound />;
      case 'completed':
        return <CompletionPage />;
      default:
        return <RulesPage />;
    }
  };

  return (
    // Added bg-black and text-white to ensure visibility after Stranger Things hero
    <div className="min-h-screen relative bg-black text-white selection:bg-red-600 selection:text-white">

      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <CompetitionHeader />
        
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-[280px,1fr] gap-8 h-full">
            
            {/* Sidebar - Timeline (Sticky) */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <CompetitionTimeline />
              </div>
            </div>
            
            {/* Main Content Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRound}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
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