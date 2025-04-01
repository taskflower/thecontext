import React, { useEffect, useMemo, useState } from 'react';
import { DashboardPluginComponentProps } from '../modules/appDashboard/types';
import { useAppStore } from '../modules/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle, Clock, ArrowRight, Play, Filter, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

// Helper function to format time ago
const formatTimeAgo = (timestamp?: string | number): string => {
  if (!timestamp) return "Recently";

  const now = new Date().getTime();
  const date = new Date(timestamp).getTime();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `about ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
};

/**
 * Scenario Card Component for Widget
 */
const ScenarioCardMini = ({ 
  scenario, 
  isCurrentScenario,
  isActive,
  onSelect,
  onStartFlow
}) => {
  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      !isActive ? "opacity-70" : "hover:shadow-md"
    } ${isCurrentScenario ? "ring-1 ring-primary" : ""}`}
    >
      <CardHeader className="pb-2 px-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-bold break-words">
            {scenario.name}
          </CardTitle>
          
          {scenario.activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {scenario.activeFiltersCount} {scenario.activeFiltersCount === 1 ? 'filter' : 'filters'}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs line-clamp-1 mt-1">
          {scenario.description || "No description available"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 px-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {isActive ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>{isActive ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="truncate max-w-[120px]">Updated {formatTimeAgo(scenario.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 px-3 pb-3">
        {isCurrentScenario ? (
          <Button
            size="sm"
            className="w-full gap-2 text-xs py-1"
            onClick={onStartFlow}
            disabled={!isActive}
          >
            <Play className="h-3 w-3" />
            Start Flow
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="w-full gap-2 text-xs py-1"
            onClick={onSelect}
            disabled={!isActive}
          >
            <ArrowRight className="h-3 w-3" />
            Select
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

/**
 * Scenarios Widget for Dashboard
 * Shows scenarios from the current workspace with filtering capabilities
 */
const ScenariosWidget: React.FC<DashboardPluginComponentProps> = ({ 
  data,
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilteringActive, setIsFilteringActive] = useState(false);
  
  // Get app store state and actions
  const {
    items: workspaces,
    selected,
    selectScenario,
    getCurrentWorkspace,
    checkScenarioFilterMatch,
    startFlowSession
  } = useAppStore();
  
  // Force refresh on widget refresh
  useEffect(() => {
    // This is an empty dependency to trigger on refresh
  }, [onRefresh]);
  
  // Get current workspace
  const currentWorkspace = getCurrentWorkspace();
  
  // Get all scenarios from current workspace with filter status
  const scenariosWithStatus = useMemo(() => {
    if (!currentWorkspace) return [];

    return currentWorkspace.children.map((scenario) => {
      const hasFilters = !!scenario.filters && scenario.filters.length > 0;
      const activeFilters =
        hasFilters && scenario.filters
          ? scenario.filters.filter((f) => f.enabled)
          : [];
      const matchesFilter = checkScenarioFilterMatch();

      return {
        ...scenario,
        hasFilters,
        activeFiltersCount: activeFilters.length,
        matchesFilter: hasFilters ? matchesFilter : true,
      };
    });
  }, [currentWorkspace, checkScenarioFilterMatch]);
  
  // Filter scenarios based on search term and active filter
  const filteredScenarios = useMemo(() => {
    return scenariosWithStatus
      .filter(scenario => 
        // Filter by search term
        scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        // Filter by active status if filtering is enabled
        (!isFilteringActive || scenario.matchesFilter)
      )
      // Sort by updated time, most recent first
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      })
      // Limit to top 6 scenarios
      .slice(0, 6);
  }, [scenariosWithStatus, searchTerm, isFilteringActive]);
  
  // Toggle active filter
  const toggleActiveFilter = () => {
    setIsFilteringActive(!isFilteringActive);
  };
  
  // Start flow session
  const handleStartFlow = () => {
    startFlowSession();
  };
  
  // Handle scenario selection
  const handleSelectScenario = (scenarioId: string) => {
    selectScenario(scenarioId);
  };
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Recent Scenarios</h3>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs px-2 py-1 ${isFilteringActive ? 'bg-primary/10' : ''}`}
            onClick={toggleActiveFilter}
            title="Show only active scenarios"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            {isFilteringActive ? 'All' : 'Active only'}
          </Button>
        </div>
        
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-xs"
            placeholder="Search scenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 px-4 overflow-y-auto">
        {!currentWorkspace ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No workspace selected
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {searchTerm ? 'No scenarios match your search' : 'No scenarios available'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
            {filteredScenarios.map((scenario) => (
              <ScenarioCardMini
                key={scenario.id}
                scenario={scenario}
                isCurrentScenario={scenario.id === selected.scenario}
                isActive={scenario.matchesFilter}
                onSelect={() => handleSelectScenario(scenario.id)}
                onStartFlow={handleStartFlow}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t text-xs text-center text-muted-foreground">
        {currentWorkspace ? (
          <span>Showing {filteredScenarios.length} of {currentWorkspace.children.length} scenarios</span>
        ) : (
          <span>No workspace selected</span>
        )}
      </div>
    </div>
  );
};

export default ScenariosWidget;