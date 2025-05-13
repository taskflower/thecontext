// src/components/Loading.tsx

export const Loading: React.FC<{ message?: string }> = ({
  message = "Ładowanie...",
}) => (
  <div className="absolute top-0 left-0 w-full flex items-center justify-center h-full bg-gray-50">
    <div className="p-6 rounded-lg">
      <div className="w-8 h-8 border-8 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-center text-gray-700 text-xs">{message}</p>
    </div>
  </div>
);

export default Loading;
