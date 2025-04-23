
import { Box } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyState = ({ user }:any) => {
  const navigate = useNavigate();
  
  return (
    <div className="border border-border bg-card rounded-lg p-8 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center border border-border rounded-full bg-background mb-4">
        <Box className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-medium mb-2">No applications available</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {user ? "Go to the Admin Panel to add test data" : "Sign in to add new applications"}
      </p>
      {user && (
        <button
          onClick={() => navigate("/admin")}
          className="mt-6 inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition"
        >
          Go to Admin Panel
        </button>
      )}
    </div>
  );
};

export default EmptyState;