import HeaderBar from "@/components/HeaderBar";
import MasonryList from "@/components/MasonryList";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { styles as profileStyles } from "@/utility/profile/styles";
import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";
import { HistoryState } from "./controller";

type Props = {
  history: ReturnType<typeof useFieldState<HistoryState>>;
  interactionVersion: number;
};

export default function HistoryComponent({
  history,
  interactionVersion,
}: Props) {
  const { posts } = history;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenWrapper>
        <ScrollView
          style={profileStyles.headerContainer}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <HeaderBar title="History" />
          <View style={{ backgroundColor: Colors.surface.background, flex: 1 }}>
            <MasonryList
              posts={posts}
              interactionVersion={interactionVersion}
              source="historyPage"
            />
          </View>
        </ScrollView>
      </ScreenWrapper>
    </>
  );
}
