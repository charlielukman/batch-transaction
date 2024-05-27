import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import AdminPage from "./page/AdminPage";
import { ProtectedRoute } from "./components/protected-route";
import "./App.css";
import { AuthProvider } from "./hooks/useAuth";
import CreateTransactionPage from "./page/CreateTransactionPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-transaction"
            element={
              <ProtectedRoute>
                <CreateTransactionPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
