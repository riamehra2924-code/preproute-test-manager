import { apiClient } from "./client";
import type {
  ApiResponse,
  TestSummary,
  TestDetail,
  CreateTestPayload,
  UpdateTestPayload,
} from "@/types";

export async function getTests(): Promise<TestSummary[]> {
  const res = await apiClient.get<ApiResponse<TestSummary[]>>("/tests");
  return res.data.data;
}

export async function getTestById(id: string): Promise<TestDetail> {
  const res = await apiClient.get<ApiResponse<TestDetail>>(`/tests/${id}`);
  return res.data.data;
}

export async function createTest(payload: CreateTestPayload): Promise<TestDetail> {
  const res = await apiClient.post<ApiResponse<TestDetail>>("/tests", payload);
  return res.data.data;
}

export async function updateTest(id: string, payload: UpdateTestPayload): Promise<TestDetail> {
  const res = await apiClient.put<ApiResponse<TestDetail>>(`/tests/${id}`, payload);
  return res.data.data;
}

export async function deleteTest(id: string): Promise<void> {
  await apiClient.delete(`/tests/${id}`);
}

export async function publishTest(id: string): Promise<TestDetail> {
  return updateTest(id, { status: "live" });
}
