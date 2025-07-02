import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ServiceArea, Address } from '../types';

interface AuthContextType {
  user: User | null;
  login: (userId: string, password: string, userType: 'customer' | 'vendor') => Promise<boolean>;
  register: (userData: Omit<User, 'id'> & { password: string }, areaId?: string, addressData?: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  deleteProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (userId: string, password: string, userType: 'customer' | 'vendor'): Promise<boolean> => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: User & { password: string }) => 
      u.userId === userId && u.type === userType
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (
    userData: Omit<User, 'id'> & { password: string }, 
    areaId?: string, 
    addressData?: any
  ): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: User) => u.userId === userData.userId);
    
    if (existingUser) {
      return false;
    }

    const userId = Date.now().toString();
    let addresses: Address[] = [];

    // Create initial address for customers
    if (userData.type === 'customer' && addressData && areaId) {
      const initialAddress: Address = {
        id: Date.now().toString(),
        label: 'Home',
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        isDefault: true,
        areaId: areaId,
      };
      addresses = [initialAddress];
    }

    const newUser = {
      ...userData,
      id: userId,
      addresses: userData.type === 'customer' ? addresses : undefined,
    };

    // Update service area with vendor ID if vendor
    if (userData.type === 'vendor' && areaId) {
      const serviceAreas = JSON.parse(localStorage.getItem('serviceAreas') || '[]');
      const updatedAreas = serviceAreas.map((area: ServiceArea) =>
        area.id === areaId ? { ...area, vendorId: userId } : area
      );
      localStorage.setItem('serviceAreas', JSON.stringify(updatedAreas));
    }

    const { password: _, ...userWithoutPassword } = newUser;
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update in users list
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  const deleteProfile = () => {
    if (!user) return;

    // Remove user from users list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter((u: User) => u.id !== user.id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // If vendor, remove service area and related data
    if (user.type === 'vendor') {
      // Remove service area
      const serviceAreas = JSON.parse(localStorage.getItem('serviceAreas') || '[]');
      const updatedAreas = serviceAreas.filter((area: ServiceArea) => area.vendorId !== user.id);
      localStorage.setItem('serviceAreas', JSON.stringify(updatedAreas));

      // Remove inventory
      const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      const updatedInventory = inventory.filter((item: any) => item.vendorId !== user.id);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));

      // Remove orders
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = orders.filter((order: any) => order.vendorId !== user.id);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Remove invoices
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const updatedInvoices = invoices.filter((invoice: any) => {
        const order = orders.find((o: any) => o.id === invoice.orderId);
        return !order || order.vendorId !== user.id;
      });
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    } else {
      // If customer, remove their orders
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = orders.filter((order: any) => order.customerId !== user.id);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    }

    // Logout
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, deleteProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};