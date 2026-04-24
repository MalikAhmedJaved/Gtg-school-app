// Mock data for Glory to God PPEC app
//
// Translatable string fields are stored as { en, es } objects. Use the
// lr() helper from LanguageContext to render them: lr(category.name).

export const THERAPY_CATEGORIES = [
  {
    id: 'physical',
    name: { en: 'Physical Therapy', es: 'Terapia Física' },
    icon: 'fitness',
    color: '#E74C3C',
    description: {
      en: 'Improving mobility, strength, and motor skills',
      es: 'Mejorando la movilidad, fuerza y habilidades motoras',
    },
  },
  {
    id: 'speech',
    name: { en: 'Speech Therapy', es: 'Terapia del Habla' },
    icon: 'chatbubble-ellipses',
    color: '#8E44AD',
    description: {
      en: 'Enhancing communication and language skills',
      es: 'Mejorando las habilidades de comunicación y lenguaje',
    },
  },
  {
    id: 'occupational',
    name: { en: 'Occupational Therapy', es: 'Terapia Ocupacional' },
    icon: 'hand-left',
    color: '#E67E22',
    description: {
      en: 'Building daily living and fine motor skills',
      es: 'Desarrollando habilidades de la vida diaria y motoras finas',
    },
  },
  {
    id: 'behavioral',
    name: { en: 'Behavioral Therapy', es: 'Terapia Conductual' },
    icon: 'happy',
    color: '#27AE60',
    description: {
      en: 'Supporting emotional and behavioral development',
      es: 'Apoyando el desarrollo emocional y conductual',
    },
  },
  {
    id: 'nursing',
    name: { en: 'Nursing', es: 'Enfermería' },
    icon: 'medkit',
    color: '#2980B9',
    description: {
      en: 'Medical care and health monitoring',
      es: 'Atención médica y monitoreo de salud',
    },
  },
];

export const THERAPISTS = [
  {
    id: 1,
    name: 'Kim',
    fullName: 'Kim Rodriguez',
    role: { en: 'Occupational Therapy', es: 'Terapia Ocupacional' },
    categoryId: 'occupational',
    color: '#E67E22',
    avatar: null,
  },
  {
    id: 2,
    name: 'Maria',
    fullName: 'Maria Santos',
    role: { en: 'Speech Therapy', es: 'Terapia del Habla' },
    categoryId: 'speech',
    color: '#8E44AD',
    avatar: null,
  },
  {
    id: 3,
    name: 'Jenny',
    fullName: 'Jenny Thompson',
    role: { en: 'Physical Therapy', es: 'Terapia Física' },
    categoryId: 'physical',
    color: '#E74C3C',
    avatar: null,
  },
  {
    id: 4,
    name: 'David',
    fullName: 'David Chen',
    role: { en: 'Behavioral Therapy', es: 'Terapia Conductual' },
    categoryId: 'behavioral',
    color: '#27AE60',
    avatar: null,
  },
  {
    id: 5,
    name: 'Lisa',
    fullName: 'Lisa Williams',
    role: { en: 'Nursing', es: 'Enfermería' },
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
    message: {
      en: 'Good morning! I worked on fine motor activities with Ethan today using some colorful stacking cups. He did a great job grasping and stacking them!',
      es: '¡Buenos días! Hoy trabajé en actividades motoras finas con Ethan usando vasos apilables de colores. ¡Lo hizo muy bien al agarrarlos y apilarlos!',
    },
    hasPhotos: true,
    photos: [IMAGES.colorByNumber, IMAGES.coloringTogether],
  },
  {
    id: 2,
    therapistId: 2,
    categoryId: 'speech',
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    time: '11:15 AM',
    message: {
      en: "Ethan had a productive speech therapy session today! He practiced identifying animal picture cards and repeating their names back. Here's a photo of him during the session.",
      es: '¡Ethan tuvo una sesión productiva de terapia del habla hoy! Practicó identificar tarjetas con imágenes de animales y repetir sus nombres. Aquí hay una foto de él durante la sesión.',
    },
    hasPhotos: true,
    photos: [IMAGES.childWithScreen],
  },
  {
    id: 3,
    therapistId: 3,
    categoryId: 'physical',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    time: '1:45 PM',
    message: {
      en: 'Ethan had a great time practicing walking with his gait trainer today! He managed to take some steps forward with my help. Here is a picture of him using the gait trainer.',
      es: '¡Ethan se divirtió mucho practicando con su andador hoy! Logró dar algunos pasos hacia adelante con mi ayuda. Aquí hay una foto de él usando el andador.',
    },
    hasPhotos: true,
    photos: [IMAGES.therapySession],
  },
  {
    id: 4,
    therapistId: 4,
    categoryId: 'behavioral',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    time: '2:30 PM',
    message: {
      en: 'We worked on social interaction skills today. Ethan did really well sharing toys with his peers during group play time. He showed great improvement in turn-taking!',
      es: 'Hoy trabajamos en habilidades de interacción social. Ethan lo hizo muy bien compartiendo juguetes con sus compañeros durante el juego en grupo. ¡Mostró una gran mejora en tomar turnos!',
    },
    hasPhotos: true,
    photos: [IMAGES.kidsReading, IMAGES.staffBalloons],
  },
  {
    id: 5,
    therapistId: 5,
    categoryId: 'nursing',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    time: '3:00 PM',
    message: {
      en: 'All vitals checked and looking great today! Ethan had a good appetite at lunch and his medications were administered on schedule. He seems to be in great spirits!',
      es: '¡Todos los signos vitales revisados y luciendo muy bien hoy! Ethan tuvo buen apetito en el almuerzo y sus medicamentos se administraron a tiempo. ¡Parece estar de muy buen ánimo!',
    },
    hasPhotos: true,
    photos: [IMAGES.boyEating, IMAGES.childEating],
  },
  {
    id: 6,
    therapistId: 1,
    categoryId: 'occupational',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00 AM',
    message: {
      en: 'Yesterday we focused on sensory play activities. Ethan enjoyed the textured balls and showed great progress with his grip strength. He was very engaged throughout the session!',
      es: 'Ayer nos enfocamos en actividades de juego sensorial. A Ethan le encantaron las pelotas con textura y mostró un gran progreso en la fuerza de agarre. ¡Estuvo muy concentrado durante toda la sesión!',
    },
    hasPhotos: true,
    photos: [IMAGES.gardenActivity, IMAGES.sunny, IMAGES.staffWithChild],
  },
  {
    id: 7,
    therapistId: 2,
    categoryId: 'speech',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    time: '11:30 AM',
    message: {
      en: 'We practiced simple words and sounds using music therapy today. Ethan responded really well to the singing activities and tried to repeat some words!',
      es: '¡Hoy practicamos palabras y sonidos simples usando terapia musical. Ethan respondió muy bien a las actividades de canto e intentó repetir algunas palabras!',
    },
    hasPhotos: true,
    photos: [IMAGES.childSmiling],
  },
  {
    id: 8,
    therapistId: 3,
    categoryId: 'physical',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    time: '1:00 PM',
    message: {
      en: 'We did some stretching exercises and balance work on the therapy ball. Ethan is showing improved core strength and balance. Keep up the great work at home too!',
      es: 'Hicimos algunos ejercicios de estiramiento y trabajo de equilibrio en la pelota de terapia. Ethan está mostrando mayor fuerza central y equilibrio. ¡Sigan con el buen trabajo en casa también!',
    },
    hasPhotos: true,
    photos: [IMAGES.staffWithKids, IMAGES.babyInChair],
  },
];

export const MOCK_CHAT_CONVERSATIONS = [
  {
    id: 1,
    therapist: THERAPISTS[0],
    lastMessage: {
      en: "Let me know if you have any questions about today's session!",
      es: '¡Avísame si tienes alguna pregunta sobre la sesión de hoy!',
    },
    lastMessageTime: '10:15 AM',
    unreadCount: 1,
  },
  {
    id: 2,
    therapist: THERAPISTS[1],
    lastMessage: {
      en: 'Ethan is making wonderful progress with his speech!',
      es: '¡Ethan está haciendo un maravilloso progreso con su habla!',
    },
    lastMessageTime: '11:30 AM',
    unreadCount: 0,
  },
  {
    id: 3,
    therapist: THERAPISTS[2],
    lastMessage: {
      en: 'Here are some exercises you can practice at home.',
      es: 'Aquí hay algunos ejercicios que pueden practicar en casa.',
    },
    lastMessageTime: '2:00 PM',
    unreadCount: 2,
  },
  {
    id: 4,
    therapist: THERAPISTS[3],
    lastMessage: {
      en: 'Great session today! Ethan was very cooperative.',
      es: '¡Gran sesión hoy! Ethan fue muy cooperativo.',
    },
    lastMessageTime: { en: 'Yesterday', es: 'Ayer' },
    unreadCount: 0,
  },
  {
    id: 5,
    therapist: THERAPISTS[4],
    lastMessage: {
      en: 'All vitals are looking good. No concerns today.',
      es: 'Los signos vitales se ven bien. Sin preocupaciones hoy.',
    },
    lastMessageTime: { en: 'Yesterday', es: 'Ayer' },
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES = {
  1: [
    {
      id: 1,
      senderId: 1,
      text: {
        en: 'Good morning! Just starting OT with Ethan now.',
        es: '¡Buenos días! Justo comenzando TO con Ethan ahora.',
      },
      time: '9:30 AM',
      isMe: false,
    },
    {
      id: 2,
      senderId: 'parent',
      text: { en: 'Great! How is he doing today?', es: '¡Genial! ¿Cómo está hoy?' },
      time: '9:32 AM',
      isMe: true,
    },
    {
      id: 3,
      senderId: 1,
      text: {
        en: "He's in a wonderful mood! We're working on stacking cups today.",
        es: '¡Está de muy buen ánimo! Hoy estamos trabajando con vasos apilables.',
      },
      time: '9:35 AM',
      isMe: false,
    },
    {
      id: 4,
      senderId: 1,
      text: {
        en: 'He did amazing with the fine motor activities! Attached some photos for you.',
        es: '¡Lo hizo increíble en las actividades motoras finas! Te adjunto algunas fotos.',
      },
      time: '10:00 AM',
      isMe: false,
    },
    {
      id: 5,
      senderId: 1,
      text: {
        en: "Let me know if you have any questions about today's session!",
        es: '¡Avísame si tienes alguna pregunta sobre la sesión de hoy!',
      },
      time: '10:15 AM',
      isMe: false,
    },
  ],
  2: [
    {
      id: 1,
      senderId: 2,
      text: {
        en: 'Hi! We had a great speech session today.',
        es: '¡Hola! Tuvimos una gran sesión de habla hoy.',
      },
      time: '11:00 AM',
      isMe: false,
    },
    {
      id: 2,
      senderId: 2,
      text: {
        en: 'Ethan practiced identifying animals and saying their names.',
        es: 'Ethan practicó identificar animales y decir sus nombres.',
      },
      time: '11:05 AM',
      isMe: false,
    },
    {
      id: 3,
      senderId: 'parent',
      text: {
        en: "That's wonderful! Has he been trying any new sounds?",
        es: '¡Eso es maravilloso! ¿Ha estado intentando algún sonido nuevo?',
      },
      time: '11:10 AM',
      isMe: true,
    },
    {
      id: 4,
      senderId: 2,
      text: {
        en: 'Yes! He\'s been attempting "ma" and "da" sounds much more consistently.',
        es: '¡Sí! Ha estado intentando los sonidos "ma" y "da" con mucha más consistencia.',
      },
      time: '11:15 AM',
      isMe: false,
    },
    {
      id: 5,
      senderId: 2,
      text: {
        en: 'Ethan is making wonderful progress with his speech!',
        es: '¡Ethan está haciendo un maravilloso progreso con su habla!',
      },
      time: '11:30 AM',
      isMe: false,
    },
  ],
  3: [
    {
      id: 1,
      senderId: 3,
      text: {
        en: 'PT session complete! Ethan worked hard today.',
        es: '¡Sesión de TF completada! Ethan trabajó duro hoy.',
      },
      time: '1:30 PM',
      isMe: false,
    },
    {
      id: 2,
      senderId: 'parent',
      text: {
        en: 'How did he do with the walking exercises?',
        es: '¿Cómo le fue con los ejercicios de caminar?',
      },
      time: '1:35 PM',
      isMe: true,
    },
    {
      id: 3,
      senderId: 3,
      text: {
        en: "He took 5 assisted steps today! That's a new record for him.",
        es: '¡Dio 5 pasos asistidos hoy! Ese es un nuevo récord para él.',
      },
      time: '1:40 PM',
      isMe: false,
    },
    {
      id: 4,
      senderId: 'parent',
      text: {
        en: "Oh wow, that's amazing! We're so proud of him!",
        es: '¡Vaya, eso es increíble! ¡Estamos muy orgullosos de él!',
      },
      time: '1:42 PM',
      isMe: true,
    },
    {
      id: 5,
      senderId: 3,
      text: {
        en: 'Here are some exercises you can practice at home.',
        es: 'Aquí hay algunos ejercicios que pueden practicar en casa.',
      },
      time: '2:00 PM',
      isMe: false,
    },
  ],
  4: [
    {
      id: 1,
      senderId: 4,
      text: {
        en: 'Behavioral therapy update for today!',
        es: '¡Actualización de terapia conductual de hoy!',
      },
      time: '2:15 PM',
      isMe: false,
    },
    {
      id: 2,
      senderId: 4,
      text: {
        en: 'We focused on social skills and sharing during group play.',
        es: 'Nos enfocamos en habilidades sociales y en compartir durante el juego en grupo.',
      },
      time: '2:20 PM',
      isMe: false,
    },
    {
      id: 3,
      senderId: 4,
      text: {
        en: 'Great session today! Ethan was very cooperative.',
        es: '¡Gran sesión hoy! Ethan fue muy cooperativo.',
      },
      time: '2:30 PM',
      isMe: false,
    },
  ],
  5: [
    {
      id: 1,
      senderId: 5,
      text: {
        en: 'Nursing check-in: All meds given on schedule.',
        es: 'Chequeo de enfermería: Todos los medicamentos administrados a tiempo.',
      },
      time: '12:00 PM',
      isMe: false,
    },
    {
      id: 2,
      senderId: 'parent',
      text: { en: 'Thank you! How was his appetite today?', es: '¡Gracias! ¿Cómo estuvo su apetito hoy?' },
      time: '12:05 PM',
      isMe: true,
    },
    {
      id: 3,
      senderId: 5,
      text: {
        en: 'He ate really well at lunch! Good appetite today.',
        es: '¡Comió muy bien en el almuerzo! Buen apetito hoy.',
      },
      time: '12:10 PM',
      isMe: false,
    },
    {
      id: 4,
      senderId: 5,
      text: {
        en: 'All vitals are looking good. No concerns today.',
        es: 'Los signos vitales se ven bien. Sin preocupaciones hoy.',
      },
      time: '3:00 PM',
      isMe: false,
    },
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

// ──────────────────────────────────────────────────────────────
// COMPLIANCE (employee credentialing)
// Document catalog follows Florida AHCA PPEC staffing requirements
// (rule 59A-13) as reflected in the client's compliance spreadsheet.
// ──────────────────────────────────────────────────────────────

export const COMPLIANCE_CATEGORIES = {
  licensing: { id: 'licensing', name: 'Licensing & Identity', icon: 'id-card', color: '#1A5276' },
  training: { id: 'training', name: 'Mandatory Training', icon: 'school', color: '#8E44AD' },
  health: { id: 'health', name: 'Health & Safety', icon: 'medkit', color: '#27AE60' },
  employment: { id: 'employment', name: 'Employment Records', icon: 'document-text', color: '#E67E22' },
};

// renewalMonths === null means the document does not expire.
export const COMPLIANCE_DOCUMENT_TYPES = [
  // Licensing & identity
  { id: 'professional_license', name: 'Professional License', category: 'licensing', renewalMonths: 24, required: true, description: 'Your current state professional license (RN / LPN / CNA / OT / PT / SLP / RBT).' },
  { id: 'driver_license', name: 'Driver License', category: 'licensing', renewalMonths: null, required: true, description: 'A valid driver license or state-issued ID.' },
  { id: 'ssn', name: 'Social Security Card', category: 'licensing', renewalMonths: null, required: true, description: 'A copy of your Social Security card.' },
  { id: 'i9', name: 'I-9 Employment Eligibility', category: 'licensing', renewalMonths: null, required: true, description: 'Federal employment eligibility verification.' },
  { id: 'w4', name: 'W-4 Tax Form', category: 'licensing', renewalMonths: null, required: true, description: 'Federal tax withholding form.' },
  { id: 'legal_status', name: 'Legal Status', category: 'licensing', renewalMonths: null, required: true, description: 'Proof of legal work status (if applicable).' },

  // Mandatory training (Florida state-required, most renew every 2 years)
  { id: 'hipaa', name: 'HIPAA Training', category: 'training', renewalMonths: 24, required: true, description: 'Protecting patient health information.' },
  { id: 'hiv_aids', name: 'HIV / AIDS Training', category: 'training', renewalMonths: 24, required: true, description: 'Florida-required HIV/AIDS awareness training.' },
  { id: 'domestic_violence', name: 'Domestic Violence Training', category: 'training', renewalMonths: 36, required: true, description: 'Florida-required domestic violence awareness.' },
  { id: 'child_abuse', name: 'Child Abuse Recognition', category: 'training', renewalMonths: 24, required: true, description: 'Recognizing and reporting suspected child abuse.' },
  { id: 'medical_errors', name: 'Medical Errors Prevention', category: 'training', renewalMonths: 24, required: true, description: 'Florida-required medical errors training.' },
  { id: 'laws_rules', name: 'Laws & Rules', category: 'training', renewalMonths: 24, required: true, description: 'Florida laws and rules for your profession.' },
  { id: 'infection_control', name: 'Infection Control', category: 'training', renewalMonths: 24, required: true, description: 'Infection prevention and control protocols.' },
  { id: 'osha_tb', name: 'OSHA / TB Screening', category: 'training', renewalMonths: 12, required: true, description: 'Annual OSHA bloodborne pathogens and TB screening.' },
  { id: 'impairment', name: 'Impairment in the Workplace', category: 'training', renewalMonths: 24, required: false, description: 'Recognizing impairment in healthcare professionals.' },

  // Health & safety
  { id: 'cpr', name: 'CPR Certification', category: 'health', renewalMonths: 24, required: true, description: 'Current CPR (BLS) certification from an approved provider.' },
  { id: 'physical_exam', name: 'Physical Exam', category: 'health', renewalMonths: 12, required: true, description: 'Annual physical exam signed by a physician.' },
  { id: 'hepatitis_b', name: 'Hepatitis B (or Refusal)', category: 'health', renewalMonths: null, required: true, description: 'Hepatitis B vaccination record or signed refusal.' },

  // Employment records
  { id: 'application', name: 'Employment Application', category: 'employment', renewalMonths: null, required: true, description: 'Signed employment application.' },
  { id: 'resume', name: 'Resume', category: 'employment', renewalMonths: null, required: false, description: 'Current resume or CV.' },
  { id: 'background_check', name: 'Background Check', category: 'employment', renewalMonths: 60, required: true, description: 'Level 2 background screening (AHCA compliant).' },
  { id: 'orientation', name: 'Orientation', category: 'employment', renewalMonths: null, required: true, description: 'Completion of new-hire orientation.' },
  { id: 'year_eval', name: 'Annual Evaluation', category: 'employment', renewalMonths: 12, required: true, description: 'Annual performance evaluation.' },
  { id: 'liability_insurance', name: 'Liability Insurance', category: 'employment', renewalMonths: 12, required: false, description: 'Current professional liability insurance (if applicable).' },
  { id: 'confidentiality', name: 'Confidentiality Statement', category: 'employment', renewalMonths: null, required: true, description: 'Signed confidentiality agreement.' },
  { id: 'attestation', name: 'Attestation of Compliance', category: 'employment', renewalMonths: 12, required: true, description: 'Annual attestation of compliance with PPEC policies.' },
];

export function getComplianceDocumentType(typeId) {
  return COMPLIANCE_DOCUMENT_TYPES.find((t) => t.id === typeId);
}

// ─── MOCK DATA FOR DEMO EMPLOYEE ────────────────────────────────
// Demo employee: NUR-65095829 Vargas, Gabriel (DON) — from the Excel.
// Mix of statuses so every state is reachable from the UI.
const today = new Date();
const addMonths = (months) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
};
const subMonths = (months) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
};

export const MOCK_EMPLOYEE_DOCUMENTS = [
  // APPROVED & valid (green)
  { id: 'doc-1', typeId: 'professional_license', fileName: 'RN_License_2025.pdf', uploadedAt: subMonths(8), expiresAt: addMonths(16), approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(8), notes: null },
  { id: 'doc-2', typeId: 'hipaa', fileName: 'HIPAA_2025.pdf', uploadedAt: subMonths(6), expiresAt: addMonths(18), approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(6), notes: null },
  { id: 'doc-3', typeId: 'physical_exam', fileName: 'Physical_2026.pdf', uploadedAt: subMonths(2), expiresAt: addMonths(10), approvalStatus: 'approved', approvedBy: 'Robert', approvedAt: subMonths(2), notes: null },
  { id: 'doc-4', typeId: 'hiv_aids', fileName: 'HIV_AIDS_2025.pdf', uploadedAt: subMonths(5), expiresAt: addMonths(19), approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(5), notes: null },
  { id: 'doc-5', typeId: 'infection_control', fileName: 'Infection_Control_2025.pdf', uploadedAt: subMonths(7), expiresAt: addMonths(17), approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(7), notes: null },

  // EXPIRING SOON (yellow) — within 30 days
  { id: 'doc-6', typeId: 'cpr', fileName: 'CPR_2024.pdf', uploadedAt: subMonths(23), expiresAt: addMonths(0.5), approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(23), notes: null },
  { id: 'doc-7', typeId: 'osha_tb', fileName: 'OSHA_TB_2025.pdf', uploadedAt: subMonths(11), expiresAt: addMonths(1), approvalStatus: 'approved', approvedBy: 'Robert', approvedAt: subMonths(11), notes: null },

  // EXPIRED (red)
  { id: 'doc-8', typeId: 'medical_errors', fileName: 'Medical_Errors_2023.pdf', uploadedAt: subMonths(26), expiresAt: subMonths(2), approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(26), notes: null },

  // PENDING manager approval (blue)
  { id: 'doc-9', typeId: 'child_abuse', fileName: 'Child_Abuse_2026.pdf', uploadedAt: subMonths(0.2), expiresAt: addMonths(24), approvalStatus: 'pending', approvedBy: null, approvedAt: null, notes: null },

  // REJECTED (gray / needs re-upload)
  { id: 'doc-10', typeId: 'year_eval', fileName: 'Year_Eval_2025.pdf', uploadedAt: subMonths(1), expiresAt: addMonths(11), approvalStatus: 'rejected', approvedBy: 'Nicole Chang', approvedAt: subMonths(1), notes: 'Signature page is missing. Please re-upload with all pages included.' },

  // DOESN'T EXPIRE — approved
  { id: 'doc-11', typeId: 'i9', fileName: 'I9_Form.pdf', uploadedAt: subMonths(30), expiresAt: null, approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(30), notes: null },
  { id: 'doc-12', typeId: 'w4', fileName: 'W4_Form.pdf', uploadedAt: subMonths(30), expiresAt: null, approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(30), notes: null },
  { id: 'doc-13', typeId: 'driver_license', fileName: 'Drivers_License.pdf', uploadedAt: subMonths(15), expiresAt: null, approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(15), notes: null },
  { id: 'doc-14', typeId: 'application', fileName: 'Application.pdf', uploadedAt: subMonths(30), expiresAt: null, approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(30), notes: null },
  { id: 'doc-15', typeId: 'ssn', fileName: 'SSN_Card.pdf', uploadedAt: subMonths(30), expiresAt: null, approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(30), notes: null },
  { id: 'doc-16', typeId: 'confidentiality', fileName: 'Confidentiality.pdf', uploadedAt: subMonths(30), expiresAt: null, approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(30), notes: null },
  { id: 'doc-17', typeId: 'orientation', fileName: 'Orientation_Complete.pdf', uploadedAt: subMonths(30), expiresAt: null, approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(30), notes: null },
  { id: 'doc-18', typeId: 'hepatitis_b', fileName: 'HepB_Refusal_Signed.pdf', uploadedAt: subMonths(30), expiresAt: null, approvalStatus: 'approved', approvedBy: 'Nicole Chang', approvedAt: subMonths(30), notes: null },

  // MISSING — document type is required but has no upload yet (handled by service)
];

// A few history entries so the detail screen can show a timeline.
// Keyed by document id.
export const MOCK_DOCUMENT_HISTORY = {
  'doc-1': [
    { id: 'h1', event: 'approved', actor: 'Nicole Chang', timestamp: subMonths(8), notes: 'License verified.' },
    { id: 'h2', event: 'uploaded', actor: 'You', timestamp: subMonths(8), notes: null },
  ],
  'doc-6': [
    { id: 'h3', event: 'approved', actor: 'Nicole Chang', timestamp: subMonths(23), notes: null },
    { id: 'h4', event: 'uploaded', actor: 'You', timestamp: subMonths(23), notes: null },
  ],
  'doc-9': [
    { id: 'h5', event: 'uploaded', actor: 'You', timestamp: subMonths(0.2), notes: 'Renewal before expiration.' },
  ],
  'doc-10': [
    { id: 'h6', event: 'rejected', actor: 'Nicole Chang', timestamp: subMonths(1), notes: 'Signature page is missing. Please re-upload with all pages included.' },
    { id: 'h7', event: 'uploaded', actor: 'You', timestamp: subMonths(1), notes: null },
  ],
};
