
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ExtensionPromo() {
  return (
    <section className="w-full bg-primary/10 backdrop-blur-sm border-t border-b border-white/20">
      <div className="container grid items-center justify-center gap-4 px-4 py-12 text-center md:px-6 md:py-24 lg:gap-10">
        <div className="relative z-10 space-y-3">
          <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight text-foreground">
            Take FraudFence With You
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Protect yourself everywhere you go online. Our browser extension provides real-time fraud alerts right in your browser.
          </p>
        </div>
        <div className="relative z-10">
          <Button size="lg">
            <Download className="mr-2 h-5 w-5" />
            Download for Chrome
          </Button>
          <p className="mt-2 text-xs text-muted-foreground/80">Coming soon to other browsers</p>
        </div>
      </div>
    </section>
  );
}
    