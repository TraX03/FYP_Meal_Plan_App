import { useReduxSelectors } from "@/hooks/useReduxSelectors";
import { useEffect } from "react";
import HomeComponent from "./component";
import { useHomeController } from "./controller";

export default function HomeContainer() {
  const { home, suggestions, filteredPosts, refreshing, onRefresh } =
    useHomeController();
  const { interactionVersion } = useReduxSelectors();

  useEffect(() => {
    onRefresh();
  }, [onRefresh, home.getFieldState("activeTab")]);

  return (
    <HomeComponent
      suggestions={suggestions}
      filteredPosts={filteredPosts}
      home={home}
      onRefresh={onRefresh}
      refreshing={refreshing}
      interactionVersion={interactionVersion}
    />
  );
}
