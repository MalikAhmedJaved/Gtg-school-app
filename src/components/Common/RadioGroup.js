import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const RadioGroup = ({
  options = [],
  selectedValue,
  onChange,
  label,
  style,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onChange && onChange(option.value)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={isSelected ? colors.primary : colors.gray[400]}
              style={styles.radioIcon}
            />
            <View style={styles.optionTextContainer}>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              {option.description ? (
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  optionSelected: {
    backgroundColor: colors.backgroundDark,
  },
  radioIcon: {
    marginRight: spacing.sm,
    marginTop: 1,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 22,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
    lineHeight: 18,
  },
});

export default RadioGroup;
