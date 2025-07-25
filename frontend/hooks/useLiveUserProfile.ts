import {
  fetchUsers,
  listenToUserCache,
  UserInfo,
} from "@/utility/userCacheUtils";
import { useEffect, useState } from "react";

export function useLiveUserProfile(userId?: string) {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (!userId) return;

    fetchUsers([userId]).then((map) => {
      setUser(map.get(userId) ?? null);
    });

    const unsubscribe = listenToUserCache(userId, () => {
      const updated = fetchUsers([userId]);
      updated.then((map) => {
        setUser(map.get(userId) ?? null);
      });
    });

    return unsubscribe;
  }, [userId]);

  return user;
}
