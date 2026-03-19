import * as React from "react";
import { SVGProps } from "react";

const Stumps = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={"1em"}
    height={"1em"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Base line */}
    <line x1="3" y1="20" x2="21" y2="20" />
    
    {/* Left stump */}
    <line x1="6" y1="20" x2="6" y2="6" />
    
    {/* Middle stump */}
    <line x1="12" y1="20" x2="12" y2="6" />
    
    {/* Right stump */}
    <line x1="18" y1="20" x2="18" y2="6" />
    
    {/* Left bail */}
    <line x1="6" y1="6" x2="9" y2="5" />
    <line x1="9" y1="5" x2="12" y2="6" />
    
    {/* Right bail */}
    <line x1="12" y1="6" x2="15" y2="5" />
    <line x1="15" y1="5" x2="18" y2="6" />
    
    {/* Top caps on stumps */}
    <circle cx="6" cy="6" r="0.5" fill="currentColor" />
    <circle cx="12" cy="6" r="0.5" fill="currentColor" />
    <circle cx="18" cy="6" r="0.5" fill="currentColor" />
  </svg>
);

export default Stumps;
