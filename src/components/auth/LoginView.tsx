import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sendOtpToEmail, verifyOtp } from '../../services/otpService';
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  UserX,
  HelpCircle
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, users, resetPasswordWithOtp, organization } = useApp();

  const [mode, setMode] = useState<'login' | 'forgot_password'>('login');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request_otp' | 'verify_otp'>('request_otp');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const res = login(email.trim(), password, rememberMe);
    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials.');
    }
  };

  const handleSendResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);

    const user = users.find(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
    if (!user) {
      setForgotError('No registered user account found with this email address.');
      return;
    }

    if (user.isDisabled) {
      setForgotError('This account is disabled. Password reset is not permitted. Please contact administrator.');
      return;
    }

    const res = sendOtpToEmail(forgotEmail.trim());
    if (res.success) {
      setForgotStep('verify_otp');
      setForgotMessage(`Password reset OTP dispatched to ${forgotEmail.trim()}.`);
    } else {
      setForgotError(res.message);
    }
  };

  const handleCompletePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newPassword.length < 8) {
      setForgotError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    const otpRes = verifyOtp(forgotEmail.trim(), forgotOtp.trim());
    if (!otpRes.success) {
      setForgotError(otpRes.message);
      return;
    }

    resetPasswordWithOtp(forgotEmail.trim(), newPassword);
    setMode('login');
    setEmail(forgotEmail.trim());
    setPassword('');
    setLoginError(null);
    alert('Password reset successful! Please log in with your new password.');
  };

  // Quick fill helper for reviewers
  const quickFillAccount = (userEmail: string, userPass = 'Enterprise@2026') => {
    setEmail(userEmail);
    const user = users.find(u => u.email === userEmail);
    setPassword(user?.password || userPass);
    setLoginError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-slate-800 text-white text-center">
          <div className="w-12 h-12 bg-blue-600/40 border border-blue-400/30 rounded-xl flex items-center justify-center mx-auto text-blue-300 shadow-sm mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Enterprise Task & Mission Platform</h1>
          <p className="text-xs text-blue-200/80 mt-1">
            {organization.name}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-xs">
            {loginError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            <div>
              <label className="font-semibold block mb-1.5 text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setForgotEmail(email);
                    setForgotError(null);
                    setForgotMessage(null);
                    setForgotStep('request_otp');
                  }}
                  className="text-blue-400 hover:text-blue-300 text-[11px]"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg text-xs"
            >
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-slate-800 text-[11px]">
              <div className="text-slate-400 font-medium mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Quick-Select Registered Accounts:</span>
              </div>
              <div className="space-y-1.5">
                {users.slice(0, 3).map(u => (
                  <button
                    key={u.userId}
                    type="button"
                    onClick={() => quickFillAccount(u.email, u.password || 'Enterprise@2026')}
                    className="w-full text-left p-2 rounded bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-white">{u.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({u.role})</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-mono">Fill Creds</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          /* Forgot Password OTP Flow */
          <form
            onSubmit={forgotStep === 'request_otp' ? handleSendResetOtp : handleCompletePasswordReset}
            className="p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Reset Password with Email OTP</h3>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-400 hover:text-white"
              >
                Back to Sign In
              </button>
            </div>

            {forgotError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{forgotMessage}</span>
              </div>
            )}

            {forgotStep === 'request_otp' ? (
              <>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    Your Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                >
                  Send Password Reset OTP
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center tracking-widest text-lg font-mono p-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
                >
                  Verify Code & Set New Password
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
