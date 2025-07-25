import { AppwriteConfig } from "@/constants/AppwriteConfig";
import { createDocument } from "@/services/Appwrite";
import { TheMealDB_Config } from "@/services/MealDbApi";
import { detectBackgroundDarkness } from "@/utility/imageUtils";

const parseIngredients = (meal: any): string[] => {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim() && measure && measure.trim()) {
      ingredients.push(
        JSON.stringify({
          name: ingredient.trim(),
          quantity: measure.trim(),
        })
      );
    }
  }
  return ingredients;
};

const parseInstructions = (instructions: string): string[] => {
  const steps = instructions
    .split(".")
    .map((text) => text.replace(/^step\s*\d+[\.\-\:\)]*\s*/i, "").trim())
    .filter((text) => text.length > 0);

  return steps.map((text) =>
    JSON.stringify({
      text,
      image: undefined,
    })
  );
};

export const fetchAndSaveMeals = async () => {
  const { THEMEALDB_ID, BASE_URL } = TheMealDB_Config;

  try {
    const res = await fetch(`${BASE_URL}/search.php?f=y`);
    const data = await res.json();
    const meals: any[] = data.meals || [];

    for (const meal of meals) {
      try {
        const ingredients = parseIngredients(meal);
        const instructions = parseInstructions(meal.strInstructions);
        const images = [meal.strMealThumb];

        const metadata = {
          images: await Promise.all(
            images.map(async (uri: string) => {
              try {
                return { isDark: await detectBackgroundDarkness(uri) };
              } catch {
                return { isDark: false };
              }
            })
          ),
        };

        await createDocument(AppwriteConfig.RECIPES_COLLECTION_ID, {
          title: meal.strMeal,
          image: images,
          author_id: THEMEALDB_ID,
          ingredients,
          instructions,
          area: meal.strArea,
          category: [meal.strCategory],
          created_at: new Date().toISOString(),
          metadata: JSON.stringify(metadata),
        });

        console.log(`Saved: ${meal.strMeal}`);
      } catch (saveErr) {
        console.warn(`Failed to save ${meal.strMeal}`, saveErr);
      }
    }

    console.log(`Done: Imported ${meals.length} meals.`);
  } catch (err) {
    console.error("Error fetching meals or saving to Appwrite:", err);
  }
};
