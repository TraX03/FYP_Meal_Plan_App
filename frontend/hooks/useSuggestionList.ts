import {
  fetchArea,
  fetchCategory,
  fetchIngredients,
} from "@/services/MealDbApi";
import { useEffect, useState } from "react";

export type SuggestionType = "ingredient" | "category" | "area" | "mealtime";

const fetchMap: Partial<Record<SuggestionType, () => Promise<string[]>>> = {
  ingredient: fetchIngredients,
  category: fetchCategory,
  area: fetchArea,
};

export function useSuggestionList(type: SuggestionType) {
  const [allItems, setAllItems] = useState<string[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      const fetchFn = fetchMap[type];
      if (!fetchFn) {
        setAllItems([]);
        return;
      }

      const list = await fetchFn();
      setAllItems(list);
    };

    loadItems();
  }, [type]);

  const getSuggestions = (query: string): string[] => {
    if (!query) return [];
    return allItems
      .filter((name) => name.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5);
  };

  return { getSuggestions, allItems };
}
