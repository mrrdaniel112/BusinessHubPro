import VerifyEmail from "@/pages/verify-email";

function Router() {
  return (
    <Switch>
      {/* Add this route before the protected routes */}
      <Route path="/verify-email" component={VerifyEmail} />
      
      {/* ... existing routes ... */}
    </Switch>
  );
} 