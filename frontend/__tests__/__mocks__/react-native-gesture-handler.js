module.exports = {
  ...jest.requireActual("react-native-gesture-handler"),
  GestureHandlerRootView: ({ children }) => children,
};
