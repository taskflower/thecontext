import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";

const AdminHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <Settings className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-muted text-muted-foreground text-sm font-medium shadow hover:bg-muted/80 transition"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Applications
      </button>
    </div>
  );
};

export default AdminHeader;