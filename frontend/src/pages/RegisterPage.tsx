import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Terminal, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please complete all required fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0f14] p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#161922] border border-[#222736] text-blue-400 mb-3.5">
            <Terminal className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#e6edf3]">Create your LifeOS account</h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Initialize your personal developer workspace in seconds
          </p>
        </div>

        <Card className="border-[#222736] bg-[#13161f]">
          <CardContent className="p-6">
            {/* Auto-seeding info banner */}
            <div className="mb-4 flex items-start gap-2.5 rounded-md bg-[#152744] border border-[#1f4277] p-3 text-xs text-[#58a6ff]">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
              <span>
                <strong>Developer Quickstart:</strong> Sample projects, tasks, habits, and notes will be seeded automatically for you!
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-[#3c1e22] border border-[#67252b] p-3 text-xs text-[#f85149] font-medium">
                  {error}
                </div>
              )}

              <Input
                label="Full Name *"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="Email Address *"
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password *"
                type="password"
                placeholder="••••••••"
                helperText="Must be at least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password *"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" size="md" className="w-full mt-2" isLoading={isLoading}>
                <span>Create LifeOS Account</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-[#222736] text-center">
              <p className="text-xs text-[#8b949e]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
