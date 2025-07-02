import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Droplets, MapPin, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ServiceArea } from '../types';
import { getServiceAreas } from '../services/database';

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'customer' | 'vendor'>('customer');
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  useEffect(() => {
    // Load service areas from database
    loadServiceAreas();
  }, []);

  const loadServiceAreas = async () => {
    try {
      const { data, error } = await getServiceAreas();
      if (!error && data) {
        const areas: ServiceArea[] = data.map(area => ({
          id: area.id,
          name: area.name,
          vendorId: area.vendor_id || '',
          vendorName: area.vendor_name,
          createdDate: area.created_at,
        }));
        setServiceAreas(areas);
      }
    } catch (error) {
      console.error('Error loading service areas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(formData.userId, formData.password, userType);
        if (!success) {
          setError('Invalid credentials or user type');
        }
      } else {
        // Validation for registration
        if (userType === 'customer' && !selectedAreaId) {
          setError('Please select a service area');
          setLoading(false);
          return;
        }
        
        if (userType === 'vendor' && !newAreaName.trim()) {
          setError('Please enter the area you will serve');
          setLoading(false);
          return;
        }

        let areaId = selectedAreaId;
        
        // If vendor, check if area name already exists
        if (userType === 'vendor') {
          const existingArea = serviceAreas.find(area => 
            area.name.toLowerCase() === newAreaName.toLowerCase()
          );
          
          if (existingArea) {
            setError('This area already has a vendor. Please choose a different area.');
            setLoading(false);
            return;
          }
        }

        const userData = {
          userId: formData.userId,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          type: userType,
          areaId: userType === 'customer' ? areaId : undefined,
          serviceArea: userType === 'vendor' ? newAreaName.trim() : undefined,
        };

        success = await register(userData, areaId, formData);
        
        if (!success) {
          setError('User ID already exists');
        }
      }

      if (success) {
        onSuccess();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <Droplets className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AquaFlow</h1>
          <p className="text-gray-600">Premium Water Delivery Service</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ml-2 ${
                !isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  userType === 'customer'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">Customer</div>
                <div className="text-xs text-gray-500">Order water delivery</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('vendor')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  userType === 'vendor'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">Vendor</div>
                <div className="text-xs text-gray-500">Manage deliveries</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                User ID
              </label>
              <input
                type="text"
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter unique user ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Service Area Selection */}
                {userType === 'customer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Service Area
                    </label>
                    <select
                      required
                      value={selectedAreaId}
                      onChange={(e) => setSelectedAreaId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select your area</option>
                      {serviceAreas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name} - {area.vendorName}
                        </option>
                      ))}
                    </select>
                    {serviceAreas.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">No service areas available yet</p>
                    )}
                  </div>
                )}

                {userType === 'vendor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Service Area (Create New)
                    </label>
                    <input
                      type="text"
                      required
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Downtown, North Side, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the area you will serve</p>
                  </div>
                )}

                {/* Address for customers */}
                {userType === 'customer' && !isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter street address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="State"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        required
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ZIP Code"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};