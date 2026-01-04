import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, Briefcase, FileText, Upload, MapPin } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

type UserType = "user" | "agent";

const Register = () => {
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [userType, setUserType] = useState<UserType>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agency: "",
    experience: "",
    cnic: "",
    address: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Validate file sizes (5MB max each)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        alert(`File ${file.name} is not a valid type (PNG, JPG, PDF)`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    if (userType === 'agent' && attachments.length === 0) {
      alert("Please upload at least one document for agent verification");
      return;
    }

    setIsLoading(true);

    try {
      // For agents, convert files to base64
      let attachmentData: string[] = [];
      if (userType === 'agent' && attachments.length > 0) {
        attachmentData = await Promise.all(
          attachments.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result as string;
                resolve(base64);
              };
              reader.readAsDataURL(file);
            });
          })
        );
      }

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          userType: userType,
          agency: userType === 'agent' ? formData.agency : null,
          experience: userType === 'agent' ? parseInt(formData.experience) : 0,
          cnic: userType === 'agent' ? formData.cnic : null,
          address: userType === 'agent' ? formData.address : null,
          attachments: attachmentData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! Please log in with your credentials.');
        navigate('/login');
      } else {
        alert('Registration failed: ' + data.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold gradient-text">PropAI</span>
              </Link>
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-muted-foreground mt-1">Join our AI-powered real estate platform</p>
            </div>

            {/* User Type Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={() => setUserType("user")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  userType === "user"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <User className="w-5 h-5" />
                User
              </button>
              <button
                type="button"
                onClick={() => setUserType("agent")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  userType === "agent"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Briefcase className="w-5 h-5" />
                Agent
              </button>
            </div>

            <Card variant="glass">
              <CardContent className="p-6">
                {userType === "agent" && (
                  <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Note:</strong> Agent accounts require admin approval. You'll need to upload your CNIC and other relevant documents for verification.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        variant="search"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        variant="search"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        variant="search"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Agent-specific fields */}
                  {userType === "agent" && (
                    <>
                      {/* Agency */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Agency Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            variant="search"
                            placeholder="Enter your agency name"
                            className="pl-10"
                            value={formData.agency}
                            onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Years of Experience</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            variant="search"
                            type="number"
                            placeholder="Enter years of experience"
                            className="pl-10"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      {/* CNIC */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CNIC Number</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            variant="search"
                            placeholder="Enter your CNIC number"
                            className="pl-10"
                            value={formData.cnic}
                            onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      {/* Attachments */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Attachments</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                        >
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, PDF (max. 5MB each)
                          </p>
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept=".png,.jpg,.jpeg,.pdf" 
                            multiple
                            onChange={handleFileChange}
                          />
                        </div>
                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Selected files:</p>
                            {attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                                <span className="text-sm">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            variant="search"
                            placeholder="Enter your address"
                            className="pl-10"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        variant="search"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        variant="search"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="w-full mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : (userType === "agent" ? "Register as Agent" : "Create Account")}
                  </Button>
                </form>

                {/* Login Link */}
                <p className="text-center mt-6 text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
