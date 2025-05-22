// src/themes/default/widgets/WelcomeBubbleWidget.tsx
import { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";

type WelcomeBubbleWidgetProps = {
  userName?: string;
  message?: string;
  delay?: number;
  autoDismiss?: boolean;
  dismissDelay?: number;
  showCloseButton?: boolean;
  ctaLink?: string;
  ctaLabel?: string;
};

export default function WelcomeBubbleWidget({
  userName = "",
  message = "Witaj w naszym systemie! Cieszymy się, że dołączyłeś do nas.",
  delay = 1000,
  autoDismiss = false,
  dismissDelay = 10000,
  showCloseButton = true,
  ctaLink = "",
  ctaLabel = "Rozpocznij",
}: WelcomeBubbleWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Pokaż bąbelek z opóźnieniem
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(showTimer);
  }, [delay]);

  // Automatyczne zamknięcie
  useEffect(() => {
    if (autoDismiss && isVisible) {
      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setIsDismissed(true), 500); // Po zakończeniu animacji
      }, dismissDelay);

      return () => clearTimeout(dismissTimer);
    }
  }, [autoDismiss, dismissDelay, isVisible]);

  // Obsługa zamknięcia
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsDismissed(true), 500); // Po zakończeniu animacji
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 max-w-sm transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg p-5 relative">
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {userName ? userName.charAt(0).toUpperCase() : "👋"}
              </span>
            </div>
          </div>

          <div className="ml-3 flex-1">
            <h3 className="font-semibold text-lg">
              {userName ? `Witaj, ${userName}!` : "Witaj!"}
            </h3>
            <p className="mt-1 text-white/90 text-sm leading-relaxed">
              {message}
            </p>

            {ctaLink && (
              <a
                href={ctaLink}
                className="mt-3 inline-flex items-center text-sm font-medium text-white hover:underline"
              >
                {ctaLabel} <ArrowRight className="ml-1 w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Dekoracyjny element */}
        <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>

        {/* Wskaźnik animacji (kropki pulsujące) */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div
            className="w-1 h-1 rounded-full bg-white/60 animate-pulse"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-1 h-1 rounded-full bg-white/60 animate-pulse"
            style={{ animationDelay: "300ms" }}
          ></div>
          <div
            className="w-1 h-1 rounded-full bg-white/60 animate-pulse"
            style={{ animationDelay: "600ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
