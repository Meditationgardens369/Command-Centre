import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, Timestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { processVoiceBrain } from '../lib/gemini';
import { GlassPanel } from './GlassPanel';
import { GlowButton } from './GlowButton';
import { Mic, MicOff, Send, Brain, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfWeek } from 'date-fns';

export function VoiceBrain() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentContext, setRecentContext] = useState<any>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const fetchContext = async () => {
      if (!auth.currentUser) return;
      try {
        const uid = auth.currentUser.uid;
        const monday = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const planQuery = query(
          collection(db, 'weeklyPlans'),
          where('uid', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(planQuery);
        if (!snapshot.empty) {
          setRecentContext(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error('Failed to fetch recent context', err);
      }
    };
    fetchContext();
  }, []);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + event.results[i][0].transcript + ' ');
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
    setIsRecording(true);
    setError(null);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleProcess = async () => {
    if (!transcript.trim() || !auth.currentUser) return;

    setIsProcessing(true);
    setError(null);
    try {
      const data = await processVoiceBrain(transcript, recentContext);
      setResult(data);

      const uid = auth.currentUser.uid;
      const now = Timestamp.now();

      // Automatically populate dashboard
      const batchPromises = [];

      if (data.tasks) {
        for (const task of data.tasks) {
          batchPromises.push(addDoc(collection(db, 'tasks'), {
            ...task,
            status: 'Pending',
            createdAt: now,
            uid
          }));
        }
      }

      if (data.insights) {
        for (const insight of data.insights) {
          batchPromises.push(addDoc(collection(db, 'insights'), {
            ...insight,
            createdAt: now,
            uid
          }));
        }
      }

      if (data.opportunities) {
        for (const opp of data.opportunities) {
          batchPromises.push(addDoc(collection(db, 'opportunities'), {
            ...opp,
            createdAt: now,
            uid
          }));
        }
      }

      await Promise.all(batchPromises);
      setTranscript('');
    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to process text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="font-mono text-xs md:text-sm tracking-[0.3em] text-amber-500 uppercase mb-1">Audio Input</h2>
        <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-zinc-100">Voice Notes</h1>
        <p className="mt-2 text-sm md:text-base text-zinc-500">Record or type your notes. The AI will organize them into tasks and categories.</p>
      </div>

      <GlassPanel className="p-4 md:p-8" glowColor="zinc">
        <div className="flex flex-col items-center gap-8">
          {/* Visualizer (Simulated) */}
          <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isRecording ? [8, 32, 12, 40, 8] : 8,
                  opacity: isRecording ? [0.3, 1, 0.3] : 0.3
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className={clsx(
                  "w-1 rounded-full",
                  isRecording ? "bg-amber-500" : "bg-zinc-500"
                )}
              />
            ))}
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={clsx(
                "h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500",
                isRecording 
                  ? "bg-red-500/20 text-red-500 ring-4 ring-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.4)]" 
                  : "bg-zinc-800 text-zinc-100 ring-4 ring-white/10 shadow-[0_0_40px_rgba(0,0,0,0.4)] hover:bg-zinc-700"
              )}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </motion.button>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 animate-pulse"
              />
            )}
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Text from your recording will appear here, or you can type directly..."
            className="w-full min-h-[150px] bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all resize-none font-mono text-sm leading-relaxed"
          />

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <GlowButton
            onClick={handleProcess}
            disabled={!transcript.trim() || isProcessing || isRecording}
            className="w-full py-4 flex items-center justify-center gap-2"
            glowColor="amber"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing text...</span>
              </>
            ) : (
              <>
                <Brain size={20} />
                <span>Process Notes</span>
              </>
            )}
          </GlowButton>
        </div>
      </GlassPanel>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <GlassPanel glowColor="amber" className="p-6">
              <h3 className="text-lg font-serif font-light tracking-wide mb-4 flex items-center gap-2 text-zinc-100">
                <CheckCircle2 className="text-amber-500" size={20} />
                Tasks Found
              </h3>
              <div className="space-y-3">
                {result.tasks?.map((task: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1 p-3 bg-zinc-900/50 rounded-xl border border-white/10">
                    <span className="text-sm text-zinc-100 font-medium break-words">{task.title}</span>
                    <span className="text-[10px] font-mono uppercase text-amber-500">{task.category}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel glowColor="zinc" className="p-6">
              <h3 className="text-lg font-serif font-light tracking-wide mb-4 flex items-center gap-2 text-zinc-100">
                <Zap className="text-amber-400" size={20} />
                Notes Found
              </h3>
              <div className="space-y-3">
                {result.insights?.map((insight: any, i: number) => (
                  <div key={i} className="p-3 bg-zinc-900/50 rounded-xl border border-white/10">
                    <p className="text-sm italic text-zinc-300 font-light">"{insight.content}"</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
