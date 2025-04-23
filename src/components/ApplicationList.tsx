
import { Database } from "lucide-react";
import ApplicationListItem from "./ApplicationListItem";

const ApplicationList = ({ 
  applications, 
  selectedApplication, 
  setSelectedApplication, 
  confirmDelete, 
  handleDeleteApplication, 
  cancelDelete, 
  isDeleting
}:any) => {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Database className="mr-2 h-5 w-5 text-primary" />
        Applications ({applications.length})
      </h2>

      {applications.length === 0 ? (
        <div className="p-4 bg-black border  rounded-lg">
          <p className="text-amber-200">
            No applications in the database. Import data from a JSON file.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app:any) => (
            <ApplicationListItem
              key={app.id}
              app={app}
              isSelected={selectedApplication === app.id}
              onSelect={() => setSelectedApplication(
                app.id === selectedApplication ? null : app.id
              )}
              confirmDelete={confirmDelete}
              onDelete={handleDeleteApplication}
              cancelDelete={cancelDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationList;