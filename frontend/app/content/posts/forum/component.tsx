import CommentItem from "@/components/CommentItem";
import InputBox from "@/components/InputBox";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { usePreventDoubleTap } from "@/hooks/usePreventDoubleTap";
import { ProfileData } from "@/redux/slices/profileSlice";
import { styles } from "@/utility/content/posts/styles";
import { styles as homeStyles } from "@/utility/home/styles";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { ForumPost, PostState } from "../controller";
import type { Comment } from "./controller";
import { ForumState } from "./controller";

type Props = {
  post: ReturnType<typeof useFieldState<PostState>>;
  forum: ReturnType<typeof useFieldState<ForumState>>;
  getUpdatedText: (createdAt: Date) => string;
  currentUserProfile: ProfileData;
  handleSubmit: () => Promise<void>;
  checkLogin: (next: string | (() => void)) => void;
  toggleReplies: (parentId: string) => void;
};

export default function ForumComponent({
  post,
  forum,
  getUpdatedText,
  currentUserProfile,
  handleSubmit,
  checkLogin,
  toggleReplies,
}: Props) {
  const { postData } = post;
  const { comment, comments, setFieldState, replyTo } = forum;
  const forumData = postData as ForumPost;
  const handleSubmitPress = usePreventDoubleTap(() => checkLogin(handleSubmit));

  const parentComments = comments.filter((c) => !c.parentId);
  const replyMap = comments.reduce((acc, c) => {
    if (c.parentId) {
      acc[c.parentId] = acc[c.parentId] || [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {} as Record<string, Comment[]>);

  return (
    <View
      style={[
        styles.contentContainer,
        { borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
      ]}
    >
      <Text style={styles.content}>{forumData.description}</Text>
      <Text style={styles.dateText}>
        {getUpdatedText(new Date(forumData.createdAt))}
      </Text>

      <View style={styles.divider} />

      <View className="flex-row mb-4 items-center gap-2">
        <Text style={styles.sectionTitle}>Comments</Text>
        <Text style={styles.countLabel}>
          ({postData?.commentsCount} comments)
        </Text>
      </View>

      {replyTo && (
        <View className="flex-row items-center justify-between mb-1.5">
          <Text
            style={styles.replyToText}
            numberOfLines={1}
            ellipsizeMode="tail"
            className="flex-shrink max-w-[80%]"
          >
            Replying to {replyTo.user.username}
          </Text>

          <Pressable onPress={() => setFieldState("replyTo", null)}>
            <Text style={{ color: Colors.text.link, fontSize: 12 }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      )}

      <View className="flex-row items-center">
        <View className="w-[30px] h-[30px] rounded-[20px] mr-2 overflow-hidden border border-gray-300">
          <Image
            source={{ uri: currentUserProfile.avatarUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <InputBox
          placeholder="Leave a comment..."
          value={comment}
          onChangeText={(text) => setFieldState("comment", text)}
          containerStyle={styles.commentBar}
          inputStyle={{ paddingLeft: 15 }}
        />
        <Pressable onPress={handleSubmitPress}>
          <IconSymbol
            name="paperplane.fill"
            color={Colors.brand.primary}
            size={20}
          />
        </Pressable>
      </View>

      <ScrollView className="mt-3">
        {parentComments.length > 0 ? (
          parentComments.map((c) => (
            <View key={c.id}>
              <CommentItem
                avatarUrl={c.user.avatarUrl}
                username={c.user.username}
                timeAgo={c.timeAgo}
                content={c.content}
                onReplyPress={() => setFieldState("replyTo", c)}
                hasReplies={Boolean(replyMap[c.id]?.length)}
              />

              {(replyMap[c.id]?.length ?? 0) > 0 && (
                <Pressable
                  onPress={() => toggleReplies(c.id)}
                  className="ml-2 mb-2"
                >
                  <Text
                    style={[styles.replyButton, { color: Colors.text.link }]}
                  >
                    {forum.expandedComments?.[c.id]
                      ? "Hide Replies"
                      : `View Replies (${replyMap[c.id].length})`}
                  </Text>
                </Pressable>
              )}

              {forum.expandedComments?.[c.id] &&
                replyMap[c.id].map((reply) => (
                  <View key={reply.id} className="ml-6">
                    <CommentItem
                      avatarUrl={reply.user.avatarUrl}
                      username={reply.user.username}
                      timeAgo={reply.timeAgo}
                      content={reply.content}
                    />
                  </View>
                ))}
            </View>
          ))
        ) : (
          <View className="flex-row items-center justify-center mb-12 mt-3">
            <View style={homeStyles.divider} />
            <Text style={homeStyles.endText}>No comments yet</Text>
            <View style={homeStyles.divider} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
