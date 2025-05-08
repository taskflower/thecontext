// src/_modules/admin/components/AppManager.tsx
import React, { useState, useEffect } from "react";
import { applicationService } from "@/_firebase/services";
import { Application } from "@/types";

import DataImporter from "./DataImporter";
import ApplicationList from "./ApplicationList";

const AppManager: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Fetch applications list
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const appList = await applicationService.getAll();
      setApplications(appList);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to fetch applications list");
    } finally {
      setIsLoading(false);
    }
  };

  // Load list on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex flex-col space-y-4 h-full">
        {/* File Upload Section */}
        <DataImporter 
          onImportSuccess={fetchApplications}
          isLoading={isLoading}
        />

        {/* Applications List */}
        <ApplicationList 
          applications={applications}
          isLoading={isLoading}
          onRefresh={fetchApplications}
        />
      </div>
    </div>
  );
};

export default AppManager;