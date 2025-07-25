export const TheMealDB_Config = {
  BASE_URL: "https://www.themealdb.com/api/json/v1/1",
  THEMEALDB_ID: "6820380fced41380df17",
};

const fetchMealDBList = async (
  queryParam: string,
  key: "strIngredient" | "strCategory" | "strArea"
): Promise<string[]> => {
  try {
    const response = await fetch(
      `${TheMealDB_Config.BASE_URL}/list.php?${queryParam}=list`
    );
    const data = await response.json();

    return data.meals?.map((item: any) => item[key]?.trim()) ?? [];
  } catch (error) {
    console.error(`Error fetching ${key} list:`, error);
    return [];
  }
};

export const fetchIngredients = (): Promise<string[]> =>
  fetchMealDBList("i", "strIngredient");

export const fetchCategory = (): Promise<string[]> =>
  fetchMealDBList("c", "strCategory");

export const fetchArea = (): Promise<string[]> =>
  fetchMealDBList("a", "strArea");
