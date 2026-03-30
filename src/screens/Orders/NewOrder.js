import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { Picker } from '@react-native-picker/picker';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { navigate as rootNavigate } from '../../utils/rootNavigation';
import { calculateHours, createEmptyOrder } from '../../utils/orderService';
import Button from '../../components/Common/Button';
import Checkbox from '../../components/Common/Checkbox';
import RadioGroup from '../../components/Common/RadioGroup';
import SectionCard from '../../components/Common/SectionCard';
import InfoBox from '../../components/Common/InfoBox';
import api from '../../utils/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const WEEKDAYS = [
  { value: 0, short: 'S' },
  { value: 1, short: 'M' },
  { value: 2, short: 'T' },
  { value: 3, short: 'W' },
  { value: 4, short: 'T' },
  { value: 5, short: 'F' },
  { value: 6, short: 'S' },
];

const DEFAULT_EVENT_FORM = {
  title: '',
  date: new Date().toISOString().slice(0, 10),
  startTime: '09:00',
  endTime: '09:30',
  allDay: false,
  recurring: false,
  recurrenceEvery: 1,
  recurrenceDays: [],
  recurrenceUntil: '',
  address: '',
  cleaningType: 'residential',
  checklistItems: [],
  comments: '',
};

const shiftCalendarDate = (baseDate, mode, direction) => {
  const next = new Date(baseDate);
  if (mode === 'month') {
    next.setMonth(next.getMonth() + direction);
    return next;
  }
  if (mode === 'week') {
    next.setDate(next.getDate() + (7 * direction));
    return next;
  }
  next.setDate(next.getDate() + direction);
  return next;
};

const formatLocalDateISO = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getRecurringPreviewDates = (startDateStr, recurrenceDays, recurrenceUntil, recurrenceEvery = 1) => {
  if (!startDateStr) return [];

  const start = new Date(`${startDateStr}T00:00:00`);
  if (Number.isNaN(start.getTime())) return [];

  const validDays = Array.isArray(recurrenceDays)
    ? [...new Set(recurrenceDays.map((d) => parseInt(d, 10)).filter((d) => d >= 0 && d <= 6))]
    : [];

  if (validDays.length === 0) {
    return [start];
  }

  const until = recurrenceUntil
    ? new Date(`${recurrenceUntil}T23:59:59`)
    : (() => {
      const d = new Date(start);
      d.setFullYear(d.getFullYear() + 1);
      d.setHours(23, 59, 59, 999);
      return d;
    })();

  const intervalWeeks = Math.max(1, parseInt(recurrenceEvery, 10) || 1);
  const results = [];

  validDays.forEach((dayOfWeek) => {
    const first = new Date(start);
    const dayOffset = (dayOfWeek - start.getDay() + 7) % 7;
    first.setDate(first.getDate() + dayOffset);

    for (let weekIndex = 0; weekIndex < 160; weekIndex += 1) {
      const candidate = new Date(first);
      candidate.setDate(candidate.getDate() + (weekIndex * 7 * intervalWeeks));
      if (candidate > until) break;
      results.push(candidate);
    }
  });

  const dedupedByDate = new Map();
  results.forEach((date) => {
    dedupedByDate.set(formatLocalDateISO(date), date);
  });

  return Array.from(dedupedByDate.values()).sort((a, b) => a - b);
};

const NewOrder = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { isAuthenticated, userRole, userData } = useAuth();
  const editOrder = route?.params?.editOrder;
  const isEditMode = Boolean(route?.params?.editMode && (editOrder?.id || editOrder?._id));
  const { width } = useWindowDimensions();
  const isNarrowScreen = width <= 480;
  const isWeb = Platform.OS === 'web';
  const isAdmin = userRole === 'admin';
  const isCleaner = userRole === 'cleaner';
  const [order, setOrder] = useState(createEmptyOrder());
  const [submitting, setSubmitting] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarMode, setCalendarMode] = useState('month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [eventForm, setEventForm] = useState(DEFAULT_EVENT_FORM);
  const [savedEventData, setSavedEventData] = useState(null);
  const [bookingPreviewEventId] = useState('booking-preview-event');
  const [checklistInput, setChecklistInput] = useState('');
  const [eventError, setEventError] = useState('');
  const [bookingValidationError, setBookingValidationError] = useState('');
  const [hasBookingEvent, setHasBookingEvent] = useState(false);
  const [dateEventsModal, setDateEventsModal] = useState(null); // { date, events[] }
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);
  const [showNativeStartTimePicker, setShowNativeStartTimePicker] = useState(false);
  const [showNativeEndTimePicker, setShowNativeEndTimePicker] = useState(false);
  const [showNativeUntilDatePicker, setShowNativeUntilDatePicker] = useState(false);
  const mainScrollRef = useRef(null);
  const modalScrollRef = useRef(null);
  const commentsInputRef = useRef(null);
  const modalCommentsInputRef = useRef(null);
  const commercialDescInputRef = useRef(null);
  const estimatedHours = useMemo(() => calculateHours(order), [order]);
  const calendarTitle = useMemo(() => (
    calendarDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  ), [calendarDate]);
  const modalWidth = Math.min(width - 16, 560);
  const webInputStyle = {
    width: '100%',
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.md,
    padding: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
    marginBottom: 8,
    boxSizing: 'border-box',
  };

  const updateOrder = (field, value) => {
    setOrder((prev) => ({ ...prev, [field]: value }));
  };

  const scrollToTextInput = (scrollRef, inputRef = null) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (inputRef?.current) {
          inputRef.current.measureLayout(
            scrollRef.current,
            (x, y) => {
              const offset = Math.max(0, y - 150);
              scrollRef?.current?.scrollTo({ y: offset, animated: true });
            },
            () => {
              scrollRef?.current?.scrollToEnd({ animated: true });
            }
          );
        } else {
          scrollRef?.current?.scrollToEnd({ animated: true });
        }
      }, 150);
    });
  };


  const toggleAsNeeded = (item) => {
    setOrder((prev) => {
      const selections = prev.asNeededSelections.includes(item)
        ? prev.asNeededSelections.filter((i) => i !== item)
        : [...prev.asNeededSelections, item];
      return { ...prev, asNeededSelections: selections };
    });
  };

  const toggleMainExtra = (item) => {
    setOrder((prev) => {
      const extras = prev.mainCleaningExtras.includes(item)
        ? prev.mainCleaningExtras.filter((i) => i !== item)
        : [...prev.mainCleaningExtras, item];
      return { ...prev, mainCleaningExtras: extras };
    });
  };

  const toggleAdhoc = (item) => {
    setOrder((prev) => {
      const selections = prev.adhocSelections.includes(item)
        ? prev.adhocSelections.filter((i) => i !== item)
        : [...prev.adhocSelections, item];
      return { ...prev, adhocSelections: selections };
    });
  };

  const toggleEquipment = (item) => {
    setOrder((prev) => ({
      ...prev,
      equipment: { ...prev.equipment, [item]: !prev.equipment[item] },
    }));
  };

  const toggleExtraTargeted = (item) => {
    setOrder((prev) => ({
      ...prev,
      extraTargeted: { ...prev.extraTargeted, [item]: !prev.extraTargeted[item] },
    }));
  };

  const mapCleaningType = (serviceType, cleaningCategory) => {
    if (serviceType === 'commercial') return 'commercial';
    if (serviceType === 'moveinout') return 'move';
    if (cleaningCategory === 'main') return 'deep';
    return 'residential';
  };

  const mapServiceFromCleaningType = (cleaningType) => {
    if (cleaningType === 'commercial') {
      return { serviceType: 'commercial', cleaningCategory: 'standard' };
    }
    if (cleaningType === 'move') {
      return { serviceType: 'moveinout', cleaningCategory: 'standard' };
    }
    if (cleaningType === 'deep') {
      return { serviceType: 'home', cleaningCategory: 'main' };
    }
    return { serviceType: 'home', cleaningCategory: 'standard' };
  };

  const hydrateOrderFromTask = (task) => {
    const fallback = createEmptyOrder();
    if (!task) return fallback;

    const checklist = Array.isArray(task.checklist) ? task.checklist : [];
    const asNeededOptions = ['wipingFrames', 'limeShower', 'vacuumFurniture', 'cobwebs'];
    const mainExtrasOptions = [
      'wipingFrames',
      'wipingWindowEdges',
      'wipingCeilingEdges',
      'windowCleaning',
      'blindsCleaned',
      'furnitureVacuumed',
      'behindFurniture',
      'cleaningWallsCeilings',
      'underCarpets',
      'mirrorsGlass',
      'ceilingLights',
      'closedSpaces',
      'insideCupboards',
      'woodenFloors',
      'ovenFridge',
    ];

    const equipment = { ...fallback.equipment };
    checklist.forEach((item) => {
      if (typeof item === 'string' && item.startsWith('equipment:')) {
        const key = item.replace('equipment:', '');
        if (Object.prototype.hasOwnProperty.call(equipment, key)) {
          equipment[key] = true;
        }
      }
    });

    const serviceType = task.serviceType
      ? task.serviceType
      : (task.cleaningType === 'residential'
        ? 'home'
        : task.cleaningType === 'move'
          ? 'moveinout'
          : task.cleaningType || 'home');

    const cleaningCategory = task.cleaningCategory
      ? task.cleaningCategory
      : (task.cleaningType === 'deep' ? 'main' : 'standard');

    return {
      ...fallback,
      serviceType,
      cleaningCategory,
      asNeededSelections: checklist.filter((item) => asNeededOptions.includes(item)),
      mainCleaningExtras: checklist.filter((item) => mainExtrasOptions.includes(item)),
      adhocSelections: checklist.filter((item) => ['standardWithout', 'vacuumAndFloor', 'bathroomAndFloor', 'largeHome'].includes(item)),
      extraTargeted: {
        animalHair: checklist.includes('animalHair'),
        smoking: checklist.includes('smoking'),
      },
      equipment,
      address: task.address || '',
      date: task.date || '',
      time: task.time || '',
      manualHours: Number(task.calculatedHours || task.hours || task.manualHours || fallback.manualHours),
      comments: task.comments || '',
    };
  };

  const buildChecklist = () => {
    const checklist = [];
    if (order.asNeededSelections?.length) checklist.push(...order.asNeededSelections);
    if (order.mainCleaningExtras?.length) checklist.push(...order.mainCleaningExtras);
    if (order.adhocSelections?.length) checklist.push(...order.adhocSelections);
    if (order.extraTargeted?.animalHair) checklist.push('animalHair');
    if (order.extraTargeted?.smoking) checklist.push('smoking');
    if (order.equipment) {
      Object.entries(order.equipment).forEach(([key, val]) => {
        if (val) checklist.push(`equipment:${key}`);
      });
    }
    const eventChecklist = Array.isArray(eventForm.checklistItems)
      ? eventForm.checklistItems.filter(Boolean)
      : [];
    checklist.push(...eventChecklist);
    return checklist;
  };

  const formatClientAddress = (client) => {
    if (!client) return '';
    const parts = [client.address, client.city, client.zipCode].filter(Boolean);
    return parts.join(', ');
  };

  const updateEventForm = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  };

  const stepRecurrenceEvery = (delta) => {
    setEventForm((prev) => {
      const current = Number.isFinite(Number(prev.recurrenceEvery)) ? Number(prev.recurrenceEvery) : 0;
      const next = Math.max(0, current + delta);
      return { ...prev, recurrenceEvery: next };
    });
  };

  const addChecklistItem = () => {
    const trimmed = checklistInput.trim();
    if (!trimmed) return;
    setEventForm((prev) => ({
      ...prev,
      checklistItems: [...(prev.checklistItems || []), trimmed],
    }));
    setChecklistInput('');
  };

  const removeChecklistItem = (index) => {
    setEventForm((prev) => ({
      ...prev,
      checklistItems: (prev.checklistItems || []).filter((_, idx) => idx !== index),
    }));
  };

  const toggleRecurrenceDay = (day) => {
    setEventForm((prev) => {
      const exists = prev.recurrenceDays.includes(day);
      const next = exists
        ? prev.recurrenceDays.filter((d) => d !== day)
        : [...prev.recurrenceDays, day].sort((a, b) => a - b);
      return { ...prev, recurrenceDays: next };
    });
  };

  const fetchClients = async () => {
    if (!isAdmin || !isAuthenticated) return;
    setClientsLoading(true);
    try {
      const response = await api.get('/users', { params: { role: 'client' } });
      const list = response.data?.success ? (response.data.data || []) : [];
      setClients(list);
    } catch {
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchCalendarTasks = async () => {
    if (!isAuthenticated) return;
    setCalendarLoading(true);
    try {
      const params = {};
      if (isAdmin && selectedClientId) params.clientId = selectedClientId;
      const response = await api.get('/tasks', { params });
      const tasks = response.data?.success ? (response.data.data || []) : [];
      const events = tasks
        .filter((task) => task.status !== 'cancelled')
        .map((task) => {
          const start = new Date(task.date);
          const [hour, minute] = (task.time || '09:00').split(':').map(Number);
          start.setHours(hour || 9, minute || 0, 0, 0);

          const end = new Date(start);
          if (task.endTime) {
            const [endHour, endMinute] = task.endTime.split(':').map(Number);
            end.setHours(endHour || hour || 9, endMinute || minute || 0, 0, 0);
          } else {
            end.setMinutes(end.getMinutes() + Math.max(30, (task.hours || 1) * 60));
          }

          const cleanerName = task.cleaner?.name;
          return {
            id: `task-${task.id || task._id || `${task.date}-${task.time}`}`,
            title: cleanerName
              ? `${cleanerName} — ${task.title || task.address || task.cleaningType || 'Event'}`
              : (task.title || task.address || task.cleaningType || 'Event'),
            start,
            end,
            color: task.status === 'pending' ? colors.warning : colors.primary,
            resource: task,
          };
        });
      setCalendarEvents(events);
    } catch {
      setCalendarEvents([]);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleSaveNewEvent = () => {
    setEventError('');

    if (!eventForm.address.trim()) {
      setEventError(t('client.addressRequired', 'Address is required'));
      return;
    }

    if (isAdmin && !selectedClientId) {
      setEventError(t('admin.pleaseSelectClient', 'Please select a client.'));
      return;
    }

    if (!eventForm.allDay && !eventForm.startTime) {
      setEventError(t('client.timeRequired', 'Start time is required'));
      return;
    }

    if (eventForm.recurring && (!Array.isArray(eventForm.recurrenceDays) || eventForm.recurrenceDays.length === 0)) {
      setEventError(t('scheduling.selectRecurrenceDays', 'Please select at least one weekday for recurrence'));
      return;
    }

    const [startHour, startMinute] = eventForm.startTime.split(':').map(Number);
    const [endHour, endMinute] = (eventForm.endTime || eventForm.startTime).split(':').map(Number);
    const durationHours = eventForm.allDay
      ? 8
      : Math.max(0.5, ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60);

    if (!eventForm.allDay && (endHour * 60 + endMinute) <= (startHour * 60 + startMinute)) {
      setEventError(t('scheduling.invalidTimeRange', 'End time must be after start time'));
      return;
    }

    const normalizedEvent = {
      title: eventForm.title.trim(),
      date: eventForm.date,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      allDay: Boolean(eventForm.allDay),
      recurring: Boolean(eventForm.recurring),
      recurrenceEvery: parseInt(eventForm.recurrenceEvery ?? 1, 10) || 0,
      recurrenceDays: Array.isArray(eventForm.recurrenceDays) ? eventForm.recurrenceDays : [],
      recurrenceUntil: eventForm.recurrenceUntil || '',
      address: eventForm.address.trim(),
      cleaningType: mapCleaningType(order.serviceType, order.cleaningCategory),
      checklistItems: Array.isArray(eventForm.checklistItems) ? eventForm.checklistItems.filter(Boolean) : [],
      comments: eventForm.comments.trim(),
    };

    setOrder((prev) => ({
      ...prev,
      address: normalizedEvent.address,
      date: normalizedEvent.date,
      time: normalizedEvent.allDay ? '09:00' : normalizedEvent.startTime,
      manualHours: durationHours,
      comments: normalizedEvent.comments,
    }));

    const previewDates = normalizedEvent.recurring
      ? getRecurringPreviewDates(
        normalizedEvent.date,
        normalizedEvent.recurrenceDays,
        normalizedEvent.recurrenceUntil,
        normalizedEvent.recurrenceEvery
      )
      : [new Date(`${normalizedEvent.date}T00:00:00`)];

    const previewEvents = previewDates.map((dateValue, index) => {
      const day = formatLocalDateISO(dateValue);
      const start = new Date(`${day}T${normalizedEvent.allDay ? '09:00' : normalizedEvent.startTime}:00`);
      const end = new Date(`${day}T${normalizedEvent.allDay ? '17:00' : normalizedEvent.endTime}:00`);
      return {
        id: `${bookingPreviewEventId}-${index}`,
        title: normalizedEvent.title || normalizedEvent.address,
        start,
        end,
        color: colors.primary,
      };
    });

    setCalendarEvents((prev) => ([
      ...prev.filter((event) => !String(event.id || '').startsWith(bookingPreviewEventId)),
      ...previewEvents,
    ]));

    setSavedEventData(normalizedEvent);
    setBookingValidationError('');
    if (previewEvents.length > 0) {
      setCalendarDate(previewEvents[0].start);
    }
    setHasBookingEvent(true);
    setShowNewEvent(false);
    setChecklistInput('');
  };

  const handleOpenEventModal = (prefilledDate) => {
    setEventError('');
    setBookingValidationError('');
    const source = savedEventData || eventForm;
    const dateStr = prefilledDate
      ? prefilledDate.toISOString().slice(0, 10)
      : (order.date || source.date || new Date().toISOString().slice(0, 10));
    setEventForm((prev) => ({
      ...prev,
      ...source,
      title: selectedServiceTypeLabel,
      date: dateStr,
      startTime: order.time || source.startTime || '09:00',
      endTime: source.endTime || order.time || source.startTime || '09:30',
      address: order.address || source.address,
      cleaningType: mapCleaningType(order.serviceType, order.cleaningCategory),
      comments: order.comments || source.comments,
    }));
    setShowNewEvent(true);
  };

  const handleCalendarPressCell = (date) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayEvents = calendarEvents.filter(
      (evt) => evt.start >= dayStart && evt.start < dayEnd
    );
    if (dayEvents.length > 0) {
      setDateEventsModal({ date: dayStart, events: dayEvents });
    } else {
      handleOpenEventModal(date);
    }
  };

  const handleCalendarPressEvent = (event) => {
    const dayStart = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayEvents = calendarEvents.filter(
      (evt) => evt.start >= dayStart && evt.start < dayEnd
    );
    setDateEventsModal({ date: dayStart, events: dayEvents });
  };

  const handleSubmit = async () => {
    if (!hasBookingEvent) {
      setBookingValidationError(
        t('scheduling.bookingDetailsRequired', 'Please add booking details first by creating a new event.')
      );
      return;
    }

    setBookingValidationError('');

    if (!order.address.trim()) {
      Alert.alert('', t('newOrder.addressRequired', 'Please enter your address'));
      return;
    }
    if (!order.date.trim()) {
      Alert.alert('', t('newOrder.dateRequired', 'Please select a date'));
      return;
    }
    if (!order.time.trim()) {
      Alert.alert('', t('newOrder.timeRequired', 'Please select a time'));
      return;
    }

    setSubmitting(true);
    try {
      const booking = savedEventData || eventForm;
      const parsedManualHours = parseFloat(order.manualHours);
      const resolvedHours = Number.isFinite(parsedManualHours) && parsedManualHours > 0
        ? parsedManualHours
        : estimatedHours;
      const payloadChecklist = [
        ...buildChecklist(),
        ...(Array.isArray(booking.checklistItems) ? booking.checklistItems.filter(Boolean) : []),
      ];

      const payload = {
        title: booking.title || '',
        address: order.address || '',
        date: order.date,
        time: order.time,
        endTime: booking.allDay ? '17:00' : (booking.endTime || null),
        allDay: Boolean(booking.allDay),
        hours: resolvedHours,
        cleaningType: mapCleaningType(order.serviceType, order.cleaningCategory),
        frequency: booking.recurring ? 'weekly' : 'once',
        recurrenceEvery: booking.recurring ? (parseInt(booking.recurrenceEvery ?? 1, 10) || 0) : null,
        recurrenceDays: booking.recurring ? (booking.recurrenceDays || []) : null,
        recurrenceUntil: booking.recurring ? (booking.recurrenceUntil || null) : null,
        comments: order.comments || '',
        checklist: [...new Set(payloadChecklist)],
      };

      if (isEditMode) {
        const taskId = editOrder?.id || editOrder?._id;
        if (!taskId) {
          Alert.alert('Error', 'Invalid order id for update');
          setSubmitting(false);
          return;
        }

        await api.put(`/tasks/${taskId}`, payload);
        Alert.alert('Success', t('orders.orderUpdated', 'Order updated successfully'));
        navigation.setParams({ editMode: undefined, editOrder: undefined });
        rootNavigate('MenuTab', { screen: 'PendingOrders' });
        return;
      }

      let response;
      if (isAdmin) {
        if (!selectedClientId) {
          Alert.alert('Error', t('admin.pleaseSelectClient', 'Please select a client.'));
          setSubmitting(false);
          return;
        }
        response = await api.post('/tasks/admin/create', {
          ...payload,
          clientId: selectedClientId,
        });
      } else {
        response = await api.post('/tasks', payload);
      }

      const task = Array.isArray(response.data?.data)
        ? response.data.data[0]
        : response.data?.data;

      const result = {
        ...order,
        _id: String(task?.id || Date.now()),
        id: task?.id,
        status: task?.status || 'pending',
        calculatedHours: task?.hours || estimatedHours,
      };

      navigation.replace('OrderConfirmation', { order: result });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Service type options ---
  const [serviceTypeOptions, setServiceTypeOptions] = useState([
    { value: 'home', label: t('newOrder.homeCleaning', 'Home Cleaning') },
    { value: 'commercial', label: t('newOrder.commercialCleaning', 'Commercial Cleaning') },
    { value: 'moveinout', label: t('newOrder.moveInOut', 'Move-in/Move-out') },
  ]);
  const selectedServiceTypeLabel = useMemo(() => {
    const selected = serviceTypeOptions.find((option) => option.value === order.serviceType);
    return selected?.label || order.serviceType || t('scheduling.titlePlaceholder', 'Cleaning service');
  }, [serviceTypeOptions, order.serviceType, t]);

  // --- Cleaning category options (only for home) ---
  const [cleaningCategoryOptions, setCleaningCategoryOptions] = useState([
    {
      value: 'standard',
      label: t('newOrder.standardCleaning', 'Standard Cleaning'),
      description: t('newOrder.standardCleaningDesc', '3 hours — regular maintenance cleaning'),
    },
    {
      value: 'main',
      label: t('newOrder.mainCleaning', 'Main Cleaning'),
      description: t('newOrder.mainCleaningDesc', '5-6 hours — deep thorough cleaning'),
    },
    {
      value: 'adhoc',
      label: t('newOrder.adhocCleaning', 'Ad hoc Cleaning'),
      description: t('newOrder.adhocCleaningDesc', 'Custom cleaning based on your selection'),
    },
  ]);

  // --- Always included items ---
  const [alwaysIncludedItems, setAlwaysIncludedItems] = useState([
    t('newOrder.vacuumCleaning', 'Vacuum cleaning'),
    t('newOrder.floorWashing', 'Floor washing'),
    t('newOrder.wipingSurfaces', 'Wiping surfaces'),
    t('newOrder.bridgeSink', 'Bridge/sink'),
    t('newOrder.bathroom', 'Bathroom, including cleaning toilet and sink (remember plug), mirror and shower'),
    t('newOrder.kitchenSurfaces', 'Kitchen surfaces (no washing up)'),
  ]);

  // --- As needed items ---
  const [asNeededItems, setAsNeededItems] = useState([
    { key: 'wipingFrames', label: t('newOrder.wipingFrames', 'Wiping frames, skirting boards, doors') },
    { key: 'limeShower', label: t('newOrder.limeShower', 'Lime shower cabin and sanitary') },
    { key: 'vacuumFurniture', label: t('newOrder.vacuumFurniture', 'Vacuuming furniture cushions and under cushions') },
    { key: 'cobwebs', label: t('newOrder.cobwebs', 'Cobwebs: walls, ceiling edges and windows') },
  ]);
  const [newAlwaysIncludedItem, setNewAlwaysIncludedItem] = useState('');
  const [newAsNeededItem, setNewAsNeededItem] = useState('');
  const [newServiceValue, setNewServiceValue] = useState('');
  const [newServiceLabel, setNewServiceLabel] = useState('');
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // --- Main cleaning extra items ---
  const mainExtraItems = [
    { key: 'wipingFrames', label: t('newOrder.wipingFrames', 'Wiping frames, skirting boards, doors') },
    { key: 'wipingWindowEdges', label: t('newOrder.wipingWindowEdges', 'Wiping window edges') },
    { key: 'wipingCeilingEdges', label: t('newOrder.wipingCeilingEdges', 'Wiping ceiling edges') },
    { key: 'windowCleaning', label: t('newOrder.windowCleaning', 'Window cleaning (if necessary)') },
    { key: 'blindsCleaned', label: t('newOrder.blindsCleaned', 'Blinds cleaned') },
    { key: 'furnitureVacuumed', label: t('newOrder.furnitureVacuumed', 'Furniture thoroughly vacuumed') },
    { key: 'behindFurniture', label: t('newOrder.behindFurniture', 'Behind furniture') },
    { key: 'cleaningWallsCeilings', label: t('newOrder.cleaningWallsCeilings', 'Cleaning walls and ceilings') },
    { key: 'underCarpets', label: t('newOrder.underCarpets', 'Under loose carpets') },
    { key: 'mirrorsGlass', label: t('newOrder.mirrorsGlass', 'Mirrors and glass surfaces') },
    { key: 'ceilingLights', label: t('newOrder.ceilingLights', 'Cleaning ceiling lights') },
    { key: 'closedSpaces', label: t('newOrder.closedSpaces', 'More closed spaces (if necessary)') },
    { key: 'insideCupboards', label: t('newOrder.insideCupboards', 'Inside cupboards, where dust and dirt collect') },
    { key: 'woodenFloors', label: t('newOrder.woodenFloors', 'Wooden floors washed and polished') },
    { key: 'ovenFridge', label: t('newOrder.ovenFridge', 'Oven and fridge') },
  ];

  // --- Home size options ---
  const homeSizeOptions = [
    { value: 'under150', label: t('newOrder.under150', 'Under 150 sq m (5 hours)') },
    { value: 'over150', label: t('newOrder.over150', 'Over 150 sq m (6 hours)') },
  ];

  // --- Ad hoc predefined options ---
  const adhocPredefined = [
    { key: 'standardWithout', label: t('newOrder.standardWithout', 'Standard without bathroom or floor washing (2.5 hours)') },
    { key: 'vacuumAndFloor', label: t('newOrder.vacuumAndFloor', 'Only vacuuming and floor washing (2 hours)') },
    { key: 'bathroomAndFloor', label: t('newOrder.bathroomAndFloor', 'Only bathroom and floor washing or vacuuming (2 hours)') },
  ];

  const isHome = order.serviceType === 'home';

  useEffect(() => {
    if (!order.serviceType) return;

    setEventForm((prev) => ({
      ...prev,
      title: selectedServiceTypeLabel,
    }));

    setSavedEventData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title: selectedServiceTypeLabel,
      };
    });
  }, [order.serviceType, selectedServiceTypeLabel]);

  const updateServiceTypeLabel = (value, label) => {
    setServiceTypeOptions((prev) => prev.map((item) => (item.value === value ? { ...item, label } : item)));
  };

  const REQUIRED_SERVICE_VALUES = ['home', 'commercial', 'moveinout'];
  const addServiceType = () => {
    const value = newServiceValue.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const label = newServiceLabel.trim();
    if (!value || !label) return;
    if (serviceTypeOptions.some((o) => o.value === value)) return;
    setServiceTypeOptions((prev) => [...prev, { value, label }]);
    setNewServiceValue('');
    setNewServiceLabel('');
  };
  const removeServiceType = (value) => {
    setServiceTypeOptions((prev) => prev.filter((o) => o.value !== value));
    if (order.serviceType === value) updateOrder('serviceType', 'home');
  };

  const updateCleaningCategoryField = (value, field, fieldValue) => {
    setCleaningCategoryOptions((prev) =>
      prev.map((item) => (item.value === value ? { ...item, [field]: fieldValue } : item))
    );
  };

  const REQUIRED_CATEGORY_VALUES = ['standard', 'main', 'adhoc'];
  const addCleaningCategory = () => {
    const value = newCategoryValue.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const label = newCategoryLabel.trim();
    if (!value || !label) return;
    if (cleaningCategoryOptions.some((o) => o.value === value)) return;
    setCleaningCategoryOptions((prev) => [...prev, { value, label, description: newCategoryDesc.trim() }]);
    setNewCategoryValue('');
    setNewCategoryLabel('');
    setNewCategoryDesc('');
  };
  const removeCleaningCategory = (value) => {
    setCleaningCategoryOptions((prev) => prev.filter((o) => o.value !== value));
    if (order.cleaningCategory === value) updateOrder('cleaningCategory', 'standard');
  };

  const updateAlwaysIncludedLabel = (index, label) => {
    setAlwaysIncludedItems((prev) => prev.map((item, idx) => (idx === index ? label : item)));
  };

  const updateAsNeededLabel = (key, label) => {
    setAsNeededItems((prev) => prev.map((item) => (item.key === key ? { ...item, label } : item)));
  };

  const addAlwaysIncludedItem = () => {
    const value = newAlwaysIncludedItem.trim();
    if (!value) return;
    setAlwaysIncludedItems((prev) => [...prev, value]);
    setNewAlwaysIncludedItem('');
  };

  const addAsNeededItem = () => {
    const value = newAsNeededItem.trim();
    if (!value) return;
    const key = `custom_${Date.now()}`;
    setAsNeededItems((prev) => [...prev, { key, label: value }]);
    setNewAsNeededItem('');
  };

  const removeAlwaysIncludedItem = (index) => {
    setAlwaysIncludedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const removeAsNeededItem = (key) => {
    setAsNeededItems((prev) => prev.filter((item) => item.key !== key));
    setOrder((prev) => ({
      ...prev,
      asNeededSelections: prev.asNeededSelections.filter((item) => item !== key),
    }));
  };

  const loadOrderConfig = async () => {
    if (!isAuthenticated) return;

    setConfigLoading(true);
    try {
      const response = await api.get('/order-config');
      const data = response.data?.data;

      if (Array.isArray(data?.serviceTypeOptions) && data.serviceTypeOptions.length) {
        setServiceTypeOptions(data.serviceTypeOptions);
      }
      if (Array.isArray(data?.cleaningCategoryOptions) && data.cleaningCategoryOptions.length) {
        setCleaningCategoryOptions(data.cleaningCategoryOptions);
      }
      if (Array.isArray(data?.alwaysIncludedItems) && data.alwaysIncludedItems.length) {
        setAlwaysIncludedItems(data.alwaysIncludedItems);
      }
      if (Array.isArray(data?.asNeededItems) && data.asNeededItems.length) {
        setAsNeededItems(data.asNeededItems);
      }
    } catch (error) {
      console.log('Order config fallback to local defaults:', error.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const saveOrderConfig = async () => {
    if (!isAdmin) return;

    const payload = {
      serviceTypeOptions,
      cleaningCategoryOptions,
      alwaysIncludedItems,
      asNeededItems,
    };

    setConfigSaving(true);
    try {
      const response = await api.put('/order-config', payload);
      const data = response.data?.data;

      if (Array.isArray(data?.serviceTypeOptions)) setServiceTypeOptions(data.serviceTypeOptions);
      if (Array.isArray(data?.cleaningCategoryOptions)) setCleaningCategoryOptions(data.cleaningCategoryOptions);
      if (Array.isArray(data?.alwaysIncludedItems)) setAlwaysIncludedItems(data.alwaysIncludedItems);
      if (Array.isArray(data?.asNeededItems)) setAsNeededItems(data.asNeededItems);

      Alert.alert('Success', 'New order options saved successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save new order options');
    } finally {
      setConfigSaving(false);
    }
  };

  useEffect(() => {
    loadOrderConfig();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchClients();
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    fetchCalendarTasks();
  }, [isAuthenticated, isAdmin, selectedClientId]);

  useEffect(() => {
    if (!showNewEvent) return;

    if (isAdmin) {
      const selectedClient = clients.find((client) => String(client.id || client._id) === String(selectedClientId));
      const clientAddress = formatClientAddress(selectedClient);
      setEventForm((prev) => ({ ...prev, address: clientAddress || prev.address }));
      return;
    }

    const ownAddress = formatClientAddress(userData);
    setEventForm((prev) => ({ ...prev, address: ownAddress || prev.address }));
  }, [showNewEvent, isAdmin, selectedClientId, clients, userData]);

  useEffect(() => {
    if (!isEditMode || !editOrder) return;

    const hydrated = hydrateOrderFromTask(editOrder);
    setOrder(hydrated);
    setHasBookingEvent(Boolean(hydrated.address && hydrated.date && hydrated.time));

    if (isAdmin && editOrder.client?.id) {
      setSelectedClientId(String(editOrder.client.id));
    }

    setEventForm((prev) => ({
      ...prev,
      title: editOrder.title || editOrder.address || '',
      date: hydrated.date || prev.date,
      startTime: hydrated.time || prev.startTime,
      endTime: editOrder.endTime || hydrated.time || prev.endTime,
      address: hydrated.address || prev.address,
      cleaningType: editOrder.cleaningType || prev.cleaningType,
      checklistItems: (Array.isArray(editOrder.checklist) ? editOrder.checklist : []).filter(
        (item) => typeof item === 'string' && item && !item.startsWith('equipment:') && item !== 'animalHair' && item !== 'smoking'
      ),
      comments: hydrated.comments || prev.comments,
    }));

    setSavedEventData({
      title: editOrder.title || editOrder.address || '',
      date: hydrated.date || new Date().toISOString().slice(0, 10),
      startTime: hydrated.time || '09:00',
      endTime: editOrder.endTime || hydrated.time || '09:30',
      allDay: Boolean(editOrder.allDay),
      recurring: Array.isArray(editOrder.recurrenceDays) && editOrder.recurrenceDays.length > 0,
      recurrenceEvery: parseInt(editOrder.recurrenceEvery ?? 1, 10) || 0,
      recurrenceDays: Array.isArray(editOrder.recurrenceDays) ? editOrder.recurrenceDays : [],
      recurrenceUntil: editOrder.recurrenceUntil || '',
      address: hydrated.address || '',
      cleaningType: editOrder.cleaningType || mapCleaningType(hydrated.serviceType, hydrated.cleaningCategory),
      checklistItems: (Array.isArray(editOrder.checklist) ? editOrder.checklist : []).filter(
        (item) => typeof item === 'string' && item && !item.startsWith('equipment:') && item !== 'animalHair' && item !== 'smoking'
      ),
      comments: hydrated.comments || '',
    });
  }, [isEditMode, editOrder, isAdmin]);

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginTitle}>{t('orders.loginRequired', 'Login Required')}</Text>
          <Text style={styles.loginMessage}>
            {t('orders.loginRequiredMsg', 'Please log in to place a new order.')}
          </Text>
          <Button
            title={t('orders.goToLogin', 'Go to Login')}
            onPress={() => rootNavigate('MenuTab', { screen: 'Login' })}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 130 : 0}
      >
        <ScrollView
          ref={mainScrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditMode
                ? t('orders.editPendingOrder', 'Edit Pending Order')
                : t('newOrder.title', 'New Cleaning Order')}
            </Text>
            {configLoading ? <Text style={styles.configHint}>Loading saved options...</Text> : null}
            {isAdmin ? (
              <Button
                title={configSaving ? 'Saving options...' : 'Save Options'}
                onPress={saveOrderConfig}
                variant="secondary"
                loading={configSaving}
                disabled={configSaving}
                style={styles.saveOptionsButton}
              />
            ) : null}
          </View>

          {/* Section A: Service Type */}
          <SectionCard
            title={t('newOrder.serviceType', 'Service Type')}
            collapsible
            defaultExpanded={false}
          >
            <RadioGroup
              options={serviceTypeOptions}
              selectedValue={order.serviceType}
              onChange={(val) => updateOrder('serviceType', val)}
            />

            {isAdmin && (
              <View style={styles.adminEditorWrap}>
                <Text style={styles.adminEditorTitle}>Admin: Edit Service Type Labels</Text>
                {serviceTypeOptions.map((option) => (
                  <View key={`st-${option.value}`} style={styles.adminEditableRow}>
                    <TextInput
                      style={[styles.input, styles.adminEditableInput]}
                      value={option.label}
                      onChangeText={(val) => updateServiceTypeLabel(option.value, val)}
                      placeholder="Service type label"
                    />
                    {!REQUIRED_SERVICE_VALUES.includes(option.value) && (
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => removeServiceType(option.value)}>
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <Text style={styles.adminEditorTitle}>Add New Service Type</Text>
                <View style={styles.adminAddRow}>
                  <TextInput
                    style={[styles.input, { flex: 0.4, marginBottom: 0 }]}
                    value={newServiceValue}
                    onChangeText={setNewServiceValue}
                    placeholder="Value (e.g. office)"
                  />
                  <TextInput
                    style={[styles.input, styles.adminAddInput]}
                    value={newServiceLabel}
                    onChangeText={setNewServiceLabel}
                    placeholder="Label (shown to users)"
                  />
                  <Button title="Add" onPress={addServiceType} variant="secondary" />
                </View>
              </View>
            )}
          </SectionCard>

          {/* Home cleaning specific sections */}
          {isHome && (
            <>
              {/* Section B: Cleaning Category */}
              <SectionCard
                title={t('newOrder.cleaningCategory', 'Cleaning Category')}
                collapsible
                defaultExpanded={false}
              >
                <RadioGroup
                  options={cleaningCategoryOptions}
                  selectedValue={order.cleaningCategory}
                  onChange={(val) => updateOrder('cleaningCategory', val)}
                />

                {isAdmin && (
                  <View style={styles.adminEditorWrap}>
                    <Text style={styles.adminEditorTitle}>Admin: Edit Cleaning Category Content</Text>
                    {cleaningCategoryOptions.map((option) => (
                      <View key={`cc-${option.value}`} style={styles.adminEditorBlock}>
                        <View style={styles.adminEditableRow}>
                          <TextInput
                            style={[styles.input, styles.adminEditableInput]}
                            value={option.label}
                            onChangeText={(val) => updateCleaningCategoryField(option.value, 'label', val)}
                            placeholder="Category label"
                          />
                          {!REQUIRED_CATEGORY_VALUES.includes(option.value) && (
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => removeCleaningCategory(option.value)}>
                              <Text style={styles.deleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <TextInput
                          style={styles.input}
                          value={option.description || ''}
                          onChangeText={(val) => updateCleaningCategoryField(option.value, 'description', val)}
                          placeholder="Category description"
                        />
                      </View>
                    ))}
                    <Text style={styles.adminEditorTitle}>Add New Cleaning Category</Text>
                    <View style={styles.adminAddRow}>
                      <TextInput
                        style={[styles.input, { flex: 0.4, marginBottom: 0 }]}
                        value={newCategoryValue}
                        onChangeText={setNewCategoryValue}
                        placeholder="Value (e.g. deep)"
                      />
                      <TextInput
                        style={[styles.input, styles.adminAddInput]}
                        value={newCategoryLabel}
                        onChangeText={setNewCategoryLabel}
                        placeholder="Label"
                      />
                    </View>
                    <View style={styles.adminAddRow}>
                      <TextInput
                        style={[styles.input, styles.adminAddInput]}
                        value={newCategoryDesc}
                        onChangeText={setNewCategoryDesc}
                        placeholder="Description (optional)"
                      />
                      <Button title="Add" onPress={addCleaningCategory} variant="secondary" />
                    </View>
                  </View>
                )}
              </SectionCard>

              {/* Standard cleaning checklist */}
              {(order.cleaningCategory === 'standard' || order.cleaningCategory === 'main') && (
                <>
                  {/* Always included */}
                  <SectionCard
                    title={t('newOrder.alwaysIncluded', 'Always Included')}
                    description={t('newOrder.alwaysIncludedDesc', 'These tasks are always performed')}
                    collapsible
                    defaultExpanded={false}
                  >
                    {alwaysIncludedItems.map((item, index) => {
                      if (isAdmin) {
                        return (
                          <View key={`ai-edit-${index}`} style={styles.adminEditableRow}>
                            <TextInput
                              style={[styles.input, styles.adminEditableInput]}
                              value={item}
                              onChangeText={(val) => updateAlwaysIncludedLabel(index, val)}
                              placeholder="Always included item"
                            />
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => removeAlwaysIncludedItem(index)}>
                              <Text style={styles.deleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }

                      return (
                        <Checkbox
                          key={index}
                          label={item}
                          alwaysChecked
                        />
                      );
                    })}

                    {isAdmin && (
                      <View style={styles.adminAddRow}>
                        <TextInput
                          style={[styles.input, styles.adminAddInput]}
                          value={newAlwaysIncludedItem}
                          onChangeText={setNewAlwaysIncludedItem}
                          placeholder="Add always included item"
                        />
                        <Button title="Add" onPress={addAlwaysIncludedItem} variant="secondary" />
                      </View>
                    )}
                  </SectionCard>

                  {/* As needed — only for Standard */}
                  {order.cleaningCategory === 'standard' && (
                    <SectionCard
                      title={t('newOrder.asNeeded', 'As Needed')}
                      description={t('newOrder.asNeededDesc', 'Select additional tasks you want done')}
                      collapsible
                      defaultExpanded={false}
                    >
                      {asNeededItems.map((item) => (
                        <View key={item.key} style={styles.asNeededRow}>
                          <Checkbox
                            label={item.label}
                            checked={order.asNeededSelections.includes(item.key)}
                            onChange={() => toggleAsNeeded(item.key)}
                          />
                          {isAdmin && (
                            <View style={styles.adminEditableRow}>
                              <TextInput
                                style={[styles.input, styles.adminEditableInput]}
                                value={item.label}
                                onChangeText={(val) => updateAsNeededLabel(item.key, val)}
                                placeholder="As needed label"
                              />
                              <TouchableOpacity style={styles.deleteBtn} onPress={() => removeAsNeededItem(item.key)}>
                                <Text style={styles.deleteBtnText}>Delete</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      ))}

                      {isAdmin && (
                        <View style={styles.adminAddRow}>
                          <TextInput
                            style={[styles.input, styles.adminAddInput]}
                            value={newAsNeededItem}
                            onChangeText={setNewAsNeededItem}
                            placeholder="Add as needed item"
                          />
                          <Button title="Add" onPress={addAsNeededItem} variant="secondary" />
                        </View>
                      )}
                      {/* Cleaner reminders */}
                      {isCleaner && order.asNeededSelections.length > 0 && (
                        <InfoBox
                          title={t('newOrder.cleanerReminders', 'Reminders for Cleaner')}
                          type="warning"
                          messages={[
                            t('newOrder.reminderMove', 'REMEMBER TO MOVE ITEMS SO FLOOR APPEARS CLEAN!'),
                            t('newOrder.reminderEye', 'REMEMBER TO USE YOUR EYE ON DOORS, FRAMES, ETC.'),
                          ]}
                        />
                      )}
                    </SectionCard>
                  )}

                  {/* Main cleaning extras */}
                  {order.cleaningCategory === 'main' && (
                    <>
                      <SectionCard
                        title={t('newOrder.mainCleaningExtras', 'Main Cleaning — Additional Tasks')}
                        description={t('newOrder.mainCleaningExtrasDesc', 'All standard items plus these extra tasks')}
                        collapsible
                        defaultExpanded={false}
                      >
                        {mainExtraItems.map((item) => (
                          <Checkbox
                            key={item.key}
                            label={item.label}
                            checked={order.mainCleaningExtras.includes(item.key)}
                            onChange={() => toggleMainExtra(item.key)}
                          />
                        ))}
                      </SectionCard>

                      {/* Home size — Main cleaning */}
                      <SectionCard
                        title={t('newOrder.homeSize', 'Home Size')}
                        collapsible
                        defaultExpanded={false}
                      >
                        <RadioGroup
                          options={homeSizeOptions}
                          selectedValue={order.homeSize}
                          onChange={(val) => updateOrder('homeSize', val)}
                        />
                      </SectionCard>
                    </>
                  )}
                </>
              )}

              {/* Ad hoc cleaning options */}
              {order.cleaningCategory === 'adhoc' && (
                <SectionCard
                  title={t('newOrder.adhocOptions', 'Ad hoc Cleaning Options')}
                  description={t('newOrder.adhocOptionsDesc', 'Select the cleaning you need')}
                  collapsible
                  defaultExpanded={false}
                >
                  {adhocPredefined.map((item) => (
                    <Checkbox
                      key={item.key}
                      label={item.label}
                      checked={order.adhocSelections.includes(item.key)}
                      onChange={() => toggleAdhoc(item.key)}
                    />
                  ))}

                  <View style={styles.separator} />

                  {/* More bathrooms */}
                  <Checkbox
                    label={t('newOrder.moreBathrooms', 'More bathrooms (+½ hour each)')}
                    checked={order.extraBathrooms > 0}
                    onChange={(checked) =>
                      updateOrder('extraBathrooms', checked ? 1 : 0)
                    }
                  />
                  {order.extraBathrooms > 0 && (
                    <View style={styles.inlineInput}>
                      <Text style={styles.inputLabel}>
                        {t('newOrder.bathroomCount', 'Number of extra bathrooms')}
                      </Text>
                      <TextInput
                        style={styles.smallInput}
                        value={String(order.extraBathrooms)}
                        onChangeText={(val) =>
                          updateOrder('extraBathrooms', Math.max(0, parseInt(val) || 0))
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  )}

                  {/* Large home */}
                  <Checkbox
                    label={t('newOrder.largeHome', 'House over 150 sq m with 3+ rooms (+½ hour)')}
                    checked={order.adhocSelections.includes('largeHome')}
                    onChange={() => toggleAdhoc('largeHome')}
                  />

                  <View style={styles.separator} />

                  {/* Free text */}
                  <Text style={styles.inputLabel}>
                    {t('newOrder.specialRequests', 'Special Requests')}
                  </Text>
                  <TextInput
                    style={styles.textArea}
                    value={order.adhocFreeText}
                    onChangeText={(val) => updateOrder('adhocFreeText', val)}
                    placeholder={t('newOrder.specialRequestsPlaceholder', 'Describe any additional cleaning needs...')}
                    placeholderTextColor={colors.gray[400]}
                    multiline
                    numberOfLines={3}
                    onFocus={() => scrollToTextInput(mainScrollRef)}
                  />
                </SectionCard>
              )}
            </>
          )}

          {/* Commercial / Move-in-out — simple form */}
          {!isHome && (
            <SectionCard
              title={order.serviceType === 'commercial'
                ? t('newOrder.commercialCleaning', 'Commercial Cleaning')
                : t('newOrder.moveInOut', 'Move-in/Move-out')}
              collapsible
              defaultExpanded={true}
            >
              <Text style={styles.inputLabel}>
                {order.serviceType === 'commercial'
                  ? t('newOrder.commercialDesc', 'Describe your commercial cleaning needs')
                  : t('newOrder.moveInOutDesc', 'Describe your move-in/move-out cleaning needs')}
              </Text>
              <TextInput
                ref={commercialDescInputRef}
                style={styles.textArea}
                value={order.comments}
                onChangeText={(val) => updateOrder('comments', val)}
                placeholder={t('newOrder.commentsPlaceholder', 'Any other notes or instructions...')}
                placeholderTextColor={colors.gray[400]}
                multiline
                numberOfLines={4}
                onFocus={() => scrollToTextInput(mainScrollRef, commercialDescInputRef)}
              />
              <Text style={styles.inputLabel}>{t('newOrder.hoursLabel', 'Hours needed')}</Text>
              <TextInput
                style={styles.input}
                value={String(order.manualHours)}
                onChangeText={(val) => updateOrder('manualHours', parseFloat(val) || 0)}
                keyboardType="numeric"
              />
            </SectionCard>
          )}

          {/* Section F: Extra Targeted Cleaning */}
          <SectionCard
            title={t('newOrder.extraTargeted', 'Extra Targeted Cleaning')}
            collapsible
            defaultExpanded={false}
          >
            <Checkbox
              label={t('newOrder.animalHair', 'Animal hair')}
              checked={order.extraTargeted.animalHair}
              onChange={() => toggleExtraTargeted('animalHair')}
            />
            <Checkbox
              label={t('newOrder.smoking', 'Smoking')}
              checked={order.extraTargeted.smoking}
              onChange={() => toggleExtraTargeted('smoking')}
            />
          </SectionCard>

          {/* Section G: Equipment */}
          <SectionCard
            title={t('newOrder.equipment', 'Equipment')}
            description={t('newOrder.equipmentDesc', 'Select equipment you want the cleaner to bring')}
            collapsible
            defaultExpanded={false}
          >
            <Checkbox
              label={t('newOrder.cleaningAgents', 'Cleaning agents')}
              checked={order.equipment.cleaningAgents}
              onChange={() => toggleEquipment('cleaningAgents')}
            />
            <Checkbox
              label={t('newOrder.cloth', 'Cloth')}
              checked={order.equipment.cloth}
              onChange={() => toggleEquipment('cloth')}
            />
            <Checkbox
              label={t('newOrder.vacuumCleaner', 'Vacuum cleaner')}
              checked={order.equipment.vacuumCleaner}
              onChange={() => toggleEquipment('vacuumCleaner')}
            />
            <Checkbox
              label={t('newOrder.mop', 'Mop')}
              checked={order.equipment.mop}
              onChange={() => toggleEquipment('mop')}
            />
            <Checkbox
              label={t('newOrder.specialProducts', 'Special products')}
              checked={order.equipment.specialProducts}
              onChange={() => toggleEquipment('specialProducts')}
            />
          </SectionCard>

          {/* Section H: Booking Details */}
          <SectionCard
            title={t('newOrder.bookingDetails', 'Booking Details')}
            collapsible
            defaultExpanded={false}
          >
            {isAdmin ? (
              <>
                <Text style={styles.inputLabel}>{t('admin.client', 'Client')}</Text>
                <View style={styles.clientPickerWrap}>
                  <Picker selectedValue={selectedClientId} onValueChange={(value) => setSelectedClientId(value)}>
                    <Picker.Item label={clientsLoading ? 'Loading clients...' : t('admin.allClients', 'All clients')} value="" />
                    {clients.map((client) => (
                      <Picker.Item
                        key={String(client.id || client._id)}
                        label={`${client.name}${client.email ? ` (${client.email})` : ''}`}
                        value={String(client.id || client._id)}
                      />
                    ))}
                  </Picker>
                </View>
              </>
            ) : null}

            <View style={styles.calendarToolbar}>
              <View style={styles.calendarToolbarLeft}>
                <View style={styles.calendarModes}>
                  {['month', 'week', 'day'].map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.modeBtn, calendarMode === mode && styles.modeBtnActive]}
                      onPress={() => setCalendarMode(mode)}
                    >
                      <Text style={[styles.modeBtnText, calendarMode === mode && styles.modeBtnTextActive]}>
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.calendarNavRow}>
                  <TouchableOpacity
                    style={styles.calendarNavBtn}
                    onPress={() => setCalendarDate((prev) => shiftCalendarDate(prev, calendarMode, -1))}
                  >
                    <Text style={styles.calendarNavBtnText}>{t('common.prev', 'Prev')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.calendarNavBtn}
                    onPress={() => setCalendarDate(new Date())}
                  >
                    <Text style={styles.calendarNavBtnText}>{t('common.today', 'Today')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.calendarNavBtn}
                    onPress={() => setCalendarDate((prev) => shiftCalendarDate(prev, calendarMode, 1))}
                  >
                    <Text style={styles.calendarNavBtnText}>{t('common.next', 'Next')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.calendarActionWrap}>
                <Button
                  title={hasBookingEvent || isEditMode ? t('scheduling.editEvent', 'Edit event') : t('scheduling.newEvent', 'New event')}
                  onPress={() => handleOpenEventModal()}
                  variant="primary"
                />
              </View>
            </View>

            <Text style={styles.calendarTitle}>{calendarTitle}</Text>

            {isEditMode ? (
              <View style={styles.editDateTimeWrap}>
                <Text style={styles.editDateTimeHint}>
                  {t('orders.editDateTimeHint', 'To change pending booking date/time, open event editor and update start date and start time.')}
                </Text>
                <Button
                  title={t('orders.editDateTime', 'Edit Date & Time')}
                  onPress={() => handleOpenEventModal()}
                  variant="secondary"
                />
              </View>
            ) : null}

            <View style={styles.calendarCard}>
              {calendarLoading ? (
                <Text style={styles.calendarPlaceholder}>{t('common.loading', 'Loading...')}</Text>
              ) : (
                <Calendar
                  key={`calendar-${calendarMode}`}
                  events={calendarEvents}
                  mode={calendarMode}
                  date={calendarDate}
                  height={isNarrowScreen ? 360 : 420}
                  weekStartsOn={1}
                  swipeEnabled
                  onSwipeEnd={(date) => setCalendarDate(date)}
                  onPressCell={handleCalendarPressCell}
                  onPressEvent={handleCalendarPressEvent}
                />
              )}
            </View>

            <View style={styles.calendarClientInfo}>
              <Text style={styles.calendarClientLabel}>{t('admin.client', 'Client')}</Text>
              <Text style={styles.calendarClientValue}>
                {isAdmin
                  ? (selectedClientId
                    ? (clients.find((client) => String(client.id || client._id) === String(selectedClientId))?.name || t('admin.allClients', 'All clients'))
                    : t('admin.allClients', 'All clients'))
                  : t('scheduling.mySchedule', 'My Schedule')}
              </Text>
            </View>

            {!hasBookingEvent ? (
              <Text style={styles.bookingHintText}>
                {t('scheduling.pickEventHint', 'Create a new event to fill booking details before submitting.')}
              </Text>
            ) : (
              <View style={styles.bookingSummary}>
                <Text style={styles.bookingSummaryTitle}>{t('newOrder.bookingDetails', 'Booking Details')}</Text>
                <Text style={styles.bookingSummaryItem}>{order.address}</Text>
                <Text style={styles.bookingSummaryItem}>{order.date} {order.time}</Text>
              </View>
            )}

            {/* Calculated hours display */}
            <View style={styles.hoursDisplay}>
              <Text style={styles.hoursLabel}>
                {t('newOrder.calculatedHours', 'Estimated Hours')}
              </Text>
              <Text style={styles.hoursValue}>{estimatedHours} h</Text>
            </View>

            <Text style={styles.inputLabel}>{t('newOrder.additionalComments', 'Additional Comments')}</Text>
            <TextInput
              ref={commentsInputRef}
              style={styles.textArea}
              value={isHome ? order.comments : undefined}
              onChangeText={isHome ? (val) => updateOrder('comments', val) : undefined}
              defaultValue={!isHome ? order.comments : undefined}
              placeholder={t('newOrder.commentsPlaceholder', 'Any other notes or instructions...')}
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={3}
              onFocus={() => scrollToTextInput(mainScrollRef, commentsInputRef)}
            />
          </SectionCard>

          <Modal
            visible={showNewEvent}
            transparent
            animationType="fade"
            onRequestClose={() => setShowNewEvent(false)}
          >
            <KeyboardAvoidingView
              style={styles.modalKeyboardWrap}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 130 : 0}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalCard, { width: modalWidth }]}> 
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('scheduling.newEvent', 'New event')}</Text>
                    <TouchableOpacity onPress={() => setShowNewEvent(false)}>
                      <Text style={styles.modalClose}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    ref={modalScrollRef}
                    style={styles.modalBody}
                    contentContainerStyle={styles.modalBodyContent}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                  >
                  <Text style={styles.inputLabel}>{t('scheduling.title', 'Title')}</Text>
                  <TextInput
                    style={styles.input}
                    value={eventForm.title}
                    onChangeText={(value) => updateEventForm('title', value)}
                    placeholder={t('scheduling.titlePlaceholder', 'e.g. Cleaning service')}
                  />

                  {isAdmin ? (
                    <>
                      <Text style={styles.inputLabel}>{t('admin.client', 'Client')} *</Text>
                      <View style={styles.clientPickerWrap}>
                        <Picker
                          selectedValue={selectedClientId}
                          onValueChange={(value) => {
                            setSelectedClientId(value);
                            const selectedClient = clients.find((client) => String(client.id || client._id) === String(value));
                            updateEventForm('address', formatClientAddress(selectedClient));
                          }}
                        >
                          <Picker.Item label={t('admin.chooseClient', 'Choose a client...')} value="" />
                          {clients.map((client) => (
                            <Picker.Item
                              key={String(client.id || client._id)}
                              label={`${client.name}${client.email ? ` (${client.email})` : ''}`}
                              value={String(client.id || client._id)}
                            />
                          ))}
                        </Picker>
                      </View>
                    </>
                  ) : null}

                  <Text style={styles.inputLabel}>{t('scheduling.startDate', 'Start date')} *</Text>
                  {isWeb ? (
                    <input
                      style={webInputStyle}
                      value={eventForm.date}
                      onChange={(event) => updateEventForm('date', event.target.value)}
                      type="date"
                    />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.nativePickerBtn}
                        onPress={() => setShowNativeDatePicker(true)}
                      >
                        <Text style={eventForm.date ? styles.nativePickerText : styles.nativePickerPlaceholder}>
                          {eventForm.date ? new Date(eventForm.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select date...'}
                        </Text>
                        <Text style={styles.nativePickerIcon}>📅</Text>
                      </TouchableOpacity>
                      {showNativeDatePicker && (
                        <DateTimePicker
                          value={eventForm.date ? new Date(eventForm.date + 'T00:00:00') : new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            setShowNativeDatePicker(Platform.OS === 'ios');
                            if (selectedDate) {
                              const yyyy = selectedDate.getFullYear();
                              const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                              const dd = String(selectedDate.getDate()).padStart(2, '0');
                              updateEventForm('date', `${yyyy}-${mm}-${dd}`);
                            }
                          }}
                        />
                      )}
                      {showNativeDatePicker && Platform.OS === 'ios' && (
                        <TouchableOpacity style={styles.pickerDoneBtn} onPress={() => setShowNativeDatePicker(false)}>
                          <Text style={styles.pickerDoneBtnText}>Done</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  <View style={[styles.timeRow, (isNarrowScreen || isWeb) && styles.timeRowStack]}>
                    <View style={styles.timeCol}>
                      <Text style={styles.inputLabel}>{t('scheduling.startTime', 'Start time')}</Text>
                      {isWeb ? (
                        <input
                          style={webInputStyle}
                          value={eventForm.startTime}
                          onChange={(event) => updateEventForm('startTime', event.target.value)}
                          type="time"
                        />
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.nativePickerBtn}
                            onPress={() => setShowNativeStartTimePicker(true)}
                          >
                            <Text style={eventForm.startTime ? styles.nativePickerText : styles.nativePickerPlaceholder}>
                              {eventForm.startTime || 'Select time...'}
                            </Text>
                            <Text style={styles.nativePickerIcon}>🕐</Text>
                          </TouchableOpacity>
                          {showNativeStartTimePicker && (
                            <DateTimePicker
                              value={(() => { const [h, m] = (eventForm.startTime || '09:00').split(':'); const d = new Date(); d.setHours(parseInt(h), parseInt(m), 0); return d; })()}
                              mode="time"
                              is24Hour={true}
                              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                              onChange={(event, selectedTime) => {
                                setShowNativeStartTimePicker(Platform.OS === 'ios');
                                if (selectedTime) {
                                  const hh = String(selectedTime.getHours()).padStart(2, '0');
                                  const mm = String(selectedTime.getMinutes()).padStart(2, '0');
                                  updateEventForm('startTime', `${hh}:${mm}`);
                                }
                              }}
                            />
                          )}
                          {showNativeStartTimePicker && Platform.OS === 'ios' && (
                            <TouchableOpacity style={styles.pickerDoneBtn} onPress={() => setShowNativeStartTimePicker(false)}>
                              <Text style={styles.pickerDoneBtnText}>Done</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                    <View style={styles.timeCol}>
                      <Text style={styles.inputLabel}>{t('scheduling.endTime', 'End time')}</Text>
                      {isWeb ? (
                        <input
                          style={webInputStyle}
                          value={eventForm.endTime}
                          onChange={(event) => updateEventForm('endTime', event.target.value)}
                          type="time"
                        />
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.nativePickerBtn}
                            onPress={() => setShowNativeEndTimePicker(true)}
                          >
                            <Text style={eventForm.endTime ? styles.nativePickerText : styles.nativePickerPlaceholder}>
                              {eventForm.endTime || 'Select time...'}
                            </Text>
                            <Text style={styles.nativePickerIcon}>🕐</Text>
                          </TouchableOpacity>
                          {showNativeEndTimePicker && (
                            <DateTimePicker
                              value={(() => { const [h, m] = (eventForm.endTime || '09:30').split(':'); const d = new Date(); d.setHours(parseInt(h), parseInt(m), 0); return d; })()}
                              mode="time"
                              is24Hour={true}
                              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                              onChange={(event, selectedTime) => {
                                setShowNativeEndTimePicker(Platform.OS === 'ios');
                                if (selectedTime) {
                                  const hh = String(selectedTime.getHours()).padStart(2, '0');
                                  const mm = String(selectedTime.getMinutes()).padStart(2, '0');
                                  updateEventForm('endTime', `${hh}:${mm}`);
                                }
                              }}
                            />
                          )}
                          {showNativeEndTimePicker && Platform.OS === 'ios' && (
                            <TouchableOpacity style={styles.pickerDoneBtn} onPress={() => setShowNativeEndTimePicker(false)}>
                              <Text style={styles.pickerDoneBtnText}>Done</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity style={styles.checkRow} onPress={() => updateEventForm('allDay', !eventForm.allDay)}>
                    <View style={[styles.checkBox, eventForm.allDay && styles.checkBoxActive]} />
                    <Text style={styles.checkLabel}>{t('scheduling.allDay', 'All day')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.checkRow} onPress={() => updateEventForm('recurring', !eventForm.recurring)}>
                    <View style={[styles.checkBox, eventForm.recurring && styles.checkBoxActive]} />
                    <Text style={styles.checkLabel}>{t('scheduling.recurring', 'Recurring')}</Text>
                  </TouchableOpacity>

                  {eventForm.recurring ? (
                    <View style={styles.recurringWrap}>
                      <Text style={styles.inputLabel}>{t('scheduling.repeatEvery', 'Repeat every')}</Text>
                      <View style={styles.recurrenceStepperRow}>
                        <View style={styles.recurrenceValueBox}>
                          <Text style={styles.recurrenceValueText}>{String(eventForm.recurrenceEvery ?? 0)}</Text>
                        </View>
                        <View style={styles.recurrenceArrowColumn}>
                          <TouchableOpacity
                            style={styles.recurrenceArrowBtn}
                            onPress={() => stepRecurrenceEvery(1)}
                          >
                            <Text style={styles.recurrenceArrowText}>▲</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.recurrenceArrowBtn}
                            onPress={() => stepRecurrenceEvery(-1)}
                          >
                            <Text style={styles.recurrenceArrowText}>▼</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.recurrenceUnitText}>{t('scheduling.week', 'week(s)')}</Text>
                      </View>
                      <Text style={styles.inputLabel}>{t('scheduling.onDays', 'On days')}</Text>
                      <View style={styles.weekdayRow}>
                        {WEEKDAYS.map((day) => (
                          <TouchableOpacity
                            key={day.value}
                            style={[styles.weekdayBtn, eventForm.recurrenceDays.includes(day.value) && styles.weekdayBtnActive]}
                            onPress={() => toggleRecurrenceDay(day.value)}
                          >
                            <Text style={[styles.weekdayText, eventForm.recurrenceDays.includes(day.value) && styles.weekdayTextActive]}>{day.short}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={styles.inputLabel}>{t('scheduling.untilDate', 'Until date')}</Text>
                      {isWeb ? (
                        <input
                          style={webInputStyle}
                          value={eventForm.recurrenceUntil}
                          onChange={(event) => updateEventForm('recurrenceUntil', event.target.value)}
                          type="date"
                        />
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.nativePickerBtn}
                            onPress={() => setShowNativeUntilDatePicker(true)}
                          >
                            <Text style={eventForm.recurrenceUntil ? styles.nativePickerText : styles.nativePickerPlaceholder}>
                              {eventForm.recurrenceUntil ? new Date(eventForm.recurrenceUntil + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select end date...'}
                            </Text>
                            <Text style={styles.nativePickerIcon}>📅</Text>
                          </TouchableOpacity>
                          {showNativeUntilDatePicker && (
                            <DateTimePicker
                              value={eventForm.recurrenceUntil ? new Date(eventForm.recurrenceUntil + 'T00:00:00') : new Date()}
                              mode="date"
                              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                              onChange={(event, selectedDate) => {
                                setShowNativeUntilDatePicker(Platform.OS === 'ios');
                                if (selectedDate) {
                                  const yyyy = selectedDate.getFullYear();
                                  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                  const dd = String(selectedDate.getDate()).padStart(2, '0');
                                  updateEventForm('recurrenceUntil', `${yyyy}-${mm}-${dd}`);
                                }
                              }}
                            />
                          )}
                          {showNativeUntilDatePicker && Platform.OS === 'ios' && (
                            <TouchableOpacity style={styles.pickerDoneBtn} onPress={() => setShowNativeUntilDatePicker(false)}>
                              <Text style={styles.pickerDoneBtnText}>Done</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  ) : null}

                  <Text style={styles.inputLabel}>{t('auth.address', 'Address')} *</Text>
                  <TextInput
                    style={styles.input}
                    value={eventForm.address}
                    placeholder={t('newOrder.addressPlaceholder', 'Enter your address')}
                    editable={false}
                  />

                  <Text style={styles.inputLabel}>{t('client.whatNeedsToBeDone', 'What needs to be done')}</Text>
                  <View style={styles.checklistInputRow}>
                    <TextInput
                      style={[styles.input, styles.checklistInput]}
                      value={checklistInput}
                      onChangeText={setChecklistInput}
                      placeholder={t('client.checklistPlaceholder', 'e.g. Kitchen cleaning, Bathroom deep clean...')}
                      onSubmitEditing={addChecklistItem}
                    />
                    <TouchableOpacity
                      style={[styles.addChecklistBtn, !checklistInput.trim() && styles.addChecklistBtnDisabled]}
                      onPress={addChecklistItem}
                      disabled={!checklistInput.trim()}
                    >
                      <Text style={styles.addChecklistBtnText}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                  {(eventForm.checklistItems || []).length > 0 ? (
                    <View style={styles.checklistListWrap}>
                      {(eventForm.checklistItems || []).map((item, index) => (
                        <View key={`check-item-${index}`} style={styles.checklistItemRow}>
                          <Text style={styles.checklistTick}>✓</Text>
                          <Text style={styles.checklistItemText}>{item}</Text>
                          <TouchableOpacity onPress={() => removeChecklistItem(index)} style={styles.removeChecklistBtn}>
                            <Text style={styles.removeChecklistBtnText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <Text style={styles.inputLabel}>{t('client.comments', 'Comments')}</Text>
                  <TextInput
                    ref={modalCommentsInputRef}
                    style={styles.textArea}
                    value={eventForm.comments}
                    onChangeText={(value) => updateEventForm('comments', value)}
                    placeholder={t('newOrder.commentsPlaceholder', 'Any other notes or instructions...')}
                    placeholderTextColor={colors.gray[400]}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    onFocus={() => scrollToTextInput(modalScrollRef, modalCommentsInputRef)}
                  />

                  {eventError ? <Text style={styles.eventError}>{eventError}</Text> : null}

                    <View style={styles.modalActions}>
                      <Button title={t('scheduling.saveEvent', 'Save')} onPress={handleSaveNewEvent} variant="primary" />
                      <Button title={t('common.cancel', 'Cancel')} onPress={() => setShowNewEvent(false)} variant="secondary" />
                    </View>
                  </ScrollView>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Date Events Modal */}
          <Modal
            visible={!!dateEventsModal}
            transparent
            animationType="fade"
            onRequestClose={() => setDateEventsModal(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { width: modalWidth }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {dateEventsModal
                      ? `${dateEventsModal.date.toLocaleDateString('en-GB')} — ${dateEventsModal.events.length} ${dateEventsModal.events.length === 1 ? t('scheduling.event', 'Event') : t('scheduling.events', 'Events')}`
                      : ''}
                  </Text>
                  <TouchableOpacity onPress={() => setDateEventsModal(null)}>
                    <Text style={styles.modalClose}>×</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody}>
                  {dateEventsModal?.events.map((evt, idx) => (
                    <View key={evt.id || idx} style={styles.dateEventCard}>
                      <Text style={styles.dateEventTitle}>{evt.title}</Text>
                      <Text style={styles.dateEventDetail}>
                        {t('scheduling.time', 'Time')}: {evt.start ? evt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - {evt.end ? evt.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Text>
                      {evt.resource?.address ? (
                        <Text style={styles.dateEventDetail}>
                          {t('scheduling.address', 'Address')}: {evt.resource.address}
                        </Text>
                      ) : null}
                      {evt.resource?.status ? (
                        <Text style={styles.dateEventDetail}>
                          {t('scheduling.status', 'Status')}: {evt.resource.status}
                        </Text>
                      ) : null}
                      {evt.resource?.cleaningType ? (
                        <Text style={styles.dateEventDetail}>
                          {t('scheduling.cleaningType', 'Cleaning Type')}: {evt.resource.cleaningType}
                        </Text>
                      ) : null}
                      {evt.resource?.cleaner ? (
                        <View style={styles.dateEventCleanerSection}>
                          <Text style={[styles.dateEventDetail, { fontWeight: '600' }]}>
                            {t('scheduling.assignedCleaner', 'Assigned Cleaner')}: {evt.resource.cleaner.name}
                          </Text>
                          {evt.resource.cleaner.phone ? (
                            <Text style={styles.dateEventDetail}>
                              {t('common.phone', 'Phone')}: {evt.resource.cleaner.phone}
                            </Text>
                          ) : null}
                          {evt.resource.cleaner.email ? (
                            <Text style={styles.dateEventDetail}>
                              {t('common.email', 'Email')}: {evt.resource.cleaner.email}
                            </Text>
                          ) : null}
                        </View>
                      ) : (
                        <Text style={[styles.dateEventDetail, { color: '#f59e0b', fontStyle: 'italic' }]}>
                          {t('scheduling.noCleanerAssigned', 'No cleaner assigned yet')}
                        </Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Submit */}
          <View style={styles.submitContainer}>
            {bookingValidationError ? (
              <Text style={styles.submitValidationText}>{bookingValidationError}</Text>
            ) : null}
            <Button
              title={submitting
                ? t('newOrder.submitting', 'Submitting...')
                : (isEditMode ? t('orders.saveChanges', 'Save Changes') : t('newOrder.submitOrder', 'Submit Order'))}
              onPress={handleSubmit}
              disabled={submitting}
              loading={submitting}
              variant="primary"
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    marginBottom: spacing.md,
  },
  saveOptionsButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  configHint: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loginTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  loginMessage: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.sm,
  },
  adminEditorWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  adminEditorTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  adminEditorBlock: {
    marginBottom: spacing.sm,
  },
  adminAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  adminAddInput: {
    flex: 1,
    marginBottom: 0,
  },
  adminEditableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  adminEditableInput: {
    flex: 1,
    marginBottom: 0,
  },
  deleteBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  deleteBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  asNeededRow: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  nativePickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  nativePickerText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  nativePickerPlaceholder: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
  },
  nativePickerIcon: {
    fontSize: 18,
  },
  pickerDoneBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  pickerDoneBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
    width: 60,
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  inlineInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  hoursDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  hoursLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryDark,
  },
  hoursValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  submitContainer: {
    marginTop: spacing.md,
  },
  clientPickerWrap: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  calendarToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    gap: spacing.sm,
    width: '100%',
  },
  calendarToolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    flex: 1,
    minWidth: 220,
  },
  calendarActionWrap: {
    marginLeft: 'auto',
    alignSelf: 'center',
    alignItems: 'flex-end',
  },
  submitValidationText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  calendarModes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    maxWidth: '100%',
  },
  calendarNavRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  calendarNavBtn: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
  },
  calendarNavBtnText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
    fontWeight: typography.fontWeight.medium,
  },
  calendarTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.sm,
    textTransform: 'capitalize',
  },
  modeBtn: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
  },
  modeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  modeBtnText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
    textTransform: 'capitalize',
  },
  modeBtnTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.fontWeight.bold,
  },
  calendarCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    width: '100%',
    alignSelf: 'stretch',
  },
  calendarPlaceholder: {
    padding: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  calendarClientInfo: {
    marginBottom: spacing.sm,
  },
  calendarClientLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  calendarClientValue: {
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    fontWeight: typography.fontWeight.semibold,
  },
  bookingHintText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  editDateTimeWrap: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  editDateTimeHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  bookingSummary: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  bookingSummaryTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  bookingSummaryItem: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  modalKeyboardWrap: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    maxHeight: '90%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
  },
  modalClose: {
    fontSize: 24,
    color: colors.textLight,
  },
  modalBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalBodyContent: {
    paddingBottom: spacing.xl,
  },
  dateEventCard: {
    backgroundColor: colors.gray[50] || '#f9fafb',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  dateEventTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textDark,
    marginBottom: 4,
  },
  dateEventDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  dateEventCleanerSection: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200] || '#e5e7eb',
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  timeRowStack: {
    flexDirection: 'column',
    gap: 0,
  },
  timeCol: {
    flex: 1,
    minWidth: 0,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 4,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  checkBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
  },
  recurringWrap: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.gray[50],
  },
  cleaningTypeOptionsWrap: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  recurrenceStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  recurrenceValueBox: {
    minWidth: 72,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurrenceValueText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
  },
  recurrenceArrowColumn: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  recurrenceArrowBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  recurrenceArrowText: {
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    fontWeight: typography.fontWeight.bold,
  },
  recurrenceUnitText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
  },
  weekdayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  weekdayBtn: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
  },
  weekdayBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  weekdayText: {
    fontSize: typography.fontSize.xs,
    color: colors.textDark,
  },
  weekdayTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.fontWeight.bold,
  },
  eventError: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  checklistInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  checklistInput: {
    flex: 1,
    marginBottom: 0,
  },
  addChecklistBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  addChecklistBtnDisabled: {
    opacity: 0.5,
  },
  addChecklistBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  checklistListWrap: {
    marginBottom: spacing.sm,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  checklistTick: {
    color: colors.secondary,
    marginRight: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  checklistItemText: {
    flex: 1,
    color: colors.textDark,
    fontSize: typography.fontSize.sm,
  },
  removeChecklistBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  removeChecklistBtnText: {
    color: colors.error,
    fontSize: typography.fontSize.lg,
    lineHeight: 20,
  },
  modalActions: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
});

export default NewOrder;
