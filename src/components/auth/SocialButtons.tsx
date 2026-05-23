import { Button } from "@/components/ui/button";

export function SocialButtons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Button variant="glass" size="lg" type="button" className="w-full active:scale-[0.98] transition-transform duration-200 justify-center" suppressHydrationWarning>
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.4-1.65 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.84 3.92 14.78 3 12.17 3 6.97 3 2.75 7.22 2.75 12.27S6.97 21.55 12.17 21.55c7.02 0 9.34-4.94 9.34-7.49 0-.5-.05-.88-.16-1.96Z"/></svg>
        Google
      </Button>
      <Button variant="glass" size="lg" type="button" className="w-full active:scale-[0.98] transition-transform duration-200 justify-center" suppressHydrationWarning>
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12.07C22 6.48 17.52 2 11.93 2 6.34 2 1.86 6.48 1.86 12.07c0 5.04 3.69 9.21 8.51 9.93v-7.02H7.83v-2.91h2.54V9.85c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.91h-2.33V22c4.83-.72 8.5-4.89 8.5-9.93Z"/></svg>
        GitHub
      </Button>
    </div>
  );
}

