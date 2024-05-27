import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import  { ReactNode, PropsWithChildren  } from "react";

interface ProtectedRouteProps extends PropsWithChildren {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user } = useAuth() || { user: null, login: () => {}, logout: () => {} };
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};