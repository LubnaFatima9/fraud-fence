
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">About</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">About FraudFence</DialogTitle>
                <DialogDescription>
                  Your AI-powered shield against online fraud.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 text-sm text-muted-foreground">
                <p>
                  FraudFence was created to empower users to navigate the digital world safely. With the rise of sophisticated online scams, our goal is to provide a powerful, easy-to-use tool that can detect and explain fraudulent content before it can cause harm.
                </p>
                <h3 className="font-bold text-foreground">Our Features:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-semibold">Multi-Content Analysis:</span> Check text, images, and URLs for potential threats.
                  </li>
                  <li>
                    <span className="font-semibold">AI Explanations:</span> Understand *why* something is flagged as suspicious with clear, AI-generated explanations.
                  </li>
                  <li>
                    <span className="font-semibold">Multilingual Support:</span> Analyze text in English, Hindi, and Spanish.
                  </li>
                   <li>
                    <span className="font-semibold">Trending News:</span> Stay informed about the latest scam and fraud trends.
                  </li>
                </ul>
                 <h3 className="font-bold text-foreground pt-2">Created By:</h3>
                 <ul className="list-none space-y-1">
                    <li>Lubna Fatima</li>
                    <li>Diksha Gour</li>
                    <li>Sunanya Nareddy</li>
                 </ul>
              </div>
            </DialogContent>
          </Dialog>

          <Button>Get Extension</Button>
        </div>
      </div>
    </header>
  );
}
