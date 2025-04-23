
import { useNavigate } from "react-router-dom";
import { Briefcase, ChevronRight, Trash2 } from "lucide-react";

const ApplicationListItem = ({ 
  app, 
  isSelected, 
  onSelect, 
  confirmDelete, 
  onDelete, 
  cancelDelete, 
  isDeleting 
}:any) => {
  const navigate = useNavigate();
  
  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        isSelected ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer flex-1"
          onClick={onSelect}
        >
          <div className="p-2 rounded-full bg-black border text-white mr-3">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-medium">{app.name}</h3>
            <p className="text-sm text-muted-foreground">
              {app.description || "No description"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/app/${app.id}`)}
            className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition"
          >
            <span>Open</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>

          {confirmDelete === app.id ? (
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(app.id)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-destructive text-destructive-foreground text-sm font-medium shadow hover:bg-destructive/90 transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
              <button
                onClick={cancelDelete}
                className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-muted text-muted-foreground text-sm font-medium shadow hover:bg-muted/90 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => onDelete(app.id)}
              className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-destructive text-destructive-foreground text-sm font-medium shadow hover:bg-destructive/90 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationListItem;