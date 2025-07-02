import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, FileText, Bell, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order, InventoryItem } from '../../types';

export const OrderManagement: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    // Filter orders for this vendor's area only
    const vendorOrders = savedOrders.filter((order: Order) => order.vendorId === user?.id);
    setOrders(vendorOrders.sort((a: Order, b: Order) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = allOrders.map((order: Order) =>
      order.id === orderId ? { ...order, status } : order
    );
    
    // If marking as delivered, decrease inventory
    if (status === 'delivered') {
      const order = allOrders.find((o: Order) => o.id === orderId);
      if (order) {
        const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        const updatedInventory = allInventory.map((item: InventoryItem) => {
          const orderItem = order.items.find((oi: any) => oi.id === item.id);
          if (orderItem) {
            return { ...item, stock: Math.max(0, item.stock - orderItem.quantity) };
          }
          return item;
        });
        localStorage.setItem('inventory', JSON.stringify(updatedInventory));
      }
    }
    
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    loadOrders();
  };

  const sendMessage = (orderId: string) => {
    if (!newMessage.trim()) return;

    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = allOrders.map((order: Order) => {
      if (order.id === orderId) {
        const messages = order.messages || [];
        return {
          ...order,
          messages: [...messages, {
            id: Date.now().toString(),
            sender: 'vendor',
            senderName: user?.name || 'Vendor',
            message: newMessage.trim(),
            timestamp: new Date().toISOString()
          }]
        };
      }
      return order;
    });

    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setNewMessage('');
    loadOrders();
  };

  const generateInvoice = (order: Order) => {
    const invoiceId = `INV-${Date.now()}`;
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = allOrders.map((o: Order) =>
      o.id === order.id ? { ...o, invoiceId } : o
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    loadOrders();
    
    // Save invoice
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const newInvoice = {
      id: invoiceId,
      orderId: order.id,
      amount: order.total,
      generatedDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      status: 'draft',
    };
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    alert(`Invoice ${invoiceId} generated successfully!`);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'acknowledged':
        return <Bell className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-transit':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800';
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(order => order.status === filter);
  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;

  const statusOptions: Order['status'][] = ['acknowledged', 'confirmed', 'in-transit', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
          {pendingOrdersCount > 0 && (
            <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
              <Bell className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{pendingOrdersCount} pending orders</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | Order['status'])}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="pending">Pending ({orders.filter(o => o.status === 'pending').length})</option>
            <option value="acknowledged">Acknowledged ({orders.filter(o => o.status === 'acknowledged').length})</option>
            <option value="confirmed">Confirmed ({orders.filter(o => o.status === 'confirmed').length})</option>
            <option value="in-transit">In Transit ({orders.filter(o => o.status === 'in-transit').length})</option>
            <option value="delivered">Delivered ({orders.filter(o => o.status === 'delivered').length})</option>
            <option value="cancelled">Cancelled ({orders.filter(o => o.status === 'cancelled').length})</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500">No orders match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">Customer: {order.customerName} ({order.customerUserId})</p>
                  <p className="text-sm text-gray-500">Phone: {order.customerPhone}</p>
                  <p className="text-sm text-gray-500">
                    Order Date: {formatDate(order.orderDate)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Delivery: {formatDate(order.deliveryDate)} at {order.preferredTime}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </span>
                  <span className="text-lg font-semibold text-gray-900">₹{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                <p className="text-sm text-gray-600">
                  {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
                </p>
                <p className="text-sm text-blue-600 font-medium">Area: {order.address.label}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} (20L Can) × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Messages</h4>
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    {order.messages?.length || 0} messages
                  </button>
                </div>
                
                {selectedOrder?.id === order.id && (
                  <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                    {order.messages && order.messages.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {order.messages.map((msg) => (
                          <div key={msg.id} className={`text-sm p-2 rounded ${
                            msg.sender === 'vendor' ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'
                          }`}>
                            <div className="font-medium text-xs text-gray-500 mb-1">
                              {msg.senderName} • {formatDate(msg.timestamp)}
                            </div>
                            <div>{msg.message}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No messages yet</p>
                    )}
                    
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(order.id)}
                      />
                      <button
                        onClick={() => sendMessage(order.id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <>
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            status === 'acknowledged' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            status === 'confirmed' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            status === 'in-transit' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                            status === 'delivered' ? 'bg-green-600 text-white hover:bg-green-700' :
                            'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </>
                  )}
                  
                  {order.status !== 'pending' && order.status !== 'cancelled' && (
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex space-x-2">
                  {!order.invoiceId && order.status !== 'cancelled' && (
                    <button
                      onClick={() => generateInvoice(order)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Generate Invoice
                    </button>
                  )}
                  {order.invoiceId && (
                    <span className="text-sm text-green-600 font-medium">
                      Invoice: {order.invoiceId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};