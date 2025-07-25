import useListsController from "@/app/lists/controller";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import * as AppwriteService from "@/services/Appwrite";
import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

jest.mock("@/services/Appwrite");
jest.mock("@/services/GeminiApi");
jest.mock("@/utility/notificationUtils");
jest.mock("@/services/GeminiApi", () => ({
  predictExpiryDateTime: jest.fn(() =>
    Promise.resolve("2025-08-01T00:00:00.000Z")
  ),
  generateSuggestions: jest.fn(() => Promise.resolve([])),
}));

const mockUser = { $id: "user123" };

beforeEach(() => {
  jest.clearAllMocks();
  (AppwriteService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  (AppwriteService.getDocumentById as jest.Mock).mockResolvedValue({
    inventory_recipes: [],
  });
  (AppwriteService.fetchAllDocuments as jest.Mock).mockResolvedValue([]);
  (AppwriteService.createDocument as jest.Mock).mockResolvedValue({
    $id: "mock_id",
  });
  (AppwriteService.updateDocument as jest.Mock).mockResolvedValue({});
  (AppwriteService.deleteDocument as jest.Mock).mockResolvedValue({});
});

describe("useListsController", () => {
  it("initializes and checks inventory_recipes", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    (AppwriteService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (AppwriteService.getDocumentById as jest.Mock).mockResolvedValue({
      inventory_recipes: ["recipe1", "recipe2"],
    });

    const { result } = renderHook(() => useListsController());

    await act(async () => {
      await result.current.init();
    });

    expect(AppwriteService.getCurrentUser).toHaveBeenCalled();
    expect(AppwriteService.getDocumentById).toHaveBeenCalledWith(
      AppwriteConfig.USERS_COLLECTION_ID,
      mockUser.$id
    );

    expect(Alert.alert).toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it("loads items and updates field state", async () => {
    (AppwriteService.fetchAllDocuments as jest.Mock).mockResolvedValue([
      {
        $id: "item1",
        type: "shopping",
        name: "Tomato",
        quantity: [2],
        unit: "kg",
        checked: false,
        checkedCount: 0,
        expiries: [],
      },
    ]);

    const { result } = renderHook(() => useListsController());

    await act(async () => {
      await result.current.actions.loadItems();
    });

    expect(AppwriteService.fetchAllDocuments).toHaveBeenCalled();
    expect(result.current.lists.items).toHaveLength(1);
    expect(result.current.lists.items[0].name).toBe("Tomato");
  });

  it("adds a new shopping item", async () => {
    const { result } = renderHook(() => useListsController());

    await act(async () => {
      await result.current.actions.addItemToList("Carrot", [1], "kg", 1);
    });

    const items = result.current.lists.items;
    expect(items.some((i) => i.name === "Carrot")).toBe(true);
  });

  it("handles duplicate shopping item and updates quantity", async () => {
    (AppwriteService.createDocument as jest.Mock).mockResolvedValue({
      $id: "mock_id",
    });

    (AppwriteService.updateDocument as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useListsController());

    await act(async () => {
      await result.current.actions.addItemToList("Carrot", [1], "kg", 1);
    });

    const originalLength = result.current.lists.items.length;

    await act(async () => {
      await result.current.actions.addItemToList("Carrot", [1], "kg", 1);
    });

    expect(result.current.lists.items.length).toBe(originalLength);
  });

  it("removes an item from the list", async () => {
    const { result } = renderHook(() => useListsController());

    await act(async () => {
      await result.current.actions.addItemToList("Lettuce", [1], "kg", 1);
    });

    const itemId = result.current.lists.items.find(
      (i) => i.name === "Lettuce"
    )?.id;

    await act(async () => {
      await result.current.actions.handleRemoveItem(itemId!);
    });

    expect(
      result.current.lists.items.find((i) => i.id === itemId)
    ).toBeUndefined();
  });
});
