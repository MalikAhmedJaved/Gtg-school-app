import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const Checkbox = ({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  alwaysChecked = false,
  style,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isChecked = alwaysChecked || checked;

  const handlePress = () => {
    if (!disabled && !alwaysChecked && onChange) {
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled,
        alwaysChecked && styles.alwaysChecked,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={disabled || alwaysChecked ? 1 : 0.7}
    >
      <View
        style={[
          styles.checkbox,
          isChecked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
        ]}
      >
        {isChecked && (
          <Ionicons name="checkmark" size={16} color={colors.white} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.label,
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
  alwaysChecked: {
    opacity: 0.85,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxDisabled: {
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[200],
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.normal,
    lineHeight: 22,
  },
  labelDisabled: {
    color: colors.textLight,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
    lineHeight: 18,
  },
});

export default Checkbox;
