import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Address, ServiceArea } from '../../types';
import { 
  getServiceAreas, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  getUserAddresses 
} from '../../services/database';

export const AddressManager: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    areaId: '',
    isDefault: false,
  });

  useEffect(() => {
    loadServiceAreas();
    loadAddresses();
  }, [user]);

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

  const loadAddresses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await getUserAddresses(user.id);
      if (!error && data) {
        const userAddresses: Address[] = data.map(addr => ({
          id: addr.id,
          label: addr.label,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zip_code,
          isDefault: addr.is_default,
          areaId: addr.area_id || '',
        }));
        setAddresses(userAddresses);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      areaId: '',
      isDefault: false,
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.areaId) {
      alert('Please select a service area');
      return;
    }

    if (!user) return;
    
    setLoading(true);
    
    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await updateAddress(editingAddress.id, {
          label: formData.label,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          areaId: formData.areaId,
          isDefault: formData.isDefault,
        });
        
        if (!error) {
          await loadAddresses();
        }
      } else {
        // Add new address
        const { error } = await createAddress({
          userId: user.id,
          label: formData.label,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          areaId: formData.areaId,
          isDefault: formData.isDefault || addresses.length === 0,
        });
        
        if (!error) {
          await loadAddresses();
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      areaId: address.areaId,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    try {
      const { error } = await deleteAddress(addressId);
      if (!error) {
        await loadAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const setAsDefault = async (addressId: string) => {
    try {
      // First, set all addresses to non-default
      for (const addr of addresses) {
        if (addr.isDefault) {
          await updateAddress(addr.id, { isDefault: false });
        }
      }
      
      // Then set the selected address as default
      const { error } = await updateAddress(addressId, { isDefault: true });
      if (!error) {
        await loadAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const getAreaName = (areaId: string) => {
    const area = serviceAreas.find(a => a.id === areaId);
    return area ? `${area.name} - ${area.vendorName}` : 'Unknown Area';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Delivery Addresses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Address
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                required
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Home, Office"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
              <select
                required
                value={formData.areaId}
                onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select service area</option>
                {serviceAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} - {area.vendorName}
                  </option>
                ))}
              </select>
            </div>
            
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Addresses</h3>
            <p className="text-gray-500">Add your first delivery address to get started.</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{address.label}</h3>
                    {address.isDefault && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        <Home className="w-3 h-3 inline mr-1" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">{address.street}</p>
                  <p className="text-gray-600 mb-1">{address.city}, {address.state} {address.zipCode}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {getAreaName(address.areaId)}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => setAsDefault(address.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};