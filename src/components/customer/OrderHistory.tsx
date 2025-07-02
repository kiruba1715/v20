import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, Package, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = savedOrders.filter((order: Order) => order.customerId === user?.id);
    setOrders(userOrders.sort((a: Order, b: Order) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
  }, [user]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateOrderPDF = (order: Order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('AquaFlow - Order Receipt', 20, 20);
    
    // Order details
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 20, 40);
    doc.text(`Customer: ${order.customerName} (${order.customerUserId})`, 20, 50);
    doc.text(`Phone: ${order.customerPhone}`, 20, 60);
    doc.text(`Order Date: ${formatDate(order.orderDate)}`, 20, 70);
    doc.text(`Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString()}`, 20, 80);
    doc.text(`Preferred Time: ${order.preferredTime}`, 20, 90);
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 100);
    
    // Address
    doc.text('Delivery Address:', 20, 120);
    doc.text(`${order.address.street}`, 20, 130);
    doc.text(`${order.address.city}, ${order.address.state} ${order.address.zipCode}`, 20, 140);
    
    // Items table
    const tableData = order.items.map(item => [
      item.name,
      `${item.quantity} cans`,
      `₹${item.price}`,
      `₹${(item.price * item.quantity).toFixed(2)}`
    ]);
    
    doc.autoTable({
      head: [['Product', 'Quantity', 'Price per Can', 'Total']],
      body: tableData,
      startY: 160,
      theme: 'grid'
    });
    
    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Amount: ₹${order.total.toFixed(2)}`, 20, finalY);
    
    doc.save(`order-${order.id}.pdf`);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
        <p className="text-gray-500">Place your first water delivery order to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
      
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Order #{order.id}</h3>
              <p className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                Ordered: {formatDate(order.orderDate)}
              </p>
              <p className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                Delivery: {new Date(order.deliveryDate).toLocaleDateString()} at {order.preferredTime}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <button
                onClick={() => generateOrderPDF(order)}
                className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
            <p className="text-sm text-gray-600">
              <MapPin className="w-4 h-4 inline mr-1" />
              {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
            </p>
            <p className="text-sm text-gray-600">
              <Phone className="w-4 h-4 inline mr-1" />
              {order.customerPhone}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Items</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name} (20L Can) × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-semibold">Total: ₹{order.total.toFixed(2)}</span>
            {order.status === 'pending' && (
              <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                Cancel Order
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};