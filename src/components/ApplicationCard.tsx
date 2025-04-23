
import { AppWindowMac, ChevronRight } from "lucide-react";

const ApplicationCard = ({ app, onClick }:any) => {
  return (
    <div
      onClick={onClick}
      className="border border-border bg-card rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer group flex flex-col justify-between"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-black border text-white mr-3">
            <AppWindowMac className="w-4 h-4" />
          </div>
          <h3 className="font-medium">{app.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {app.description}
        </p>
      </div>
      <div className="border-t border-border p-4">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center text-primary group-hover:underline">
            <span>Open application</span>
            <ChevronRight className="w-4 h-4 ml-1 transition transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;