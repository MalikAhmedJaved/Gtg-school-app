import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

const logoPng = require('../../../assets/gtg_logo.png');

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
});

export default Logo;
