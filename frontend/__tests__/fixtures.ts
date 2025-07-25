import { Post } from "@/components/PostCard";
import * as Appwrite from "@/services/Appwrite";

export const testPost: Post = {
  id: "post-1",
  type: "recipe",
  title: "Test Title",
  image: "https://example.com/image.jpg",
  created_at: new Date().toISOString(),
};

export const mockUser: any = {
  $id: "user1",
  $createdAt: "2025-01-01T00:00:00Z",
  $updatedAt: "2025-01-01T00:00:00Z",
  name: "Test User",
  registration: "2025-01-01T00:00:00Z",
  email: "test@example.com",
  emailVerification: false,
  phoneVerification: false,
  status: true,
  passwordUpdate: "2025-01-01T00:00:00Z",
  accessedAt: "2025-07-15T00:00:00Z",
};

export const mockedGetCurrentUser =
  Appwrite.getCurrentUser as jest.MockedFunction<
    typeof Appwrite.getCurrentUser
  >;
