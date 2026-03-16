import React from 'react';
import { clsx } from 'clsx';

export function Logo({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={clsx("shrink-0", className)}
            style={style}
        >
            <defs>
                <linearGradient id="logo-gradient" x1="8" y1="16" x2="34" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="currentColor" />
                    <stop offset="1" stopColor="currentColor" stopOpacity="0.8" />
                </linearGradient>
            </defs>
            {/* C Curve - Background Layer */}
            <path
                d="M 28 12 C 24 6 16 6 12 12 C 8 18 8 26 14 31"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-30"
            />
            {/* W interlocking and forming a growth arrow - Primary Layer */}
            <path
                d="M 8 18 L 14 28 L 20 18 L 26 28 L 34 16"
                stroke="url(#logo-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Arrowhead at the end of the W */}
            <path
                d="M 26 16 L 34 16 L 34 24"
                stroke="url(#logo-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
