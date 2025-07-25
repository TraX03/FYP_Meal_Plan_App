import { Post } from "@/components/PostCard";
import { useFieldState } from "@/hooks/useFieldState";
import { fetchPosts, fetchUserList, User } from "@/utility/fetchUtils";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
} from "@/utility/searchStorageUtils";
import Fuse from "fuse.js";

export const searchModeOptions = [
  { id: "default", label: "Default" },
  { id: "ingredient", label: "Ingredient" },
  { id: "area", label: "Region" },
  { id: "diet", label: "Diet" },
] as const;

export type SearchMode = (typeof searchModeOptions)[number]["id"];
export type SearchContext = "mealtime" | "area";

export interface SearchState {
  posts: Post[];
  users: User[];
  allFilteredPosts: Post[];
  filteredUsers: User[];
  searchText: string;
  hasSearched: boolean;
  recentSearches: string[];
  expanded: boolean;
  postLoading: boolean;
  isInitialized: boolean;
  searchMode: SearchMode;
}

const useSearchController = () => {
  const search = useFieldState<SearchState>({
    posts: [],
    users: [],
    allFilteredPosts: [],
    filteredUsers: [],
    searchText: "",
    hasSearched: false,
    recentSearches: [],
    expanded: false,
    postLoading: false,
    isInitialized: false,
    searchMode: "default",
  });

  const { searchText, setFieldState, setFields, getFieldState } = search;

  const init = async () => {
    const recent = await getRecentSearches();
    setFieldState("recentSearches", recent);

    const [posts, users] = await Promise.all([
      fetchPosts(false, false),
      fetchUserList(),
    ]);

    setFields({
      posts,
      users,
      allFilteredPosts: posts,
      filteredUsers: users,
      isInitialized: true,
    });

    return { posts, users };
  };

  const handleSearch = async (term?: string, context?: SearchContext) => {
    const mode = getFieldState("searchMode");
    const query = (term ?? searchText).trim().toLowerCase();
    if (!query) return;

    setFields({
      searchText: query,
      postLoading: true,
      hasSearched: true,
    });

    let posts = search.posts;
    let users = search.users;

    if (!search.isInitialized) {
      const result = await init();
      posts = result.posts;
      users = result.users;
    }

    if (!context) {
      await addRecentSearch(query);
      const recent = await getRecentSearches();
      setFieldState("recentSearches", recent);
    }

    const recipePosts = posts.filter((post) => post.type === "recipe");
    const otherPosts = posts.filter((post) => post.type !== "recipe");

    let filteredRecipes: typeof posts = [];
    if (context) {
      filteredRecipes = recipePosts.filter((post) => {
        const rawValue = post[context] as string | string[] | undefined;

        const values: string[] = Array.isArray(rawValue)
          ? rawValue.map((v) => (typeof v === "string" ? v.toLowerCase() : ""))
          : typeof rawValue === "string"
          ? [rawValue.toLowerCase()]
          : [];

        return (
          values.includes(query.toLowerCase()) ||
          (context === "mealtime" && values.includes("all"))
        );
      });
    }

    const fuzzyTargetPosts = context ? otherPosts : posts;

    const postKeys =
      mode === "ingredient"
        ? [
            { name: "ingredients", weight: 1 },
            { name: "title", weight: 0.5 },
          ]
        : mode === "area"
        ? [
            { name: "area", weight: 1 },
            { name: "title", weight: 0.3 },
            { name: "description", weight: 0.1 },
          ]
        : mode === "diet"
        ? [
            { name: "tags", weight: 1 },
            { name: "category", weight: 0.6 },
            { name: "title", weight: 0.3 },
          ]
        : [
            { name: "title", weight: 0.58 },
            { name: "ingredients", weight: 0.25 },
            { name: "category", weight: 0.1 },
            { name: "description", weight: 0.07 },
          ];

    const postFuse = new Fuse(fuzzyTargetPosts, {
      includeScore: true,
      threshold: 0.25,
      ignoreLocation: true,
      keys: postKeys,
    });

    const postFuzzyResults = postFuse
      .search(query)
      .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
      .map((res) => res.item);

    const userFuse = new Fuse(users, {
      includeScore: true,
      threshold: 0.3,
      ignoreLocation: true,
      keys: [
        { name: "name", weight: 0.7 },
        { name: "bio", weight: 0.3 },
      ],
    });

    const userResults = userFuse
      .search(query)
      .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
      .map((res) => res.item);

    const allFilteredPosts = context
      ? [...filteredRecipes, ...postFuzzyResults]
      : postFuzzyResults;

    const finalFilteredPosts = dietaryFilter(query, allFilteredPosts);

    setFields({
      allFilteredPosts: finalFilteredPosts,
      filteredUsers: userResults,
      postLoading: false,
    });
  };

  const dietaryFilter = (query: string, posts: typeof search.posts) => {
    const lowerQuery = query.toLowerCase();

    const baseMeatBlacklist = [
      "chicken",
      "beef",
      "pork",
      "lamb",
      "fish",
      "shrimp",
      "bacon",
      "ham",
      "mutton",
      "duck",
      "turkey",
      "anchovy",
      "sardine",
      "venison",
      "ragu",
      "prawn",
    ];

    const dairyAndAnimalProducts = [
      "milk",
      "cheese",
      "butter",
      "yogurt",
      "egg",
      "honey",
      "cream",
      "mayonnaise",
      "ghee",
      "whey",
      "casein",
      "lard",
      "gelatin",
    ];

    const blacklistMap: Record<string, string[]> = {
      halal: ["pork", "pig", "bacon", "ham", "pig leg", "pig shoulder"],
      vegetarian: [...baseMeatBlacklist],
      vegan: [...baseMeatBlacklist, ...dairyAndAnimalProducts],
    };

    const getDiet = () => {
      if (lowerQuery.includes("vegan")) return "vegan";
      if (lowerQuery.includes("vegetarian")) return "vegetarian";
      if (lowerQuery.includes("halal")) return "halal";
      return null;
    };

    const diet = getDiet();
    if (!diet) return posts;

    const blacklist = blacklistMap[diet];

    return posts.filter((post) => {
      const ingredientNames = (post.ingredients ?? []).map((i) =>
        typeof i === "string" ? i.toLowerCase() : ""
      );
      const title = (post.title ?? "").toLowerCase();
      const description = (post.description ?? "").toLowerCase();

      const combinedFields = [...ingredientNames, title, description];

      return !combinedFields.some((field) =>
        blacklist.some((term) => field.includes(term))
      );
    });
  };

  const handleClear = async () => {
    await clearRecentSearches();
    setFieldState("recentSearches", []);
  };

  return {
    search,
    handleSearch,
    handleClear,
    init,
  };
};

export default useSearchController;
