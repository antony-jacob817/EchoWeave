import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const { signup, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Tell us your name.";
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email.";
    if (password.length < 6) errs.password = "At least 6 characters.";
    if (password !== confirm) errs.confirm = "Passwords don't match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created! Please check your email for a confirmation link.");
      navigate({ to: "/login" }); // Better to go to login while waiting for confirmation
    } catch (error: any) {
      toast.error(error.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start capturing ideas in seconds.">
      <form onSubmit={submit} className="space-y-4">
        <SocialButtons />
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Maya Okafor" value={name} onChange={(e) => setName(e.target.value)} suppressHydrationWarning />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@studio.com" value={email} onChange={(e) => setEmail(e.target.value)} suppressHydrationWarning />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} suppressHydrationWarning />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} suppressHydrationWarning />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full active:scale-[0.98] transition-transform duration-200" disabled={loading} suppressHydrationWarning>
          {loading ? "Creating…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have one? <Link to="/login" className="text-foreground underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
