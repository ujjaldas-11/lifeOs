import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Terminal, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("alex@example.com");
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0f14] p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#161922] border border-[#222736] text-blue-400 mb-3.5">
            <Terminal className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#e6edf3]">Welcome back to LifeOS</h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Personal developer operating system & task commander
          </p>
        </div>

        <Card className="border-[#222736] bg-[#13161f]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-[#3c1e22] border border-[#67252b] p-3 text-xs text-[#f85149] font-medium">
                  {error}
                </div>
              )}

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" size="md" className="w-full mt-2" isLoading={isLoading}>
                <span>Sign In to LifeOS</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              {/* Demo account quick login helper */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="w-full rounded border border-dashed border-[#222736] bg-[#161922] p-2 text-xs text-[#8b949e] hover:text-blue-400 hover:border-blue-500/50 transition-colors cursor-pointer text-center"
                >
                  ⚡ Autofill seeded demo account (<code className="text-blue-400 font-mono">alex@example.com</code>)
                </button>
              </div>
            </form>

            <div className="mt-5 pt-5 border-t border-[#222736] text-center">
              <p className="text-xs text-[#8b949e]">
                Don't have an account yet?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
