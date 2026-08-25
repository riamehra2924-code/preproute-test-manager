export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginPayload {
  userId: string;
  password: string;
}

export interface AuthUser {
  id?: string;
  userId?: string;
  name?: string;
  [key: string]: unknown;
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export type TestType = "chapterwise" | "pyq" | "mock";
export type Difficulty = "easy" | "medium" | "difficult";
export type TestStatus = "draft" | "live" | "unpublished" | "scheduled" | "expired";

export interface TestSummary {
  id: string;
  name: string;
  subject: string;
  topics: string[];
  status: TestStatus | string;
  created_at: string;
}

export interface TestDetail extends Partial<TestSummary> {
  id: string;
  name: string;
  type?: TestType;
  subject?: string;
  topics?: string[];
  sub_topics?: string[];
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
  difficulty?: Difficulty;
  total_time?: number;
  total_marks?: number;
  total_questions?: number;
  questions?: string[];
  status?: TestStatus | string;
}

export interface CreateTestPayload {
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: TestStatus;
}

export interface UpdateTestPayload {
  name?: string;
  subject?: string;
  topics?: string[];
  sub_topics?: string[];
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
  difficulty?: Difficulty;
  total_time?: number;
  questions?: string[];
  total_questions?: number;
  total_marks?: number;
  status?: TestStatus;
}

export type CorrectOption = "option1" | "option2" | "option3" | "option4";

export interface QuestionDraft {
  clientId: string;
  type: "mcq";
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: CorrectOption;
  explanation?: string;
  difficulty?: Difficulty;
  topic?: string;
  sub_topic?: string;
  media_url?: string;
  test_id?: string;
}

export interface Question extends Omit<QuestionDraft, "clientId"> {
  id: string;
}

export interface BulkCreateQuestionsPayload {
  questions: Omit<QuestionDraft, "clientId">[];
}
