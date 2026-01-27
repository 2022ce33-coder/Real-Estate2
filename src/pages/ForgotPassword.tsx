import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:3001/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        setMessage("A reset token has been sent to your email (demo: check console or ask admin). Use it below.");
        // For demo, show token in alert
        alert("Reset token: " + data.resetToken);
      } else {
        setMessage(data.error || "Failed to send reset link.");
      }
    } catch {
      setMessage("Error sending reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:3001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.error || "Failed to reset password.");
      }
    } catch {
      setMessage("Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card variant="glass">
              <CardContent className="p-6">
                {step === 1 ? (
                  <form onSubmit={handleRequestReset} className="space-y-4">
                    <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          variant="search"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <h2 className="text-xl font-bold mb-2">Reset Password</h2>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Reset Token</label>
                      <Input
                        type="text"
                        placeholder="Enter the reset token"
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          variant="search"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="pl-10 pr-10"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                )}
                {message && <p className="mt-4 text-sm text-center text-primary font-medium">{message}</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
