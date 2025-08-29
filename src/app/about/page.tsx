
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 bg-muted/20">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  About FraudFence
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Your AI-powered shield against online fraud.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-4xl gap-8 pt-12 lg:grid-cols-2 lg:gap-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <Target className="h-6 w-6 text-primary" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    FraudFence was created to empower users to navigate the digital world safely. With the rise of sophisticated online scams, our goal is to provide a powerful, easy-to-use tool that can detect and explain fraudulent content before it can cause harm.
                  </p>
                  <p>
                    We believe that by making AI-powered security tools accessible to everyone, we can collectively build a safer online environment.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <Zap className="h-6 w-6 text-primary" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-3 pl-5 text-muted-foreground">
                    <li>
                      <span className="font-semibold text-foreground">Multi-Content Analysis:</span> Check text, images, and URLs for potential threats.
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">AI Explanations:</span> Understand *why* something is flagged as suspicious with clear, AI-generated explanations.
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">Multilingual Support:</span> Analyze text in English, Hindi, and Spanish.
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">Trending News:</span> Stay informed about the latest scam and fraud trends.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
             <div className="mx-auto mt-12 max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
                            <Users className="h-6 w-6 text-primary" />
                            Created By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-center text-lg text-muted-foreground">
                            <li>Lubna Fatima</li>
                            <li>Diksha Gour</li>
                            <li>Sunanya Nareddy</li>
                        </ul>
                    </CardContent>
                </Card>
             </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
