import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { GlassPanel } from './GlassPanel';
import { GlowButton } from './GlowButton';
import { Plus, CheckCircle2, Circle, Trash2, Filter, MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export function ActionCockpit() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState<'Business' | 'House' | 'Family'>('Business');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [filter, setFilter] = useState<'All' | 'Business' | 'House' | 'Family'>('All');

  useEffect(() => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTask.trim(),
        category,
        priority,
        status: 'Pending',
        createdAt: Timestamp.now(),
        uid: auth.currentUser.uid
      });
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: currentStatus === 'Pending' ? 'Completed' : 'Pending'
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.category === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-xs md:text-sm tracking-[0.3em] text-amber-500 uppercase mb-1">Task Management</h2>
          <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-zinc-100">Tasks</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Business', 'House', 'Family'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={clsx(
                "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap",
                filter === f ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30" : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Form */}
      <GlassPanel className="p-3 md:p-4" glowColor="zinc">
        <form onSubmit={addTask} className="flex flex-col gap-3 md:gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              <option value="Business">Business</option>
              <option value="House">House</option>
              <option value="Family">Family</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <GlowButton type="submit" glowColor="amber" className="w-full md:w-auto px-4 py-3">
              <Plus size={20} className="mx-auto" />
            </GlowButton>
          </div>
        </form>
      </GlassPanel>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
          <GlassPanel
            key={task.id}
            className={clsx(
              "p-4 transition-all duration-300 group",
              task.status === 'Completed' ? "opacity-40 grayscale" : "opacity-100"
            )}
            glowColor={task.category === 'Business' ? 'amber' : task.category === 'House' ? 'zinc' : 'zinc'}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleTask(task.id, task.status)}
                className={clsx(
                  "transition-colors",
                  task.status === 'Completed' ? "text-amber-500" : "text-zinc-600 hover:text-amber-400"
                )}
              >
                {task.status === 'Completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <h4 className={clsx(
                  "font-medium text-base md:text-lg transition-all text-zinc-100 break-words",
                  task.status === 'Completed' && "line-through text-zinc-600"
                )}>
                  {task.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                  <span className={clsx(
                    "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border",
                    task.category === 'Business' ? "border-amber-500/30 text-amber-400" :
                    task.category === 'House' ? "border-zinc-500/30 text-zinc-400" :
                    "border-zinc-500/30 text-zinc-400"
                  )}>
                    {task.category}
                  </span>
                  <span className={clsx(
                    "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border",
                    task.priority === 'High' ? "border-red-500/30 text-red-400" :
                    task.priority === 'Medium' ? "border-amber-500/30 text-amber-400" :
                    "border-zinc-500/30 text-zinc-400"
                  )}>
                    {task.priority}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600 uppercase">
                    {task.createdAt?.toDate ? format(task.createdAt.toDate(), 'MMM d, HH:mm') : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </GlassPanel>
        )) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
            No tasks found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
