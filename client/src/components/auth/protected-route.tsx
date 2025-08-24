import { useAuthStore } from "@/lib/auth";
import { Route, Redirect, RouteComponentProps } from "wouter";
import { ComponentType } from "react";

interface ProtectedRouteProps {
  path: string;
  component: ComponentType<RouteComponentProps>;
}

export default function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect to="/auth/login" />;
  }

  return <Route path={path} component={Component} />;
}
