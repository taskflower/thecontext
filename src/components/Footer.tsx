import { useNavigate } from "react-router-dom";
import { Github, Twitter, Users } from "lucide-react";

const Footer = ({ user }: any) => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm mt-auto">
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
            {user && (
              <button
                onClick={() => navigate("/admin")}
                className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition"
              >
                <Users className="w-4 h-4 mr-2" />
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
