import { useFieldState } from "@/hooks/useFieldState";
import { Review } from "../controller";

type SortOption = {
  label: string;
  value: "latest" | "oldest" | "rating_desc" | "rating_asc";
};

export const sortOptions: SortOption[] = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest Rating", value: "rating_desc" },
  { label: "Lowest Rating", value: "rating_asc" },
];

export interface RateState {
  reviews?: Review[];
  selectedFilters: {
    all: boolean;
    withMedia: boolean;
    withText: boolean;
    ratingScore: string;
    orderBy: string;
  };
  fullscreenImage: string;
}

export const useRatingController = () => {
  const rate = useFieldState<RateState>({
    selectedFilters: {
      all: true,
      withMedia: false,
      withText: false,
      ratingScore: "All",
      orderBy: "latest",
    },
    fullscreenImage: "",
  });

  const { setFieldState, reviews = [], selectedFilters } = rate;

  const getStarDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];

    reviews.forEach(({ score }) => {
      const star = Math.min(5, Math.max(1, Math.round(score / 2)));
      distribution[star - 1]++;
    });

    const total = reviews.length;
    return distribution.map((count) => (total ? (count / total) * 100 : 0));
  };

  const sortBy = {
    latest: (a: Review, b: Review) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    oldest: (a: Review, b: Review) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    rating_desc: (a: Review, b: Review) => b.score - a.score,
    rating_asc: (a: Review, b: Review) => a.score - b.score,
  };

  const getFilteredReviews = (reviews: Review[]) => {
    const { all, withMedia, withText, ratingScore, orderBy } = selectedFilters;

    let filtered = reviews.filter(({ images, content, score }) => {
      const hasMedia = images.length > 0;
      const hasText = content.trim().length > 0;

      if (!all) {
        if (withMedia && !hasMedia) return false;
        if (withText && !hasText) return false;
      }

      if (ratingScore !== "All") {
        const targetScore = parseInt(ratingScore);
        if (Math.round(score) !== targetScore) return false;
      }

      return true;
    });

    return filtered.sort(sortBy[orderBy as keyof typeof sortBy]);
  };

  const updateFilters = (updates: Partial<RateState["selectedFilters"]>) => {
    setFieldState("selectedFilters", {
      ...selectedFilters,
      ...updates,
    });
  };

  const toggleMediaFilter = () => {
    const withMedia = !selectedFilters.withMedia;
    updateFilters({
      withMedia,
      all: !withMedia && !selectedFilters.withText,
    });
  };

  const toggleTextFilter = () => {
    const withText = !selectedFilters.withText;
    updateFilters({
      withText,
      all: !selectedFilters.withMedia && !withText,
    });
  };

  const setAllFilter = () => {
    updateFilters({
      all: true,
      withMedia: false,
      withText: false,
    });
  };

  const setRatingScoreFilter = (value: string) =>
    updateFilters({ ratingScore: value });

  const setOrderBy = (value: string) => updateFilters({ orderBy: value });

  return {
    rate,
    getStarDistribution,
    getFilteredReviews,
    actions: {
      toggleMediaFilter,
      toggleTextFilter,
      setAllFilter,
      setRatingScoreFilter,
      setOrderBy,
    },
  };
};

export default useRatingController;
