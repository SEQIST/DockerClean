// src/layout/AppLayout.tsx
import React from 'react';
import { Outlet } from "react-router-dom"; // Ändere "react-router" zu "react-router-dom"
import { SidebarProvider } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div className="flex-1">
        <AppHeader />
        <div className="p-4 mx-auto max-w-[1800px] min-w-[1200px] md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;