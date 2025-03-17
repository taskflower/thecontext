// src/modules/scenarios/ScenariosList.tsx
import React, { useState } from "react";
import { useAppStore } from '../store';
import { ItemList } from "@/components/APPUI";
import { Scenario } from "../types";
import { FileText, Plus, MoreHorizontal, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialogManager } from '@/hooks/useDialogManager';
import { FilterEditor } from "../filters/FilterEditor";
import { FilterStatus } from "../filters/FilterStatus";

export const ScenariosList: React.FC = () => {
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  const selectScenario = useAppStore(state => state.selectScenario);
  const deleteScenario = useAppStore(state => state.deleteScenario);
  const addScenario = useAppStore(state => state.addScenario);
  const updateScenario = useAppStore(state => state.updateScenario);
  
  // Access the store directly for checking if functions exist
  const store = useAppStore();
  
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const workspace = items.find(w => w.id === selected.workspace);
  
  // Get scenarios from appropriate source with fallback
  let scenarios = workspace?.children || [];
  
  // Check if the function exists in the store and workspace is selected
  if (typeof store.getScenariosWithFilterStatus === 'function' && selected.workspace) {
    try {
      scenarios = store.getScenariosWithFilterStatus();
    } catch (error) {
      console.error("Error using filter status:", error);
      // Fallback to unfiltered scenarios
      scenarios = workspace?.children || [];
    }
  }
  
  // Use the dialog manager hook
  const { createDialog } = useDialogManager();
  
  // State for filter editor
  const [editingFilters, setEditingFilters] = useState<string | null>(null);
  
  const handleAddScenario = () => {
    createDialog(
      "New Scenario",
      [{ 
        name: 'name', 
        placeholder: 'Scenario name',
        type: 'text',
        validation: {
          required: true,
          minLength: 1,
          maxLength: 50
        }
      }, 
      { 
        name: 'description', 
        placeholder: 'Description',
        type: 'text',
        validation: {
          maxLength: 200
        }
      }],
      (data) => {
        if (data.name?.toString().trim()) {
          addScenario({
            name: String(data.name),
            description: data.description ? String(data.description) : undefined
          });
        }
      },
      {
        confirmText: "Add",
        size: 'sm'
      }
    );
  };

  const handleEditScenario = (scenario: Scenario) => {
    createDialog(
      "Edit Scenario",
      [
        { 
          name: 'name', 
          placeholder: 'Scenario name',
          type: 'text',
          value: scenario.name,
          validation: {
            required: true,
            minLength: 1,
            maxLength: 50
          }
        },
        {
          name: 'description',
          placeholder: 'Description',
          type: 'text',
          value: scenario.description || '',
          validation: {
            maxLength: 200
          }
        }
      ],
      (data) => {
        if (data.name?.toString().trim()) {
          updateScenario(scenario.id, {
            name: String(data.name),
            description: data.description ? String(data.description) : undefined
          });
        }
      },
      {
        confirmText: "Update",
        size: 'sm'
      }
    );
  };
  
  // Handle options button click
  const handleOptionsClick = (e: React.MouseEvent, scenario: Scenario) => {
    e.stopPropagation();
    handleEditScenario(scenario);
  };
  
  // Handle filter button click
  const handleFilterClick = (e: React.MouseEvent, scenarioId: string) => {
    e.stopPropagation();
    setEditingFilters(scenarioId);
  };
  
  // Check if filter functions exist in the store
  const hasFilterFunctions = typeof store.getScenariosWithFilterStatus === 'function';
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Scenarios</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleAddScenario} 
          className="h-7 w-7 rounded-full hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <ItemList<Scenario & { matchesFilter?: boolean }> 
          items={scenarios}
          selected={selected.scenario}
          onClick={selectScenario}
          onDelete={deleteScenario}
          renderItem={(item) => (
            <div className={`text-xs flex items-center justify-between w-full ${item.matchesFilter === false ? 'opacity-70' : ''}`}>
              <div className="flex-1">
                <div className="font-medium flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {item.name}
                  {/* Only render FilterStatus if filter functions exist */}
                  {hasFilterFunctions && (
                    <FilterStatus 
                      scenarioId={item.id} 
                      onEditClick={(e: React.MouseEvent<Element, MouseEvent>) => handleFilterClick(e, item.id)}
                    />
                  )}
                </div>
                {item.description && (
                  <div className="text-xs text-muted-foreground truncate mt-0.5 ml-5.5 max-w-56">
                    {item.description}
                  </div>
                )}
              </div>
              <div className="flex items-center">
                {/* Filter button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Manage Filters"
                  onClick={(e) => handleFilterClick(e, item.id)}
                >
                  <FilterIcon className="h-3.5 w-3.5" />
                </Button>
                {/* Options button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Options"
                  onClick={(e) => handleOptionsClick(e, item)}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          height="h-full"
        />
      </div>
      
      {/* Render filter editor when needed */}
      {editingFilters && (
        <FilterEditor
          scenarioId={editingFilters}
          onClose={() => setEditingFilters(null)}
        />
      )}
    </div>
  );
};