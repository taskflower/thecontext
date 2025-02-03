import React from "react";

interface MainTitleProps {
  title: string;
  icon: React.ReactNode; // Zmieniliśmy typ na React.ReactNode
  description?: string;
}

const MainTitleSecondary: React.FC<MainTitleProps> = ({ title, icon, description }) => {
  return (
    <div className="flex md:flex-col items-center justify-between space-y-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex">{title}</h2>
        {description && (
          <p className="text-muted-foreground flex items-center gap-1">
            {icon} {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default MainTitleSecondary;
