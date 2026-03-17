import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // ['rapper', 'producer', 'listener', 'admin']
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Agar user login nahi hai
  if (!user) {
    console.log("🚫 Guard: No user found, throwing to /roles");
    return <Navigate to="/roles" replace />;
  }

  // 3. ROLE MATCHING FIX (Sabko lowercase karke match karo taaki koi error na aaye)
  const userRole = (user.role || '').toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    console.warn(`🚨 Guard: Role mismatch! User is '${userRole}', but needs:`, normalizedAllowedRoles);
    return <Navigate to="/roles" replace />;
  }

  // 4. Sab Sahi Hai! Entry de do
  return <>{children}</>;
};