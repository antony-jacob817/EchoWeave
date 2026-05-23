import { Link } from "@tanstack/react-router";
import logo from "@/assets/echoweave-logo.png";

export function Logo({ className = "h-8", forceShowText = false }: { className?: string; forceShowText?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src={logo} alt="EchoWeave" className={`${className} w-auto drop-shadow-[0_0_18px_oklch(0.65_0.22_285_/_0.4)]`} />
      <span className={`font-display text-lg font-semibold tracking-tight ${forceShowText ? "inline" : "hidden min-[380px]:inline"}`}>EchoWeave</span>
    </Link>
  );
}
