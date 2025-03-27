// src/components/frontApp/AppFooter.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Palette } from "lucide-react";

const AppFooter = () => {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-4xl  mx-auto py-4 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-center md:text-left mb-2 md:mb-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2025 Powered by REVERTCONTEXT.COM All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            >
              <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            >
              <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Link to="/studio">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
              >
                <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button variant="ghost" size="sm" className="text-xs px-2 sm:px-3 h-7 sm:h-8">
              Terms
            </Button>
            <Button variant="ghost" size="sm" className="text-xs px-2 sm:px-3 h-7 sm:h-8">
              Privacy
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;