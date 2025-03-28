import { Switch, Route } from "wouter";
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
import MainLayout from "@/components/layout/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/financials" component={Financials} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/ai-insights" component={AiInsights} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
