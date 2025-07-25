import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { styles } from "@/utility/content/posts/styles";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

type CommentItemProps = {
  avatarUrl: string;
  username: string;
  timeAgo: string;
  content: string;
  onReplyPress?: () => void;
  hasReplies?: boolean;
  hideEllipsis?: boolean;
};

const CommentItem = ({
  avatarUrl,
  username,
  timeAgo,
  content,
  onReplyPress,
  hasReplies,
  hideEllipsis = false,
}: CommentItemProps) => (
  <View className={`flex-col ${hasReplies ? "my-2" : "my-4 pb-4"}`}>
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center max-w-[75%] flex-shrink">
        <View className="w-[30px] h-[30px] rounded-full mr-3 overflow-hidden border border-gray-300">
          <Image
            source={{ uri: avatarUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <Text
          style={{ fontFamily: "RobotoMedium" }}
          className="flex-shrink"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {username}
        </Text>
      </View>

      <View className="items-end">
        {!hideEllipsis && (
          <IconSymbol
            name="ellipsis"
            selectedIcon={1}
            color={Colors.brand.primary}
            size={18}
          />
        )}
        <Text style={styles.timeAgoText}>{timeAgo}</Text>
      </View>
    </View>

    <View className="ml-1">
      <Text style={styles.commentText}>{content}</Text>
    </View>

    {onReplyPress && (
      <Pressable onPress={onReplyPress}>
        <Text style={styles.replyButton}>Reply</Text>
      </Pressable>
    )}
  </View>
);

export default CommentItem;
