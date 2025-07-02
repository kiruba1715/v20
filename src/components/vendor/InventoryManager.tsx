import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem } from '../../types';

export const InventoryManager: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
  });

  useEffect(() => {
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
      const allInventory = JSON.parse(savedInventory);
      const vendorInventory = allInventory.filter((item: InventoryItem) => item.vendorId === user?.id);
      setInventory(vendorInventory);
    } else {
      // Initialize with default inventory for this vendor
      if (user?.id) {
        const defaultInventory: InventoryItem[] = [
          { id: `${user.id}-1`, name: 'Pure Water', price: 45, stock: 50, description: 'Premium purified water', vendorId: user.id },
          { id: `${user.id}-2`, name: 'Spring Water', price: 55, stock: 30, description: 'Natural spring water', vendorId: user.id },
          { id: `${user.id}-3`, name: 'Alkaline Water', price: 65, stock: 25, description: 'pH balanced alkaline water', vendorId: user.id },
        ];
        setInventory(defaultInventory);
        localStorage.setItem('inventory', JSON.stringify(defaultInventory));
      }
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      description: '',
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    
    if (editingItem) {
      // Update existing item
      const updatedItem = {
        ...editingItem,
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
      };
      
      const updatedAllInventory = allInventory.map((item: InventoryItem) =>
        item.id === editingItem.id ? updatedItem : item
      );
      
      const vendorInventory = updatedAllInventory.filter((item: InventoryItem) => item.vendorId === user?.id);
      setInventory(vendorInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedAllInventory));
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: `${user?.id}-${Date.now()}`,
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
        vendorId: user?.id || '',
      };
      
      const updatedAllInventory = [...allInventory, newItem];
      const vendorInventory = [...inventory, newItem];
      setInventory(vendorInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedAllInventory));
    }
    
    resetForm();
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      price: item.price.toString(),
      stock: item.stock.toString(),
      description: item.description,
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (itemId: string) => {
    const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const updatedAllInventory = allInventory.filter((item: InventoryItem) => item.id !== itemId);
    const vendorInventory = updatedAllInventory.filter((item: InventoryItem) => item.vendorId === user?.id);
    setInventory(vendorInventory);
    localStorage.setItem('inventory', JSON.stringify(updatedAllInventory));
  };

  const updateStock = (itemId: string, newStock: number) => {
    const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const updatedAllInventory = allInventory.map((item: InventoryItem) =>
      item.id === itemId ? { ...item, stock: newStock } : item
    );
    const vendorInventory = updatedAllInventory.filter((item: InventoryItem) => item.vendorId === user?.id);
    setInventory(vendorInventory);
    localStorage.setItem('inventory', JSON.stringify(updatedAllInventory));
  };

  const updatePrice = (itemId: string, newPrice: number) => {
    const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const updatedAllInventory = allInventory.map((item: InventoryItem) =>
      item.id === itemId ? { ...item, price: newPrice } : item
    );
    const vendorInventory = updatedAllInventory.filter((item: InventoryItem) => item.vendorId === user?.id);
    setInventory(vendorInventory);
    localStorage.setItem('inventory', JSON.stringify(updatedAllInventory));
  };

  const lowStockItems = inventory.filter(item => item.stock < 50);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Inventory Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Product
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-800">Low Stock Alert</h3>
          </div>
          <p className="text-yellow-700 mb-2">The following items have stock below 50 cans:</p>
          <ul className="list-disc list-inside text-yellow-700">
            {lowStockItems.map(item => (
              <li key={item.id}>{item.name} - {item.stock} cans remaining</li>
            ))}
          </ul>
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Pure Water"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Can (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity (Cans)</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Product description..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingItem ? 'Update Product' : 'Add Product'}
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

      {/* Inventory List */}
      <div className="space-y-4">
        {inventory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products</h3>
            <p className="text-gray-500">Add your first product to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">20L Can</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Price:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Stock:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.stock}
                        onChange={(e) => updateStock(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.stock >= 50 ? 'bg-green-100 text-green-800' :
                        item.stock > 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.stock >= 50 ? 'Good Stock' :
                         item.stock > 10 ? 'Low Stock' :
                         'Critical'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};