import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const SectionCard = ({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
  style,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => collapsible && setExpanded(!expanded)}
        activeOpacity={collapsible ? 0.7 : 1}
        disabled={!collapsible}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{title}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>
        {collapsible && (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textLight}
          />
        )}
      </TouchableOpacity>
      {(!collapsible || expanded) && (
        <View style={styles.content}>{children}</View>
      )}
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: 4,
    lineHeight: 18,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});

export default SectionCard;
