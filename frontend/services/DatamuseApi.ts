export const Datamuse_Config = {
  BASE_URL: "https://api.datamuse.com",
};

export const fetchSuggestions = async (input: string): Promise<string[]> => {
  if (!input.trim()) return [];

  try {
    const url = new URL("/sug", Datamuse_Config.BASE_URL);
    url.searchParams.set("s", input);
    url.searchParams.set("max", "10");

    const response = await fetch(url.toString());
    const data: { word: string }[] = await response.json();

    return data.map(({ word }) => word);
  } catch (error) {
    console.error("Datamuse suggestion error:", error);
    return [];
  }
};
