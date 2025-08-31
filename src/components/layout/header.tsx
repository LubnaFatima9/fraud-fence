
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '../theme-switch';
import { Logo } from '../logo';

export function AppHeader() {
  const handleDownloadExtension = () => {
    const extensionElement = document.getElementById('extension-promo');
    if (extensionElement) {
      extensionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-14 items-center px-4 md:px-6">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-6 md:h-8 md:w-8" />
            <span className="font-bold font-headline text-sm md:text-base animate-logo-glow">
              FraudFence
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-1 md:space-x-2">
           <div className="hidden sm:flex space-x-1 md:space-x-2">
             <Button variant="ghost" size="sm" asChild>
                <Link href="/guides">Guides</Link>
             </Button>
             <Button variant="ghost" size="sm" asChild>
                <Link href="/about">About</Link>
             </Button>
           </div>
          <Button 
            size="sm" 
            onClick={handleDownloadExtension}
            className="text-xs md:text-sm px-2 md:px-4"
          >
            <span className="hidden sm:inline">Get Extension</span>
            <span className="sm:hidden">Extension</span>
          </Button>
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
