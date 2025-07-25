const ActualSafeAreaContext = jest.requireActual(
  "react-native-safe-area-context"
);

module.exports = {
  ...ActualSafeAreaContext,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
};
