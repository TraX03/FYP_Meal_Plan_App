import { Post } from "@/components/PostCard";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { useFieldState } from "@/hooks/useFieldState";
import { fetchAllDocuments } from "@/services/Appwrite";
import { getImageUrl } from "@/utility/imageUtils";
import Fuse from "fuse.js";
import { useRef } from "react";
import { Query } from "react-native-appwrite";

export const mainTabs = ["Joined", "Created"] as const;
export type MainTab = (typeof mainTabs)[number];

export interface ListingState {
  created: Post[];
  joined: Post[];
  activeTab: MainTab;
  showLoading: boolean;
  searchText: string;
}

export const useCommunityListController = () => {
  const comList = useFieldState<ListingState>({
    created: [],
    joined: [],
    activeTab: "Joined",
    showLoading: false,
    searchText: "",
  });

  const { setFieldState, getFieldState, setFields } = comList;

  const originalCreatedRef = useRef<Post[]>([]);
  const originalJoinedRef = useRef<Post[]>([]);
  const fetchCreatedCommunities = async (userId: string) => {
    if (!userId) return;

    try {
      const docs = await fetchAllDocuments(
        AppwriteConfig.COMMUNITIES_COLLECTION_ID,
        [Query.equal("creator_id", userId)]
      );

      const communities: Post[] = docs.map((doc: any) => ({
        id: doc.$id,
        type: "community",
        title: doc.name,
        description: doc.description,
        image: getImageUrl(doc.image),
        membersCount: doc.members_count,
        postsCount: doc.posts_count,
        creator_id: doc.creator_id,
        created_at: doc.created_at,
      }));

      originalCreatedRef.current = communities;
      setFieldState("created", communities);
    } catch (err) {
      console.error("Failed to fetch created communities:", err);
    }
  };

  const fetchJoinedCommunities = async (userId: string) => {
    if (!userId) return;

    try {
      const interactions = await fetchAllDocuments(
        AppwriteConfig.INTERACTIONS_COLLECTION_ID,
        [Query.equal("user_id", userId), Query.equal("type", "join")]
      );

      const communityIds = interactions.map((i: any) => i.item_id);

      if (!communityIds.length) {
        setFieldState("joined", []);
        return;
      }

      const communityDocs = await fetchAllDocuments(
        AppwriteConfig.COMMUNITIES_COLLECTION_ID,
        [Query.equal("$id", communityIds)]
      );

      const joinedCommunities: Post[] = communityDocs.map((doc: any) => ({
        id: doc.$id,
        type: "community",
        title: doc.name,
        description: doc.description,
        image: getImageUrl(doc.image),
        membersCount: doc.members_count,
        postsCount: doc.posts_count,
        creator_id: doc.creator_id,
        created_at: doc.created_at,
      }));

      originalJoinedRef.current = joinedCommunities;
      setFieldState("joined", joinedCommunities);
    } catch (err) {
      console.error("Failed to fetch joined communities:", err);
    }
  };

  const handleCommunitySearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setFieldState("searchText", trimmed);

    const activeTab = getFieldState("activeTab");
    const source =
      activeTab === "Created"
        ? originalCreatedRef.current
        : originalJoinedRef.current;

    const fuse = new Fuse(source, {
      includeScore: true,
      threshold: 0.3,
      ignoreLocation: true,
      keys: [
        { name: "title", weight: 0.6 },
        { name: "description", weight: 0.4 },
      ],
    });

    const results = fuse.search(trimmed).map((r) => r.item);

    if (activeTab === "Created") {
      setFieldState("created", results);
    } else {
      setFieldState("joined", results);
    }
  };

  const resetCommunitySearch = () => {
    setFieldState("searchText", "");

    setFields({
      created: originalCreatedRef.current,
      joined: originalJoinedRef.current,
    });
  };

  return {
    comList,
    fetchCreatedCommunities,
    fetchJoinedCommunities,
    handleCommunitySearch,
    resetCommunitySearch,
  };
};

export default useCommunityListController;
