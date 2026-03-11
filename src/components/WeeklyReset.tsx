import { clsx } from 'clsx';
import { useState } from 'react';
import { collection, addDoc, Timestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { GlassPanel } from './GlassPanel';
import { GlowButton } from './GlowButton';
import { RotateCcw, CheckCircle2, Target, Zap, TrendingUp, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfWeek } from 'date-fns';

interface WeeklyResetProps {
  onComplete: () => void;
}

export function WeeklyReset({ onComplete }: WeeklyResetProps) {
  const [step, setStep] = useState(1);
  const [wins, setWins] = useState<string[]>(['']);
  const [insights, setInsights] = useState<string[]>(['']);
  const [outcomes, setOutcomes] = useState({
    business: '',
    house: '',
    family: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddWin = () => setWins([...wins, '']);
  const handleAddInsight = () => setInsights([...insights, '']);

  const handleWinChange = (index: number, value: string) => {
    const newWins = [...wins];
    newWins[index] = value;
    setWins(newWins);
  };

  const handleInsightChange = (index: number, value: string) => {
    const newInsights = [...insights];
    newInsights[index] = value;
    setInsights(newInsights);
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;

    setIsSubmitting(true);
    try {
      const uid = auth.currentUser.uid;
      const monday = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

      await addDoc(collection(db, 'weeklyPlans'), {
        weekStartDate: monday,
        outcomes,
        wins: wins.filter(w => w.trim()),
        insights: insights.filter(i => i.trim()),
        createdAt: Timestamp.now(),
        uid
      });

      onComplete();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="font-mono text-xs md:text-sm tracking-[0.3em] text-amber-500 uppercase mb-1">Weekly Planning</h2>
        <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-zinc-100">Weekly Review</h1>
        <p className="mt-2 text-sm md:text-base text-zinc-500">Plan your goals for next week.</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={clsx(
              "h-1 w-16 rounded-full transition-all duration-500",
              step >= s ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-zinc-800"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <GlassPanel className="p-4 md:p-8" glowColor="zinc">
              <h3 className="text-lg md:text-xl font-serif font-light tracking-wide mb-6 flex items-center gap-3 text-zinc-100">
                <CheckCircle2 className="text-amber-500" size={24} />
                What did you complete successfully last week?
              </h3>
              <div className="space-y-4">
                {wins.map((win, i) => (
                  <input
                    key={i}
                    type="text"
                    value={win}
                    onChange={(e) => handleWinChange(i, e.target.value)}
                    placeholder={`Win #${i + 1}`}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                ))}
                <button onClick={handleAddWin} className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                  + Add another win
                </button>
              </div>
            </GlassPanel>
            <div className="flex justify-end">
              <GlowButton onClick={() => setStep(2)} className="flex items-center gap-2" glowColor="amber">
                Next <ArrowRight size={18} />
              </GlowButton>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <GlassPanel className="p-4 md:p-8" glowColor="zinc">
              <h3 className="text-lg md:text-xl font-serif font-light tracking-wide mb-6 flex items-center gap-3 text-zinc-100">
                <RotateCcw className="text-amber-500" size={24} />
                What important things did you learn?
              </h3>
              <div className="space-y-4">
                {insights.map((insight, i) => (
                  <textarea
                    key={i}
                    value={insight}
                    onChange={(e) => handleInsightChange(i, e.target.value)}
                    placeholder={`Insight #${i + 1}`}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
                  />
                ))}
                <button onClick={handleAddInsight} className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                  + Add another insight
                </button>
              </div>
            </GlassPanel>
            <div className="flex justify-between">
              <GlowButton variant="secondary" onClick={() => setStep(1)} className="flex items-center gap-2" glowColor="zinc">
                <ArrowLeft size={18} /> Back
              </GlowButton>
              <GlowButton onClick={() => setStep(3)} className="flex items-center gap-2" glowColor="amber">
                Next <ArrowRight size={18} />
              </GlowButton>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <GlassPanel className="p-4 md:p-8" glowColor="zinc">
              <h3 className="text-lg md:text-xl font-serif font-light tracking-wide mb-6 flex items-center gap-3 text-zinc-100">
                <Target className="text-amber-500" size={24} />
                What are your 3 main goals for this week?
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-amber-500 uppercase tracking-wider">Business</label>
                  <input
                    type="text"
                    value={outcomes.business}
                    onChange={(e) => setOutcomes({ ...outcomes, business: e.target.value })}
                    placeholder="e.g. Finish the quarterly report"
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">House</label>
                  <input
                    type="text"
                    value={outcomes.house}
                    onChange={(e) => setOutcomes({ ...outcomes, house: e.target.value })}
                    placeholder="e.g. Clean the garage"
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Family</label>
                  <input
                    type="text"
                    value={outcomes.family}
                    onChange={(e) => setOutcomes({ ...outcomes, family: e.target.value })}
                    placeholder="e.g. Call parents on Sunday"
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                </div>
              </div>
            </GlassPanel>
            <div className="flex justify-between">
              <GlowButton variant="secondary" onClick={() => setStep(2)} className="flex items-center gap-2" glowColor="zinc">
                <ArrowLeft size={18} /> Back
              </GlowButton>
              <GlowButton onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2" glowColor="amber">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                Save Weekly Plan
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
