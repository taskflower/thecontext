// src/layouts/AdminLayout.tsx

import { Outlet, Navigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { AdminSidebar } from "@/layouts/AdminSidebar";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";

export const AdminLayout = () => {
  const { user, loading } = useAuthState();

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-grow">
        <AdminSidebar />
        <main className="flex-grow p-0 flex flex-col">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};