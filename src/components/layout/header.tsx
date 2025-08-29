
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '../theme-switch';
import { Logo } from '../logo';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold font-headline sm:inline-block animate-logo-glow">
              FraudFence
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button variant="ghost" asChild>
              <Link href="/guides">Guides</Link>
           </Button>
           <Button variant="ghost" asChild>
              <Link href="/about">About</Link>
           </Button>
          <Button>Get Extension</Button>
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
