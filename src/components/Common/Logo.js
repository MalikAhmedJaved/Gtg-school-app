import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { colors } from '../../constants/theme';

// Use the provided PNG logo for the mobile app
const logoPng = require('../../../assets/logo-Photoroom.png');

const Logo = ({ width = 150, height = 150 }) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={logoPng}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackLogo: {
    color: colors.primary,
  },
});

export default Logo;
