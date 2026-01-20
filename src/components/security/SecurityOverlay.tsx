import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Maximize, Ban, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompetitionStore } from '@/store/competitionStore';
import { toast } from 'sonner';

export const SecurityOverlay = () => {
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [showCopyWarning, setShowCopyWarning] = useState(false);
  const { incrementTabSwitch, tabSwitchCount } = useCompetitionStore();

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowFullscreenWarning(true);
        toast.error('Fullscreen mode required for assessment', {
          icon: <AlertTriangle className="w-4 h-4" />
        });
      } else {
        setShowFullscreenWarning(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowTabSwitchWarning(true);
        incrementTabSwitch();

        setTimeout(() => {
          setShowTabSwitchWarning(false);
        }, 3000);

        toast.warning(`Tab switch detected! Warning ${tabSwitchCount + 1}/3`, {
          icon: <AlertTriangle className="w-4 h-4" />
        });
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setShowCopyWarning(true);
      setTimeout(() => setShowCopyWarning(false), 2000);
      toast.error('Copying is disabled during assessment');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setShowCopyWarning(true);
      setTimeout(() => setShowCopyWarning(false), 2000);
      toast.error('Pasting is disabled during assessment');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-click is disabled during assessment');
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [incrementTabSwitch, tabSwitchCount]);

  const handleEnterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(() => {
      toast.error('Failed to enter fullscreen mode');
    });
  };

  return (
    <>
      {/* Fullscreen Warning Overlay */}
      <AnimatePresence>
        {showFullscreenWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="max-w-md w-full mx-4"
            >
              <div className="glass-strong rounded-2xl p-8 border-2 border-destructive/50 shadow-[0_0_60px_rgba(239,68,68,0.4)]">
                <div className="text-center space-y-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <AlertTriangle className="w-20 h-20 text-destructive mx-auto" />
                  </motion.div>

                  <div>
                    <h2 className="font-display text-2xl font-bold text-destructive mb-2">
                      PROTOCOL VIOLATION
                    </h2>
                    <p className="text-sm text-red-200/80">
                      Fullscreen mode is required to continue the assessment
                    </p>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <p className="text-xs text-red-200/70 leading-relaxed">
                      <Lock className="w-4 h-4 inline mr-1" />
                      For security and proctoring purposes, you must remain in fullscreen mode
                      throughout the entire assessment. Exiting fullscreen is monitored.
                    </p>
                  </div>

                  <Button
                    onClick={handleEnterFullscreen}
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                  >
                    <Maximize className="w-4 h-4 mr-2" />
                    Re-enter Fullscreen Mode
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switch Warning */}
      <AnimatePresence>
        {showTabSwitchWarning && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[150]"
          >
            <div className="glass-strong rounded-xl p-4 border-2 border-warning/50 shadow-[0_0_40px_rgba(251,191,36,0.4)] min-w-[400px]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-display font-bold text-warning mb-1">
                    TAB SWITCH DETECTED
                  </h3>
                  <p className="text-xs text-red-200/70">
                    Warning <span className="font-mono font-bold">{tabSwitchCount + 1}/3</span> - Further violations will result in disqualification
                  </p>
                </div>
                <Eye className="w-5 h-5 text-warning animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy/Paste Warning */}
      <AnimatePresence>
        {showCopyWarning && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150]"
          >
            <div className="glass-strong rounded-xl p-6 border-2 border-destructive/50 shadow-[0_0_60px_rgba(239,68,68,0.5)]">
              <div className="flex items-center gap-3">
                <Ban className="w-8 h-8 text-destructive animate-pulse" />
                <div>
                  <h3 className="font-display font-bold text-destructive">
                    ACTION BLOCKED
                  </h3>
                  <p className="text-xs text-red-200/70">
                    Copy/Paste operations are disabled
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Security Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 right-4 z-[100]"
      >
        <div className="glass rounded-lg px-3 py-2 border border-success/30 bg-success/5">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-success font-mono">PROCTORING ACTIVE</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-success"
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};
