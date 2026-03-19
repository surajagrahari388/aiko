import Link from "next/link";
import { Globe, Instagram, Linkedin } from "lucide-react";
import Aikologo2 from "@/components/ui/svg/aiko-logo-2";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#27272a]">
      <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          {/* Left side - Logo, Copyright, and Legal Links */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <Link href="/cricket" className="flex items-center">
                <Aikologo2 className="w-8 h-8 sm:w-10 sm:h-10 hover:opacity-80 transition-opacity" />
              </Link>
              <p className="text-xs text-center sm:text-left text-[#a1a1aa]">
                © 2026 Aiko. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Link 
                href="/terms" 
                className="text-[#a1a1aa] hover:text-white transition-colors"
              >
                Terms
              </Link>
              <span className="text-[#27272a]">•</span>
              <Link 
                href="/privacy" 
                className="text-[#a1a1aa] hover:text-white transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>

          {/* Right side - Social Media Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="https://aiko.inc/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#27272a] rounded-full hover:bg-[#a6171b] transition-colors"
            >
              <Globe className="h-3 w-3 text-white" />
            </Link>
            <Link
              href="https://www.instagram.com/aiko.sports"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#27272a] rounded-full hover:bg-[#a6171b] transition-colors"
            >
              <Instagram className="h-3 w-3 text-white" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/aiko-inc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#27272a] rounded-full hover:bg-[#a6171b] transition-colors"
            >
              <Linkedin className="h-3 w-3 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
