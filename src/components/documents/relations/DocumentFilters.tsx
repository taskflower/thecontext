// DocumentFilters.tsx
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui";
import { DocumentSearch } from "@/components/documents";
import { Filter } from "lucide-react";
import { Trans, t } from "@lingui/macro";

interface DocumentFiltersProps {
  filter: string;
  onFilterChange: (value: string) => void;
  selectedRelationFilter: string | null;
  setSelectedRelationFilter: (value: string | null) => void;
  relationConfigs: { id: string; name: string }[];
  onBackToContainers?: () => void;
}

export const DocumentFilters = ({
  filter,
  onFilterChange,
  selectedRelationFilter,
  setSelectedRelationFilter,
  relationConfigs,
  onBackToContainers,
}: DocumentFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-2">
      <DocumentSearch value={filter} onChange={onFilterChange} />
      <div className="flex items-center gap-2 ml-auto">
        {onBackToContainers && (
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex"
            onClick={onBackToContainers}
          >
            <Trans>Back to containers</Trans>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden lg:flex">
              <Filter className="mr-2 h-4 w-4" />
              {selectedRelationFilter
                ? relationConfigs.find(
                    (config) => config.id === selectedRelationFilter
                  )?.name
                : t`Filters`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {relationConfigs.length === 0 ? (
              <DropdownMenuItem disabled>
                <Trans>No relation filters</Trans>
              </DropdownMenuItem>
            ) : (
              relationConfigs.map((config) => (
                <DropdownMenuItem
                  key={config.id}
                  onClick={() => setSelectedRelationFilter(config.id)}
                >
                  {config.name}
                </DropdownMenuItem>
              ))
            )}
            {selectedRelationFilter && (
              <DropdownMenuItem onClick={() => setSelectedRelationFilter(null)}>
                <Trans>Clear Filter</Trans>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DocumentFilters;
