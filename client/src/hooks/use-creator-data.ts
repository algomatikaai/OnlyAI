import { useQuery } from "@tanstack/react-query";
import { User, Content } from "@shared/schema";

export function useFeaturedCreators() {
  return useQuery<User[]>({
    queryKey: ["/api/creators/featured"],
  });
}

export function useCreatorProfile(username: string) {
  return useQuery<User>({
    queryKey: [`/api/users/${username}`],
    enabled: !!username,
  });
}

export function useCreatorContent(userId: number) {
  return useQuery<Content[]>({
    queryKey: [`/api/content/user/${userId}`],
    enabled: !!userId,
  });
}

export function useFeaturedContent() {
  return useQuery<Content[]>({
    queryKey: ["/api/content/featured"],
  });
}

export function useTrendingContent() {
  return useQuery<Content[]>({
    queryKey: ["/api/content/trending"],
  });
}
