import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuestionDraft } from "@/types";

interface TestDraftState {
  testId: string | null;
  testName: string | null;
  questions: QuestionDraft[];
  setTestId: (id: string, name: string) => void;
  addQuestion: (q: QuestionDraft) => void;
  updateQuestion: (clientId: string, q: Partial<QuestionDraft>) => void;
  removeQuestion: (clientId: string) => void;
  replaceQuestions: (qs: QuestionDraft[]) => void;
  reset: () => void;
}

export const useTestDraftStore = create<TestDraftState>()(
  persist(
    (set) => ({
      testId: null,
      testName: null,
      questions: [],
      setTestId: (id, name) => set({ testId: id, testName: name }),
      addQuestion: (q) => set((state) => ({ questions: [...state.questions, q] })),
      updateQuestion: (clientId, patch) =>
        set((state) => ({
          questions: state.questions.map((q) => (q.clientId === clientId ? { ...q, ...patch } : q)),
        })),
      removeQuestion: (clientId) =>
        set((state) => ({ questions: state.questions.filter((q) => q.clientId !== clientId) })),
      replaceQuestions: (qs) => set({ questions: qs }),
      reset: () => set({ testId: null, testName: null, questions: [] }),
    }),
    {
      name: "preproute-test-draft",
    }
  )
);
