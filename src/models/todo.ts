export type TodoStatus = "pending" | "in_progress" | "done";
export type TodoCategory =
  | "music"
  | "venue"
  | "flowers"
  | "catering"
  | "photography"
  | "decoration"
  | "clothing"
  | "transport"
  | "honeymoon"
  | "other";

export interface Todo {
  id: number;
  event_id: number;
  title: string;
  category: TodoCategory;
  status: TodoStatus;
  due_date: Date | null;
  notes: string | null;
  created_at: Date;
}

export interface CreateTodoInput {
  title: string;
  category: TodoCategory;
  due_date?: string;
  notes?: string;
}
