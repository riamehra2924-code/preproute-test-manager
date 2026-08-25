import { apiClient } from "./client";
import type { ApiResponse, Subject, Topic, SubTopic } from "@/types";

export async function getSubjects(): Promise<Subject[]> {
  const res = await apiClient.get<ApiResponse<Subject[]>>("/subjects");
  return res.data.data;
}

export async function getTopicsBySubject(subjectId: string): Promise<Topic[]> {
  const res = await apiClient.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`);
  return res.data.data;
}

export async function getSubTopicsByTopic(topicId: string): Promise<SubTopic[]> {
  const res = await apiClient.get<ApiResponse<SubTopic[]>>(`/sub-topics/topic/${topicId}`);
  return res.data.data;
}

/** Bulk variant: fetch sub-topics across multiple topic ids at once (used on Add Questions page,
 * where a question's topic dropdown can be any of the test's selected topics). */
export async function getSubTopicsByTopics(topicIds: string[]): Promise<SubTopic[]> {
  if (topicIds.length === 0) return [];
  const res = await apiClient.post<ApiResponse<SubTopic[]>>("/sub-topics/multi-topics", {
    topicIds,
  });
  return res.data.data;
}
