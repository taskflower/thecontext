// src/layouts/AdminLayout.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { AdminSidebar } from "@/layouts/AdminSidebar";
import { Navbar } from "@/layouts/Navbar";

export const AdminLayout = () => {
  const { user, loading } = useAuthState();

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col select-none">
      <Navbar /> {/* Dodano Navbar na górze */}
      <div className="flex flex-grow">
        <AdminSidebar />
        <main className="flex-grow p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
