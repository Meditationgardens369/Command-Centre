import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { generateStrategicAdvice } from '../lib/gemini';
import { GlassPanel } from './GlassPanel';
import { GlowButton } from './GlowButton';
import { Zap, Target, Lightbulb, TrendingUp, Sparkles, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export function StrategicIntelligence() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    const oppQuery = query(collection(db, 'opportunities'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const unsubscribeOpp = onSnapshot(oppQuery, (snapshot) => {
      setOpportunities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const assetQuery = query(collection(db, 'assets'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const unsubscribeAsset = onSnapshot(assetQuery, (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeOpp();
      unsubscribeAsset();
    };
  }, []);

  const getAdvice = async () => {
    setIsGenerating(true);
    try {
      const context = { opportunities, assets };
      const result = await generateStrategicAdvice(context);
      setAdvice(result);
    } catch (err) {
      console.error('Advice error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-xs md:text-sm tracking-[0.3em] text-amber-500 uppercase mb-1">AI Analysis</h2>
          <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-zinc-100">AI Advice</h1>
        </div>
        <GlowButton onClick={getAdvice} disabled={isGenerating} glowColor="amber" className="flex items-center gap-2 w-full md:w-auto justify-center">
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          <span>Get AI Advice</span>
        </GlowButton>
      </div>

      <AnimatePresence>
        {advice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <GlassPanel glowColor="amber" className="p-6 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
                  <Zap size={24} />
                </div>
                <div className="flex-1 prose prose-invert max-w-none">
                  <h3 className="text-lg font-serif font-light text-amber-500 mb-2 uppercase tracking-wider">AI Advice Report</h3>
                  <div className="text-zinc-300 leading-relaxed font-light">
                    <ReactMarkdown>{advice}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Opportunity Radar */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-light tracking-wide flex items-center gap-2 text-zinc-100">
            <Target className="text-amber-500" size={20} />
            Future Ideas
          </h3>
          <div className="space-y-4">
            {opportunities.length > 0 ? opportunities.map((opp) => (
              <GlassPanel key={opp.id} className="p-4 group" glowColor="zinc">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-lg text-zinc-100">{opp.title}</h4>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                    <TrendingUp size={12} className="text-amber-400" />
                    <span className="text-xs font-mono text-amber-400">{opp.leverageScore}/10</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">{opp.description}</p>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${opp.leverageScore * 10}%` }}
                    className="h-full bg-amber-500"
                  />
                </div>
              </GlassPanel>
            )) : (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                No future ideas listed.
              </div>
            )}
          </div>
        </div>

        {/* Asset Builder */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-light tracking-wide flex items-center gap-2 text-zinc-100">
            <TrendingUp className="text-amber-500" size={20} />
            Current Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.length > 0 ? assets.map((asset) => (
              <GlassPanel key={asset.id} glowColor="amber" className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-tighter">{asset.type}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{asset.progress}%</span>
                </div>
                <h4 className="font-medium mb-3 text-zinc-100 break-words">{asset.name}</h4>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${asset.progress}%` }}
                    className="h-full bg-amber-500"
                  />
                </div>
              </GlassPanel>
            )) : (
              <div className="col-span-2 py-12 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                No projects currently listed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
