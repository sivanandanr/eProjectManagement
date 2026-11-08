import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sendOtpToEmail, verifyOtp } from '../../services/otpService';
import {
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

export const AdminFirstTimeSetup: React.FC = () => {
  const { registerInitialAdministrator, organization } = useApp();

  const [step, setStep] = useState<'details' | 'otp'>('details');

  // Form Fields
  const [fullName, setFullName] = useState('Sarah Lin');
  const [email, setEmail] = useState('siv.anan@gmail.com');
  const [jobTitle, setJobTitle] = useState('Chief Information Officer & System Administrator');
  const [password, setPassword] = useState('Admin@2026!');
  const [confirmPassword, setConfirmPassword] = useState('Admin@2026!');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Validate Details and Trigger OTP
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!fullName.trim()) {
      setOtpError('Please enter administrator full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setOtpError('Please enter a valid administrator email address.');
      return;
    }
    if (password.length < 8) {
      setOtpError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setOtpError('Passwords do not match. Please verify.');
      return;
    }

    // Send OTP
    const res = sendOtpToEmail(email.trim());
    if (res.success) {
      setStep('otp');
      setOtpSuccess(`A 6-digit verification code was sent to ${email.trim()}.`);
      startCooldown();
    } else {
      setOtpError(res.message);
    }
  };

  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    setOtpError(null);
    const res = sendOtpToEmail(email.trim());
    if (res.success) {
      setOtpSuccess(`New verification code sent to ${email.trim()}.`);
      startCooldown();
    } else {
      setOtpError(res.message);
    }
  };

  // Step 2: Verify OTP and Register Administrator
  const handleVerifyAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (otpCode.length !== 6) {
      setOtpError('Please enter the full 6-digit code.');
      return;
    }

    setIsSubmitting(true);
    const verifyRes = verifyOtp(email.trim(), otpCode.trim());

    if (!verifyRes.success) {
      setIsSubmitting(false);
      setOtpError(verifyRes.message);
      return;
    }

    // Register Administrator & Initialize System
    setTimeout(() => {
      registerInitialAdministrator({
        name: fullName.trim(),
        email: email.trim(),
        jobTitle: jobTitle.trim(),
        password: password
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Banner Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-slate-800 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/40 border border-blue-400/40 flex items-center justify-center shrink-0 text-blue-300 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-bold">
              First-Time System Initialization
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Register Administrator Account
            </h1>
            <p className="text-xs text-blue-200/80 mt-0.5">
              Organization: {organization.name} ({organization.code})
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'details'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className={step === 'details' ? 'text-white font-semibold' : 'text-slate-400'}>
              Administrator Profile & Credentials
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'otp'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span className={step === 'otp' ? 'text-white font-semibold' : 'text-slate-400'}>
              Email OTP Validation
            </span>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {otpError && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{otpError}</span>
          </div>
        )}

        {otpSuccess && step === 'otp' && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{otpSuccess}</span>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 'details' && (
          <form onSubmit={handleProceedToOtp} className="p-6 space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-slate-300">
                Administrator Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Lin"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Email ID (For OTP Validation) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. admin@organization.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Job Title / Responsibility
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="Chief Information Officer"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Administrator Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-9 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Setup is only required once. Subsequent visits check registered status.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: OTP Validation */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyAndRegister} className="p-6 space-y-5 text-xs">
            <div className="text-center space-y-2 py-2">
              <div className="w-12 h-12 bg-blue-900/40 border border-blue-700/50 rounded-full flex items-center justify-center mx-auto text-blue-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-sm">
                Enter Email Verification Code
              </h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                Please enter the 6-digit OTP code dispatched to <strong className="text-blue-300 font-mono">{email}</strong>.
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-slate-900 border border-blue-500/70 rounded-xl text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="text-blue-400 hover:text-blue-300 disabled:text-slate-500 flex items-center gap-1.5 transition-colors font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                <span>{resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend Code to Email'}</span>
              </button>
              <span className="text-slate-600">·</span>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-slate-400 hover:text-slate-200"
              >
                Change Email
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || otpCode.length !== 6}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying...' : 'Verify & Launch Platform'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
