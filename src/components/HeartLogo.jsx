import React from 'react';

/**
 * BP.ai heart logo — black heart silhouette with red ECG pulse line.
 * Used in the app header and login page.
 */
export default function HeartLogo({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 34 C20 34 4 24 4 13 C4 8 8 4 13 4 C16 4 19 6 20 8 C21 6 24 4 27 4 C32 4 36 8 36 13 C36 24 20 34 20 34Z"
        fill="white"
      />
      <polyline
        points="6,20 11,20 14,13 17,27 20,16 23,22 26,20 34,20"
        stroke="#dc2626"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
