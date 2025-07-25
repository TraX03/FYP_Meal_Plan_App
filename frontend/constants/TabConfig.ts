/* Below is the configuration for the app's bottom tab navigation. */

import { IconSymbolName } from "@/components/ui/IconSymbol";

export interface TabItem {
  name: string;
  title?: string;
  icon?: IconSymbolName;
  iconFocused?: IconSymbolName;
  hidden?: boolean;
};

export const TabConfig: TabItem[] = [
  {
    name: "index",
    title: "Home",
    icon: "house",
    iconFocused: "house.fill",
  },
  {
    name: "planner",
    title: "Planner",
    icon: "calendar.circle",
    iconFocused: "calendar.circle.fill",
  },
  {
    name: "_add",
    hidden: true,
  },
  {
    name: "lists",
    title: "Lists",
    icon: "list.bullet",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person",
    iconFocused: "person.fill",
  },
];
