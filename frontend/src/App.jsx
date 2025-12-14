import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ComplaintForm from './pages/ComplaintForm';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

import SetUsername from './pages/SetUsername';

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Force Username Setup
  if (!user.displayName) return <Navigate to="/set-username" />;

  return children;
}

const NavBar = () => {
  const { user, isAdmin, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        <ul className="flex items-center gap-6 m-0 p-0 list-none">
          <li>
            <Link to="/" className="text-foreground font-bold hover:text-primary transition-colors text-lg font-serif">
              CampusPulse
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground hidden sm:inline-block">
              {user.displayName ? `Welcome, ${user.displayName}` : user.email}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
          <NavBar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/set-username" element={<SetUsername />} />
              <Route path="/" element={
                <PrivateRoute>
                  <ComplaintForm />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <Dashboard />
                </ProtectedAdminRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
