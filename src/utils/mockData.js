import AsyncStorage from '@react-native-async-storage/async-storage';

// Utility function to generate consistent task IDs
export const generateTaskId = async () => {
  try {
    let taskCounter = parseInt((await AsyncStorage.getItem('taskCounter')) || '0', 10);
    taskCounter += 1;
    await AsyncStorage.setItem('taskCounter', taskCounter.toString());
    return `task-${taskCounter}`;
  } catch (error) {
    console.error('Error generating task ID:', error);
    return `task-${Date.now()}`;
  }
};

export const mockPendingTasks = [
  {
    _id: 'task-1',
    address: '123 Main Street, City',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00',
    hours: 3,
    cleaningType: 'residential',
    comments: 'Please focus on kitchen and bathrooms',
    status: 'pending',
    client: { name: 'John Doe', email: 'john@example.com' }
  },
  {
    _id: 'task-2',
    address: '456 Oak Avenue, City',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '14:00',
    hours: 5,
    cleaningType: 'commercial',
    comments: 'Office cleaning, 3 floors',
    status: 'pending',
    client: { name: 'Jane Smith', email: 'jane@example.com' }
  },
];

export const mockCleaners = [
  {
    _id: 'cleaner-001',
    name: 'Sarah Williams',
    email: 'sarah@cleaner.com',
    phone: '555-0101',
    experience: 5
  },
  {
    _id: 'cleaner-002',
    name: 'Mike Thompson',
    email: 'mike@cleaner.com',
    phone: '555-0102',
    experience: 3
  },
];

export const mockCompletedTasks = [
  {
    _id: 'task-4',
    address: '123 Main Street, City',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00',
    hours: 3,
    actualHours: 3.5,
    cleaningType: 'residential',
    status: 'completed',
    clientId: 'client-001',
    client: { name: 'John Doe', email: 'john@example.com' },
    cleaner: { name: 'Sarah Williams', _id: 'cleaner-001' },
    rating: 5,
    ratingComment: 'Excellent service! Very thorough and professional.'
  },
];

export const mockAssignedTasks = [
  {
    _id: 'task-7',
    address: '123 Main Street, City',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00',
    hours: 3,
    cleaningType: 'residential',
    comments: 'Please focus on kitchen and bathrooms',
    status: 'assigned',
    clientId: 'client-001',
    client: { name: 'John Doe', email: 'john@example.com' },
    cleaner: { name: 'Sarah Williams', _id: 'cleaner-001' }
  },
];

// Store mock data in AsyncStorage for persistence
export const initMockData = async () => {
  try {
    const initialized = await AsyncStorage.getItem('mockDataInitialized');
    if (!initialized) {
      await AsyncStorage.setItem('mockPendingTasks', JSON.stringify(mockPendingTasks));
      await AsyncStorage.setItem('mockCleaners', JSON.stringify(mockCleaners));
      await AsyncStorage.setItem('mockAssignedTasks', JSON.stringify(mockAssignedTasks));
      await AsyncStorage.setItem('mockCompletedTasks', JSON.stringify(mockCompletedTasks));
      await AsyncStorage.setItem('mockDataInitialized', 'true');
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
};

export const getMockPendingTasks = async () => {
  try {
    const stored = await AsyncStorage.getItem('mockPendingTasks');
    return stored ? JSON.parse(stored) : mockPendingTasks;
  } catch (error) {
    return mockPendingTasks;
  }
};

export const getMockCleaners = async () => {
  try {
    const stored = await AsyncStorage.getItem('mockCleaners');
    return stored ? JSON.parse(stored) : mockCleaners;
  } catch (error) {
    return mockCleaners;
  }
};

export const getMockCompletedTasks = async () => {
  try {
    const stored = await AsyncStorage.getItem('mockCompletedTasks');
    return stored ? JSON.parse(stored) : mockCompletedTasks;
  } catch (error) {
    return mockCompletedTasks;
  }
};

export const getMockAssignedTasks = async () => {
  try {
    const stored = await AsyncStorage.getItem('mockAssignedTasks');
    return stored ? JSON.parse(stored) : mockAssignedTasks;
  } catch (error) {
    return mockAssignedTasks;
  }
};
