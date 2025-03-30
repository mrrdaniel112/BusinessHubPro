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
import { lazy, Suspense, useEffect } from "react";

// No need to declare global types when we use a proper debounce approach

// Import the new components
import BankReconciliation from "./pages/bank-reconciliation";
import BudgetPlanning from "./pages/budget-planning";
import InventoryCostAnalysis from "./pages/inventory-cost-analysis";
import PayrollProcessing from "./pages/payroll-processing";
import TimeTracking from "./pages/time-tracking";
import ClientManagement from "./pages/client-management";
import EmployeeManagement from "./pages/employee-management";

// Import legal pages
import LegalHub from "./pages/legal/index";
import TermsOfService from "./pages/legal/terms";
import PrivacyPolicy from "./pages/legal/privacy";
import LegalDisclaimers from "./pages/legal/disclaimers";

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
      
      {/* Legal pages - public access */}
      <Route path="/legal" component={LegalHub} />
      <Route path="/legal/terms" component={TermsOfService} />
      <Route path="/legal/privacy" component={PrivacyPolicy} />
      <Route path="/legal/disclaimers" component={LegalDisclaimers} />
      
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
      
      <Route path="/employee-management">
        {() => (
          <ProtectedRouteWithLayout>
            <EmployeeManagement />
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

// Fix for iOS Safari 100vh viewport height issue
const setViewportHeight = () => {
  // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
  const vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  // For debugging iOS issues - add a class to the body if on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  if (isIOS) {
    document.body.classList.add('ios-device');
  } else {
    document.body.classList.remove('ios-device');
  }
};

function App() {
  // Set up viewport height fix for iOS
  useEffect(() => {
    // Set the height initially
    setViewportHeight();
    
    // Add event listeners to update on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // iOS-specific event for when the address bar appears/disappears
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      // Debounce the event to prevent too many calls
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(setViewportHeight, 250);
    };
    window.addEventListener('scroll', handleScroll);

    // Handle iOS fullscreen issues on navigation
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setViewportHeight();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // Clean up event listeners on component unmount
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(scrollTimeout); // Clear any pending timeouts
    };
  }, []);

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
