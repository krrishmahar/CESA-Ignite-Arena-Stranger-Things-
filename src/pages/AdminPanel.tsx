import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Ensure path is correct
import { 
  Users, Lock, Unlock, Ban, Search, Shield, RefreshCw, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AnimatedBackground } from '../components/competition/AnimatedBackground'; 

// Types for DB Data
interface Participant {
  user_id: string;
  email: string; // Ensure your exam_sessions table has email, or fetch from auth
  status: 'active' | 'frozen' | 'disqualified';
  current_round_slug: string;
  tab_switches: number;
}

const AdminPanel = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. FETCH DATA FROM SUPABASE
  const fetchParticipants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) console.error("Error fetching users:", error);
    else setParticipants(data || []);
    setLoading(false);
  };

  // 2. REALTIME SUBSCRIPTION
  useEffect(() => {
    fetchParticipants();

    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_sessions' }, (payload) => {
        console.log('Realtime update:', payload);
        fetchParticipants(); // Refresh list on any change
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 3. ADMIN ACTIONS
  const handleAction = async (action: 'freeze' | 'unfreeze' | 'dq', userId: string) => {
    let updates = {};
    if (action === 'freeze') updates = { status: 'frozen' };
    if (action === 'unfreeze') updates = { status: 'active' };
    if (action === 'dq') updates = { status: 'disqualified', is_disqualified: true };

    const { error } = await supabase
        .from('exam_sessions')
        .update(updates)
        .eq('user_id', userId);

    if (error) alert("Action failed: " + error.message);
  };

  const filteredUsers = participants.filter(p => 
     p.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative font-sans text-slate-900 dark:text-slate-50">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center bg-black/50 p-6 rounded-xl border border-white/10 backdrop-blur-md">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="text-indigo-500" /> Admin Command Center
            </h1>
            <Button onClick={fetchParticipants} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white">
                <p className="text-xs uppercase text-slate-500 font-bold">Total Users</p>
                <p className="text-3xl font-bold">{participants.length}</p>
             </div>
             <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-white">
                <p className="text-xs uppercase text-orange-500 font-bold">Frozen</p>
                <p className="text-3xl font-bold text-orange-400">
                    {participants.filter(p => p.status === 'frozen').length}
                </p>
             </div>
        </div>

        {/* Search */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input 
                className="pl-10 bg-slate-900/50 border-slate-800 text-white" 
                placeholder="Search participant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {/* Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-black/40 uppercase text-xs font-bold text-slate-500">
                    <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Round</th>
                        <th className="p-4 text-center">Tab Switches</th>
                        <th className="p-4 text-right">Controls</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center">Loading live data...</td></tr>
                    ) : filteredUsers.map((p) => (
                        <tr key={p.user_id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-white">{p.email || 'Unknown'}</div>
                                <div className="text-xs font-mono opacity-50">{p.user_id}</div>
                            </td>
                            <td className="p-4">
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-bold border",
                                    p.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                    p.status === 'frozen' ? "bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse" :
                                    "bg-red-500/10 text-red-400 border-red-500/20"
                                )}>
                                    {p.status.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-4 capitalize text-white">{p.current_round_slug}</td>
                            <td className="p-4 text-center font-mono text-lg font-bold text-white">
                                {p.tab_switches}
                            </td>
                            <td className="p-4 text-right space-x-2">
                                {p.status === 'frozen' ? (
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction('unfreeze', p.user_id)}>
                                        <Unlock className="w-4 h-4" /> Unfreeze
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" className="border-orange-500 text-orange-400" onClick={() => handleAction('freeze', p.user_id)}>
                                        <Lock className="w-4 h-4" /> Freeze
                                    </Button>
                                )}
                                <Button size="sm" variant="destructive" onClick={() => handleAction('dq', p.user_id)}>
                                    <Ban className="w-4 h-4" /> DQ
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;