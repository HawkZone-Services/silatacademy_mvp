import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    username: "", // email OR nationalId OR phone
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const API_URL = "https://api-f3rwhuz64a-uc.a.run.app/api/auth/login";

  // VALIDATION (email OR nationalId OR phone)
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const value = formData.username.trim();

    if (!value) {
      newErrors.username = "Email, National ID or Phone is required";
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isNationalId = /^[0-9]{10,20}$/.test(value);
      const isPhone = /^[0-9]{8,15}$/.test(value);

      if (!isEmail && !isNationalId && !isPhone) {
        newErrors.username = "Enter valid email, national ID or phone number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid login credentials",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Token check
      const token = data.token || data.user?.token;
      if (!token) {
        toast({
          title: "Error",
          description: "Token missing in server response!",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Save session
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Login Successful!",
        description: `Welcome back, ${data.user?.name || "User"}!`,
      });

      setLoading(false);
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Server Error",
        description: "Unable to connect to server.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "If the account exists, a reset link was sent.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 min-h-[calc(100vh-4rem)] flex items-center">
        <div className="container px-4">
          <div className="max-w-md mx-auto">
            <Card className="gradient-card shadow-card border-border/40">
              <div className="p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center border-2 border-secondary/20">
                      <LogIn className="h-8 w-8 text-secondary" />
                    </div>
                  </div>
                  <h1 className="font-display text-3xl font-bold">
                    Welcome Back
                  </h1>
                  <p className="text-muted-foreground">
                    Sign in to your account
                  </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* USERNAME */}
                  <div className="space-y-2">
                    <Label htmlFor="username">
                      Email / National ID / Phone
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="example@mail.com OR 29801150123456 OR 01234567890"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      className={errors.username ? "border-destructive" : ""}
                    />
                    {errors.username && (
                      <p className="text-sm text-destructive">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        className={
                          errors.password ? "border-destructive pr-10" : "pr-10"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="rememberMe"
                        className="text-sm cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-secondary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/40" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-secondary hover:underline font-medium"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
