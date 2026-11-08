/**
 * OTP Verification and Email Dispatch Service
 * Handles email verification, 6-digit OTP generation, simulated SMTP dispatch, and TTL validation.
 */

export interface OtpRecord {
  email: string;
  code: string;
  expiresAt: number; // Unix timestamp
  attempts: number;
}

// In-memory / temporary store for active OTPs
const activeOtps = new Map<string, OtpRecord>();

// Observers for in-app simulated email delivery notifications
type OtpListener = (notification: { email: string; code: string; sentAt: string }) => void;
const listeners = new Set<OtpListener>();

export function subscribeToOtpDelivery(listener: OtpListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Generates and dispatches a 6-digit OTP code to the specified email address.
 * OTP is valid for 10 minutes.
 */
export function sendOtpToEmail(email: string): { success: boolean; code: string; message: string } {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, code: '', message: 'Please provide a valid email address.' };
  }

  // Generate 6-digit numeric OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL

  activeOtps.set(normalizedEmail, {
    email: normalizedEmail,
    code,
    expiresAt,
    attempts: 0
  });

  const sentAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Notify listeners (UI toast notification representing mail delivery)
  listeners.forEach(fn => {
    try {
      fn({ email: normalizedEmail, code, sentAt });
    } catch (err) {
      console.error('[OtpService] Error notifying listener:', err);
    }
  });

  return {
    success: true,
    code,
    message: `Verification code successfully sent to ${normalizedEmail}. Code expires in 10 minutes.`
  };
}

/**
 * Validates the entered OTP code against the target email address.
 */
export function verifyOtp(email: string, code: string): { success: boolean; message: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const record = activeOtps.get(normalizedEmail);

  if (!record) {
    return {
      success: false,
      message: 'No verification code was requested for this email. Please click "Send OTP".'
    };
  }

  if (Date.now() > record.expiresAt) {
    activeOtps.delete(normalizedEmail);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new code.'
    };
  }

  if (record.attempts >= 5) {
    activeOtps.delete(normalizedEmail);
    return {
      success: false,
      message: 'Too many incorrect attempts. Please request a new code.'
    };
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    return {
      success: false,
      message: `Invalid code. ${5 - record.attempts} attempts remaining.`
    };
  }

  // Successfully verified! Consume the code
  activeOtps.delete(normalizedEmail);
  return {
    success: true,
    message: 'Email address verified successfully.'
  };
}
