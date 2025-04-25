
import React from "react";
import NavBar from "@/components/layout/NavBar";

const DashboardLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex items-center justify-center">
        <p>Carregando...</p>
      </main>
    </div>
  );
};

export default DashboardLoading;
