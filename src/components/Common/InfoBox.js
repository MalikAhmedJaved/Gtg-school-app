import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const InfoBox = ({
  title,
  message,
  messages = [],
  type = 'info', // 'info' | 'warning' | 'success'
  icon,
  style,
}) => {
  const { colors } = useTheme();
  const typeConfig = {
    info: {
      bgColor: colors.backgroundDark,
      borderColor: colors.primary,
      iconName: 'information-circle',
      iconColor: colors.primary,
      textColor: colors.primaryDark,
    },
    warning: {
      bgColor: '#FFF8E1',
      borderColor: colors.warning,
      iconName: 'warning',
      iconColor: colors.warning,
      textColor: '#8B6914',
    },
    success: {
      bgColor: '#E8F5E9',
      borderColor: colors.success,
      iconName: 'checkmark-circle',
      iconColor: colors.success,
      textColor: '#2E7D32',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  const allMessages = message
    ? [message, ...messages]
    : messages;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderLeftColor: config.borderColor,
        },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Ionicons
          name={icon || config.iconName}
          size={20}
          color={config.iconColor}
          style={styles.icon}
        />
        {title ? (
          <Text style={[styles.title, { color: config.textColor }]}>
            {title}
          </Text>
        ) : null}
      </View>
      {allMessages.map((msg, index) => (
        <Text
          key={index}
          style={[styles.message, { color: config.textColor }]}
        >
          {msg}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
  },
  message: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginTop: spacing.xs,
    paddingLeft: 28,
  },
});

export default InfoBox;
