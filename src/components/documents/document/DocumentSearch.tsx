import { SearchInput } from "@/components/common";
import { t } from "@lingui/macro";

interface DocumentSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DocumentSearch = ({ 
  value, 
  onChange,
  className = "h-8 w-[150px] lg:w-[250px]"
}: DocumentSearchProps) => {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder={t`Search documents...`}
      className={className}
    />
  );
};

export default DocumentSearch;