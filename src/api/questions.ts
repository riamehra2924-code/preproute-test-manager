import { apiClient } from "./client";
import type { ApiResponse, Question, BulkCreateQuestionsPayload } from "@/types";

export async function bulkCreateQuestions(payload: BulkCreateQuestionsPayload): Promise<Question[]> {
  const res = await apiClient.post<ApiResponse<Question[]>>("/questions/bulk", payload);
  return res.data.data;
}

export async function fetchBulkQuestions(questionIds: string[]): Promise<Question[]> {
  if (questionIds.length === 0) return [];
  const res = await apiClient.post<ApiResponse<Question[]>>("/questions/fetchBulk", {
    question_ids: questionIds,
  });
  return res.data.data;
}