import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { navigate as rootNavigate } from '../../utils/rootNavigation';
import { createOrder, calculateHours, createEmptyOrder } from '../../utils/orderService';
import Button from '../../components/Common/Button';
import Checkbox from '../../components/Common/Checkbox';
import RadioGroup from '../../components/Common/RadioGroup';
import SectionCard from '../../components/Common/SectionCard';
import InfoBox from '../../components/Common/InfoBox';

const NewOrder = ({ navigation }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(createEmptyOrder());
  const [submitting, setSubmitting] = useState(false);

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

  const updateOrder = (field, value) => {
    setOrder((prev) => ({ ...prev, [field]: value }));
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

  const estimatedHours = useMemo(() => calculateHours(order), [order]);

  const handleSubmit = async () => {
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
      const result = await createOrder(order);
      navigation.replace('OrderConfirmation', { order: result });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Service type options ---
  const serviceTypeOptions = [
    { value: 'home', label: t('newOrder.homeCleaning', 'Home Cleaning') },
    { value: 'commercial', label: t('newOrder.commercialCleaning', 'Commercial Cleaning') },
    { value: 'moveinout', label: t('newOrder.moveInOut', 'Move-in/Move-out') },
  ];

  // --- Cleaning category options (only for home) ---
  const cleaningCategoryOptions = [
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
  ];

  // --- Always included items ---
  const alwaysIncludedItems = [
    t('newOrder.vacuumCleaning', 'Vacuum cleaning'),
    t('newOrder.floorWashing', 'Floor washing'),
    t('newOrder.wipingSurfaces', 'Wiping surfaces'),
    t('newOrder.bridgeSink', 'Bridge/sink'),
    t('newOrder.bathroom', 'Bathroom, including cleaning toilet and sink (remember plug), mirror and shower'),
    t('newOrder.kitchenSurfaces', 'Kitchen surfaces (no washing up)'),
  ];

  // --- As needed items ---
  const asNeededItems = [
    { key: 'wipingFrames', label: t('newOrder.wipingFrames', 'Wiping frames, skirting boards, doors') },
    { key: 'limeShower', label: t('newOrder.limeShower', 'Lime shower cabin and sanitary') },
    { key: 'vacuumFurniture', label: t('newOrder.vacuumFurniture', 'Vacuuming furniture cushions and under cushions') },
    { key: 'cobwebs', label: t('newOrder.cobwebs', 'Cobwebs: walls, ceiling edges and windows') },
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('newOrder.title', 'New Cleaning Order')}</Text>
          </View>

          {/* Section A: Service Type */}
          <SectionCard title={t('newOrder.serviceType', 'Service Type')}>
            <RadioGroup
              options={serviceTypeOptions}
              selectedValue={order.serviceType}
              onChange={(val) => updateOrder('serviceType', val)}
            />
          </SectionCard>

          {/* Home cleaning specific sections */}
          {isHome && (
            <>
              {/* Section B: Cleaning Category */}
              <SectionCard title={t('newOrder.cleaningCategory', 'Cleaning Category')}>
                <RadioGroup
                  options={cleaningCategoryOptions}
                  selectedValue={order.cleaningCategory}
                  onChange={(val) => updateOrder('cleaningCategory', val)}
                />
              </SectionCard>

              {/* Standard cleaning checklist */}
              {(order.cleaningCategory === 'standard' || order.cleaningCategory === 'main') && (
                <>
                  {/* Always included */}
                  <SectionCard
                    title={t('newOrder.alwaysIncluded', 'Always Included')}
                    description={t('newOrder.alwaysIncludedDesc', 'These tasks are always performed')}
                  >
                    {alwaysIncludedItems.map((item, index) => (
                      <Checkbox
                        key={index}
                        label={item}
                        alwaysChecked
                      />
                    ))}
                  </SectionCard>

                  {/* As needed — only for Standard */}
                  {order.cleaningCategory === 'standard' && (
                    <SectionCard
                      title={t('newOrder.asNeeded', 'As Needed')}
                      description={t('newOrder.asNeededDesc', 'Select additional tasks you want done')}
                    >
                      {asNeededItems.map((item) => (
                        <Checkbox
                          key={item.key}
                          label={item.label}
                          checked={order.asNeededSelections.includes(item.key)}
                          onChange={() => toggleAsNeeded(item.key)}
                        />
                      ))}
                      {/* Cleaner reminders */}
                      {order.asNeededSelections.length > 0 && (
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
                      <SectionCard title={t('newOrder.homeSize', 'Home Size')}>
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
            >
              <Text style={styles.inputLabel}>
                {order.serviceType === 'commercial'
                  ? t('newOrder.commercialDesc', 'Describe your commercial cleaning needs')
                  : t('newOrder.moveInOutDesc', 'Describe your move-in/move-out cleaning needs')}
              </Text>
              <TextInput
                style={styles.textArea}
                value={order.comments}
                onChangeText={(val) => updateOrder('comments', val)}
                placeholder={t('newOrder.commentsPlaceholder', 'Any other notes or instructions...')}
                placeholderTextColor={colors.gray[400]}
                multiline
                numberOfLines={4}
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
          <SectionCard title={t('newOrder.bookingDetails', 'Booking Details')}>
            <Text style={styles.inputLabel}>{t('newOrder.address', 'Address')} *</Text>
            <TextInput
              style={styles.input}
              value={order.address}
              onChangeText={(val) => updateOrder('address', val)}
              placeholder={t('newOrder.addressPlaceholder', 'Enter your address')}
              placeholderTextColor={colors.gray[400]}
            />

            <Text style={styles.inputLabel}>{t('newOrder.preferredDate', 'Preferred Date')} *</Text>
            <TextInput
              style={styles.input}
              value={order.date}
              onChangeText={(val) => updateOrder('date', val)}
              placeholder={t('newOrder.datePlaceholder', 'YYYY-MM-DD')}
              placeholderTextColor={colors.gray[400]}
            />

            <Text style={styles.inputLabel}>{t('newOrder.preferredTime', 'Preferred Time')} *</Text>
            <TextInput
              style={styles.input}
              value={order.time}
              onChangeText={(val) => updateOrder('time', val)}
              placeholder={t('newOrder.timePlaceholder', 'HH:MM')}
              placeholderTextColor={colors.gray[400]}
            />

            {/* Calculated hours display */}
            <View style={styles.hoursDisplay}>
              <Text style={styles.hoursLabel}>
                {t('newOrder.calculatedHours', 'Estimated Hours')}
              </Text>
              <Text style={styles.hoursValue}>{estimatedHours} h</Text>
            </View>

            <Text style={styles.inputLabel}>{t('newOrder.additionalComments', 'Additional Comments')}</Text>
            <TextInput
              style={styles.textArea}
              value={isHome ? order.comments : undefined}
              onChangeText={isHome ? (val) => updateOrder('comments', val) : undefined}
              defaultValue={!isHome ? order.comments : undefined}
              placeholder={t('newOrder.commentsPlaceholder', 'Any other notes or instructions...')}
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={3}
            />
          </SectionCard>

          {/* Submit */}
          <View style={styles.submitContainer}>
            <Button
              title={submitting ? t('newOrder.submitting', 'Submitting...') : t('newOrder.submitOrder', 'Submit Order')}
              onPress={handleSubmit}
              disabled={submitting}
              loading={submitting}
              variant="primary"
            />
          </View>

          <View style={{ height: 40 }} />
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
  },
  header: {
    marginBottom: spacing.md,
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
});

export default NewOrder;
