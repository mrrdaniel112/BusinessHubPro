import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Financials from "@/pages/financials";
import Inventory from "@/pages/inventory";
import Contracts from "@/pages/contracts";
import Expenses from "@/pages/expenses";
import Invoices from "@/pages/invoices";
import AiInsights from "@/pages/ai-insights";
import BusinessAssistant from "@/pages/business-assistant";
import AdminDashboard from "@/pages/admin-dashboard";
import Login from "@/pages/login";
import Calendar from "@/pages/calendar";
import Profile from "@/pages/profile";
import TaxManagement from "@/pages/tax-management";
import MainLayout from "@/components/layout/main-layout";
import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { lazy, Suspense } from "react";

// Import the new components
import BankReconciliation from "./pages/bank-reconciliation";
import BudgetPlanning from "./pages/budget-planning";
import InventoryCostAnalysis from "./pages/inventory-cost-analysis";
import PayrollProcessing from "./pages/payroll-processing";
import TimeTracking from "./pages/time-tracking";
import ClientManagement from "./pages/client-management";

function ProtectedRouteWithLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        {() => (
          <ProtectedRouteWithLayout>
            <Dashboard />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/financials">
        {() => (
          <ProtectedRouteWithLayout>
            <Financials />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/inventory">
        {() => (
          <ProtectedRouteWithLayout>
            <Inventory />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/contracts">
        {() => (
          <ProtectedRouteWithLayout>
            <Contracts />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/expenses">
        {() => (
          <ProtectedRouteWithLayout>
            <Expenses />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/invoices">
        {() => (
          <ProtectedRouteWithLayout>
            <Invoices />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/ai-insights">
        {() => (
          <ProtectedRouteWithLayout>
            <AiInsights />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/business-assistant">
        {() => (
          <ProtectedRouteWithLayout>
            <BusinessAssistant />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/admin">
        {() => (
          <ProtectedRouteWithLayout>
            <AdminDashboard />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/calendar">
        {() => (
          <ProtectedRouteWithLayout>
            <Calendar />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/profile">
        {() => (
          <ProtectedRouteWithLayout>
            <Profile />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      {/* New Feature Routes */}
      <Route path="/tax-management">
        {() => (
          <ProtectedRouteWithLayout>
            <TaxManagement />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/bank-reconciliation">
        {() => (
          <ProtectedRouteWithLayout>
            <BankReconciliation />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/budget-planning">
        {() => (
          <ProtectedRouteWithLayout>
            <BudgetPlanning />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/inventory-cost-analysis">
        {() => (
          <ProtectedRouteWithLayout>
            <InventoryCostAnalysis />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/payroll-processing">
        {() => (
          <ProtectedRouteWithLayout>
            <PayrollProcessing />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/time-tracking">
        {() => (
          <ProtectedRouteWithLayout>
            <TimeTracking />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route path="/client-management">
        {() => (
          <ProtectedRouteWithLayout>
            <ClientManagement />
          </ProtectedRouteWithLayout>
        )}
      </Route>
      
      <Route>
        {() => (
          <ProtectedRouteWithLayout>
            <NotFound />
          </ProtectedRouteWithLayout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
