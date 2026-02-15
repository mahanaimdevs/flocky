import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";

import { apiFetch, type Page } from "@/lib/api-client";

export type User = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type UseUsersParams = {
  page: number;
  size: number;
};

export function useUsers({ page, size }: UseUsersParams): UseQueryResult<Page<User>> {
  return useQuery<Page<User>>({
    queryKey: ["users", { page, size }],
    queryFn: () => apiFetch<Page<User>>(`/users?page=${page}&size=${size}`),
    placeholderData: keepPreviousData,
  });
}
