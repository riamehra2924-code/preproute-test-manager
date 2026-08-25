import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as taxonomyApi from "@/api/taxonomy";
import * as testsApi from "@/api/tests";
import * as questionsApi from "@/api/questions";
import type { CreateTestPayload, UpdateTestPayload, BulkCreateQuestionsPayload } from "@/types";

// ---- Taxonomy ----
export function useSubjects() {
  return useQuery({ queryKey: ["subjects"], queryFn: taxonomyApi.getSubjects });
}

export function useTopics(subjectId: string | undefined) {
  return useQuery({
    queryKey: ["topics", subjectId],
    queryFn: () => taxonomyApi.getTopicsBySubject(subjectId as string),
    enabled: !!subjectId,
  });
}

export function useSubTopics(topicIds: string[]) {
  return useQuery({
    queryKey: ["subtopics", topicIds],
    queryFn: () => taxonomyApi.getSubTopicsByTopics(topicIds),
    enabled: topicIds.length > 0,
  });
}

// ---- Tests ----
export function useTests() {
  return useQuery({ queryKey: ["tests"], queryFn: testsApi.getTests });
}

export function useTest(id: string | undefined) {
  return useQuery({
    queryKey: ["test", id],
    queryFn: () => testsApi.getTestById(id as string),
    enabled: !!id,
  });
}

export function useCreateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTestPayload) => testsApi.createTest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

export function useUpdateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTestPayload }) => testsApi.updateTest(id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["tests"] });
      qc.invalidateQueries({ queryKey: ["test", vars.id] });
    },
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testsApi.deleteTest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

// ---- Questions ----
export function useBulkCreateQuestions() {
  return useMutation({
    mutationFn: (payload: BulkCreateQuestionsPayload) => questionsApi.bulkCreateQuestions(payload),
  });
}

export function useFetchBulkQuestions(questionIds: string[]) {
  return useQuery({
    queryKey: ["questions-bulk", questionIds],
    queryFn: () => questionsApi.fetchBulkQuestions(questionIds),
    enabled: questionIds.length > 0,
  });
}
