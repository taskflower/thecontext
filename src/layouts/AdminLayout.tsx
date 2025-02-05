// src/layouts/AdminLayout.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { AdminSidebar } from "@/layouts/AdminSidebar";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer"; // dodano import stopki

export const AdminLayout = () => {
  const { user, loading } = useAuthState();

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
 
  return (
    <div className="min-h-screen flex flex-col select-none relative">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-grow relative">
        <AdminSidebar />
        <main className="flex-grow p-0 md:p-6 lg:p-8 pb-20 md:pb-6 relative ml-0 2xl:-ml-32">
          <Outlet />
        </main>
      </div>
      <Footer /> {/* Dodana stopka */}
    </div>
  );
};
