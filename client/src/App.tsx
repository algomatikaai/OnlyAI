import { Switch, Route } from "wouter";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import CreatorProfile from "@/pages/creator-profile";
import Create from "@/pages/create";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import MyProfile from "@/pages/my-profile";
import NotFound from "@/pages/not-found";
import MainLayout from "@/layouts/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/discover" component={Discover} />
      <Route path="/creator/:username" component={CreatorProfile} />
      <Route path="/create" component={Create} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={MyProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <MainLayout>
      <Router />
    </MainLayout>
  );
}

export default App;
