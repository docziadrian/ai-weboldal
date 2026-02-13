import { Route, Switch, Redirect } from "wouter";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {isLoggedIn ? <Redirect to="/" /> : <Login />}
      </Route>
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      {/* Add your service routes here, also protected */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}