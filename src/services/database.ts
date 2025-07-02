import { supabase } from '../lib/supabase';
import { User, Address, ServiceArea, Order, OrderItem, InventoryItem, Invoice, OrderMessage } from '../types';

// Auth functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// User functions
export const createUser = async (userData: Omit<User, 'id' | 'addresses'>) => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      user_id: userData.userId,
      name: userData.name,
      phone: userData.phone,
      user_type: userData.type,
      area_id: userData.areaId,
      service_area: userData.serviceArea,
    })
    .select()
    .single();

  return { data, error };
};

export const getUserByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      name: updates.name,
      phone: updates.phone,
      area_id: updates.areaId,
      service_area: updates.serviceArea,
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  return { error };
};

// Service Area functions
export const getServiceAreas = async () => {
  const { data, error } = await supabase
    .from('service_areas')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

export const createServiceArea = async (areaData: Omit<ServiceArea, 'id' | 'createdDate'>) => {
  const { data, error } = await supabase
    .from('service_areas')
    .insert({
      name: areaData.name,
      vendor_id: areaData.vendorId,
      vendor_name: areaData.vendorName,
    })
    .select()
    .single();

  return { data, error };
};

export const updateServiceArea = async (id: string, updates: Partial<ServiceArea>) => {
  const { data, error } = await supabase
    .from('service_areas')
    .update({
      name: updates.name,
      vendor_id: updates.vendorId,
      vendor_name: updates.vendorName,
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteServiceArea = async (id: string) => {
  const { error } = await supabase
    .from('service_areas')
    .delete()
    .eq('id', id);

  return { error };
};

// Address functions
export const getUserAddresses = async (userId: string) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  return { data, error };
};

export const createAddress = async (addressData: Omit<Address, 'id'> & { userId: string }) => {
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: addressData.userId,
      label: addressData.label,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      zip_code: addressData.zipCode,
      is_default: addressData.isDefault,
      area_id: addressData.areaId,
    })
    .select()
    .single();

  return { data, error };
};

export const updateAddress = async (id: string, updates: Partial<Address>) => {
  const { data, error } = await supabase
    .from('addresses')
    .update({
      label: updates.label,
      street: updates.street,
      city: updates.city,
      state: updates.state,
      zip_code: updates.zipCode,
      is_default: updates.isDefault,
      area_id: updates.areaId,
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteAddress = async (id: string) => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id);

  return { error };
};

// Inventory functions
export const getInventoryByVendor = async (vendorId: string) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const getInventoryByArea = async (areaId: string) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      service_areas!inner(id)
    `)
    .eq('service_areas.id', areaId);

  return { data, error };
};

export const createInventoryItem = async (itemData: Omit<InventoryItem, 'id'>) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      vendor_id: itemData.vendorId,
      name: itemData.name,
      price: itemData.price,
      stock: itemData.stock,
      description: itemData.description,
    })
    .select()
    .single();

  return { data, error };
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      name: updates.name,
      price: updates.price,
      stock: updates.stock,
      description: updates.description,
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteInventoryItem = async (id: string) => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  return { error };
};

// Order functions
export const getOrdersByCustomer = async (customerId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      order_messages(*),
      addresses(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const getOrdersByVendor = async (vendorId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      order_messages(*),
      addresses(*)
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'orderDate' | 'messages' | 'items'> & { items: OrderItem[] }) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: orderData.customerId,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      customer_user_id: orderData.customerUserId,
      vendor_id: orderData.vendorId,
      vendor_name: orderData.vendorName,
      area_id: orderData.areaId,
      address_id: orderData.address.id,
      total: orderData.total,
      delivery_date: orderData.deliveryDate,
      preferred_time: orderData.preferredTime,
    })
    .select()
    .single();

  if (orderError || !order) {
    return { data: null, error: orderError };
  }

  // Insert order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    inventory_item_id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    return { data: null, error: itemsError };
  }

  return { data: order, error: null };
};

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const updateOrderInvoiceId = async (id: string, invoiceId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ invoice_id: invoiceId })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Order Messages functions
export const createOrderMessage = async (messageData: Omit<OrderMessage, 'id' | 'timestamp'>) => {
  const { data, error } = await supabase
    .from('order_messages')
    .insert({
      order_id: messageData.orderId,
      sender: messageData.sender,
      sender_name: messageData.senderName,
      message: messageData.message,
    })
    .select()
    .single();

  return { data, error };
};

// Invoice functions
export const getInvoicesByVendor = async (vendorId: string) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      orders(*)
    `)
    .eq('orders.vendor_id', vendorId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'generatedDate'>) => {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      invoice_id: invoiceData.id,
      order_id: invoiceData.orderId,
      amount: invoiceData.amount,
      due_date: invoiceData.dueDate,
      status: invoiceData.status,
    })
    .select()
    .single();

  return { data, error };
};

export const updateInvoiceStatus = async (id: string, status: Invoice['status']) => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};