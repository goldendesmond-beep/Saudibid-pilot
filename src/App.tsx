import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { OpportunityExplorerPage } from "./pages/OpportunityExplorerPage";
import { MonitoringPage } from "./pages/MonitoringPage";
import { SavedListsPage } from "./pages/SavedListsPage";
import { SourceHealthPage } from "./pages/SourceHealthPage";
import { AwardsPage } from "./pages/AwardsPage";
import { SubcontractRadarPage } from "./pages/SubcontractRadarPage";
import { VendorRegistrationPage } from "./pages/VendorRegistrationPage";
import { ProposalsPage } from "./pages/ProposalsPage";
import { WorkspacePage } from "./pages/WorkspacePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <OpportunityExplorerPage /> },
      { path: "monitoring", element: <MonitoringPage /> },
      { path: "awards", element: <AwardsPage /> },
      { path: "subcontract-radar", element: <SubcontractRadarPage /> },
      { path: "vendor-registration", element: <VendorRegistrationPage /> },
      { path: "proposals", element: <ProposalsPage /> },
      { path: "saved-lists", element: <SavedListsPage /> },
      { path: "source-health", element: <SourceHealthPage /> },
      { path: "workspace", element: <WorkspacePage /> },
      { path: "analytics", element: <AnalyticsPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}

