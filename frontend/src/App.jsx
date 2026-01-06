import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './admin/AdminAuthContext';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomerDetail from './components/CustomerDetail';
import Suppliers from './components/Suppliers';
import SupplierDetail from './components/SupplierDetail';
import Profile from './components/Profile';
import Analytics from './components/Analytics';
import Cashbook from './components/Cashbook';
import ContactUs from './components/ContactUs';
import CustomerMessagesList from './components/CustomerMessagesList';
import CustomerLogin from './customer/CustomerLogin';
import CustomerPortal from './customer/CustomerPortal';
import CustomerMessages from './customer/CustomerMessages';
import CustomerTransactions from './customer/CustomerTransactions';

// Admin Components
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminUserDetails from './admin/AdminUserDetails';
import AdminMessages from './admin/AdminMessages';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" />;
}

function AdminProtectedRoute({ children }) {
  const { admin } = useAdminAuth();
  return admin ? children : <Navigate to="/admin/login" />;
}

function AdminPublicRoute({ children }) {
  const { admin } = useAdminAuth();
  return !admin ? children : <Navigate to="/admin/dashboard" />;
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* User Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cashbook" 
                element={
                  <ProtectedRoute>
                    <Cashbook />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/:id" 
                element={
                  <ProtectedRoute>
                    <CustomerDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/suppliers" 
                element={
                  <ProtectedRoute>
                    <Suppliers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/suppliers/:id" 
                element={
                  <ProtectedRoute>
                    <SupplierDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <ProtectedRoute>
                    <ContactUs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer-messages" 
                element={
                  <ProtectedRoute>
                    <CustomerMessagesList />
                  </ProtectedRoute>
                } 
              />

              {/* Customer Portal Routes */}
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route path="/customer/portal" element={<CustomerPortal />} />
              <Route path="/customer/transactions" element={<CustomerTransactions />} />
              <Route path="/customer/messages" element={<CustomerMessages />} />

              {/* Admin Routes */}
              <Route 
                path="/admin/login" 
                element={
                  <AdminPublicRoute>
                    <AdminLogin />
                  </AdminPublicRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminProtectedRoute>
                    <AdminUsers />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users/:userId" 
                element={
                  <AdminProtectedRoute>
                    <AdminUserDetails />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/messages" 
                element={
                  <AdminProtectedRoute>
                    <AdminMessages />
                  </AdminProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;