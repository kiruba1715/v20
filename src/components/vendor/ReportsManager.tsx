import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, User, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order, MonthlyReport } from '../../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const ReportsManager: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const vendorOrders = savedOrders.filter((order: Order) => 
      order.vendorId === user?.id && order.status === 'delivered'
    );
    setOrders(vendorOrders);
    generateMonthlyReports(vendorOrders);
  }, [user]);

  const generateMonthlyReports = (ordersList: Order[]) => {
    const reports: { [key: string]: MonthlyReport } = {};
    
    ordersList.forEach(order => {
      const date = new Date(order.deliveryDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!reports[monthKey]) {
        reports[monthKey] = {
          month: date.toLocaleDateString('en-US', { month: 'long' }),
          year: date.getFullYear(),
          totalOrders: 0,
          totalRevenue: 0,
          customerBreakdown: {}
        };
      }
      
      reports[monthKey].totalOrders++;
      reports[monthKey].totalRevenue += order.total;
      
      if (!reports[monthKey].customerBreakdown[order.customerId]) {
        reports[monthKey].customerBreakdown[order.customerId] = {
          name: order.customerName,
          orders: 0,
          amount: 0
        };
      }
      
      reports[monthKey].customerBreakdown[order.customerId].orders++;
      reports[monthKey].customerBreakdown[order.customerId].amount += order.total;
    });
    
    setMonthlyReports(Object.values(reports).sort((a, b) => 
      new Date(b.year, new Date(`${b.month} 1`).getMonth()).getTime() - 
      new Date(a.year, new Date(`${a.month} 1`).getMonth()).getTime()
    ));
  };

  const getMonthlyData = () => {
    if (!selectedMonth) return null;
    
    const [year, month] = selectedMonth.split('-');
    return monthlyReports.find(report => 
      report.year === parseInt(year) && 
      report.month === new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' })
    );
  };

  const generateMonthlyPDF = () => {
    const monthlyData = getMonthlyData();
    if (!monthlyData) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('AquaFlow - Monthly Report', 20, 20);
    
    // Report details
    doc.setFontSize(12);
    doc.text(`Vendor: ${user?.name}`, 20, 40);
    doc.text(`Month: ${monthlyData.month} ${monthlyData.year}`, 20, 50);
    doc.text(`Total Orders: ${monthlyData.totalOrders}`, 20, 60);
    doc.text(`Total Revenue: ₹${monthlyData.totalRevenue.toFixed(2)}`, 20, 70);
    
    // Customer breakdown table
    const tableData = Object.values(monthlyData.customerBreakdown).map(customer => [
      customer.name,
      customer.orders.toString(),
      `₹${customer.amount.toFixed(2)}`
    ]);
    
    doc.autoTable({
      head: [['Customer Name', 'Orders', 'Total Amount']],
      body: tableData,
      startY: 90,
      theme: 'grid'
    });
    
    doc.save(`monthly-report-${selectedMonth}.pdf`);
  };

  const generateYearlyPDF = () => {
    const yearlyData = monthlyReports.filter(report => report.year === selectedYear);
    if (yearlyData.length === 0) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('AquaFlow - Yearly Report', 20, 20);
    
    // Report details
    doc.setFontSize(12);
    doc.text(`Vendor: ${user?.name}`, 20, 40);
    doc.text(`Year: ${selectedYear}`, 20, 50);
    
    const totalOrders = yearlyData.reduce((sum, report) => sum + report.totalOrders, 0);
    const totalRevenue = yearlyData.reduce((sum, report) => sum + report.totalRevenue, 0);
    
    doc.text(`Total Orders: ${totalOrders}`, 20, 60);
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 20, 70);
    
    // Monthly breakdown table
    const tableData = yearlyData.map(report => [
      report.month,
      report.totalOrders.toString(),
      `₹${report.totalRevenue.toFixed(2)}`
    ]);
    
    doc.autoTable({
      head: [['Month', 'Orders', 'Revenue']],
      body: tableData,
      startY: 90,
      theme: 'grid'
    });
    
    doc.save(`yearly-report-${selectedYear}.pdf`);
  };

  const getAvailableMonths = () => {
    const months = new Set<string>();
    orders.forEach(order => {
      const date = new Date(order.deliveryDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const getAvailableYears = () => {
    const years = new Set<number>();
    orders.forEach(order => {
      const date = new Date(order.deliveryDate);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort().reverse();
  };

  const monthlyData = getMonthlyData();
  const yearlyData = monthlyReports.filter(report => report.year === selectedYear);
  const yearlyTotalOrders = yearlyData.reduce((sum, report) => sum + report.totalOrders, 0);
  const yearlyTotalRevenue = yearlyData.reduce((sum, report) => sum + report.totalRevenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">Business Intelligence</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">{new Set(orders.map(o => o.customerId)).size}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Report */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Report</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Month</option>
              {getAvailableMonths().map(month => {
                const [year, monthNum] = month.split('-');
                const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return (
                  <option key={month} value={month}>{monthName}</option>
                );
              })}
            </select>
            {selectedMonth && (
              <button
                onClick={generateMonthlyPDF}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </button>
            )}
          </div>
        </div>

        {monthlyData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{monthlyData.totalOrders}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">₹{monthlyData.totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer Breakdown</h4>
              <div className="space-y-2">
                {Object.values(monthlyData.customerBreakdown).map((customer, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-900">{customer.name}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">{customer.orders} orders</span>
                      <span className="ml-4 text-sm font-medium text-gray-900">₹{customer.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Select a month to view detailed report</p>
        )}
      </div>

      {/* Yearly Report */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Yearly Report</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {yearlyData.length > 0 && (
              <button
                onClick={generateYearlyPDF}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </button>
            )}
          </div>
        </div>

        {yearlyData.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{yearlyTotalOrders}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">₹{yearlyTotalRevenue.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Monthly Breakdown</h4>
              <div className="space-y-2">
                {yearlyData.map((report, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-900">{report.month}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">{report.totalOrders} orders</span>
                      <span className="ml-4 text-sm font-medium text-gray-900">₹{report.totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No data available for {selectedYear}</p>
        )}
      </div>
    </div>
  );
};