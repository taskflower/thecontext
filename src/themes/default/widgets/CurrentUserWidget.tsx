// src/themes/default/widgets/CurrentUserWidget.tsx - Modern Dropbox Style
import { useEngineStore, useAppNavigation } from "@/core";
import ButtonWidget from "./ButtonWidget";

interface CurrentUserWidgetProps {
  title?: string;
  attrs?: {
    currentUserPath?: string;
    showActions?: boolean;
    editnavigationPath?: string;
    logoutnavigationPath?: string;
    loginnavigationPath?: string;
    registernavigationPath?: string;
    variant?: "compact" | "detailed" | "card";
    colSpan?: string | number;
  };
}

export default function CurrentUserWidget({ 
  title = "User Account", 
  attrs = {} 
}: CurrentUserWidgetProps) {
  const { get, set } = useEngineStore();
  const { go } = useAppNavigation();
  
  const {
    currentUserPath = "currentUser",
    showActions = true,
    editnavigationPath = "/profile/edit/form",
    logoutnavigationPath = "/main",
    loginnavigationPath = "/main/login/form",
    registernavigationPath = "/main/register/form",
    variant = "detailed"
  } = attrs;

  const currentUser = get(currentUserPath);

  const handleLogout = () => {
    set(currentUserPath, null);
    go(logoutnavigationPath);
  };

  const handleEdit = () => {
    go(editnavigationPath);
  };

  const getUserInitials = () => {
    if (!currentUser) return "?";
    const first = currentUser.firstName?.[0] || "";
    const last = currentUser.lastName?.[0] || "";
    return (first + last).toUpperCase() || currentUser.email?.[0]?.toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (!currentUser) return "Guest User";
    const fullName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
    return fullName || currentUser.email || "Unknown User";
  };

  if (!currentUser) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 rounded-2xl p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Welcome! Please sign in
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Access your account to continue
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <ButtonWidget 
                title="Sign In" 
                attrs={{
                  navigationPath: loginnavigationPath,
                  variant: "primary",
                  size: "md",
                  fullWidth: true
                }}
              />
            </div>
            <div className="flex-1">
              <ButtonWidget 
                title="Register" 
                attrs={{
                  navigationPath: registernavigationPath,
                  variant: "outline",
                  size: "md",
                  fullWidth: true
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getUserInitials()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-slate-500 capitalize">{currentUser.role || "User"}</p>
            </div>
          </div>
          {showActions && (
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-red-600 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-red-50"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header with gradient */}
        <div className="h-20 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-10 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
              {getUserInitials()}
            </div>
          </div>
          
          {/* User Info */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {getUserDisplayName()}
            </h3>
            <p className="text-slate-600 text-sm">{currentUser.email}</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium mt-2 capitalize">
              {currentUser.role || "User"}
            </div>
          </div>
          
          {/* Actions */}
          {showActions && (
            <div className="flex gap-3">
              <div className="flex-1">
                <ButtonWidget 
                  title="Edit Profile" 
                  attrs={{
                    navigationPath: editnavigationPath,
                    variant: "secondary",
                    size: "md",
                    icon: "edit",
                    fullWidth: true
                  }}
                />
              </div>
              <div className="flex-1">
                <ButtonWidget 
                  title="Sign Out" 
                  attrs={{
                    navigationPath: logoutnavigationPath,
                    variant: "outline",
                    size: "md",
                    fullWidth: true
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default detailed variant
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Edit Profile"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Sign Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {getUserInitials()}
          </div>
          
          {/* User Details */}
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 mb-1">
              {getUserDisplayName()}
            </h4>
            <p className="text-sm text-slate-600 mb-3">{currentUser.email}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Role
                </p>
                <p className="text-sm text-slate-900 capitalize">
                  {currentUser.role || "User"}
                </p>
              </div>
              
              {currentUser.department && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Department
                  </p>
                  <p className="text-sm text-slate-900 capitalize">
                    {currentUser.department}
                  </p>
                </div>
              )}
              
              {currentUser.phone && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Phone
                  </p>
                  <p className="text-sm text-slate-900">{currentUser.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {currentUser.loginTime && (
          <div className="mt-6 pt-4 border-t border-slate-200/60">
            <p className="text-xs text-slate-500">
              Last login: {new Date(currentUser.loginTime).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}