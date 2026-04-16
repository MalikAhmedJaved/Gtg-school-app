const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function disablePngCrunch(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('cruncherEnabled')) {
      return config;
    }
    config.modResults.contents = config.modResults.contents.replace(
      /android\s*\{/,
      `android {
    aaptOptions {
        cruncherEnabled = false
    }`
    );
    return config;
  });
};
