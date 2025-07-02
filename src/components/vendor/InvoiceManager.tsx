import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { Invoice, Order } from '../../types';

export const InvoiceManager: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedOrders = localStorage.getItem('orders');
    
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
    
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const getOrderDetails = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    const updatedInvoices = invoices.map(invoice =>
      invoice.id === invoiceId ? { ...invoice, status } : invoice
    );
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    const order = getOrderDetails(invoice.orderId);
    if (!order) return;

    // In a real application, you would generate a proper PDF
    // For this demo, we'll show the invoice details in an alert
    const invoiceDetails = `
INVOICE: ${invoice.id}
Generated: ${formatDate(invoice.generatedDate)}
Due Date: ${formatDate(invoice.dueDate)}

Customer: ${order.customerName}
Phone: ${order.customerPhone}
Address: ${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zipCode}

Items:
${order.items.map(item => `${item.name} (${item.size}) × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: $${invoice.amount.toFixed(2)}
Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
    `;
    
    alert(invoiceDetails);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Invoice Management</h2>
        <div className="text-sm text-gray-500">
          Total Invoices: {invoices.length}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices</h3>
          <p className="text-gray-500">Generate invoices from completed orders to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const order = getOrderDetails(invoice.orderId);
            return (
              <div key={invoice.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Invoice {invoice.id}</h3>
                    <p className="text-sm text-gray-500">Order #{invoice.orderId}</p>
                    {order && (
                      <>
                        <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
                        <p className="text-sm text-gray-500">Phone: {order.customerPhone}</p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">${invoice.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Generated Date</label>
                    <p className="text-sm text-gray-900">{formatDate(invoice.generatedDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <p className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</p>
                  </div>
                </div>

                {order && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} ({item.size}) × {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <select
                      value={invoice.status}
                      onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value as Invoice['status'])}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => generateInvoicePDF(invoice)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => generateInvoicePDF(invoice)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};