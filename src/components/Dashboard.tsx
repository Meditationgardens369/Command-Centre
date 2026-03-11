import { clsx } from 'clsx';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { GlassPanel } from './GlassPanel';
import { Zap, Target, Lightbulb, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { format, startOfWeek } from 'date-fns';

export function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    // Fetch Recent Tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('uid', '==', uid),
      where('status', '==', 'Pending'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Recent Insights
    const insightsQuery = query(
      collection(db, 'insights'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const unsubscribeInsights = onSnapshot(insightsQuery, (snapshot) => {
      setInsights(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Active Projects
    const projectsQuery = query(
      collection(db, 'projects'),
      where('uid', '==', uid),
      where('status', '==', 'Active'),
      limit(4)
    );
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Current Weekly Plan
    const monday = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const planQuery = query(
      collection(db, 'weeklyPlans'),
      where('uid', '==', uid),
      where('weekStartDate', '==', monday),
      limit(1)
    );
    const unsubscribePlan = onSnapshot(planQuery, (snapshot) => {
      if (!snapshot.empty) {
        setWeeklyPlan(snapshot.docs[0].data());
      }
    });

    return () => {
      unsubscribeTasks();
      unsubscribeInsights();
      unsubscribeProjects();
      unsubscribePlan();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-xs md:text-sm tracking-[0.3em] text-amber-500 uppercase mb-1">Overview</h2>
          <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-zinc-100">Current Status</h1>
        </div>
        <div className="text-left md:text-right">
          <p className="text-zinc-500 text-[10px] md:text-sm font-mono uppercase tracking-wider">System Status: Online</p>
          <p className="text-amber-400 text-base md:text-lg font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
      </div>

      {/* Top Row: Weekly Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel glowColor="amber" className="relative group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
              <Zap size={20} />
            </div>
            <h3 className="font-medium uppercase tracking-widest text-xs text-zinc-300">Work Goal</h3>
          </div>
          <p className="text-lg text-zinc-100 min-h-[3rem] font-light">
            {weeklyPlan?.outcomes?.business || "No outcome set for this week."}
          </p>
          <div className="absolute bottom-0 left-0 h-1 bg-amber-500/50 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </GlassPanel>

        <GlassPanel glowColor="zinc" className="relative group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20">
              <Target size={20} />
            </div>
            <h3 className="font-medium uppercase tracking-widest text-xs text-zinc-300">Home Goal</h3>
          </div>
          <p className="text-lg text-zinc-100 min-h-[3rem] font-light">
            {weeklyPlan?.outcomes?.house || "No outcome set for this week."}
          </p>
          <div className="absolute bottom-0 left-0 h-1 bg-zinc-500/50 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </GlassPanel>

        <GlassPanel glowColor="zinc" className="relative group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-medium uppercase tracking-widest text-xs text-zinc-300">Family Goal</h3>
          </div>
          <p className="text-lg text-zinc-100 min-h-[3rem] font-light">
            {weeklyPlan?.outcomes?.family || "No outcome set for this week."}
          </p>
          <div className="absolute bottom-0 left-0 h-1 bg-zinc-500/50 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </GlassPanel>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Active Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-light tracking-wide flex items-center gap-2 text-zinc-100">
              <Zap className="text-amber-500" size={20} />
              Current Projects
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.length > 0 ? projects.map((project) => (
              <GlassPanel key={project.id} className="p-4" glowColor="zinc">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-amber-500 uppercase tracking-tighter">{project.category}</span>
                  <span className="text-xs font-mono text-zinc-500">{project.progress}%</span>
                </div>
                <h4 className="font-medium mb-3 text-zinc-100 break-words">{project.name}</h4>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    className="h-full bg-amber-500"
                  />
                </div>
              </GlassPanel>
            )) : (
              <div className="col-span-2 py-12 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                No active projects found.
              </div>
            )}
          </div>
        </div>

        {/* Recent Insights */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-light tracking-wide flex items-center gap-2 text-zinc-100">
            <Lightbulb className="text-amber-400" size={20} />
            Saved Notes
          </h3>
          <div className="space-y-4">
            {insights.length > 0 ? insights.map((insight) => (
              <GlassPanel key={insight.id} glowColor="amber" className="p-4">
                <p className="text-zinc-300 italic leading-relaxed font-light">"{insight.content}"</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-500 uppercase">{insight.category}</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {insight.createdAt?.toDate ? format(insight.createdAt.toDate(), 'MMM d') : ''}
                  </span>
                </div>
              </GlassPanel>
            )) : (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                No insights recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Tasks */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif font-light tracking-wide flex items-center gap-2 text-zinc-100">
          <CheckCircle2 className="text-amber-500" size={20} />
          To-Do List
        </h3>
        <GlassPanel className="p-0 overflow-hidden" glowColor="zinc">
          <div className="divide-y divide-white/5">
            {tasks.length > 0 ? tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                <div className={clsx(
                  "p-2 rounded-lg",
                  task.priority === 'High' ? "bg-red-500/10 text-red-400" :
                  task.priority === 'Medium' ? "bg-amber-500/10 text-amber-400" :
                  "bg-zinc-500/10 text-zinc-400"
                )}>
                  <Clock size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-zinc-100">{task.title}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">{task.category}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={clsx(
                    "text-[10px] font-mono px-2 py-0.5 rounded border",
                    task.priority === 'High' ? "border-red-500/30 text-red-400" :
                    task.priority === 'Medium' ? "border-amber-500/30 text-amber-400" :
                    "border-zinc-500/30 text-zinc-400"
                  )}>
                    {task.priority}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-zinc-500">
                All clear. No pending high-priority tasks.
              </div>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
