module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native" +
      "|@react-native" +
      "|@react-navigation" +
      "|react-native" +
      "|expo" +
      "|expo-asset" +
      "|expo-router" +
      "|expo-modules-core" +
      "|@expo" +
      "|react-native-css-interop" +
      "|react-native-toast-message" +
      "|react-native-appwrite" +
      "|native-base" +
      ")/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "react-native-image-colors":
      "<rootDir>/__mocks__/react-native-image-colors.js",
    "expo-asset": "<rootDir>/__mocks__/expo-asset.js",
    "\\.css$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/__mocks__/",
    "/__tests__/fixtures\\.ts$",
  ],
};
