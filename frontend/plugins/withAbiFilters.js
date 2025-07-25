const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withAbiFilters(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /defaultConfig\s*{[^}]*}/,
      (match) => {
        if (match.includes("abiFilters")) return match;

        return match.replace(
          /defaultConfig\s*{([\s\S]*?)}/,
          `defaultConfig {\n$1\n        ndk {\n            abiFilters "armeabi-v7a", "arm64-v8a", "x86", "x86_64"\n        }\n    }`
        );
      }
    );
    return config;
  });
};
