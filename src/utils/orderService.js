import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const ORDERS_STORAGE_KEY = '@cleaning_orders';

// Generate a unique ID for local orders
const generateId = () => `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Calculate hours based on order selections
export const calculateHours = (orderData) => {
  const { cleaningCategory, adhocSelections = [], homeSize, extraBathrooms = 0 } = orderData;

  if (cleaningCategory === 'standard') {
    return 3;
  }

  if (cleaningCategory === 'main') {
    return homeSize === 'over150' ? 6 : 5;
  }

  if (cleaningCategory === 'adhoc') {
    let hours = 0;
    if (adhocSelections.includes('standardWithout')) hours = Math.max(hours, 2.5);
    if (adhocSelections.includes('vacuumAndFloor')) hours = Math.max(hours, 2);
    if (adhocSelections.includes('bathroomAndFloor')) hours = Math.max(hours, 2);
    
    // If no predefined option selected, default 2 hours
    if (hours === 0) hours = 2;

    // Add extra for bathrooms
    hours += extraBathrooms * 0.5;

    // Add extra for large home
    if (adhocSelections.includes('largeHome')) hours += 0.5;

    return hours;
  }

  // Commercial or move-in/out: use manual hours or default
  return orderData.manualHours || 3;
};

// Get orders from local storage
const getLocalOrders = async () => {
  try {
    const data = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading local orders:', error);
    return [];
  }
};

// Save orders to local storage
const saveLocalOrders = async (orders) => {
  try {
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving local orders:', error);
  }
};

// Create a new order
export const createOrder = async (orderData) => {
  const order = {
    _id: generateId(),
    ...orderData,
    calculatedHours: calculateHours(orderData),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // Try API first
    const response = await api.post('/orders', order);
    return response.data;
  } catch (error) {
    // Fallback to local storage
    console.log('API unavailable, saving order locally');
    const orders = await getLocalOrders();
    orders.unshift(order);
    await saveLocalOrders(orders);
    return order;
  }
};

// Get all orders, optionally filtered
export const getOrders = async (filters = {}) => {
  try {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  } catch (error) {
    // Fallback to local storage
    console.log('API unavailable, reading local orders');
    let orders = await getLocalOrders();

    // Apply local filters
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        orders = orders.filter((o) => filters.status.includes(o.status));
      } else {
        orders = orders.filter((o) => o.status === filters.status);
      }
    }

    return orders;
  }
};

// Get a single order by ID
export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    const orders = await getLocalOrders();
    return orders.find((o) => o._id === id) || null;
  }
};

// Cancel an order
export const cancelOrder = async (id) => {
  try {
    const response = await api.patch(`/orders/${id}`, { status: 'cancelled' });
    return response.data;
  } catch (error) {
    const orders = await getLocalOrders();
    const index = orders.findIndex((o) => o._id === id);
    if (index !== -1) {
      orders[index].status = 'cancelled';
      orders[index].updatedAt = new Date().toISOString();
      await saveLocalOrders(orders);
      return orders[index];
    }
    throw new Error('Order not found');
  }
};

// Service type labels
export const SERVICE_TYPES = {
  home: 'Home Cleaning',
  commercial: 'Commercial Cleaning',
  moveinout: 'Move-in/Move-out',
};

// Cleaning category labels
export const CLEANING_CATEGORIES = {
  standard: 'Standard Cleaning',
  main: 'Main Cleaning',
  adhoc: 'Ad hoc Cleaning',
};

// Status labels and colors
export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: '#ed8936' },
  confirmed: { label: 'Confirmed', color: '#38a169' },
  assigned: { label: 'Assigned', color: '#2c7a7b' },
  completed: { label: 'Completed', color: '#4a5568' },
  cancelled: { label: 'Cancelled', color: '#dc3545' },
  archived: { label: 'Archived', color: '#718096' },
};

// Default order structure
export const createEmptyOrder = () => ({
  serviceType: 'home',
  cleaningCategory: 'standard',
  // Standard - as needed selections
  asNeededSelections: [],
  // Main - optional extras
  mainCleaningExtras: [],
  homeSize: 'under150',
  // Ad hoc
  adhocSelections: [],
  adhocFreeText: '',
  extraBathrooms: 0,
  // Extra targeted
  extraTargeted: {
    animalHair: false,
    smoking: false,
  },
  // Equipment
  equipment: {
    cleaningAgents: false,
    cloth: false,
    vacuumCleaner: false,
    mop: false,
    specialProducts: false,
  },
  // Booking details
  address: '',
  date: '',
  time: '',
  manualHours: 3,
  comments: '',
});
