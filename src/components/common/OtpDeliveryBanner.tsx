import React, { useState, useEffect } from 'react';
import { subscribeToOtpDelivery } from '../../services/otpService';
import { Mail, Check, Copy, X, KeyRound } from 'lucide-react';

export const OtpDeliveryBanner: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<{
    email: string;
    code: string;
    sentAt: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOtpDelivery(notification => {
      setActiveNotification(notification);
      setCopied(false);
    });
    return unsubscribe;
  }, []);

  if (!activeNotification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeNotification.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 p-4 flex items-start gap-3 relative">
        <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-lg shrink-0">
          <Mail className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Simulated Mail Delivery
            </span>
            <span className="text-[10px] text-slate-400">{activeNotification.sentAt}</span>
          </div>

          <p className="text-xs text-slate-300 mt-1">
            Verification OTP dispatched to <strong className="text-white font-mono">{activeNotification.email}</strong>:
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md font-mono text-base font-bold tracking-widest text-emerald-400 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>{activeNotification.code}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setActiveNotification(null)}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
