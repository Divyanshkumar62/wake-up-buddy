import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./services/authService";
import "./App.css";
import type { ReactNode } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";

interface PrivateRouteProps {
  children: ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(({ data }: any) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifToast, setShowNotifToast] = useState(false);

  useEffect(() => {
    getCurrentUser().then(({ data }: any) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  // Request notification permissions on app start
  useEffect(() => {
    const requestPermission = async () => {
      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display !== "granted") {
        setShowNotifToast(true);
      }
    };
    requestPermission();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {showNotifToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-br from-red-400 via-yellow-300 to-orange-400 text-white text-lg font-bold flex items-center gap-3 animate-bounce cursor-pointer"
          style={{ minWidth: 250, maxWidth: 350 }}
        >
          <span className="text-2xl">🔔</span>
          <span className="flex-1">
            Please enable notifications to receive your morning reminder!
          </span>
          <button
            onClick={() => setShowNotifToast(false)}
            className="ml-4 px-3 py-1 rounded bg-white/20 hover:bg-white/40 text-white font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
