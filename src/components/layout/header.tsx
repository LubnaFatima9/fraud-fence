
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '../theme-switch';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-transparent backdrop-blur supports-[backdrop-filter]:bg-transparent/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block">
              FraudFence
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
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
