import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

/**
 * ForgotPassword Component
 * 
 * Handles password reset flow with email verification
 * Features:
 * - Email validation
 * - Password reset link via email
 * - Demo mode with console logging
 * - Success/error handling
 */

interface ForgotPasswordProps {
  onBackToLogin?: () => void;
}

export function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [resetLink, setResetLink] = useState<string>('');
  const [showResetLink, setShowResetLink] = useState<boolean>(false);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle password reset request
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Password Reset Request:', {
        email,
        timestamp: new Date().toISOString(),
        url: '/api/auth/forgot-password'
      });

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      console.log('📧 Password Reset Response:', data);

      if (data.success) {
        setSuccess(true);
        toast.success('✅ Password reset link sent to your email!');
        
        // For demo/testing purposes, extract token from response if available
        if (data.resetToken) {
          const resetUrl = `http://localhost:5173/reset-password?email=${encodeURIComponent(email)}&token=${data.resetToken}`;
          setResetLink(resetUrl);
          console.log('🔗 Reset URL (for testing):', resetUrl);
          
          // Show the link in a dialog for testing
          setShowResetLink(true);
        }
        
        // Clear email field
        setEmail('');
      } else {
        const errorMsg = data.error || 'Failed to send password reset email';
        setError(errorMsg);
        toast.error('❌ ' + errorMsg);
        console.error('Error:', errorMsg);
      }
    } catch (err) {
      const errorMessage = 'Error requesting password reset. Please check your connection.';
      setError(errorMessage);
      toast.error('❌ ' + errorMessage);
      console.error('Network Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && email) {
      handleForgotPassword();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-slate-900">Reset Password</CardTitle>
          <CardDescription className="text-base">
            Enter your email address and we'll send you a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!success ? (
            <>
              {/* Email Input */}
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="your@email.com"
                  className="text-base border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  disabled={loading}
                  autoComplete="email"
                  aria-label="Email address"
                />
                <p className="text-xs text-slate-500">
                  We'll send a password reset link to this email
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="border-red-300 bg-red-50">
                  <AlertDescription className="text-red-900 text-sm">
                    ❌ {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Info Message */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-900 text-sm">
                  ℹ️ Check your email inbox and spam folder for the reset link
                </AlertDescription>
              </Alert>

              {/* Send Button */}
              <Button
                onClick={handleForgotPassword}
                disabled={loading || !email || !isValidEmail(email)}
                className="w-full h-11 text-base font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  '📧 Send Reset Link'
                )}
              </Button>

              {/* Back to Login */}
              <Button
                onClick={onBackToLogin}
                variant="outline"
                className="w-full h-11 text-base font-medium"
              >
                ← Back to Login
              </Button>

              {/* Help Text */}
              <div className="space-y-2 text-sm text-slate-600 pt-4 border-t border-slate-200">
                <p>
                  <strong>💡 Tip:</strong> The reset link will expire in 15 minutes
                </p>
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
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-5xl">✅</div>
                  <h3 className="text-xl font-bold text-slate-900">Check Your Email</h3>
                  <p className="text-slate-600">
                    We've sent a password reset link to:
                    <br />
                    <span className="font-semibold text-slate-900">{email}</span>
                  </p>
                </div>

                {/* Email Steps */}
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-900 text-sm space-y-2">
                    <p className="font-semibold">What to do next:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Check your email inbox for the reset link</li>
                      <li>If you don't see it, check your spam/junk folder</li>
                      <li>Click the link to reset your password</li>
                      <li>The link expires in 15 minutes</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                {/* Back to Login */}
                <Button
                  onClick={onBackToLogin}
                  className="w-full h-11 text-base font-semibold"
                  size="lg"
                >
                  ← Back to Login
                </Button>

                {/* Resend Option */}
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full h-11 text-base font-medium"
                >
                  🔄 Reset Another Account
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reset Link Dialog (for testing/demo) */}
      <Dialog open={showResetLink} onOpenChange={setShowResetLink}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔐 Password Reset Link (Testing)</DialogTitle>
            <DialogDescription>
              This link is for testing/development purposes. In production, users will receive this via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-900 text-sm">
                ⚠️ This is a demo display. In production, the link is sent via email only.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Reset Link:</label>
              <div className="p-3 bg-slate-100 rounded border border-slate-300 break-all font-mono text-xs max-h-32 overflow-y-auto">
                {resetLink}
              </div>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(resetLink);
                  toast.success('✅ Link copied to clipboard!');
                }}
                className="w-full"
              >
                📋 Copy Link
              </Button>
              <Button
                onClick={() => {
                  window.open(resetLink, '_blank');
                }}
                variant="outline"
                className="w-full"
              >
                🔗 Open in New Tab
              </Button>
            </div>
            <Button
              onClick={() => setShowResetLink(false)}
              variant="ghost"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ForgotPassword;
