import { clsx } from 'clsx';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';
import { GlassPanel } from './components/GlassPanel';
import { GlowButton } from './components/GlowButton';
import { LayoutDashboard, ListTodo, Brain, Zap, RotateCcw, LogOut, Shield, User as UserIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Views
import { Dashboard } from './components/Dashboard';
import { ActionCockpit } from './components/ActionCockpit';
import { VoiceBrain } from './components/VoiceBrain';
import { StrategicIntelligence } from './components/StrategicIntelligence';
import { WeeklyReset } from './components/WeeklyReset';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'brain' | 'intelligence' | 'reset'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-amber-500">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <Zap className="h-12 w-12 fill-current" />
          <span className="font-mono text-sm tracking-[0.2em] uppercase">Loading application...</span>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex h-screen w-screen items-center justify-center bg-zinc-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.05),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-stone-500/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md px-6"
        >
          <GlassPanel className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-amber-500/5 p-4 ring-1 ring-amber-500/20">
                <Shield className="h-12 w-12 text-amber-500" />
              </div>
            </div>
            <h1 className="mb-2 font-serif text-4xl font-light tracking-tight text-zinc-100">Personal Dashboard</h1>
            <p className="mb-8 text-zinc-400 font-light">Please log in to view your data.</p>
            <GlowButton onClick={handleLogin} className="w-full" glowColor="amber">
              Log In with Google
            </GlowButton>
          </GlassPanel>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'brain', label: 'Voice Notes', icon: Brain },
    { id: 'intelligence', label: 'AI Advice', icon: Zap },
    { id: 'reset', label: 'Weekly Review', icon: RotateCcw },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Mobile Top Bar */}
      <div className="flex md:hidden sticky top-0 z-30 h-16 items-center justify-between border-b border-white/10 bg-zinc-950/80 px-6 backdrop-blur-xl">
        <span className="font-serif text-lg font-light tracking-widest text-amber-500 uppercase">
          DASHBOARD
        </span>
        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/30">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="h-full w-full rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <UserIcon size={16} className="text-amber-500" />
          )}
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative z-20 hidden md:flex flex-col border-r border-white/10 bg-zinc-950/80 backdrop-blur-xl"
      >
        <div className="flex h-20 items-center justify-between px-6">
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-serif text-xl font-light tracking-widest text-amber-500 uppercase"
            >
              DASHBOARD
            </motion.span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-2 hover:bg-white/5 text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={clsx(
                "flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300",
                activeView === item.id
                  ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              )}
            >
              <item.icon size={20} className={activeView === item.id ? "text-amber-400" : ""} />
              {isSidebarOpen && <span className="font-medium tracking-wide">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className={clsx(
            "flex items-center gap-3 rounded-xl bg-white/5 p-3",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/30">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-full w-full rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon size={16} className="text-amber-500" />
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">{user.displayName || 'User'}</p>
                <p className="truncate text-xs text-zinc-500">Logged In</p>
              </div>
            )}
            {isSidebarOpen && (
              <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition-colors">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="relative flex-1 overflow-y-auto bg-zinc-950 pb-20 md:pb-0">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-stone-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'dashboard' && <Dashboard />}
              {activeView === 'tasks' && <ActionCockpit />}
              {activeView === 'brain' && <VoiceBrain />}
              {activeView === 'intelligence' && <StrategicIntelligence />}
              {activeView === 'reset' && <WeeklyReset onComplete={() => setActiveView('dashboard')} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden h-16 items-center justify-around border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as any)}
            className={clsx(
              "flex flex-col items-center justify-center gap-1 px-2 py-1 transition-all duration-300",
              activeView === item.id ? "text-amber-400" : "text-zinc-500"
            )}
          >
            <item.icon size={20} className={activeView === item.id ? "text-amber-400" : ""} />
            <span className="text-[10px] font-medium uppercase tracking-widest">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
