
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ExtensionPromo() {
  return (
    <section className="w-full bg-primary text-primary-foreground">
      <div className="container grid items-center justify-center gap-4 px-4 py-12 text-center md:px-6 md:py-24 lg:gap-10">
        <div className="relative z-10 space-y-3">
          <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Take FraudFence With You
          </h2>
          <p className="mx-auto max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Protect yourself everywhere you go online. Our browser extension provides real-time fraud alerts right in your browser.
          </p>
        </div>
        <div className="relative z-10">
          <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <Download className="mr-2 h-5 w-5" />
            Download for Chrome
          </Button>
          <p className="mt-2 text-xs text-primary-foreground/70">Coming soon to other browsers</p>
        </div>
      </div>
    </section>
  );
}
    