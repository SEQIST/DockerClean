import React from 'react';
import { NavLink } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import logo from '../images/logo/logo.svg';
import {
  BoxCubeIcon,
  CalenderIcon,
  ChatIcon,
  DocsIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  MailIcon,
  PieChartIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
} from "../icons";
import SidebarSection from './SidebarSection';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const AppSidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dashboardItems = [
    { to: "/", label: "Startpage", icon: GridIcon },
  ];

  const humanResourcesItems = [
    { to: "/humanresources/roles", label: "Rollen", icon: UserCircleIcon },
    { to: "/humanresources/departments", label: "Abteilungen", icon: ListIcon },
    { to: "/humanresources/departments-flow", label: "Organigramm", icon: TableIcon },
    { to: "/role-handbook", label: "Rollenhandbuch", icon: TableIcon },
  ];

  const qualityItems = [
    { to: "/quality/work-products", label: "Work Products", icon: DocsIcon },
    { to: "/quality/work-products-tree", label: "Work Products Tree", icon: ListIcon },
    { to: "/quality/activities", label: "Activities", icon: TaskIcon },
    { to: "/quality/processes", label: "Processes", icon: TableIcon },
    {
      to: "",
      label: "Compliance",
      icon: TableIcon,
      subItems: [
        { to: "/quality/compliance/regulatory", label: "Regulatory", icon: TableIcon },
        { to: "/quality/compliance/regulatory-flow", label: "Regulatory Flow", icon: TableIcon },
      ],
    },
  ];

  const projectsItems = [
    { to: "/projects", label: "Projects", icon: TableIcon },
  ];

  const riskManagementItems = [
    { to: "/riskmanagement", label: "Risikomanagement", icon: TableIcon },
    { to: "/riskmanagement/matrix-settings", label: "Risikomatrix-Einstellungen", icon: TableIcon },
  ];

  const organizationItems = [
    { to: "/organization", label: "Organization", icon: ListIcon },
  ];

  // Neuer Reporting-Bereich
  const reportingItems = [
    { to: "/reports", label: "Reports", icon: PieChartIcon }, // Verwende ein passendes Icon (z. B. PieChartIcon)
    { to: "/standardreports", label: "Standardreports", icon: PieChartIcon },
    { to: "/query-editor", label: "Query Editor", icon: BoxCubeIcon },
  ];

  const settingsItems = [
    { to: "/settings", label: "Settings", icon: UserCircleIcon },
  ];

  const applicationsItems = [
    { to: "/applications/analytics", label: "Analytics", icon: PieChartIcon },
    { to: "/applications/marketing", label: "Marketing", icon: PieChartIcon },
    { to: "/applications/crm", label: "CRM Stock", icon: UserCircleIcon },
    { to: "/applications/saas", label: "SAAS", icon: GridIcon },
    { to: "/applications/calendar", label: "Calendar", icon: CalenderIcon },
    { to: "/applications/chat", label: "Chat", icon: ChatIcon },
    { to: "/applications/file-manager", label: "File Manager", icon: DocsIcon },
    { to: "/applications/inbox", label: "Email", icon: MailIcon },
    { to: "/applications/task-kanban", label: "Task Kanban", icon: TaskIcon },
    { to: "/applications/task-list", label: "Task List", icon: TaskIcon },
  ];

  return (
    <div className="sidebar-wrapper relative z-[100] h-screen w-[260px] shrink-0 border-r border-gray-100 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-dark-950 max-lg:absolute max-lg:-left-[260px] max-lg:shadow-2xl lg:sticky lg:top-0">
      <div className="flex h-[70px] items-center justify-between border-b border-gray-100 px-5 dark:border-gray-800">
        <NavLink to="/">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
        </NavLink>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden"
        >
          <HorizontaLDots className="h-6 w-6" />
        </button>
      </div>

      <SimpleBar className="h-[calc(100vh-70px)]">
        <div className="px-4 py-6">
          <SidebarSection title="Dashboards" items={dashboardItems} />
          <SidebarSection title="Personalabteilung" items={humanResourcesItems} />
          <SidebarSection title="Quality" items={qualityItems} />
          <SidebarSection title="Projects" items={projectsItems} />
          <SidebarSection title="Risikomanagement" items={riskManagementItems} />
          <SidebarSection title="Organization" items={organizationItems} />
          <SidebarSection title="Reporting" items={reportingItems} /> {/* Neuer Bereich */}
          <SidebarSection title="Settings" items={settingsItems} />
          <SidebarSection title="Applications" items={applicationsItems} />
        </div>
      </SimpleBar>
    </div>
  );
};

export default AppSidebar;