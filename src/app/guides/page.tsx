
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
                    Common Online Scams: A Threat Briefing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-lg font-semibold">Phishing & Smishing Attacks</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        <div className="space-y-4">
                            <p>Phishing is a deceptive attempt to steal your sensitive information (credentials, credit card numbers) by impersonating a trustworthy entity in an electronic communication. These are not just simple emails anymore; they are sophisticated, targeted attacks.</p>
                             <blockquote className="mt-4 border-l-2 border-primary pl-6 italic text-sm">
                                <strong>Real-World Example (Email):</strong><br/>
                                "Subject: Urgent: Your Bank Account is Suspended!<br/>
                                Dear Customer, We have detected suspicious activity on your account. For your safety, we have suspended it. Please click here [fake-bank-login.com] to verify your identity and restore access. You have 24 hours before your account is permanently closed."
                            </blockquote>
                            <h4 className="font-semibold text-foreground">How to Avoid:</h4>
                            <ul className="list-disc space-y-2 pl-5">
                                <li><strong>Scrutinize the Sender:</strong> Do not trust the display name. Inspect the actual email address or phone number. Look for subtle misspellings or unusual domains (e.g., `microsft.com` instead of `microsoft.com`).</li>
                                <li><strong>Hover Before You Click:</strong> Always hover your cursor over links to preview the actual destination URL. If the link text and the destination do not match, it is a red flag.</li>
                                <li><strong>Look for Urgency & Threats:</strong> Scammers create a false sense of urgency, threatening to close your account or demanding immediate action. Legitimate organizations do not operate this way.</li>
                                <li><strong>Never Provide Information via Email/SMS:</strong> Your bank or any reputable service will never ask you to confirm passwords, PINs, or full personal details through a link in an email or text message.</li>
                            </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-lg font-semibold">Fake Job & Employment Scams</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        <div className="space-y-4">
                            <p>These scams exploit your need for employment to steal your money and personal data. They post convincing job listings on legitimate sites or contact you directly with unsolicited offers that are too good to be true.</p>
                             <blockquote className="mt-4 border-l-2 border-primary pl-6 italic text-sm">
                                <strong>Real-World Example (WhatsApp/Telegram):</strong><br/>
                                "Hello! I am a recruiter from a top MNC. We are impressed with your profile and have a remote Data Entry position available with a salary of ₹50,000/week. No interview needed. To begin, please pay a one-time security deposit of ₹5,000 for your work kit. This is refundable."
                            </blockquote>
                             <h4 className="font-semibold text-foreground">How to Avoid:</h4>
                             <ul className="list-disc space-y-2 pl-5">
                                <li><strong>No Legitimate Employer Charges You:</strong> You should never have to pay for a job. Be instantly suspicious of any request for fees for training, background checks, equipment, or software.</li>
                                <li><strong>Verify the Company Independently:</strong> Search for the company's official website and career page. Does the job exist there? Contact them through official channels, not the ones provided by the "recruiter".</li>
                                <li><strong>Unprofessional Communication:</strong> Poor grammar, spelling errors, and the use of personal email addresses (e.g., `@gmail.com`) for official communication are major red flags.</li>
                                <li><strong>Unusual Interview Process:</strong> Interviews conducted solely via text message or instant messenger are highly suspicious. A real job offer will involve formal interviews.</li>
                            </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-lg font-semibold">QR Code & Malicious Link Scams</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                       <div className="space-y-4">
                            <p>Fraudsters are increasingly using QR codes to direct victims to malicious websites. They place fraudulent stickers over legitimate codes on everything from restaurant menus to parking meters and EV charging stations.</p>
                             <blockquote className="mt-4 border-l-2 border-primary pl-6 italic text-sm">
                                <strong>Real-World Example (Public Space):</strong><br/>
                                You're at a popular tourist spot and see a poster for "Free Public Wi-Fi". You scan the QR code, which takes you to a webpage that looks like a standard network login. It asks for your personal details or even credit card information for "verification". The Wi-Fi never connects, and your data has been stolen.
                            </blockquote>
                             <h4 className="font-semibold text-foreground">How to Avoid:</h4>
                            <ul className="list-disc space-y-2 pl-5">
                                <li><strong>Physically Inspect the QR Code:</strong> Before scanning, check if the QR code is a sticker placed on top of another. Feel the edges. If it looks tampered with, do not scan it.</li>
                                <li><strong>Preview the Link:</strong> Many modern smartphones show you a preview of the URL before opening it. If the URL looks suspicious, shortened, or completely unrelated to the context, do not proceed.</li>
                                <li><strong>Be Wary of Urgent Payments:</strong> Scammers create fake payment portals. If you're paying for a service, ensure the website is the official, secure site. Look for `https://` and a lock icon.</li>
                            </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                      <AccordionTrigger className="text-lg font-semibold">Investment & "Pig Butchering" Scams</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        <div className="space-y-4">
                            <p>This is a long-term, psychologically manipulative scam. It often starts with a "wrong number" text message. The scammer builds a relationship—friendship or romance—over weeks or months. After gaining your trust, they "fatten the pig" by convincing you to invest in a fraudulent cryptocurrency or trading platform they control. Once your money is in, it's gone forever.</p>
                             <blockquote className="mt-4 border-l-2 border-primary pl-6 italic text-sm">
                                <strong>Real-World Example (Text Message):</strong><br/>
                                "Hey is this Sameer? I was told this is your new number, this is Pooja from the conference last month." You reply, "Sorry, wrong number." They respond, "Oh, I'm so sorry to bother you! You seem nice though. My name is 'X'." This begins a long conversation that eventually leads to them showing off their "investment gains" and offering to help you get rich too.
                            </blockquote>
                            <h4 className="font-semibold text-foreground">How to Avoid:</h4>
                            <ul className="list-disc space-y-2 pl-5">
                                <li><strong>Never Trust Financial Advice from Strangers Online:</strong> This is a non-negotiable rule. Your financial decisions should be made after consulting with licensed professionals, not someone you met via a random text.</li>
                                <li><strong>Reject All Unsolicited Investment Offers:</strong> Legitimate investments are not offered through unsolicited text messages or social media DMs.</li>
                                <li><strong>Use Reputable Platforms Only:</strong> If you choose to invest in cryptocurrency, only use large, well-known, and regulated exchanges that you can download from official app stores. Never use a link or app provided by someone you've only met online.</li>
                            </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger className="text-lg font-semibold text-destructive">Sextortion & Blackmail Scams</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        <div className="space-y-4">
                            <p className="font-bold">This is not a joke. This is a dangerous and aggressive form of blackmail that thrives on fear and shame. Scammers will either trick a victim into producing compromising material or use AI to create convincing fake images/videos. They then threaten to send this material to your family, friends, and colleagues unless you pay them.</p>
                             <blockquote className="mt-4 border-l-2 border-destructive pl-6 italic text-sm">
                                <strong>Real-World Example (Social Media DM):</strong><br/>
                                "I have explicit photos/videos of you. You don't remember? Don't worry, I saved them. If you don't send me ₹20,000 by tonight, I will send them to every single person on your friend list and your family. Don't believe me? Here's a list of your family members..."
                            </blockquote>
                            <h4 className="font-semibold text-destructive">What to Do—Immediate Actions:</h4>
                            <ul className="list-disc space-y-2 pl-5">
                                <li><strong>DO NOT PAY.</strong> Paying the ransom will not solve the problem. They will see you as a source of income and demand more. They may share the images anyway.</li>
                                <li><strong>CEASE ALL COMMUNICATION.</strong> Immediately block the scammer on all platforms. Do not reply, do not negotiate. Any interaction is a sign of weakness to them.</li>
                                <li><strong>PRESERVE EVIDENCE.</strong> Take screenshots of all conversations, profiles, and payment demands. This is crucial for a police report.</li>
                                <li><strong>REPORT TO THE AUTHORITIES.</strong> Contact your local police or the National Cyber Crime Reporting Portal immediately. This is a serious crime, and they are equipped to handle it. You are a victim, not a perpetrator.</li>
                            </ul>
                        </div>
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
