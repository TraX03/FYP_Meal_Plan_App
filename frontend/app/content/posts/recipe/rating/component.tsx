import CustomPicker from "@/components/CustomPicker";
import FilterPill from "@/components/FilterPill";
import FullscreenImageViewer from "@/components/FullscreenImageViewer";
import HeaderBar from "@/components/HeaderBar";
import RatingCard from "@/components/RatingCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import StarRating from "@/components/StarRating";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { styles } from "@/utility/content/posts/recipe/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import { Stack } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Review } from "../controller";
import { RateState, sortOptions } from "./controller";

type Props = {
  rating: number;
  ratingCount: number;
  rate: ReturnType<typeof useFieldState<RateState>>;
  getStarDistribution: () => number[];
  getFilteredReviews: (reviews: Review[]) => Review[];
  actions: {
    toggleMediaFilter: () => void;
    toggleTextFilter: () => void;
    setAllFilter: () => void;
    setRatingScoreFilter: (value: string) => void;
    setOrderBy: (value: string) => void;
  };
};

export default function RatingComponent({
  rating,
  ratingCount,
  rate,
  getStarDistribution,
  getFilteredReviews,
  actions,
}: Props) {
  const { reviews, selectedFilters, fullscreenImage, setFieldState } = rate;
  const {
    toggleMediaFilter,
    toggleTextFilter,
    setAllFilter,
    setRatingScoreFilter,
    setOrderBy,
  } = actions;

  const percentages = getStarDistribution();

  const StarBreakdown = ({ percentages }: { percentages: number[] }) => (
    <View className="flex-1">
      {[5, 4, 3, 2, 1].map((star) => {
        const percent = percentages[star - 1];
        return (
          <View key={star} className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1">
              <Text style={styles.starLabel}>{star}</Text>
              <IconSymbol
                name="star.fill"
                color={Colors.text.label}
                size={14}
              />
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.progressBar, { width: `${percent}%` }]} />
            </View>
            <Text style={styles.percentText}>{percent.toFixed(1)}%</Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <FullscreenImageViewer
        imageUri={fullscreenImage}
        onClose={() => setFieldState("fullscreenImage", "")}
      />

      <ScreenWrapper>
        <View style={profileStyles.headerContainer}>
          <HeaderBar />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="px-6">
              <View style={styles.scoreContainer}>
                <View className="flex-col items-center">
                  <Text style={styles.ratingScore}>{rating.toFixed(1)}</Text>
                  <StarRating score={rating} size={20} />
                  <Text style={styles.ratingCount}>{ratingCount} ratings</Text>
                </View>
                <StarBreakdown percentages={percentages} />
              </View>
            </View>

            <View className="py-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 px-5">
                  <FilterPill
                    active={selectedFilters.all}
                    onPress={setAllFilter}
                    highlight
                  >
                    <Text
                      style={{
                        color: selectedFilters.all
                          ? Colors.brand.onPrimary
                          : undefined,
                      }}
                    >
                      All
                    </Text>
                  </FilterPill>

                  <FilterPill
                    active={selectedFilters.withMedia}
                    onPress={toggleMediaFilter}
                  >
                    <IconSymbol
                      name={
                        selectedFilters.withMedia
                          ? "checkmark.circle.fill"
                          : "checkmark.circle"
                      }
                      color={Colors.brand.primaryLight}
                      size={18}
                    />
                    <Text>Media</Text>
                  </FilterPill>

                  <FilterPill
                    active={selectedFilters.withText}
                    onPress={toggleTextFilter}
                  >
                    <IconSymbol
                      name={
                        selectedFilters.withText
                          ? "checkmark.circle.fill"
                          : "checkmark.circle"
                      }
                      color={Colors.brand.primaryLight}
                      size={18}
                    />
                    <Text>Text</Text>
                  </FilterPill>

                  <FilterPill>
                    <Text>Rating</Text>
                    <CustomPicker
                      selectedValue={selectedFilters.ratingScore}
                      onValueChange={setRatingScoreFilter}
                      options={[
                        "All",
                        ...Array.from({ length: 11 }, (_, i) => `${i}`),
                      ]}
                      iconColor={Colors.brand.primary}
                      textStyle={{ color: Colors.text.label, fontSize: 12 }}
                      style={[styles.pickerContainer, { paddingHorizontal: 0 }]}
                      includeEmptyOption={false}
                    />
                  </FilterPill>
                </View>
              </ScrollView>

              <View style={styles.orderByContainer}>
                <CustomPicker
                  selectedValue={
                    sortOptions.find(
                      (opt) => opt.value === selectedFilters.orderBy
                    )?.label ?? "Latest"
                  }
                  onValueChange={(label) => {
                    const matched = sortOptions.find(
                      (opt) => opt.label === label
                    );
                    if (matched) setOrderBy(matched.value);
                  }}
                  options={sortOptions.map((opt) => opt.label)}
                  placeholder="Latest"
                  style={styles.pickerContainer}
                  includeEmptyOption={false}
                />
              </View>

              <View className="px-2 mt-4">
                {getFilteredReviews(reviews ?? []).map((review, index) => (
                  <RatingCard
                    key={index}
                    review={review}
                    onImagePress={(img) =>
                      setFieldState("fullscreenImage", img)
                    }
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </ScreenWrapper>
    </>
  );
}
