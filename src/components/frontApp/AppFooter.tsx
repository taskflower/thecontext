import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter } from "lucide-react";

const AppFooter = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              © 2025 REVERTCONTEXT.COM All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Github className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" className="text-xs">
              Terms
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              Privacy
            </Button>
            <Link to="/studio">Studio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;