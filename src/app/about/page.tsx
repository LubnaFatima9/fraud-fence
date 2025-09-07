
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Zap, Shield, Brain, Globe, Camera, FileText, Link2, Chrome, Smartphone, TrendingUp, Code, Database, Cpu, Network, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 bg-muted/20">
        <section className="w-full animate-fade-in-up py-12 md:py-24 lg:py-32">
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
            <div className="mx-auto grid max-w-6xl gap-8 pt-12">
              
              {/* Technical Architecture Overview */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <Cpu className="h-6 w-6 text-primary" />
                    Technical Architecture & Innovation
                  </CardTitle>
                  <p className="text-muted-foreground">
                    FraudFence leverages cutting-edge AI technologies and modern web frameworks to deliver enterprise-grade fraud detection capabilities
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">AI/ML Engine</h3>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Google Genkit AI Framework</li>
                        <li>• Custom Neural Network Models</li>
                        <li>• Real-time Inference Pipeline</li>
                        <li>• Multi-modal Content Analysis</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Frontend Stack</h3>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Next.js 15 with App Router</li>
                        <li>• React 18 with TypeScript</li>
                        <li>• Tailwind CSS Styling</li>
                        <li>• Responsive Design System</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3 p-4 bg-muted/20 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Backend Infrastructure</h3>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• RESTful API Architecture</li>
                        <li>• Firebase App Hosting</li>
                        <li>• External API Integrations</li>
                        <li>• Secure Data Processing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Core Features Deep Dive */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                      <Target className="h-6 w-6 text-primary" />
                      Our Mission & Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      FraudFence was born from the recognition that online fraud has become increasingly sophisticated, targeting millions of users daily with advanced social engineering tactics and AI-generated deceptive content.
                    </p>
                    <p>
                      Our mission is to democratize advanced cybersecurity by making enterprise-level fraud detection accessible to everyone, regardless of technical expertise. We believe that proactive education combined with real-time protection can significantly reduce the success rate of online scams.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">3</div>
                        <div className="text-xs text-muted-foreground">Content Types</div>
                      </div>
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">3</div>
                        <div className="text-xs text-muted-foreground">Languages</div>
                      </div>
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">24/7</div>
                        <div className="text-xs text-muted-foreground">Protection</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                      <Shield className="h-6 w-6 text-primary" />
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground">Zero Data Storage</h4>
                          <p className="text-sm text-muted-foreground">We analyze content in real-time without storing any user data or analyzed content</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground">End-to-End Encryption</h4>
                          <p className="text-sm text-muted-foreground">All communication between client and server uses TLS encryption</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground">Local Processing</h4>
                          <p className="text-sm text-muted-foreground">Browser extension processes data locally when possible</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Feature Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <Zap className="h-6 w-6 text-primary" />
                    Advanced Feature Set
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Comprehensive fraud detection capabilities powered by state-of-the-art machine learning models
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* Text Analysis */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">Intelligent Text Analysis</h3>
                        <Badge variant="secondary" className="mt-1">Natural Language Processing</Badge>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-14">
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Multi-Language Detection</h4>
                        <p className="text-sm text-muted-foreground">Advanced NLP models trained on English, Hindi, and Spanish datasets to identify fraudulent patterns across languages</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Contextual Analysis</h4>
                        <p className="text-sm text-muted-foreground">Semantic understanding of text context, urgency indicators, and psychological manipulation tactics</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Pattern Recognition</h4>
                        <p className="text-sm text-muted-foreground">Identifies common scam phrases, grammatical patterns, and linguistic fingerprints of fraudulent content</p>
                      </div>
                    </div>
                  </div>

                  {/* Image Analysis */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Camera className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">Computer Vision Analytics</h3>
                        <Badge variant="secondary" className="mt-1">Deep Learning Models</Badge>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-14">
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Visual Manipulation Detection</h4>
                        <p className="text-sm text-muted-foreground">CNN-based models detect image editing artifacts, deepfakes, and digital manipulation signatures</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Brand & Logo Analysis</h4>
                        <p className="text-sm text-muted-foreground">Identifies counterfeit logos, brand impersonation, and unauthorized use of corporate imagery</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Text Extraction & OCR</h4>
                        <p className="text-sm text-muted-foreground">Extracts text from images for combined visual-textual fraud analysis pipeline</p>
                      </div>
                    </div>
                  </div>

                  {/* URL Analysis */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Link2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">Advanced URL Intelligence</h3>
                        <Badge variant="secondary" className="mt-1">Real-time Threat Detection</Badge>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-14">
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Domain Reputation Scoring</h4>
                        <p className="text-sm text-muted-foreground">Integration with Google Safe Browsing API and custom threat intelligence databases</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Phishing Detection</h4>
                        <p className="text-sm text-muted-foreground">Identifies domain squatting, homograph attacks, and suspicious redirect patterns</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Malware Prevention</h4>
                        <p className="text-sm text-muted-foreground">Real-time scanning for known malicious domains and suspicious hosting patterns</p>
                      </div>
                    </div>
                  </div>

                  {/* Browser Extension */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Chrome className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">Browser Extension Suite</h3>
                        <Badge variant="secondary" className="mt-1">Chrome Web Store</Badge>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-14">
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Context Menu Integration</h4>
                        <p className="text-sm text-muted-foreground">Right-click analysis of selected text, images, or links directly in the browser</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Real-time Notifications</h4>
                        <p className="text-sm text-muted-foreground">Instant alerts and detailed explanations when suspicious content is detected</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Seamless Integration</h4>
                        <p className="text-sm text-muted-foreground">Non-intrusive operation with minimal performance impact on browsing experience</p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
             {/* Team Section */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
                        <Users className="h-6 w-6 text-primary" />
                        Development Team
                    </CardTitle>
                    <p className="text-center text-muted-foreground">
                      Three dedicated developers who combined their expertise to create FraudFence
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="text-center space-y-4 p-6 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
                            <div className="space-y-3">
                                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                                    <Code className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground">Lubna Fatima</h3>
                                    <p className="text-sm text-primary font-medium">Project Lead & Full-Stack Architect</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-foreground">Core Contributions:</h4>
                                    <ul className="space-y-1 text-left">
                                        <li>• Next.js application architecture & development</li>
                                        <li>• API integration & backend infrastructure</li>
                                        <li>• Browser extension development</li>
                                        <li>• UI/UX design & component system</li>
                                        <li>• Firebase deployment & hosting setup</li>
                                        <li>• Project coordination & technical leadership</li>
                                    </ul>
                                </div>
                            </div>
                            <Link 
                                href="https://www.linkedin.com/in/lubna--fatima/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                LinkedIn Profile
                            </Link>
                        </div>
                        
                        <div className="text-center space-y-4 p-6 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
                            <div className="space-y-3">
                                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground">Diksha Gour</h3>
                                    <p className="text-sm text-primary font-medium">AI/ML Engineer & Text Analysis Specialist</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-foreground">Core Contributions:</h4>
                                    <ul className="space-y-1 text-left">
                                        <li>• Custom text fraud detection model training</li>
                                        <li>• Multi-language NLP model development</li>
                                        <li>• Machine learning pipeline optimization</li>
                                        <li>• Text analysis algorithm design</li>
                                        <li>• Training data curation & preprocessing</li>
                                        <li>• Model performance tuning & validation</li>
                                    </ul>
                                </div>
                            </div>
                            <Link 
                                href="https://www.linkedin.com/in/diksha-gour/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                LinkedIn Profile
                            </Link>
                        </div>
                        
                        <div className="text-center space-y-4 p-6 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
                            <div className="space-y-3">
                                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground">Sunanya Nareddy</h3>
                                    <p className="text-sm text-primary font-medium">Computer Vision Engineer & Image Analysis Lead</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-foreground">Core Contributions:</h4>
                                    <ul className="space-y-1 text-left">
                                        <li>• Image fraud detection model training</li>
                                        <li>• Computer vision algorithm development</li>
                                        <li>• CNN architecture design & optimization</li>
                                        <li>• Visual manipulation detection systems</li>
                                        <li>• Image preprocessing & feature extraction</li>
                                        <li>• Deep learning model deployment</li>
                                    </ul>
                                </div>
                            </div>
                            <Link 
                                href="https://www.linkedin.com/in/sunanya-nareddy-832129325/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                LinkedIn Profile
                            </Link>
                        </div>
                    </div>
                    
                    <div className="mt-10 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                        <div className="text-center space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">Collaborative Excellence</h3>
                            <p className="text-muted-foreground max-w-4xl mx-auto">
                                <strong className="text-foreground">FraudFence represents the perfect synergy of three distinct skill sets:</strong> Lubna's full-stack architecture and project leadership, Diksha's expertise in natural language processing and text analysis models, and Sunanya's specialization in computer vision and image fraud detection. Together, they've created a comprehensive fraud detection platform that leverages the latest advances in AI/ML technology to protect users from increasingly sophisticated online threats.
                            </p>
                            <div className="flex justify-center items-center gap-8 pt-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">15+</div>
                                    <div className="text-xs text-muted-foreground">Technologies Used</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">3</div>
                                    <div className="text-xs text-muted-foreground">AI Models Trained</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">100%</div>
                                    <div className="text-xs text-muted-foreground">Team Collaboration</div>
                                </div>
                            </div>
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
