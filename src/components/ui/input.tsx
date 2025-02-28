import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cn } from "@/utils/utils";

interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "placeholder"> {
  placeholder?: React.ReactNode;
}

// TODO - tutaj nie działła <Trans w placeholder

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, placeholder, ...props }, ref) => {
    let resolvedPlaceholder: string | undefined;

    if (typeof placeholder === "string") {
      resolvedPlaceholder = placeholder;
    } else if (React.isValidElement(placeholder)) {
      try {
        resolvedPlaceholder = renderToStaticMarkup(placeholder);
      } catch {
        // Jeśli renderToStaticMarkup zawiedzie (np. brak I18nProvider),
        // próbujemy wyciągnąć tekst bezpośrednio z children
        const child = placeholder.props?.children;
        if (typeof child === "string") {
          resolvedPlaceholder = child;
        } else if (Array.isArray(child)) {
          resolvedPlaceholder = child.join("");
        } else {
          resolvedPlaceholder = "";
        }
      }
    }

    return (
      <input
        type={type}
        placeholder={resolvedPlaceholder}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
