import { MMKV } from "react-native-mmkv";

const searchStorage = new MMKV();
const Recent_Searches_Key = "recent_searches";

export const getRecentSearches = (): string[] => {
  const data = searchStorage.getString(Recent_Searches_Key);
  return data ? JSON.parse(data) : [];
};

export const addRecentSearch = (query: string) => {
  const searches = getRecentSearches();
  const updated = [query, ...searches.filter((q) => q !== query)].slice(0, 10);
  searchStorage.set(Recent_Searches_Key, JSON.stringify(updated));
};

export const clearRecentSearches = () => {
  searchStorage.delete(Recent_Searches_Key);
};
