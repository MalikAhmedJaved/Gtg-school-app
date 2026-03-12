import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const ORDERS_STORAGE_KEY = '@cleaning_orders';

// Calculate hours based on order selections
export const calculateHours = (orderData) => {
  const { serviceType, cleaningCategory, adhocSelections = [], homeSize, extraBathrooms = 0 } = orderData;

  // Non-home services (commercial, move-in/out): use manual hours
  if (serviceType && serviceType !== 'home') {
    return orderData.manualHours || 3;
  }

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

  // Fallback: use manual hours or default
  return orderData.manualHours || 3;
};

// Map mobile app service/category to backend cleaningType enum:
// residential | commercial | deep | move
const mapCleaningType = (serviceType, cleaningCategory) => {
  if (serviceType === 'commercial') return 'commercial';
  if (serviceType === 'moveinout') return 'move';

  // Home category mapping
  if (cleaningCategory === 'main') return 'deep';
  return 'residential';
};

// Map backend task data to mobile app order format (for display/edit)
const KNOWN_AS_NEEDED = ['wipingFrames', 'limeShower', 'vacuumFurniture', 'cobwebs'];
const KNOWN_MAIN_EXTRAS = [
  'wipingFrames', 'wipingWindowEdges', 'wipingCeilingEdges', 'windowCleaning',
  'blindsCleaned', 'furnitureVacuumed', 'behindFurniture', 'cleaningWallsCeilings',
  'underCarpets', 'mirrorsGlass', 'ceilingLights', 'closedSpaces',
  'insideCupboards', 'woodenFloors', 'ovenFridge',
];
const KNOWN_ADHOC = ['standardWithout', 'vacuumAndFloor', 'bathroomAndFloor', 'largeHome'];
const KNOWN_EXTRA_TARGETED = ['animalHair', 'smoking'];
const EQUIPMENT_PREFIX = 'equipment:';
const EQUIPMENT_KEYS = ['cleaningAgents', 'cloth', 'vacuumCleaner', 'mop', 'specialProducts'];

const getOrderScheduleTimestamp = (order) => {
  if (!order?.date) return 0;

  const dateOnly = String(order.date).split('T')[0];
  const timeValue = order.time || '00:00';
  const timestamp = new Date(`${dateOnly}T${timeValue}`).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const sortOrdersBySchedule = (orders, direction = 'asc') => {
  const multiplier = direction === 'desc' ? -1 : 1;

  return [...(Array.isArray(orders) ? orders : [])].sort((left, right) => {
    const delta = getOrderScheduleTimestamp(left) - getOrderScheduleTimestamp(right);
    if (delta !== 0) return delta * multiplier;

    const leftCreated = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightCreated = right?.createdAt ? new Date(right.createdAt).getTime() : 0;
    return (leftCreated - rightCreated) * multiplier;
  });
};

const mapTaskToOrder = (task) => {
  const cleaningType = task.cleaningType;
  const serviceType = cleaningType === 'residential'
    ? 'home'
    : cleaningType === 'move'
      ? 'moveinout'
      : cleaningType === 'deep'
        ? 'home'
        : cleaningType;
  const cleaningCategory = cleaningType === 'deep' ? 'main' : 'standard';

  const checklist = Array.isArray(task.checklist) ? task.checklist : [];

  const allKnown = new Set([
    ...KNOWN_AS_NEEDED, ...KNOWN_MAIN_EXTRAS, ...KNOWN_ADHOC, ...KNOWN_EXTRA_TARGETED,
  ]);
  const equipment = {};
  EQUIPMENT_KEYS.forEach((k) => { equipment[k] = checklist.includes(`${EQUIPMENT_PREFIX}${k}`); });
  const checklistItems = checklist.filter(
    (item) => typeof item === 'string' && !allKnown.has(item) && !item.startsWith(EQUIPMENT_PREFIX)
  );

  return {
    _id: String(task.id || task._id || ''),
    id: task.id,
    title: task.title || '',
    serviceType,
    cleaningCategory,
    cleaningType,
    address: task.address,
    date: task.date,
    time: task.time,
    endTime: task.endTime || null,
    allDay: Boolean(task.allDay),
    frequency: task.frequency,
    recurrenceEvery: task.recurrenceEvery,
    recurrenceDays: Array.isArray(task.recurrenceDays) ? task.recurrenceDays : [],
    recurrenceUntil: task.recurrenceUntil || null,
    recurrenceGroupId: task.recurrenceGroupId || null,
    isRecurring: Boolean(task.isRecurring || task.recurrenceGroupId),
    recurrenceCount: task.recurrenceCount || null,
    hours: task.hours,
    manualHours: task.hours,
    calculatedHours: task.hours,
    comments: task.comments,
    status: task.status,
    checklist,
    checklistItems,
    asNeededSelections: checklist.filter((item) => KNOWN_AS_NEEDED.includes(item)),
    mainCleaningExtras: checklist.filter((item) => KNOWN_MAIN_EXTRAS.includes(item)),
    adhocSelections: checklist.filter((item) => KNOWN_ADHOC.includes(item)),
    extraTargeted: {
      animalHair: checklist.includes('animalHair'),
      smoking: checklist.includes('smoking'),
    },
    equipment,
    client: task.client,
    cleaner: task.cleaner,
    rating: task.rating,
    ratingComment: task.ratingComment,
    canRate: Boolean(task.canRate),
    allOccurrencesCompleted: task.allOccurrencesCompleted !== false,
    ratingBlockedReason: task.ratingBlockedReason || '',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt: task.completedAt,
    cancelledAt: task.cancelledAt,
  };
};

// Map mobile app order data to backend task format (for creation)
const mapOrderToTask = (orderData) => {
  const hours = calculateHours(orderData);
  
  // Build checklist from selections
  const checklist = [];
  if (orderData.asNeededSelections?.length) {
    checklist.push(...orderData.asNeededSelections);
  }
  if (orderData.mainCleaningExtras?.length) {
    checklist.push(...orderData.mainCleaningExtras);
  }
  if (orderData.adhocSelections?.length) {
    checklist.push(...orderData.adhocSelections);
  }
  if (orderData.extraTargeted) {
    if (orderData.extraTargeted.animalHair) checklist.push('animalHair');
    if (orderData.extraTargeted.smoking) checklist.push('smoking');
  }
  if (orderData.equipment) {
    Object.entries(orderData.equipment).forEach(([key, val]) => {
      if (val) checklist.push(`equipment:${key}`);
    });
  }

  return {
    address: orderData.address || '',
    date: orderData.date || new Date().toISOString().split('T')[0],
    time: orderData.time || '09:00',
    hours: hours,
    cleaningType: mapCleaningType(orderData.serviceType, orderData.cleaningCategory),
    frequency: 'once',
    comments: orderData.comments || '',
    checklist: checklist,
  };
};

// Get orders from local storage (fallback only)
const getLocalOrders = async () => {
  try {
    const data = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading local orders:', error);
    return [];
  }
};

// Save orders to local storage (fallback only)
const saveLocalOrders = async (orders) => {
  try {
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving local orders:', error);
  }
};

// Create a new order (task)
export const createOrder = async (orderData) => {
  const taskPayload = mapOrderToTask(orderData);

  try {
    const response = await api.post('/tasks', taskPayload);
    if (response.data.success) {
      const task = response.data.data;
      return Array.isArray(task) ? mapTaskToOrder(task[0]) : mapTaskToOrder(task);
    }
    throw new Error(response.data.message || 'Failed to create task');
  } catch (error) {
    // Fallback to local storage if API is unreachable
    console.log('API unavailable, saving order locally:', error.message);
    const localOrder = {
      _id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...orderData,
      calculatedHours: calculateHours(orderData),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _isLocal: true, // flag to identify local-only orders
    };
    const orders = await getLocalOrders();
    orders.unshift(localOrder);
    await saveLocalOrders(orders);
    return localOrder;
  }
};

// Get all orders (tasks), optionally filtered
export const getOrders = async (filters = {}) => {
  try {
    // Map status filters to the correct backend endpoint
    let endpoint = '/tasks';
    const params = {};

    if (filters.status) {
      const statusArr = Array.isArray(filters.status) ? filters.status : [filters.status];
      if (statusArr.includes('pending')) {
        // /tasks/pending is admin-only; use role-safe /tasks with status filter instead
        endpoint = '/tasks';
        params.status = 'pending';
      } else if (statusArr.includes('assigned') || statusArr.includes('accepted')) {
        endpoint = '/tasks/assigned';
      } else if (statusArr.includes('completed')) {
        endpoint = '/tasks/completed';
      }
    }

    const response = await api.get(endpoint, { params });
    if (response.data.success) {
      const tasks = Array.isArray(response.data.data) ? response.data.data : [response.data.data].filter(Boolean);
      const mappedTasks = tasks.map(mapTaskToOrder);
      return sortOrdersBySchedule(mappedTasks, 'desc');
    }
    return [];
  } catch (error) {
    // Fallback to local storage
    console.log('API unavailable, reading local orders:', error.message);
    let orders = await getLocalOrders();

    if (filters.status) {
      const statusArr = Array.isArray(filters.status) ? filters.status : [filters.status];
      orders = orders.filter((o) => statusArr.includes(o.status));
    }

    const statusArr = Array.isArray(filters.status) ? filters.status : [filters.status].filter(Boolean);
    return sortOrdersBySchedule(orders, 'desc');
  }
};

// Get a single order (task) by ID
export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    if (response.data.success) {
      return mapTaskToOrder(response.data.data);
    }
    return null;
  } catch (error) {
    // Fallback to local storage
    const orders = await getLocalOrders();
    return orders.find((o) => o._id === String(id)) || null;
  }
};

export const getCleanerReviews = async (cleanerId) => {
  try {
    const response = await api.get(`/tasks/cleaners/${cleanerId}/reviews`);
    if (response.data?.success) {
      return response.data.data || { averageRating: null, count: 0, reviews: [] };
    }
  } catch {
    // Silent fallback
  }

  return { averageRating: null, count: 0, reviews: [] };
};

export const completeOrder = async (id, payload = {}) => {
  const response = await api.post(`/tasks/${id}/complete`, payload);
  if (response.data?.success) {
    return mapTaskToOrder(response.data.data);
  }
  throw new Error(response.data?.message || 'Failed to complete task');
};

export const rateOrder = async (id, payload = {}) => {
  const response = await api.post(`/tasks/${id}/rate`, payload);
  if (response.data?.success) {
    return mapTaskToOrder(response.data.data);
  }
  throw new Error(response.data?.message || 'Failed to submit rating');
};

// Cancel an order (task)
export const cancelOrder = async (id) => {
  try {
    const response = await api.post(`/tasks/${id}/cancel`);
    if (response.data.success) {
      return mapTaskToOrder(response.data.data);
    }
    throw new Error(response.data.message || 'Failed to cancel task');
  } catch (error) {
    // Fallback to local storage
    const orders = await getLocalOrders();
    const index = orders.findIndex((o) => o._id === String(id));
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
  accepted: { label: 'Accepted', color: '#2c7a7b' },
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
