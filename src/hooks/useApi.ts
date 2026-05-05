import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api/client";

// ─── Generic hooks ──────────────────────────────────────

export function useFetch<T>(key: string[], endpoint: string, enabled = true) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const res = await apiClient.get<T>(endpoint);
      return res.data;
    },
    enabled,
  });
}

export function useFetchPaginated<T>(
  key: string[],
  endpoint: string,
  page: number,
  enabled = true
) {
  return useQuery<{ data: T[]; meta: any }>({
    queryKey: [...key, page],
    queryFn: async () => {
      const res = await apiClient.get<T[]>(`${endpoint}&page=${page}&limit=20`);
      return { data: res.data as T[], meta: res.meta };
    },
    enabled,
  });
}

export function useMutate<T>(
  method: "post" | "put" | "delete",
  endpoint: string,
  invalidateKeys?: string[][]
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body?: any) => {
      const res =
        method === "post"
          ? await apiClient.post<T>(endpoint, body)
          : method === "put"
          ? await apiClient.put<T>(endpoint, body)
          : await apiClient.delete<T>(endpoint);
      return res.data;
    },
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
  });
}

// ─── Domain-specific hooks ──────────────────────────────

export function useStudents(courseId?: string, page = 1) {
  let params = `limit=20`;
  if (courseId) params += `&course_id=${courseId}`;
  return useFetchPaginated<any>(["students", courseId || "all"], `/students?${params}`, page);
}

export function useCourses() {
  return useFetch<any[]>(["courses"], "/courses");
}

export function useSubjects(facultyId?: string) {
  let endpoint = "/subjects";
  if (facultyId) endpoint += `?faculty_id=${facultyId}`;
  return useFetch<any[]>(["subjects", facultyId || "all"], endpoint);
}

export function useFaculty() {
  return useFetch<any[]>(["faculty"], "/faculty");
}

export function useAttendance(params: string) {
  return useFetch<any[]>(["attendance", params], `/attendance?${params}`);
}

export function useAttendanceSummary() {
  return useFetch<any>(["attendance-summary"], "/attendance/summary");
}

export function useLeaves(params: string) {
  return useFetch<any[]>(["leaves", params], `/leaves?${params}`);
}

export function useMarkAttendance() {
  return useMutation({
    mutationFn: async (body: any) => {
      const res = await apiClient.post("/attendance/mark", body);
      return res.data;
    },
  });
}

export function useLeavesAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiClient.put(`/leaves/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}
