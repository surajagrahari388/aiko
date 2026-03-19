import Link from 'next/link'
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-bl from-background via-background to-background/90 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/5 w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 lg:w-52 lg:h-52 bg-gradient-to-r from-red-100/15 to-pink-100/8 rounded-full blur-xl sm:blur-2xl animate-pulse delay-300" />
        <div className="absolute bottom-1/3 right-1/5 w-24 h-24 sm:w-36 sm:h-36 md:w-52 md:h-52 lg:w-72 lg:h-72 bg-gradient-to-l from-orange-50/12 to-red-50/6 rounded-full blur-xl sm:blur-2xl animate-pulse delay-700" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-tr from-amber-50/10 to-yellow-50/8 rounded-full blur-lg sm:blur-xl animate-pulse delay-1200" />
        
        {/* Floating dots */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-red-200/60 rounded-full animate-bounce delay-500" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-200/50 rounded-full animate-bounce delay-1000" />
        <div className="absolute top-2/3 left-1/4 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-amber-300/70 rounded-full animate-ping delay-800" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-6 sm:space-y-8 md:space-y-10 max-w-2xl mx-auto">

            {/* Error Message */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Oops! Page Not Found
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground/80 leading-relaxed px-4 sm:px-0">
                The page you&apos;re looking for seems to have wandered off the field. 
                <br className="hidden sm:block" />
                Don&apos;t worry, even the best players sometimes miss their target!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="group">
                <Link href="/cricket" className="flex items-center gap-2">
                  <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Return Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Corner decorative elements */}
      <div className="absolute top-8 left-8 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-red-200 to-orange-300 rounded-full opacity-60 animate-pulse" />
      <div className="absolute bottom-8 right-8 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full opacity-50 animate-pulse delay-500" />
    </div>
  )
}