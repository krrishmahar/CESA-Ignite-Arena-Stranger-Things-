import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabaseClient';

// --- TYPES ---
export type RoundStatus = 'locked' | 'active' | 'completed';
export type Round = 'rules' | 'waiting' | 'mcq' | 'flowchart' | 'coding' | 'completed'; // Added 'waiting'
export type CompetitionStatus = 'active' | 'frozen' | 'disqualified';

interface CompetitionState {
  // Local UI State
  competitionStatus: CompetitionStatus;
  currentRound: Round;
  roundStatus: Record<Round, RoundStatus>;
  
  // User Data
  userId: string | null;
  email: string | null;
  
  // Security
  tabSwitchCount: number;
  
  // --- ACTIONS ---
  initializeUser: (userId: string, email: string) => Promise<void>;
  acceptRules: () => Promise<void>;
  startRound1: () => void; // Call this from Admin or Timer
  
  // Security Actions
  logTabSwitch: () => Promise<void>;
  freezeCompetition: () => Promise<void>;
  unfreezeCompetition: () => void;
  disqualifyUser: () => Promise<void>;
  
  // Reset
  resetCompetition: () => void;
}

const initialState = {
  competitionStatus: 'active' as CompetitionStatus,
  currentRound: 'rules' as Round,
  roundStatus: {
    rules: 'active',
    waiting: 'locked',
    mcq: 'locked',
    flowchart: 'locked',
    coding: 'locked',
    completed: 'locked',
  } as Record<Round, RoundStatus>,
  tabSwitchCount: 0,
  userId: null,
  email: null,
};

export const useCompetitionStore = create<CompetitionState>()(
  persist(
    (set, get) => ({
      ...initialState,

// 1. LOGIN & INIT SESSION
      initializeUser: async (userId, email) => {
        set({ userId, email });
        
        // Check if session exists in DB
        const { data } = await supabase
          .from('exam_sessions')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data) {
          // Restore state from DB
          set({ 
            competitionStatus: data.status === 'active' ? 'active' : data.status,
            tabSwitchCount: data.tab_switches || 0
            // Add more restoration logic here if needed
          });
        } else {
          // Create new session
          await supabase.from('exam_sessions').insert({
            user_id: userId,
            email: email, // Make sure column exists or remove this
            status: 'active',
            current_round_slug: 'rules'
          });
        }
      },

      // 2. RULES ACCEPTED -> GO TO WAITING ROOM
      acceptRules: async () => {
        const { userId } = get();
        set({ 
          currentRound: 'waiting',
          roundStatus: { ...get().roundStatus, rules: 'completed', waiting: 'active' }
        });

        // Log to DB
        if (userId) {
          await supabase.from('exam_sessions')
            .update({ current_round_slug: 'waiting' })
            .eq('user_id', userId);
            
          await supabase.from('activity_logs').insert({
            user_id: userId,
            action_type: 'RULES_ACCEPTED',
            details: { timestamp: new Date().toISOString() }
          });
        }
      },

      // 3. ADMIN STARTS EXAM (Waiting -> MCQ)
      startRound1: () => {
        set({ 
          currentRound: 'mcq',
          roundStatus: { ...get().roundStatus, waiting: 'completed', mcq: 'active' }
        });
      },

      // 4. SECURITY: TAB SWITCH LOGGING
      logTabSwitch: async () => {
        const { tabSwitchCount, userId, competitionStatus } = get();
        const newCount = tabSwitchCount + 1;
        
        set({ tabSwitchCount: newCount });

        // Local Freeze Logic
        if (newCount >= 2 && competitionStatus !== 'disqualified') {
           set({ competitionStatus: 'frozen' });
        }

        // DB Log
        if (userId) {
          await supabase.from('activity_logs').insert({
            user_id: userId,
            action_type: 'TAB_SWITCH',
            severity: 'warning',
            details: { count: newCount, timestamp: new Date().toISOString() }
          });
          
          // Update Session Stats
          await supabase.from('exam_sessions')
            .update({ 
                tab_switches: newCount,
                status: newCount >= 2 ? 'frozen' : 'active' 
            })
            .eq('user_id', userId);
        }
      },

      freezeCompetition: async () => {
        set({ competitionStatus: 'frozen' });
        const { userId } = get();
        if (userId) {
            await supabase.from('exam_sessions').update({ status: 'frozen' }).eq('user_id', userId);
        }
      },

      unfreezeCompetition: () => {
        set({ competitionStatus: 'active' });
        // Optional: DB update logic if Admin triggers this
      },

      disqualifyUser: async () => {
        set({ competitionStatus: 'disqualified', currentRound: 'completed' });
        const { userId } = get();
        if (userId) {
            await supabase.from('exam_sessions').update({ status: 'disqualified', is_disqualified: true }).eq('user_id', userId);
            await supabase.from('activity_logs').insert({
                user_id: userId,
                action_type: 'DISQUALIFIED',
                severity: 'critical',
                details: { reason: 'Cheat Detection' }
            });
        }
      },

      resetCompetition: () => set(initialState),
    }),
    { name: 'cesa-competition-storage' }
  )
);