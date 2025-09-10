"use client";

import { useState, useEffect } from "react";
import { Shield, TrendingUp, Users, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FraudProtectionStats() {
  const [stats, setStats] = useState({
    totalChecks: 12547,
    fraudDetected: 2109,
    safeVerified: 10438,
    accuracy: 97.2
  });

  const [isAnimating, setIsAnimating] = useState(false);

  // Simulate live updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setStats(prev => ({
        totalChecks: prev.totalChecks + Math.floor(Math.random() * 5) + 1,
        fraudDetected: prev.fraudDetected + Math.floor(Math.random() * 2),
        safeVerified: prev.safeVerified + Math.floor(Math.random() * 4) + 1,
        accuracy: Math.min(99.9, prev.accuracy + (Math.random() * 0.1))
      }));
      setTimeout(() => setIsAnimating(false), 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      icon: Shield,
      label: "Total Checks",
      value: stats.totalChecks.toLocaleString(),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50"
    },
    {
      icon: TrendingUp,
      label: "Fraud Detected",
      value: stats.fraudDetected.toLocaleString(),
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50"
    },
    {
      icon: Users,
      label: "Safe Verified",
      value: stats.safeVerified.toLocaleString(),
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50"
    },
    {
      icon: Zap,
      label: "Accuracy Rate",
      value: `${stats.accuracy.toFixed(1)}%`,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50"
    }
  ];

  return (
    <section className="w-full py-8 sm:py-12 md:py-16">
      <div className="container px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8">
          <h2 className="font-headline text-2xl sm:text-3xl font-bold tracking-tighter mb-4">
            Real-Time Protection Statistics
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our dual AI system continuously protects users worldwide. See the live impact of fraud detection in action.
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statItems.map((item, index) => (
            <Card key={item.label} className={`${item.bgColor} border-0 shadow-md hover:shadow-lg transition-all duration-300`}>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.bgColor} mb-4`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div className={`text-2xl sm:text-3xl font-bold mb-2 ${item.color} ${isAnimating ? 'animate-pulse' : ''}`}>
                  {item.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Live Protection Active - Updates Every 10 Seconds
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
