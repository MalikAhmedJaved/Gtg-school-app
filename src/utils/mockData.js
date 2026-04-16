// Mock data for Glory to God PPEC app

export const THERAPY_CATEGORIES = [
  {
    id: 'physical',
    name: 'Physical Therapy',
    icon: 'fitness',
    color: '#E74C3C',
    description: 'Improving mobility, strength, and motor skills',
  },
  {
    id: 'speech',
    name: 'Speech Therapy',
    icon: 'chatbubble-ellipses',
    color: '#8E44AD',
    description: 'Enhancing communication and language skills',
  },
  {
    id: 'occupational',
    name: 'Occupational Therapy',
    icon: 'hand-left',
    color: '#E67E22',
    description: 'Building daily living and fine motor skills',
  },
  {
    id: 'behavioral',
    name: 'Behavioral Therapy',
    icon: 'happy',
    color: '#27AE60',
    description: 'Supporting emotional and behavioral development',
  },
  {
    id: 'nursing',
    name: 'Nursing',
    icon: 'medkit',
    color: '#2980B9',
    description: 'Medical care and health monitoring',
  },
];

export const THERAPISTS = [
  {
    id: 1,
    name: 'Kim',
    fullName: 'Kim Rodriguez',
    role: 'Occupational Therapy',
    categoryId: 'occupational',
    color: '#E67E22',
    avatar: null,
  },
  {
    id: 2,
    name: 'Maria',
    fullName: 'Maria Santos',
    role: 'Speech Therapy',
    categoryId: 'speech',
    color: '#8E44AD',
    avatar: null,
  },
  {
    id: 3,
    name: 'Jenny',
    fullName: 'Jenny Thompson',
    role: 'Physical Therapy',
    categoryId: 'physical',
    color: '#E74C3C',
    avatar: null,
  },
  {
    id: 4,
    name: 'David',
    fullName: 'David Chen',
    role: 'Behavioral Therapy',
    categoryId: 'behavioral',
    color: '#27AE60',
    avatar: null,
  },
  {
    id: 5,
    name: 'Lisa',
    fullName: 'Lisa Williams',
    role: 'Nursing',
    categoryId: 'nursing',
    color: '#2980B9',
    avatar: null,
  },
];

// Local images from assets/Images
const IMAGES = {
  staffWithKids: require('../../assets/Images/IMG_2271.jpg'),
  sunny: require('../../assets/Images/Sunny.png'),
  childSmiling: require('../../assets/Images/child_smiling.jpg'),
  staffBalloons: require('../../assets/Images/1000084805.jpeg'),
  staffWithToddler: require('../../assets/Images/1000084772.jpeg'),
  staffWithChild: require('../../assets/Images/gemini_staff_child.png'),
  therapySession: require('../../assets/Images/therapy_session.png'),
  gardenActivity: require('../../assets/Images/garden_activity.jpeg'),
  colorByNumber: require('../../assets/Images/color_by_number.jpeg'),
  coloringTogether: require('../../assets/Images/coloring_together.jpeg'),
  kidsReading: require('../../assets/Images/kids_reading.jpeg'),
  childWithScreen: require('../../assets/Images/child_with_screen.jpeg'),
  boyEating: require('../../assets/Images/gemini_boy_eating.png'),
  childEating: require('../../assets/Images/gemini_child_eating.png'),
  babyInChair: require('../../assets/Images/gemini_baby_chair.png'),
};

export { IMAGES };

export const THERAPY_UPDATES = [
  {
    id: 1,
    therapistId: 1,
    categoryId: 'occupational',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    time: '9:45 AM',
    message: 'Good morning! I worked on fine motor activities with Ethan today using some colorful stacking cups. He did a great job grasping and stacking them!',
    hasPhotos: true,
    photos: [IMAGES.colorByNumber, IMAGES.coloringTogether],
  },
  {
    id: 2,
    therapistId: 2,
    categoryId: 'speech',
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    time: '11:15 AM',
    message: 'Ethan had a productive speech therapy session today! He practiced identifying animal picture cards and repeating their names back. Here\'s a photo of him during the session.',
    hasPhotos: true,
    photos: [IMAGES.childWithScreen],
  },
  {
    id: 3,
    therapistId: 3,
    categoryId: 'physical',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    time: '1:45 PM',
    message: 'Ethan had a great time practicing walking with his gait trainer today! He managed to take some steps forward with my help. Here is a picture of him using the gait trainer.',
    hasPhotos: true,
    photos: [IMAGES.therapySession],
  },
  {
    id: 4,
    therapistId: 4,
    categoryId: 'behavioral',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    time: '2:30 PM',
    message: 'We worked on social interaction skills today. Ethan did really well sharing toys with his peers during group play time. He showed great improvement in turn-taking!',
    hasPhotos: true,
    photos: [IMAGES.kidsReading, IMAGES.staffBalloons],
  },
  {
    id: 5,
    therapistId: 5,
    categoryId: 'nursing',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    time: '3:00 PM',
    message: 'All vitals checked and looking great today! Ethan had a good appetite at lunch and his medications were administered on schedule. He seems to be in great spirits!',
    hasPhotos: true,
    photos: [IMAGES.boyEating, IMAGES.childEating],
  },
  {
    id: 6,
    therapistId: 1,
    categoryId: 'occupational',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00 AM',
    message: 'Yesterday we focused on sensory play activities. Ethan enjoyed the textured balls and showed great progress with his grip strength. He was very engaged throughout the session!',
    hasPhotos: true,
    photos: [IMAGES.gardenActivity, IMAGES.sunny, IMAGES.staffWithChild],
  },
  {
    id: 7,
    therapistId: 2,
    categoryId: 'speech',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    time: '11:30 AM',
    message: 'We practiced simple words and sounds using music therapy today. Ethan responded really well to the singing activities and tried to repeat some words!',
    hasPhotos: true,
    photos: [IMAGES.childSmiling],
  },
  {
    id: 8,
    therapistId: 3,
    categoryId: 'physical',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    time: '1:00 PM',
    message: 'We did some stretching exercises and balance work on the therapy ball. Ethan is showing improved core strength and balance. Keep up the great work at home too!',
    hasPhotos: true,
    photos: [IMAGES.staffWithKids, IMAGES.babyInChair],
  },
];

export const MOCK_CHAT_CONVERSATIONS = [
  {
    id: 1,
    therapist: THERAPISTS[0],
    lastMessage: 'Let me know if you have any questions about today\'s session!',
    lastMessageTime: '10:15 AM',
    unreadCount: 1,
  },
  {
    id: 2,
    therapist: THERAPISTS[1],
    lastMessage: 'Ethan is making wonderful progress with his speech!',
    lastMessageTime: '11:30 AM',
    unreadCount: 0,
  },
  {
    id: 3,
    therapist: THERAPISTS[2],
    lastMessage: 'Here are some exercises you can practice at home.',
    lastMessageTime: '2:00 PM',
    unreadCount: 2,
  },
  {
    id: 4,
    therapist: THERAPISTS[3],
    lastMessage: 'Great session today! Ethan was very cooperative.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 5,
    therapist: THERAPISTS[4],
    lastMessage: 'All vitals are looking good. No concerns today.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES = {
  1: [
    { id: 1, senderId: 1, text: 'Good morning! Just starting OT with Ethan now.', time: '9:30 AM', isMe: false },
    { id: 2, senderId: 'parent', text: 'Great! How is he doing today?', time: '9:32 AM', isMe: true },
    { id: 3, senderId: 1, text: 'He\'s in a wonderful mood! We\'re working on stacking cups today.', time: '9:35 AM', isMe: false },
    { id: 4, senderId: 1, text: 'He did amazing with the fine motor activities! Attached some photos for you.', time: '10:00 AM', isMe: false },
    { id: 5, senderId: 1, text: 'Let me know if you have any questions about today\'s session!', time: '10:15 AM', isMe: false },
  ],
  2: [
    { id: 1, senderId: 2, text: 'Hi! We had a great speech session today.', time: '11:00 AM', isMe: false },
    { id: 2, senderId: 2, text: 'Ethan practiced identifying animals and saying their names.', time: '11:05 AM', isMe: false },
    { id: 3, senderId: 'parent', text: 'That\'s wonderful! Has he been trying any new sounds?', time: '11:10 AM', isMe: true },
    { id: 4, senderId: 2, text: 'Yes! He\'s been attempting "ma" and "da" sounds much more consistently.', time: '11:15 AM', isMe: false },
    { id: 5, senderId: 2, text: 'Ethan is making wonderful progress with his speech!', time: '11:30 AM', isMe: false },
  ],
  3: [
    { id: 1, senderId: 3, text: 'PT session complete! Ethan worked hard today.', time: '1:30 PM', isMe: false },
    { id: 2, senderId: 'parent', text: 'How did he do with the walking exercises?', time: '1:35 PM', isMe: true },
    { id: 3, senderId: 3, text: 'He took 5 assisted steps today! That\'s a new record for him.', time: '1:40 PM', isMe: false },
    { id: 4, senderId: 'parent', text: 'Oh wow, that\'s amazing! We\'re so proud of him!', time: '1:42 PM', isMe: true },
    { id: 5, senderId: 3, text: 'Here are some exercises you can practice at home.', time: '2:00 PM', isMe: false },
  ],
  4: [
    { id: 1, senderId: 4, text: 'Behavioral therapy update for today!', time: '2:15 PM', isMe: false },
    { id: 2, senderId: 4, text: 'We focused on social skills and sharing during group play.', time: '2:20 PM', isMe: false },
    { id: 3, senderId: 4, text: 'Great session today! Ethan was very cooperative.', time: '2:30 PM', isMe: false },
  ],
  5: [
    { id: 1, senderId: 5, text: 'Nursing check-in: All meds given on schedule.', time: '12:00 PM', isMe: false },
    { id: 2, senderId: 'parent', text: 'Thank you! How was his appetite today?', time: '12:05 PM', isMe: true },
    { id: 3, senderId: 5, text: 'He ate really well at lunch! Good appetite today.', time: '12:10 PM', isMe: false },
    { id: 4, senderId: 5, text: 'All vitals are looking good. No concerns today.', time: '3:00 PM', isMe: false },
  ],
};

export function getTherapistById(id) {
  return THERAPISTS.find(t => t.id === id);
}

export function getUpdatesByCategory(categoryId) {
  return THERAPY_UPDATES.filter(u => u.categoryId === categoryId);
}

export function getTodayUpdates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return THERAPY_UPDATES.filter(u => new Date(u.timestamp) >= today);
}

export function getAllUpdates() {
  return [...THERAPY_UPDATES].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
