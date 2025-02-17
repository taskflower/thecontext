
import { Circle } from 'lucide-react';
type Status = 'todo' | 'inProgress' | 'done';

const StatusIcon = ({ status }: { status: Status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'todo':
        return 'text-gray-400';
      case 'inProgress':
        return 'text-blue-500';
      case 'done':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Circle className={`w-4 h-4 ${getStatusColor()}`} />
  );
};

export default StatusIcon;