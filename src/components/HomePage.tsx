import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'; // Make sure path is correct
import { Lock, LogOut, User } from 'lucide-react';
import { RulesPage } from './competition/RulesPage';

// --- CONTENT COMPONENTS ---

// 1. LOCKED VIEW (For Non-Logged In Users)
const LockedRules = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <Lock className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
                <h3 className="text-2xl font-st font-bold text-white tracking-wide">
                    RESTRICTED ACCESS
                </h3>
                <p className="text-zinc-400 max-w-md mx-auto">
                    The competition protocols are classified. You must identify yourself to access the Upside Down rules and begin the exam.
                </p>
            </div>

            <button 
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg tracking-wider transition-all shadow-lg hover:shadow-red-900/50"
            >
                LOGIN TO UNLOCK
            </button>
        </div>
    );
};

// 2. PUBLIC COMPONENTS
const AboutContent = () => (
  <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h2 className="text-4xl font-st text-red-600 mb-6">About CESA CSI</h2>
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-md">
        <p className="text-gray-300 text-lg leading-relaxed mb-4">
        We are the Computer Engineering Student Association (CESA) and Computer Society of India (CSI) chapter. 
        We organize events that push the boundaries of technology and creativity, much like opening portals to other dimensions.
        </p>
        <p className="text-gray-300 text-lg leading-relaxed">
        Join us to explore coding, design, and innovation.
        </p>
    </div>
  </div>
);

const HelpContent = () => (
  <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h2 className="text-4xl font-st text-red-600 mb-6">Need Help?</h2>
    <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl backdrop-blur-md">
        <p className="text-gray-300 text-lg mb-4">Try communicating via Christmas lights or use the form below.</p>
        <form className="space-y-4">
            <input type="email" placeholder="Your Email" className="w-full p-3 bg-black/50 border border-red-900/30 rounded text-white focus:border-red-600 outline-none transition-colors" />
            <textarea placeholder="Describe the monster..." rows={4} className="w-full p-3 bg-black/50 border border-red-900/30 rounded text-white focus:border-red-600 outline-none transition-colors"></textarea>
            <button className="px-6 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded transition-colors shadow-lg shadow-red-900/20">
                Send Signal
            </button>
        </form>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const HomePage = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'about' | 'help'>('rules');
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  // CHECK LOGIN STATUS
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-900 selection:text-white pb-20">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-900/30 px-6 py-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          
          <div className="text-2xl font-st font-black text-red-600 tracking-wider drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            Stranger Tech
          </div>

          <ul className="flex items-center space-x-2 md:space-x-6 text-sm md:text-base font-medium mt-4 md:mt-0">
            {['rules', 'about', 'help'].map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-2 rounded-md transition-all duration-300 capitalize ${
                    activeTab === tab 
                      ? 'text-red-500 bg-red-950/30 shadow-[0_0_10px_rgba(220,38,38,0.2)] border border-red-900/50' 
                      : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-900'
                  }`}
                >
                  {tab === 'rules' && !session && <Lock className="w-3 h-3 inline mr-1 mb-0.5" />}
                  {tab}
                </button>
              </li>
            ))}
          </ul>

          {/* DYNAMIC AUTH BUTTON */}
          <div className="mt-4 md:mt-0 ml-4">
             {session ? (
                 <div className="flex items-center gap-4">
                     <div className="hidden md:flex items-center gap-2 text-zinc-400 text-sm">
                        <User className="w-4 h-4" />
                        <span>{session.user.email}</span>
                     </div>
                     <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:border-red-600 text-zinc-300 hover:text-white rounded transition-colors text-sm"
                     >
                        <LogOut className="w-4 h-4" /> Logout
                     </button>
                 </div>
             ) : (
                <button 
                    onClick={() => navigate('/login')}
                    className="px-5 py-2 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-md shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all duration-300 transform hover:scale-105 tracking-wider"
                >
                    LOGIN / SIGNUP
                </button>
             )}
          </div>
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="container mx-auto px-6 py-12 md:py-20 relative z-10">
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {/* LOGIC: Rules tab dikhao agar session hai, warna Locked Rules */}
                {activeTab === 'rules' && (
                    session ? <RulesPage /> : <LockedRules />
                )}

                {activeTab === 'about' && <AboutContent />}
                {activeTab === 'help' && <HelpContent />}
            </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none z-0" />
    </div>
  );
};

export default HomePage;