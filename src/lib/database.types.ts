export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          user_type: 'customer' | 'vendor';
          area_id: string | null;
          service_area: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone?: string | null;
          user_type: 'customer' | 'vendor';
          area_id?: string | null;
          service_area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string | null;
          user_type?: 'customer' | 'vendor';
          area_id?: string | null;
          service_area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_areas: {
        Row: {
          id: string;
          name: string;
          vendor_id: string | null;
          vendor_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          vendor_id?: string | null;
          vendor_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          vendor_id?: string | null;
          vendor_name?: string;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          street: string;
          city: string;
          state: string;
          zip_code: string;
          is_default: boolean;
          area_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          street: string;
          city: string;
          state: string;
          zip_code: string;
          is_default?: boolean;
          area_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          street?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          is_default?: boolean;
          area_id?: string | null;
          created_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          vendor_id: string;
          name: string;
          price: number;
          stock: number;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          name: string;
          price: number;
          stock?: number;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          name?: string;
          price?: number;
          stock?: number;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          customer_user_id: string;
          vendor_id: string;
          vendor_name: string;
          area_id: string | null;
          address_id: string | null;
          total: number;
          status: 'pending' | 'acknowledged' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
          order_date: string;
          delivery_date: string;
          preferred_time: string;
          invoice_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          customer_user_id: string;
          vendor_id: string;
          vendor_name: string;
          area_id?: string | null;
          address_id?: string | null;
          total: number;
          status?: 'pending' | 'acknowledged' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
          order_date?: string;
          delivery_date: string;
          preferred_time: string;
          invoice_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_user_id?: string;
          vendor_id?: string;
          vendor_name?: string;
          area_id?: string | null;
          address_id?: string | null;
          total?: number;
          status?: 'pending' | 'acknowledged' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
          order_date?: string;
          delivery_date?: string;
          preferred_time?: string;
          invoice_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          inventory_item_id: string | null;
          name: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          inventory_item_id?: string | null;
          name: string;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          inventory_item_id?: string | null;
          name?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
      order_messages: {
        Row: {
          id: string;
          order_id: string;
          sender: 'customer' | 'vendor';
          sender_name: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          sender: 'customer' | 'vendor';
          sender_name: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          sender?: 'customer' | 'vendor';
          sender_name?: string;
          message?: string;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_id: string;
          order_id: string;
          amount: number;
          generated_date: string;
          due_date: string;
          status: 'draft' | 'sent' | 'paid';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          order_id: string;
          amount: number;
          generated_date?: string;
          due_date: string;
          status?: 'draft' | 'sent' | 'paid';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          order_id?: string;
          amount?: number;
          generated_date?: string;
          due_date?: string;
          status?: 'draft' | 'sent' | 'paid';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}