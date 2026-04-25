import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      navigate(u.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <Navbar />
      <div className="container flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card sm:p-10"
        >
          <h1 className="font-display text-4xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to place your order.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" placeholder="••••••••" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-semibold text-foreground hover:text-accent">Create an account</Link>
          </p>

          <div className="mt-6 rounded-xl bg-secondary/60 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Demo admin</p>
            <p>admin@restro.app · yokesh1290</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
