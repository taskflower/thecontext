
import { Github, Twitter} from "lucide-react";

const Footer = () => {


  return (
    <footer className="border-t border-border  backdrop-blur-sm mt-auto bg-white">
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-center md:text-left mb-2 md:mb-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2025 Powered by{" "}
              <a className="font-medium text-foreground text-xs underline-offset-4 hover:underline">
                REVERTCONTEXT.COM
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <button
              className="inline-flex items-center justify-center rounded-full p-2 hover:bg-muted transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full p-2 hover:bg-muted transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </button>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
