
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
      className={cn('text-primary', props.className)}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="45%" stopColor="hsl(var(--primary))" />
          <stop offset="55%" stopColor="#4FC3F7" />
        </linearGradient>
        <clipPath id="shield-clip">
          <path d="M42.33,43.37,128,15.5,213.67,43.37a12,12,0,0,1,8,11.26V117.89c0,84-82.39,112.5-90.23,115.82a12,12,0,0,1-6.88,0C116.72,230.39,34.33,201.85,34.33,117.89V54.63A12,12,0,0,1,42.33,43.37Z" />
        </clipPath>
      </defs>

      {/* Base Shield */}
      <path
        d="M42.33,43.37,128,15.5,213.67,43.37a12,12,0,0,1,8,11.26V117.89c0,84-82.39,112.5-90.23,115.82a12,12,0,0,1-6.88,0C116.72,230.39,34.33,201.85,34.33,117.89V54.63A12,12,0,0,1,42.33,43.37Z"
        fill="url(#logo-gradient)"
        stroke="hsl(var(--primary) / 0.5)"
        strokeWidth="4"
      />

      {/* Network lines */}
      <g clipPath="url(#shield-clip)" opacity="0.5" stroke="white" strokeWidth="2.5" strokeLinecap="round">
        {/* Left Side */}
        <path d="M 50 60 l 20 15 l 15 -20 l 25 10" />
        <path d="M 85 55 l 20 30 l -10 25 l 20 20" />
        <path d="M 55 100 l 30 10 l -5 20 l 25 15" />
        <path d="M 60 150 l 20 -10 l 15 25 l 20 -5" />
        <path d="M 90 180 l 20 -20 l 10 30" />
        <path d="M 50 180 l 30 -20" />

        {/* Right Side */}
        <path d="M 206 60 l -20 15 l -15 -20 l -25 10" />
        <path d="M 171 55 l -20 30 l 10 25 l -20 20" />
        <path d="M 201 100 l -30 10 l 5 20 l -25 15" />
        <path d="M 196 150 l -20 -10 l -15 25 l -20 -5" />
        <path d="M 166 180 l -20 -20 l -10 30" />
        <path d="M 206 180 l -30 -20" />
      </g>
      <g clipPath="url(#shield-clip)" fill="white" opacity="0.7">
         {/* Left Dots */}
        <circle cx="50" cy="60" r="3" /> <circle cx="70" cy="75" r="3" />
        <circle cx="85" cy="55" r="3" /> <circle cx="110" cy="65" r="3" />
        <circle cx="105" cy="85" r="3" /> <circle cx="95" cy="110" r="3" />
        <circle cx="115" cy="130" r="3" /> <circle cx="55" cy="100" r="3" />
        <circle cx="85" cy="110" r="3" /> <circle cx="80" cy="130" r="3" />
        <circle cx="105" cy="145" r="3" /> <circle cx="60" cy="150" r="3" />
        <circle cx="80" cy="140" r="3" /> <circle cx="95" cy="165" r="3" />
        <circle cx="115" cy="160" r="3" /> <circle cx="90" cy="180" r="3" />
        <circle cx="110" cy="160" r="3" /> <circle cx="120" cy="190" r="3" />
        <circle cx="50" cy="180" r="3" /> <circle cx="80" cy="160" r="3" />

        {/* Right Dots */}
        <circle cx="206" cy="60" r="3" /> <circle cx="186" cy="75" r="3" />
        <circle cx="171" cy="55" r="3" /> <circle cx="146" cy="65" r="3" />
        <circle cx="151" cy="85" r="3" /> <circle cx="161" cy="110" r="3" />
        <circle cx="141" cy="130" r="3" /> <circle cx="201" cy="100" r="3" />
        <circle cx="171" cy="110" r="3" /> <circle cx="176" cy="130" r="3" />
        <circle cx="151" cy="145" r="3" /> <circle cx="196" cy="150" r="3" />
        <circle cx="176" cy="140" r="3" /> <circle cx="161" cy="165" r="3" />
        <circle cx="141" cy="160" r="3" /> <circle cx="166" cy="180" r="3" />
        <circle cx="146" cy="160" r="3" /> <circle cx="136" cy="190" r="3" />
        <circle cx="206" cy="180" r="3" /> <circle cx="176" cy="160" r="3" />

      </g>

      {/* Fingerprint */}
      <path
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M164,136a36,36,0,0,1-72,0,36,36,0,0,1,72,0Z M156,136a28,28,0,0,1-56,0,28,28,0,0,1,56,0Z M148,136a20,20,0,0,1-40,0,20,20,0,0,1,40,0Z M140,136a12,12,0,0,1-24,0,12,12,0,0,1,24,0Z M130.14,132a2,2,0,0,1-4.28,0,2.14,2.14,0,0,1,4.28,0Z M108,124a12,12,0,0,0,12,12 M148,124a12,12,0,0,1-12,12 M116,116a20,20,0,0,0,20,20 M128,104a28,28,0,0,1,28,28"
      />
      
      {/* Light Flare */}
      <line x1="50" y1="128" x2="206" y2="128" stroke="hsl(var(--accent))" strokeWidth="4" opacity="0.7" />
      <line x1="60" y1="128" x2="196" y2="128" stroke="white" strokeWidth="2" opacity="0.9" />

      {/* Lock */}
      <g fill="white">
        <path d="M148,180H108a8,8,0,0,0-8,8v24a8,8,0,0,0,8,8h40a8,8,0,0,0,8-8V188A8,8,0,0,0,148,180Z" />
        <path d="M140,180h-8v-8a16,16,0,0,0-32,0v8h-8v-8a24,24,0,0,1,48,0Z" />
      </g>
    </svg>
  );
}
