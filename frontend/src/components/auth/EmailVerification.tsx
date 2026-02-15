import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

/**
 * EmailVerification Component
 * 
 * Handles email verification after user registration with 6-digit code
 * Features:
 * - 6-digit code input validation
 * - Resend code with cooldown
 * - 15-minute code expiry
 * - Mobile-friendly numeric keyboard
 * - Comprehensive error handling
 */

interface EmailVerificationProps {
  email: string;
  userId: string;
  userType?: 'user' | 'agent';
  onVerificationSuccess?: () => void;
}

export function EmailVerification({ 
  email, 
  userId, 
  userType = 'user', 
  onVerificationSuccess 
}: EmailVerificationProps) {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0);
  const MAX_ATTEMPTS = 5;

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending intervals
    };
  }, []);

  // Handle code input - only allow 6 digits
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
  };

  // Verify the email code
  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    // Check if too many failed attempts
    if (verificationAttempts >= MAX_ATTEMPTS) {
      setError(`Too many failed attempts. Please request a new code.`);
      toast.error('Too many verification attempts. Request a new code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          verificationCode: code,
          userType
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Email verified successfully!');
        // Reset state before calling callback
        setCode('');
        setVerificationAttempts(0);
        // Call success callback
        onVerificationSuccess?.();
      } else {
        // Increment failed attempts
        const newAttempts = verificationAttempts + 1;
        setVerificationAttempts(newAttempts);
        
        const errorMsg = data.error || 'Verification failed';
        setError(errorMsg);
        toast.error(errorMsg);
        
        // Alert user when approaching max attempts
        if (newAttempts >= MAX_ATTEMPTS - 1) {
          toast.warning(`⚠️ ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining`);
        }
      }
    } catch (err) {
      const errorMessage = 'Error verifying email. Please check your connection.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userType
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('📧 New verification code sent to your email');
        setCode('');
        setVerificationAttempts(0); // Reset attempts on resend
        
        // Start cooldown (60 seconds)
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        const errorMsg = data.error || 'Failed to resend code';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMessage = 'Error resending code. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && code.length === 6 && !loading) {
      handleVerifyCode();
    }
  };

  // Focus input on mount
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-slate-900">Verify Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent a 6-digit code to<br />
            <span className="font-semibold text-slate-700 break-all">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Verification Code Input */}
          <div className="space-y-3">
            <label htmlFor="code" className="block text-sm font-semibold text-slate-700">
              Verification Code
            </label>
            <Input
              ref={inputRef}
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              className="text-center text-3xl tracking-[0.5rem] font-mono font-bold border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              disabled={loading}
              autoComplete="one-time-code"
              aria-label="Email verification code"
            />
            <p className="text-xs text-slate-500 text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          {/* Attempts Warning */}
          {verificationAttempts > 0 && verificationAttempts < MAX_ATTEMPTS && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-900 text-sm">
                ⚠️ {MAX_ATTEMPTS - verificationAttempts} attempt(s) remaining
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertDescription className="text-red-900">{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Message */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-900 text-sm">
              ⏱️ The code will expire in 15 minutes
            </AlertDescription>
          </Alert>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyCode}
            disabled={loading || code.length !== 6 || verificationAttempts >= MAX_ATTEMPTS}
            className="w-full h-11 text-base font-semibold"
            size="lg"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Verifying...
              </>
            ) : (
              '✓ Verify Email'
            )}
          </Button>

          {/* Resend Code Button */}
          <div className="pt-2">
            <Button
              onClick={handleResendCode}
              disabled={resendLoading || resendCooldown > 0}
              variant="outline"
              className="w-full h-11 text-base font-medium"
            >
              {resendCooldown > 0 
                ? `⏳ Resend Code (${resendCooldown}s)` 
                : resendLoading 
                ? '📧 Sending...' 
                : "📬 Didn't receive code? Resend"
              }
            </Button>
          </div>

          {/* Help Text */}
          <div className="space-y-3 text-sm text-slate-600 pt-4 border-t border-slate-200">
            <div className="space-y-2">
              <p className="font-medium text-slate-700">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Check your spam or junk folder</li>
                <li>Press Enter to quickly verify</li>
                <li>You can request a new code every 60 seconds</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <p>
                Need help?{' '}
                <a 
                  href="mailto:support@aurahome.com" 
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmailVerification;
