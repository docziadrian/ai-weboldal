import { Route, Switch, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ChatterBlast from "./pages/ChatterBlast";
import DreamWeaver from "./pages/DreamWeaver";
import MindReader from "./pages/MindReader";

function ProtectedRoute({ component: Component, withLayout }: { component: React.ComponentType; withLayout?: boolean }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }
  if (withLayout) {
    return (
      <Layout>
        <Component />
      </Layout>
    );
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
      <Route path="/chatterblast">
        <ProtectedRoute component={ChatterBlast} withLayout />
      </Route>
      <Route path="/dreamweaver">
        <ProtectedRoute component={DreamWeaver} withLayout />
      </Route>
      <Route path="/mindreader">
        <ProtectedRoute component={MindReader} withLayout />
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}