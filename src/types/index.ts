export interface User {
  id: string;
  userId: string; // Unique user ID instead of email
  name: string;
  type: 'customer' | 'vendor';
  phone?: string;
  addresses?: Address[];
  areaId?: string; // For customers - their selected area
  serviceArea?: string; // For vendors - area they serve
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  areaId: string; // Link address to service area
}

export interface ServiceArea {
  id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  createdDate: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerUserId: string;
  address: Address;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'acknowledged' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate: string;
  preferredTime: string;
  vendorId: string;
  vendorName: string;
  areaId: string;
  invoiceId?: string;
  messages?: OrderMessage[];
}

export interface OrderMessage {
  id: string;
  sender: 'customer' | 'vendor';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  vendorId: string; // Each vendor has their own inventory
}

export interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  generatedDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid';
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalOrders: number;
  totalRevenue: number;
  customerBreakdown: { [customerId: string]: { name: string; orders: number; amount: number } };
}