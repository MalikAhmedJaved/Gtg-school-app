import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

const CleanerAttention = () => {
  const { t } = useLanguage();

  const cleanerChecklist = [
    t('cleanerChecklist.arriveOnTime', 'Arrive on time and confirm access details before starting.'),
    t('cleanerChecklist.bringEquipment', 'Bring required equipment and verify any special products needed.'),
    t('cleanerChecklist.handleFragile', 'Handle fragile items carefully and report any issue immediately.'),
    t('cleanerChecklist.followChecklist', 'Follow the task checklist and complete all required areas.'),
    t('cleanerChecklist.beforeAfter', 'Take before/after photos when required by admin or task notes.'),
    t('cleanerChecklist.finalCheck', 'Do a final quality check before leaving the location.'),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('cleanerChecklist.title', 'Cleaner Checklist')}</Text>
          {cleanerChecklist.map((point, index) => (
            <View key={`check-${index}`} style={styles.row}>
              <Text style={styles.icon}>✅</Text>
              <Text style={styles.text}>{point}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.md,
    ...shadows.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  text: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
});

export default CleanerAttention;
