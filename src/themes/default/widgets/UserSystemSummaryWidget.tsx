// src/themes/default/widgets/UserSystemSummaryWidget.tsx
import { useEngineStore } from "@/core";
import { useCollections } from "@/core/hooks/useCollections";

interface UserSystemSummaryWidgetProps {
  title?: string;
  attrs?: {
    showStats?: boolean;
    showRecentActivity?: boolean;
    colSpan?: string | number;
  };
}

export default function UserSystemSummaryWidget({ 
  title = "System użytkowników", 
  attrs = {} 
}: UserSystemSummaryWidgetProps) {
  const { get } = useEngineStore();
  const { items: users } = useCollections("users");
  const { items: tickets } = useCollections("tickets");
  
  const {
    showStats = true,
    showRecentActivity = true
  } = attrs;

  const currentUser = get("currentUser");
  
  // Statystyki użytkowników
  const userStats = {
    total: users.length,
    active: users.filter((u: any) => u.isActive !== false).length,
    inactive: users.filter((u: any) => u.isActive === false).length,
    byRole: users.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {}),
    byDepartment: users.reduce((acc: any, user: any) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {})
  };

  // Aktywność użytkownika
  const userActivity = currentUser ? {
    myTickets: tickets.filter((t: any) => t.reporterId === currentUser.id).length,
    assignedTickets: tickets.filter((t: any) => t.assigneeId === currentUser.id).length,
    loginTime: currentUser.loginTime ? new Date(currentUser.loginTime) : null
  } : null;

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-medium text-zinc-900">{title}</h3>

      {/* Obecny użytkownik */}
      {currentUser ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                Zalogowany jako: {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-xs text-green-600">
                {currentUser.role} • {currentUser.department}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Niezalogowany</p>
              <p className="text-xs text-yellow-600">
                Zaloguj się, aby uzyskać pełny dostęp do systemu
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statystyki systemu */}
      {showStats && (
        <div>
          <h4 className="text-sm font-medium text-zinc-700 mb-3">Statystyki użytkowników</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Wszyscy użytkownicy</p>
              <p className="text-lg font-semibold text-zinc-900">{userStats.total}</p>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Aktywni</p>
              <p className="text-lg font-semibold text-green-600">{userStats.active}</p>
            </div>
          </div>
          
          {/* Role breakdown */}
          {Object.keys(userStats.byRole).length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-zinc-500 mb-2">Podział według ról:</p>
              <div className="space-y-1">
                {Object.entries(userStats.byRole).map(([role, count]: any) => (
                  <div key={role} className="flex justify-between text-xs">
                    <span className="text-zinc-600 capitalize">{role}</span>
                    <span className="text-zinc-900 font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aktywność użytkownika */}
      {showRecentActivity && userActivity && (
        <div>
          <h4 className="text-sm font-medium text-zinc-700 mb-3">Twoja aktywność</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Moje zgłoszenia:</span>
              <span className="text-zinc-900 font-medium">{userActivity.myTickets}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Przypisane do mnie:</span>
              <span className="text-zinc-900 font-medium">{userActivity.assignedTickets}</span>
            </div>
            {userActivity.loginTime && (
              <div className="pt-2 border-t border-zinc-200">
                <p className="text-xs text-zinc-500">
                  Ostatnie logowanie: {userActivity.loginTime.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}