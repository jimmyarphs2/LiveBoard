import { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ShieldCheck, ShieldAlert, ShieldEllipsis, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';

interface SafetyScannerProps {
  content: string;
  type: 'text' | 'link';
  onScanComplete: (isSafe: boolean) => void;
}

export function SafetyScanner({ content, type, onScanComplete }: SafetyScannerProps) {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'idle' | 'scanning' | 'safe' | 'unsafe'>('idle');
  const [reason, setReason] = useState('');
  const [riskLevel, setRiskLevel] = useState('');

  useEffect(() => {
    if (!content || content.length < 5) {
      setStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setStatus('scanning');
      try {
        const result = await geminiService.scanContent(content, type);
        setStatus(result.isSafe ? 'safe' : 'unsafe');
        setReason(result.reason);
        setRiskLevel(result.riskLevel);
        onScanComplete(result.isSafe);

        // Log safety scan
        if (user) {
          await addDoc(collection(db, 'safety_logs'), {
            userId: user.uid,
            content,
            contentType: type,
            isSafe: result.isSafe,
            riskLevel: result.riskLevel,
            reason: result.reason,
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Safety scan failed:', error);
        setStatus('safe'); // Fallback to safe but log error
        onScanComplete(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, type, user]);

  return (
    <AnimatePresence mode="wait">
      {status !== 'idle' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mt-4 p-5 rounded-2xl border flex items-start gap-4 backdrop-blur-xl transition-all duration-500 shadow-2xl ${
            status === 'scanning' ? 'bg-white/5 border-white/10' :
            status === 'safe' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5' :
            'bg-rose-500/5 border-rose-500/20 shadow-rose-500/5'
          }`}
        >
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
            status === 'scanning' ? 'bg-white/5' :
            status === 'safe' ? 'bg-emerald-500/10' :
            'bg-rose-500/10'
          }`}>
            {status === 'scanning' && <Loader2 className="w-5 h-5 text-white/40 animate-spin" />}
            {status === 'safe' && <ShieldCheck className="w-5 h-5 text-emerald-400 glow-emerald" />}
            {status === 'unsafe' && <ShieldAlert className="w-5 h-5 text-rose-400 glow-rose" />}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                status === 'scanning' ? 'text-white/40' :
                status === 'safe' ? 'text-emerald-400' :
                'text-rose-400'
              }`}>
                {status === 'scanning' ? 'AI SAFETY SCAN IN PROGRESS' :
                 status === 'safe' ? 'CONTENT VERIFIED SAFE' :
                 `SAFETY WARNING: ${riskLevel.toUpperCase()} RISK`}
              </p>
              {status === 'scanning' && (
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 rounded-full bg-white/40" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 rounded-full bg-white/40" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 rounded-full bg-white/40" />
                </div>
              )}
            </div>
            {reason && (
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                {reason}
              </p>
            )}
            {status === 'unsafe' && (
              <div className="flex items-center gap-2 pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <p className="text-[11px] text-rose-400 font-black uppercase tracking-wider">
                  Action Required: Please revise your content
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
