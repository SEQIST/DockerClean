// src/routes.tsx
import Ecommerce from "./pages/Dashboard/Ecommerce.tsx";
import Settings from "./pages/Settings.tsx";
import Crm from "./pages/Dashboard/Crm.tsx";
import Marketing from "./pages/Dashboard/Marketing.tsx";
import Analytics from "./pages/Dashboard/Analytics.tsx";
import SignIn from "./pages/AuthPages/SignIn.tsx";
import SignUp from "./pages/AuthPages/SignUp.tsx";
import NotFound from "./pages/OtherPage/NotFound.tsx";
import Carousel from "./pages/UiElements/Carousel.tsx";
import Maintenance from "./pages/OtherPage/Maintenance.tsx";
import FiveZeroZero from "./pages/OtherPage/FiveZeroZero.tsx";
import FiveZeroThree from "./pages/OtherPage/FiveZeroThree.tsx";
import Videos from "./pages/UiElements/Videos.tsx";
import Images from "./pages/UiElements/Images.tsx";
import Alerts from "./pages/UiElements/Alerts.tsx";
import Badges from "./pages/UiElements/Badges.tsx";
import Pagination from "./pages/UiElements/Pagination.tsx";
import Avatars from "./pages/UiElements/Avatars.tsx";
import Buttons from "./pages/UiElements/Buttons.tsx";
import ButtonsGroup from "./pages/UiElements/ButtonsGroup.tsx";
import Notifications from "./pages/UiElements/Notifications.tsx";
import LineChart from "./pages/Charts/LineChart.tsx";
import BarChart from "./pages/Charts/BarChart.tsx";
import PieChart from "./pages/Charts/PieChart.tsx";
import Invoices from "./pages/Invoices.tsx";
import ComingSoon from "./pages/OtherPage/ComingSoon.tsx";
import FileManager from "./pages/FileManager.tsx";
import Calendar from "./pages/Calendar.tsx";
import BasicTables from "./pages/Tables/BasicTables.tsx";
import DataTables from "./pages/Tables/DataTables.tsx";
import PricingTables from "./pages/PricingTables.tsx";
import Faqs from "./pages/Faqs.tsx";
import Chats from "./pages/Chat/Chats.tsx";
import FormElements from "./pages/Forms/FormElements.tsx";
import FormLayout from "./pages/Forms/FormLayout.tsx";
import Blank from "./pages/Blank.tsx";
import EmailInbox from "./pages/Email/EmailInbox.tsx";
import EmailDetails from "./pages/Email/EmailDetails.tsx";
import TaskKanban from "./pages/Task/TaskKanban.tsx";
import BreadCrumb from "./pages/UiElements/BreadCrumb.tsx";
import Cards from "./pages/UiElements/Cards.tsx";
import Dropdowns from "./pages/UiElements/Dropdowns.tsx";
import Links from "./pages/UiElements/Links.tsx";
import Lists from "./pages/UiElements/Lists.tsx";
import Popovers from "./pages/UiElements/Popovers.tsx";
import Progressbar from "./pages/UiElements/Progressbar.tsx";
import Ribbons from "./pages/UiElements/Ribbons.tsx";
import Spinners from "./pages/UiElements/Spinners.tsx";
import Tabs from "./pages/UiElements/Tabs.tsx";
import Tooltips from "./pages/UiElements/Tooltips.tsx";
import Modals from "./pages/UiElements/Modals.tsx";
import ResetPassword from "./pages/AuthPages/ResetPassword.tsx";
import TwoStepVerification from "./pages/AuthPages/TwoStepVerification.tsx";
import Success from "./pages/OtherPage/Success.tsx";
import AppLayout from "./layout/AppLayout.tsx";
import TaskList from "./pages/Task/TaskList.tsx";
import Saas from "./pages/Dashboard/Saas.tsx";

// Import für Reporting
import ReportsPage from "./features/reporting/pages/ReportsPage.tsx";
import StandardReportsPage from "./features/reporting/pages/StandardReportsPage.tsx";
import QueryEditor from "./features/reporting/pages/QueryEditor.tsx";
import RoleHandbook from "./features/reporting/pages/RoleHandbook.tsx";

// Imports für Human Resources
import Departments from './features/departments/pages/Departments.tsx';
import DepartmentsFlow from './features/departments/pages/DepartmentsFlow.tsx';
import RolesPage from './features/roles/pages/RolesPage.tsx';

// Imports für Quality
import WorkProductPage from './features/workproducts/pages/WorkProductPage.tsx';
import WorkProductsTree from './features/workproductstree/pages/WorkProductsTree.tsx';
import ActivitiesPage from './features/activities/pages/ActivitiesPage.tsx';
import ActivityEditWrapper from './features/activities/components/ActivityEditWrapper.tsx';
import ProcessesPage from './features/processes/pages/ProcessesPage.tsx';
import ProcessAddPage from './features/processes/pages/ProcessAddPage.tsx';
import ProcessEditPage from './features/processes/pages/ProcessEditPage.tsx';
import ProcessDetailsPage from './features/processes/pages/ProcessDetailsPage.tsx';
import ProcessCalculation from './features/processes/pages/ProcessCalculation.tsx';
import RegulatoryPage from './features/regulatory/pages/RegulatoryPage.tsx';
import RegulatoryFlowPage from './features/regulatory/pages/RegulatoryFlowPage.tsx';

// Imports für Projects
import Projects from './features/projects/pages/Projects.tsx';
import ProjectDetails from './features/projects/pages/ProjectDetails.tsx';
import ProjectCalculation from './features/projects/pages/ProjectCalculation.tsx';
import ProjectSimulation from './features/projects/pages/ProjectSimulation.tsx';

// Imports für Risikomanagement
import RiskManagement from './features/riskmanagement/pages/RiskManagement.tsx';
import RiskEdit from './features/riskmanagement/pages/RiskEdit.tsx';
import RiskMatrixSettings from './features/riskmanagement/pages/RiskMatrixSettings.tsx';

// Imports für Organisation
import OrganizationPage from "./features/organization/pages/OrganizationPage.tsx";
import EditCompanyPage from "./features/organization/pages/EditCompanyPage.tsx";
import AddSubsidiaryPage from "./features/organization/pages/AddSubsidiaryPage.tsx";
import EditSubsidiaryPage from "./features/organization/pages/EditSubsidiaryPage.tsx";

const routes = () => [
  // Dashboard Layout
  {
    element: <AppLayout />,
    children: [
      { index: true, path: "/", element: <Ecommerce /> },

      // Applications
      { path: "/applications/analytics", element: <Analytics /> },
      { path: "/applications/marketing", element: <Marketing /> },
      { path: "/applications/crm", element: <Crm /> },
      { path: "/applications/saas", element: <Saas /> },
      { path: "/applications/calendar", element: <Calendar /> },
      { path: "/applications/chat", element: <Chats /> },
      { path: "/applications/file-manager", element: <FileManager /> },
      { path: "/applications/inbox", element: <EmailInbox /> },
      { path: "/applications/inbox-details", element: <EmailDetails /> },
      { path: "/applications/task-kanban", element: <TaskKanban /> },
      { path: "/applications/task-list", element: <TaskList /> },

      // Settings
      { path: "/settings", element: <Settings /> },

      // Others Page
      { path: "/invoice", element: <Invoices /> },
      { path: "/faq", element: <Faqs /> },
      { path: "/pricing-tables", element: <PricingTables /> },
      { path: "/blank", element: <Blank /> },

      // Forms
      { path: "/form-elements", element: <FormElements /> },
      { path: "/form-layout", element: <FormLayout /> },

      // Tables
      { path: "/basic-tables", element: <BasicTables /> },
      { path: "/data-tables", element: <DataTables /> },

      // Ui Elements
      { path: "/alerts", element: <Alerts /> },
      { path: "/avatars", element: <Avatars /> },
      { path: "/badge", element: <Badges /> },
      { path: "/breadcrumb", element: <BreadCrumb title="Breadcrumb" pageTitle="UI Elements" /> },
      { path: "/buttons", element: <Buttons /> },
      { path: "/buttons-group", element: <ButtonsGroup /> },
      { path: "/cards", element: <Cards /> },
      { path: "/carousel", element: <Carousel /> },
      { path: "/dropdowns", element: <Dropdowns /> },
      { path: "/images", element: <Images /> },
      { path: "/links", element: <Links /> },
      { path: "/list", element: <Lists /> },
      { path: "/modals", element: <Modals /> },
      { path: "/notifications", element: <Notifications /> },
      { path: "/pagination", element: <Pagination /> },
      { path: "/popovers", element: <Popovers /> },
      { path: "/progress-bar", element: <Progressbar /> },
      { path: "/ribbons", element: <Ribbons /> },
      { path: "/spinners", element: <Spinners /> },
      { path: "/tabs", element: <Tabs /> },
      { path: "/tooltips", element: <Tooltips /> },
      { path: "/videos", element: <Videos /> },

      // Charts
      { path: "/line-chart", element: <LineChart /> },
      { path: "/bar-chart", element: <BarChart /> },
      { path: "/pie-chart", element: <PieChart /> },

      // Routen für Organisation
      { path: "/organization", element: <OrganizationPage /> },
      { path: "/add-subsidiary", element: <AddSubsidiaryPage /> },
      { path: "/edit-company/:id", element: <EditCompanyPage /> },
      { path: "/edit-subsidiary/:id", element: <EditSubsidiaryPage /> },

      // Routen für Personalabteilung
      { path: "/humanresources/roles", element: <RolesPage /> },
      { path: "/humanresources/departments", element: <Departments /> },
      { path: "/humanresources/departments-flow", element: <DepartmentsFlow /> },

      // Routen für Quality
      { path: "/quality/work-products", element: <WorkProductPage /> },
      { path: "/quality/work-products-tree", element: <WorkProductsTree /> },
      { path: "/quality/activities", element: <ActivitiesPage /> },
      { path: "/quality/activities/edit/:id", element: <ActivityEditWrapper onSave={() => Promise.resolve()} /> },
      { path: "/quality/activities/add", element: <ActivityEditWrapper onSave={() => Promise.resolve()} /> },
      { path: "/quality/processes", element: <ProcessesPage /> },
      { path: "/quality/processes/add", element: <ProcessAddPage /> },
      { path: "/quality/processes/edit/:id", element: <ProcessEditPage /> },
      { path: "/quality/processes/details/:id", element: <ProcessDetailsPage /> },
      { path: "/process-calculation/:type/:id", element: <ProcessCalculation /> },
      { path: "/quality/compliance/regulatory", element: <RegulatoryPage /> },
      { path: "/quality/compliance/regulatory-flow", element: <RegulatoryFlowPage /> },

      // Routen für Projects
      { path: "/projects", element: <Projects /> },
      { path: "/projects/details/:id", element: <ProjectDetails /> },
      { path: "/project-calculation/:type/:id", element: <ProjectCalculation /> },
      { path: "/projects/simulation/:id", element: <ProjectSimulation /> },

      // Routen für reporting
      { path: "/reports", element: <ReportsPage /> },
      { path: "/standardreports", element: <StandardReportsPage /> },
      { path: "/query-editor", element: <QueryEditor /> },
      { path: "/role-handbook", element: <RoleHandbook /> },
      
      // Routen für Risikomanagement
      { path: "/riskmanagement", element: <RiskManagement /> },
      { path: "/riskmanagement/edit/:id", element: <RiskEdit /> },
      { path: "/riskmanagement/matrix-settings", element: <RiskMatrixSettings /> },
    ],
  },

  // Auth Layout
  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/two-step-verification", element: <TwoStepVerification /> },

  // Fallback Route
  { path: "*", element: <NotFound /> },
  { path: "/maintenance", element: <Maintenance /> },
  { path: "/success", element: <Success /> },
  { path: "/five-zero-zero", element: <FiveZeroZero /> },
  { path: "/five-zero-three", element: <FiveZeroThree /> },
  { path: "/coming-soon", element: <ComingSoon /> },
];

export default routes;