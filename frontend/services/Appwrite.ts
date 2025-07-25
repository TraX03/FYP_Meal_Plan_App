import { PostType } from "@/components/PostCard";
import { AppwriteConfig } from "@/constants/AppwriteConfig";
import {
  Account,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const client = new Client()
  .setEndpoint(AppwriteConfig.ENDPOINT)
  .setProject(AppwriteConfig.PROJECT_ID);

export const account = new Account(client);
export const storage = new Storage(client);
const databases = new Databases(client);

export const getCurrentUser = async () => {
  return await account.get();
};

export const getDocumentById = async (collectionId: string, id: string) => {
  return await databases.getDocument(
    AppwriteConfig.DATABASE_ID,
    collectionId,
    id
  );
};

const getDocumentSafe = async (collectionId: string, id: string) => {
  try {
    return await databases.getDocument(
      AppwriteConfig.DATABASE_ID,
      collectionId,
      id
    );
  } catch (err: any) {
    if (err.code !== 404) throw err;
    return null;
  }
};

export const getPostTypeById = async (id: string): Promise<PostType | null> => {
  const recipe = await getDocumentSafe(
    AppwriteConfig.RECIPES_COLLECTION_ID,
    id
  );
  if (recipe) return "recipe";

  const post = await getDocumentSafe(AppwriteConfig.POSTS_COLLECTION_ID, id);
  if (post?.type === "tips") return "tips";
  if (post?.type === "discussion") return "discussion";

  const community = await getDocumentSafe(
    AppwriteConfig.COMMUNITIES_COLLECTION_ID,
    id
  );
  if (community) return "community";

  return null;
};

export const fetchDocumentsByIds = async (
  collectionId: string,
  ids: string[]
) => {
  if (ids.length === 0) return [];
  const chunkSize = 100;
  const chunks = [];

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const res = await databases.listDocuments(
      AppwriteConfig.DATABASE_ID,
      collectionId,
      [Query.equal("$id", chunk)]
    );
    chunks.push(...res.documents);
  }

  return chunks;
};

export const fetchAllDocuments = async (
  collectionId: string,
  customQueries: string[] = []
): Promise<any[]> => {
  try {
    let documents: any[] = [];
    let lastDoc: any = null;
    const limit = 300;

    while (true) {
      const queries = [
        ...customQueries,
        Query.limit(limit),
        Query.orderAsc("$createdAt"),
      ];

      if (lastDoc) {
        queries.push(Query.cursorAfter(lastDoc.$id));
      }

      const { documents: newDocs } = await databases.listDocuments(
        AppwriteConfig.DATABASE_ID,
        collectionId,
        queries
      );

      documents = [...documents, ...newDocs];

      if (newDocs.length < limit) break;
      lastDoc = newDocs[newDocs.length - 1];
    }

    return documents;
  } catch (err) {
    console.warn(`Failed to fetch documents from ${collectionId}:`, err);
    return [];
  }
};

export const createDocument = async (
  collectionId: string,
  data: object,
  docId: string = ID.unique(),
  permissions?: string[]
) => {
  return await databases.createDocument(
    AppwriteConfig.DATABASE_ID,
    collectionId,
    docId,
    data,
    permissions
  );
};

export const deleteDocument = async (
  collectionId: string,
  documentId: string
) => {
  return await databases.deleteDocument(
    AppwriteConfig.DATABASE_ID,
    collectionId,
    documentId
  );
};

export const listDocuments = async (
  collectionId: string,
  queries: string[] = []
) => {
  try {
    const { documents } = await databases.listDocuments(
      AppwriteConfig.DATABASE_ID,
      collectionId,
      queries
    );
    return documents;
  } catch (err) {
    console.warn("listDocuments failed:", err);
    return [];
  }
};

export const updateDocument = async (
  collectionId: string,
  documentId: string,
  data: Record<string, any>
) => {
  return await databases.updateDocument(
    AppwriteConfig.DATABASE_ID,
    collectionId,
    documentId,
    data
  );
};
