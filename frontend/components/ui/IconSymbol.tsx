import {
  AntDesign,
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import React from "react";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

const MAPPING = {
  house: { name: "home-outline", type: "Ionicons" },
  "house.fill": { name: "home-sharp", type: "Ionicons" },
  "calendar.circle": { name: "calendar-outline", type: "Ionicons" },
  "calendar.circle.fill": { name: "calendar-sharp", type: "Ionicons" },
  "list.bullet": { name: ["list-outline", "list-sharp"], type: "Ionicons" },
  person: { name: "person-outline", type: "Ionicons" },
  "person.fill": { name: "person-sharp", type: "Ionicons" },
  magnifyingglass: { name: "search", type: "Ionicons" },
  bell: { name: "notifications", type: "Ionicons" },
  heart: { name: "heart-outline", type: "Ionicons" },
  "heart.fill": { name: "heart-sharp", type: "Ionicons" },
  bookmark: { name: "bookmark-outline", type: "Ionicons" },
  "bookmark.fill": { name: "bookmark-sharp", type: "Ionicons" },
  "chevron.left": { name: "chevron-back", type: "Ionicons" },
  "lock.fill": { name: "password", type: "MaterialIcons" },
  "pencil.circle": { name: "edit-3", type: "Feather" },
  "square.grid.2x2": { name: "settings-outline", type: "Ionicons" },
  "chevron.right": { name: "chevron-forward", type: "Ionicons" },
  photo: { name: "image-outline", type: "Ionicons" },
  "multiply.circle": { name: "x-circle", type: "Octicons" },
  pencil: { name: "pencil", type: "Octicons" },
  clock: { name: "history", type: "MaterialIcons" },
  plus: { name: "plus", type: "Octicons" },
  "person.2.fill": { name: "users", type: "Feather" },
  "multiply.circle.fill": { name: "x-circle-fill", type: "Octicons" },
  "arrow.up.left.and.arrow.down.right": {
    name: "fullscreen",
    type: "MaterialCommunityIcons",
  },
  trash: { name: "trash-can-outline", type: "MaterialCommunityIcons" },
  ellipsis: {
    name: ["ellipsis-vertical", "ellipsis-horizontal"],
    type: "Ionicons",
  },
  "ellipsis.circle": {
    name: "dots-horizontal-circle-outline",
    type: "MaterialCommunityIcons",
  },
  "arrow.clockwise.circle": {
    name: "refresh",
    type: "MaterialIcons",
  },
  "arrow.2.circlepath": { name: "refresh-ccw", type: "Feather" },
  "pencil.and.outline": {
    name: "circle-edit-outline",
    type: "MaterialCommunityIcons",
  },
  "chevron.down": {
    name: "chevron-down",
    type: "Ionicons",
  },
  "chevron.up": {
    name: "chevron-up",
    type: "Ionicons",
  },
  "checkmark.square": {
    name: "check-box-outline-blank",
    type: "MaterialIcons",
  },
  "checkmark.square.fill": {
    name: "check-box",
    type: "MaterialIcons",
  },
  "paperplane.fill": {
    name: "send",
    type: "Ionicons",
  },
  "arrowtriangle.down.fill": {
    name: "caretdown",
    type: "AntDesign",
  },
  "plus.rectangle.on.rectangle": {
    name: "duplicate-outline",
    type: "Ionicons",
  },
  "minus.circle.fill": {
    name: "heart-minus",
    type: "MaterialCommunityIcons",
  },
  "heart.slash.fill": { name: "heart-broken", type: "MaterialCommunityIcons" },
  "star.fill": { name: "star", type: "FontAwesome" },
  "star.lefthalf.fill": { name: "star-half", type: "FontAwesome" },
  "checkmark.circle": {
    name: "checkbox-blank-circle-outline",
    type: "MaterialCommunityIcons",
  },
  "checkmark.circle.fill": {
    name: "checkbox-marked-circle-outline",
    type: "MaterialCommunityIcons",
  },
  "plus.square.fill": {
    name: "plussquare",
    type: "AntDesign",
  },
  "minus.square.fill": {
    name: "minussquare",
    type: "AntDesign",
  },
  "info.circle": { name: "info", type: "Feather" },
  "arrow.down.doc": {
    name: "save",
    type: "Feather",
  },
} as const;

export type IconSymbolName = keyof typeof MAPPING;

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  selectedIcon?: number;
}

export function IconSymbol({
  name,
  size = 25,
  color,
  style,
  selectedIcon = 0,
}: IconSymbolProps) {
  const mapping = MAPPING[name];

  if (!mapping) {
    console.warn(`Icon mapping for "${name}" not found.`);
    return null;
  }

  const { name: iconName, type } = mapping;
  const iconComponentMap = {
    Ionicons: Ionicons,
    MaterialIcons: MaterialIcons,
    Feather: Feather,
    Octicons: Octicons,
    MaterialCommunityIcons: MaterialCommunityIcons,
    AntDesign: AntDesign,
    FontAwesome: FontAwesome,
  };

  const IconComponent = iconComponentMap[type];

  if (!IconComponent) {
    console.warn(`Icon type "${type}" is not supported.`);
    return null;
  }

  const finalIconName = Array.isArray(iconName)
    ? iconName[selectedIcon]
    : iconName;

  return (
    <IconComponent
      name={finalIconName}
      color={color}
      size={size}
      style={style}
    />
  );
}
