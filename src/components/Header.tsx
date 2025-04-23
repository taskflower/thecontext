import React from "react";

const Header = () => {
  return (
    <div className="mb-16 md:mb-20 text-center">
      <div className="flex justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <line x1="22" x2="2" y1="6" y2="6"></line>
          <line x1="22" x2="2" y1="18" y2="18"></line>
          <line x1="6" x2="6" y1="2" y2="22"></line>
          <line x1="18" x2="18" y1="2" y2="22"></line>
        </svg>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
        REVERT<span className="font-extralight">CONTEXT</span>
      </h1>
      <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
      <p className="text-xl text-muted-foreground max-w-xl mx-auto">
        Select an application to start building
      </p>
    </div>
  );
};

export default Header;