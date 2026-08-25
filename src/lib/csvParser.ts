import type { QuestionDraft } from "@/types";

export interface CSVRow {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation?: string;
  difficulty?: string;
  topic?: string;
  sub_topic?: string;
}

export function parseCSV(csvText: string, testId: string): { questions: QuestionDraft[]; errors: string[] } {
  const errors: string[] = [];
  const questions: QuestionDraft[] = [];
  
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length < 2) {
    errors.push("CSV must have at least a header and one data row");
    return { questions, errors };
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const requiredFields = ["question", "option1", "option2", "option3", "option4", "correct_option"];
  const missingFields = requiredFields.filter((f) => !header.includes(f));
  if (missingFields.length > 0) {
    errors.push(`Missing required columns: ${missingFields.join(", ")}`);
    return { questions, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    
    header.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });

    if (!row.question) {
      errors.push(`Row ${i + 1}: Question is required`);
      continue;
    }
    if (!row.option1 || !row.option2 || !row.option3 || !row.option4) {
      errors.push(`Row ${i + 1}: All four options are required`);
      continue;
    }
    if (!row.correct_option || !["option1", "option2", "option3", "option4"].includes(row.correct_option)) {
      errors.push(`Row ${i + 1}: correct_option must be one of: option1, option2, option3, option4`);
      continue;
    }

    const question: QuestionDraft = {
      clientId: crypto.randomUUID(),
      type: "mcq",
      question: row.question,
      option1: row.option1,
      option2: row.option2,
      option3: row.option3,
      option4: row.option4,
      correct_option: row.correct_option as "option1" | "option2" | "option3" | "option4",
      explanation: row.explanation || undefined,
      difficulty: row.difficulty ? (row.difficulty as any) : undefined,
      topic: row.topic || undefined,
      sub_topic: row.sub_topic || undefined,
      test_id: testId,
    };

    questions.push(question);
  }

  return { questions, errors };
}
