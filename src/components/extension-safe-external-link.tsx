"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface ExtensionSafeExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

/**
 * A Link component that's safe to use with browser extensions that modify external links.
 * This component suppresses hydration warnings for links that might be modified by extensions.
 */
export function ExtensionSafeExternalLink({ 
  href, 
  children, 
  className, 
  target = "_blank", 
  rel = "noopener noreferrer",
  ...props 
}: ExtensionSafeExternalLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side to prevent hydration mismatches
    setIsClient(true);
    
    // Clean up any extension-added elements when component unmounts
    return () => {
      if (linkRef.current) {
        // Remove any extension-added classes or elements
        const extensionElements = linkRef.current.querySelectorAll('.fraud-fence-indicator, [class*="fraud-fence"]');
        extensionElements.forEach(el => el.remove());
      }
    };
  }, []);

  // During SSR and initial hydration, render a simple div to prevent mismatches
  if (!isClient) {
    return (
      <div className={className} suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <Link 
      ref={linkRef}
      href={href} 
      target={target} 
      rel={rel} 
      className={className}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </Link>
  );
}
