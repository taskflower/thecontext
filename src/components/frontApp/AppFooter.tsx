// src/components/frontApp/AppFooter.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {  Frame, Heart, Linkedin, Youtube } from "lucide-react";

const AppFooter = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-center md:text-left mb-2 md:mb-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2025 Powered by{" "}
              <Link
                to="/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-foreground text-xs underline-offset-4 "
              >
                REVERTCONTEXT.COM
              </Link>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted"
              aria-label="GitHub"
            >
              <Youtube className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted"
              aria-label="Twitter"
            >
              <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Link to="/studio">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted"
                aria-label="Studio"
              >
                <Frame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs px-2 sm:px-3 h-7 sm:h-8 hover:text-foreground"
            >
              Terms
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs px-2 sm:px-3 h-7 sm:h-8 hover:text-foreground"
            >
              Privacy
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs px-2 sm:px-3 h-7 sm:h-8 hover:text-foreground flex items-center gap-1"
            >
              <Heart className="h-3 w-3 text-red-500" />
              <span>Support</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;