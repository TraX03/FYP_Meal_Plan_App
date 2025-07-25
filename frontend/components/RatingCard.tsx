import { Review } from "@/app/content/posts/recipe/controller";
import { Colors } from "@/constants/Colors";
import { getImageUrl } from "@/utility/imageUtils";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import StarRating from "./StarRating";
import { styles } from "./styles";
import { IconSymbol } from "./ui/IconSymbol";

type Props = {
  review: Review;
  onImagePress: (image: string) => void;
};

const RatingCard = ({ review, onImagePress }: Props) => {
  const formatReviewDate = (dateStr: string): string => {
    const reviewDate = new Date(dateStr);
    const now = new Date();

    const diffTime = now.getTime() - reviewDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;

    return reviewDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View className="px-2.5 pb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row">
          <View className="w-[45px] h-[45px] rounded-full mr-2 overflow-hidden">
            {review.avatarUrl && (
              <Image
                source={{ uri: review.avatarUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
          </View>
          <View>
            <Text style={styles.username}>{review.username}</Text>
            <StarRating score={review.score} />
          </View>
        </View>

        <View className="items-end">
          <IconSymbol
            name="ellipsis"
            color={Colors.brand.primary}
            size={20}
            selectedIcon={1}
          />
          <Text style={styles.dateText}>
            {formatReviewDate(review.createdAt)}
          </Text>
        </View>
      </View>

      {review.images?.length > 0 && (
        <ScrollView horizontal className="py-3">
          {review.images.map((img, i) => (
            <Pressable key={i} onPress={() => onImagePress(img)}>
              <Image
                source={{ uri: getImageUrl(img) }}
                style={styles.authorAvatar}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Text className="py-3">{review.content?.trim() || "No comments."}</Text>

      <View style={styles.ratingDivider} />
    </View>
  );
};

export default RatingCard;
