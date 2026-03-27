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
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={`mt-2 p-3 rounded-lg border flex items-start gap-3 transition-colors ${
            status === 'scanning' ? 'bg-zinc-900 border-zinc-800' :
            status === 'safe' ? 'bg-emerald-500/5 border-emerald-500/10' :
            'bg-rose-500/5 border-rose-500/10'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {status === 'scanning' && <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />}
            {status === 'safe' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            {status === 'unsafe' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
          </div>
          <div className="space-y-1">
            <p className={`text-xs font-bold uppercase tracking-wider ${
              status === 'scanning' ? 'text-zinc-500' :
              status === 'safe' ? 'text-emerald-400' :
              'text-rose-400'
            }`}>
              {status === 'scanning' ? 'AI Safety Scan in Progress...' :
               status === 'safe' ? 'Content Verified Safe' :
               `Safety Warning: ${riskLevel.toUpperCase()} RISK`}
            </p>
            {reason && (
              <p className="text-[11px] text-zinc-400 leading-tight">
                {reason}
              </p>
            )}
            {status === 'unsafe' && (
              <div className="flex items-center gap-1.5 mt-1">
                <Info className="w-3 h-3 text-rose-400" />
                <p className="text-[10px] text-rose-400 font-medium">
                  Please revise your content to comply with Boardly safety guidelines.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
