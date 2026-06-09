import { Navigate } from 'react-router-dom';

type AppRole = 'admin' | 'vendor' | 'user';

interface RoleGateProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

const readUserRole = (): AppRole | null => {
  const rawUser = localStorage.getItem('user');
  if (!rawUser || ['null', 'undefined', ''].includes(rawUser)) return null;

  try {
    const parsed = JSON.parse(rawUser) as { role?: AppRole };
    return parsed.role || null;
  } catch {
    return null;
  }
};

export default function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const token = localStorage.getItem('token');
  const role = readUserRole();

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : role === 'vendor' ? '/vendor-dashboard' : '/'} replace />;
  }

  return <>{children}</>;
}

