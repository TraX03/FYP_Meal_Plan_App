import { Colors } from "@/constants/Colors";
import { View } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";

interface StarRatingProps {
  score: number;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ score, size = 14 }) => {
  const fullStars = Math.floor(score / 2);
  const halfStar = score % 2 >= 1;

  const renderStar = (i: number) => {
    if (i < fullStars) {
      return (
        <IconSymbol
          key={`star-full-${i}`}
          name="star.fill"
          color={Colors.feedback.warning}
          size={size}
        />
      );
    }

    if (i === fullStars && halfStar) {
      return (
        <View key={`star-half-${i}`} className="relative">
          <IconSymbol
            name="star.fill"
            color={Colors.surface.backgroundMuted}
            size={size}
          />
          <View
            className="absolute h-full overflow-hidden"
            style={{ width: size / 2 }}
          >
            <IconSymbol
              name="star.fill"
              color={Colors.feedback.warning}
              size={size}
            />
          </View>
        </View>
      );
    }

    return (
      <IconSymbol
        key={`star-empty-${i}`}
        name="star.fill"
        color={Colors.surface.backgroundMuted}
        size={size}
      />
    );
  };

  return (
    <View className="flex-row">
      {Array.from({ length: 5 }, (_, i) => renderStar(i))}
    </View>
  );
};

export default StarRating;
