const { withAndroidStyles } = require("@expo/config-plugins");

const withCustomStyles = (config) => {
  return withAndroidStyles(config, async (config) => {
    config.modResults = applyCustomStyles(config.modResults);
    return config;
  });
};

function applyCustomStyles(styles) {
  console.log("Applying custom styles:", styles);

  if (styles.resources && Array.isArray(styles.resources.style)) {
    const appTheme = styles.resources.style.find(
      (style) => style.$.name === "AppTheme"
    );

    if (appTheme) {
      appTheme.item.push({
        _: "@style/Dialog.Theme",
        $: { name: "android:datePickerDialogTheme" },
      });
      appTheme.item.push({
        _: "@style/Dialog.Theme",
        $: { name: "android:timePickerDialogTheme" },
      });
    }

    const existingStyle = styles.resources.style.find(
      (style) => style.$.name === "Dialog.Theme"
    );
    if (!existingStyle) {
      styles.resources.style.push({
        $: { name: "Dialog.Theme", parent: "Theme.AppCompat.Light.Dialog" },
        item: [{ _: "#E84A62", $: { name: "colorAccent" } }],
      });
    } else {
      console.log("Dialog.Theme already exists, skipping creation");
    }
  } else {
    console.error("Invalid style structure in the provided data");
  }

  return styles;
}

module.exports = withCustomStyles;
