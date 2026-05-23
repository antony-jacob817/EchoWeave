import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <div className="flex justify-center md:justify-start">
            <Logo />
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-right max-w-sm md:max-w-md">
            Speak freely. Watch ideas connect. Voice-first AI mind mapping for makers.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="text-center md:text-left w-full md:w-auto">
            © {new Date().getFullYear()} EchoWeave. All rights reserved.
          </p>
          <p className="text-center md:text-right w-full md:w-auto">
            Crafted for thinkers, makers, and storytellers.
          </p>
        </div>
      </div>
    </footer>
  );
}
