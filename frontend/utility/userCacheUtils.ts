import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { ProfileData } from "@/redux/slices/profileSlice";
import { client, listDocuments } from "@/services/Appwrite";
import { Query, RealtimeResponseEvent } from "react-native-appwrite";
import { getImageUrl } from "./imageUtils";

export type UserInfo = Pick<
  ProfileData,
  | "username"
  | "avatarUrl"
  | "followersCount"
  | "followingCount"
  | "profileBg"
  | "bio"
  | "metadata"
>;

const userCache = new Map<string, UserInfo>();
const listenersMap = new Map<string, Set<() => void>>();

const setUserCache = (userId: string, info: UserInfo) => {
  userCache.set(userId, info);
  if (listenersMap.has(userId)) {
    for (const cb of listenersMap.get(userId)!) cb();
  }
};

export const fetchUsers = async (
  ids: string[]
): Promise<Map<string, UserInfo>> => {
  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
  const uncachedIds = uniqueIds.filter((id) => !userCache.has(id));

  if (uncachedIds.length > 0) {
    const users = await listDocuments(AppwriteConfig.USERS_COLLECTION_ID, [
      Query.equal("$id", uncachedIds),
    ]);

    users.forEach((user) => {
      setUserCache(user.$id, {
        username: user.username,
        avatarUrl: getImageUrl(user.avatar),
        followersCount: user.followers_count,
        followingCount: user.following_count,
        profileBg: user.profile_bg ? getImageUrl(user.profile_bg) : undefined,
        bio: user.bio ?? "",
        metadata: user.metadata ?? {},
      });
    });
  }

  const result = new Map<string, UserInfo>();
  uniqueIds.forEach((id) => {
    const user = userCache.get(id);
    if (user) result.set(id, user);
  });

  return result;
};

export const subscribeToUserUpdates = () => {
  const channel = `databases.${AppwriteConfig.DATABASE_ID}.collections.${AppwriteConfig.USERS_COLLECTION_ID}.documents`;

  const unsubscribe = client.subscribe(
    channel,
    (res: RealtimeResponseEvent<any>) => {
      const user = res.payload;
      const userId = user.$id;

      if (!userId) return;

      const cached = userCache.get(userId);

      if (cached) {
        const updatedInfo: UserInfo = {
          username: user.username,
          avatarUrl: getImageUrl(user.avatar),
          followersCount: user.followers_count,
          followingCount: user.following_count,
          profileBg: user.profile_bg ? getImageUrl(user.profile_bg) : undefined,
          bio: user.bio ?? "",
          metadata: user.metadata ?? {},
        };

        setUserCache(userId, updatedInfo);
      }
    }
  );

  return unsubscribe;
};

export const listenToUserCache = (userId: string, callback: () => void) => {
  if (!listenersMap.has(userId)) {
    listenersMap.set(userId, new Set());
  }

  listenersMap.get(userId)!.add(callback);

  return () => {
    listenersMap.get(userId)!.delete(callback);
  };
};
