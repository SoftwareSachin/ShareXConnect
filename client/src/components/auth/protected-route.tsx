import { useAuthStore } from "@/store/auth-store";
import { Redirect, RouteComponentProps } from "wouter";
import { ComponentType } from "react";

interface ProtectedRouteProps {
  path: string;
  component: ComponentType<RouteComponentProps>;
}

export default function ProtectedRoute({ component: Component, ...props }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect to="/auth/login" />;
  }

  return <Component {...props} params={{}} />;
}
