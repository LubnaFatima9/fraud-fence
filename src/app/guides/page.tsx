
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LifeBuoy, Building, Landmark, AlertTriangle, Phone, Mail, Globe } from 'lucide-react';
import Link from 'next/link';

export default function GuidesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 bg-muted/20">
        <section className="w-full animate-fade-in-up py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Cyber Safety Guides
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Your resource for understanding and combating online fraud.
                </p>
              </div>
            </div>
            
            <div className="mx-auto mt-12 grid max-w-5xl gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                    Common Online Scams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-lg font-semibold">Phishing Scams</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Phishing involves tricking individuals into giving away personal information, such as passwords or credit card numbers, by pretending to be a legitimate entity. These often come as emails or text messages that look like they're from your bank, a social media site, or another trusted source. Always verify the sender and never click on suspicious links.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-lg font-semibold">Fake Job Offers</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Scammers post fake job listings or send unsolicited offers to steal your personal information or money. They might ask for a fee for training or a background check. Legitimate employers will never ask for payment to hire you. Research the company and be wary of offers that seem too good to be true.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-lg font-semibold">QR Code Scams</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Fraudsters place malicious QR code stickers over legitimate ones in public places like parking meters or restaurants. Scanning the fake code can lead you to a phishing website that steals your payment details or installs malware on your device. Always check that a QR code is not a sticker placed on top of another.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                      <AccordionTrigger className="text-lg font-semibold">Investment & Crypto Scams</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Often starting with a "wrong number" text, scammers build trust over time and then convince you to invest in a fraudulent cryptocurrency or trading platform. This is known as 'pig butchering'. Be highly skeptical of investment advice from strangers online and only use reputable, well-known investment platforms.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <LifeBuoy className="h-6 w-6 text-primary" />
                    How to Report a Scam in India
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-xl font-bold">
                           <Landmark className="h-5 w-5" /> Central Government
                        </h3>
                         <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>National Cyber Crime Helpline: <strong>1930</strong></span>
                         </div>
                         <div className="flex items-start gap-2">
                            <Globe className="mt-1 h-4 w-4 text-muted-foreground" />
                            <Link href="https://www.cybercrime.gov.in/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                                National Cyber Crime Reporting Portal
                            </Link>
                         </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-xl font-bold">
                           <Building className="h-5 w-5" /> Telangana State Government
                        </h3>
                         <div className="flex items-center gap-2">
                             <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>Telangana Cyber Crime Helpline: <strong>100</strong> or <strong>1930</strong></span>
                         </div>
                         <div className="flex items-start gap-2">
                             <Globe className="mt-1 h-4 w-4 text-muted-foreground" />
                            <Link href="https://cybercrime.gov.in/state-helpline.html" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                                Telangana Cyber Crime Portal
                            </Link>
                         </div>
                    </div>
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
