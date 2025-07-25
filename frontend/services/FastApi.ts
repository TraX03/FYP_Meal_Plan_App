const FastApi_Config = {
  BASE_URL: "http://192.168.0.9:8000",
};

const fetchFromApi = async (endpoint: string, data?: any): Promise<any> => {
  try {
    const res = await fetch(`${FastApi_Config.BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error ${res.status}: ${errorText}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`Request to ${endpoint} failed:`, err);
    throw err;
  }
};

export const fetchColdstartRecommendations = (userId: string) =>
  fetchFromApi(`/onboarding/coldstart/${userId}`);

export const fetchHomeFeedRecommendations = (userId: string) =>
  fetchFromApi(`/recommendation/homeFeed/${userId}`);

export const fetchGeneratedMealPlan = (
  userId: string,
  date: string,
  mealtimes: string[],
  targetRecipeId?: string
) => {
  return fetchFromApi(`/recommendation/mealplan/${userId}`, {
    date,
    mealtime: mealtimes,
    target_recipe_id: targetRecipeId,
  });
};

export const logUserView = (
  userId: string,
  itemId: string,
  itemType: string,
  source = "homeFeed"
) =>
  fetchFromApi("/interaction/logView", {
    user_id: userId,
    item_id: itemId,
    item_type: itemType,
    source,
  });

export const logHomeFeedSessionFeedback = (userId: string) =>
  fetchFromApi(`/feedback/homeFeed/${userId}`);

export const logMealplanInventoryFeedback = (
  userId: string,
  date: string,
  mealtime: string[],
  targetRecipeId?: string,
  isRegenerate?: boolean
) => {
  return fetchFromApi(`/feedback/mealplan/${userId}`, {
    date,
    mealtime,
    target_recipe_id: targetRecipeId,
    is_regenerate: isRegenerate,
  });
};
