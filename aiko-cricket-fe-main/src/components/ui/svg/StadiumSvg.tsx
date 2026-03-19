"use client";

import React from "react";

type Props = {
  className?: string;
};

const StadiumSvg: React.FC<Props> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="fieldGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
          <stop offset="60%" stopColor="#22c55e" stopOpacity={1} />
          <stop offset="100%" stopColor="#15803d" stopOpacity={1} />
        </radialGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Field fill */}
      <circle cx="100" cy="100" r="95" fill="url(#fieldGradient)" />

      {/* Outer boundary - Main Circle */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2"
      />

      {/* Inner 30-yard circle */}
      <circle
        cx="100"
        cy="100"
        r="62"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeDasharray="3,2"
      />

      {/* Pitch - Rectangle */}
      <rect
        x="75"
        y="30"
        width="50"
        height="140"
        fill="rgba(101, 67, 33, 0.35)"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.5"
        filter="url(#shadow)"
      />

      {/* Grass texture lines on pitch */}
      <line x1="75" y1="40" x2="125" y2="40" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="50" x2="125" y2="50" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="60" x2="125" y2="60" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="70" x2="125" y2="70" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="80" x2="125" y2="80" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="90" x2="125" y2="90" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="100" x2="125" y2="100" stroke="rgba(139, 69, 19, 0.4)" strokeWidth="1" />
      <line x1="75" y1="110" x2="125" y2="110" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="120" x2="125" y2="120" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="130" x2="125" y2="130" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="140" x2="125" y2="140" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="150" x2="125" y2="150" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />
      <line x1="75" y1="160" x2="125" y2="160" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="0.5" />

      {/* Crease lines - Batting end (top) */}
      <line x1="75" y1="35" x2="125" y2="35" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
      <line x1="72" y1="35" x2="75" y2="35" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
      <line x1="125" y1="35" x2="128" y2="35" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />

      {/* Crease lines - Bowling end (bottom) */}
      <line x1="75" y1="165" x2="125" y2="165" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
      <line x1="72" y1="165" x2="75" y2="165" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
      <line x1="125" y1="165" x2="128" y2="165" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />

      {/* Popping crease lines */}
      <line x1="70" y1="35" x2="130" y2="35" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
      <line x1="70" y1="165" x2="130" y2="165" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />

      {/* Return crease lines (perpendicular to pitch) */}
      <line x1="75" y1="30" x2="75" y2="40" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
      <line x1="125" y1="30" x2="125" y2="40" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
      <line x1="75" y1="160" x2="75" y2="170" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
      <line x1="125" y1="160" x2="125" y2="170" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />

      {/* Center pitch line */}
      <line x1="100" y1="30" x2="100" y2="170" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="2,2" />

      {/* Wickets - Stumps at batting end */}
      <g id="wickets-top">
        <line x1="95" y1="32" x2="95" y2="38" stroke="rgba(255,255,0,0.9)" strokeWidth="0.8" />
        <line x1="100" y1="32" x2="100" y2="38" stroke="rgba(255,255,0,0.9)" strokeWidth="0.8" />
        <line x1="105" y1="32" x2="105" y2="38" stroke="rgba(255,255,0,0.9)" strokeWidth="0.8" />
        <line x1="93" y1="38" x2="107" y2="38" stroke="rgba(255,255,0,0.8)" strokeWidth="0.6" />
      </g>

      {/* Wickets - Stumps at bowling end */}
      <g id="wickets-bottom">
        <line x1="95" y1="162" x2="95" y2="168" stroke="rgba(255,255,0,0.9)" strokeWidth="0.8" />
        <line x1="100" y1="162" x2="100" y2="168" stroke="rgba(255,255,0,0.9)" strokeWidth="0.8" />
        <line x1="105" y1="162" x2="105" y2="168" stroke="rgba(255,255,0,0.9)" strokeWidth="0.8" />
        <line x1="93" y1="162" x2="107" y2="162" stroke="rgba(255,255,0,0.8)" strokeWidth="0.6" />
      </g>

      {/* Fielding circles - 30 yards */}
      <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4,3" />

      {/* Center spot */}
      <circle cx="100" cy="100" r="2" fill="rgba(255,255,255,0.8)" />

      {/* Sightscreen markers */}
      <line x1="20" y1="100" x2="35" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <line x1="165" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

      {/* Field zones - Light overlay lines */}
      <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    </svg>
  );
};

export default StadiumSvg;
