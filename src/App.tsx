import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { VendorDashboard } from './components/vendor/VendorDashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(true);

  useEffect(() => {
    if (user) {
      setShowAuth(false);
    } else {
      setShowAuth(true);
    }
  }, [user]);

  if (showAuth) {
    return <AuthForm onSuccess={() => setShowAuth(false)} />;
  }

  if (user?.type === 'customer') {
    return <CustomerDashboard />;
  }

  if (user?.type === 'vendor') {
    return <VendorDashboard />;
  }

  return null;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;