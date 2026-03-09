import { pool } from "../config/db";
import { Todo, CreateTodoInput } from "../models/todo";
import { EventType } from "../models/event";

const WEDDING_TODOS = [
  { title: "Book the venue", category: "venue" },
  { title: "Hire photographer", category: "photography" },
  { title: "Choose wedding cake", category: "catering" },
  { title: "Book DJ/band", category: "music" },
  { title: "Order bride flowers", category: "flowers" },
  { title: "Send invitations", category: "other" },
  { title: "Arrange seating plan", category: "other" },
  { title: "Book honeymoon", category: "honeymoon" },
  { title: "Choose wedding dress", category: "clothing" },
  { title: "Book transport", category: "transport" },
];

const BAPTISM_TODOS = [
  { title: "Book church", category: "venue" },
  { title: "Book restaurant", category: "venue" },
  { title: "Order baptism cake", category: "catering" },
  { title: "Choose godparents gifts", category: "other" },
  { title: "Hire photographer", category: "photography" },
  { title: "Order baptism outfit", category: "clothing" },
  { title: "Send invitations", category: "other" },
  { title: "Book flowers", category: "flowers" },
  { title: "Arrange seating plan", category: "other" },
  { title: "Book transport", category: "transport" },
];

const BIRTHDAY_TODOS = [
  { title: "Book venue", category: "venue" },
  { title: "Order birthday cake", category: "catering" },
  { title: "Book DJ/band", category: "music" },
  { title: "Send invitations", category: "other" },
  { title: "Hire photographer", category: "photography" },
  { title: "Choose outfit", category: "clothing" },
  { title: "Arrange decorations", category: "decoration" },
  { title: "Plan entertainment", category: "other" },
  { title: "Book transport", category: "transport" },
  { title: "Arrange seating plan", category: "other" },
];

const TODO_LISTS: Record<EventType, { title: string; category: string }[]> = {
  wedding: WEDDING_TODOS,
  baptism: BAPTISM_TODOS,
  birthday: BIRTHDAY_TODOS,
};

export const seedDefaultTodos = async (eventId: number, type: EventType): Promise<void> => {
  for (const todo of TODO_LISTS[type]) {
    await pool.query(`INSERT INTO todos (event_id, title, category) VALUES ($1, $2, $3)`, [
      eventId,
      todo.title,
      todo.category,
    ]);
  }
};

export const createTodo = async (eventId: number, input: CreateTodoInput): Promise<Todo> => {
  const result = await pool.query<Todo>(
    `INSERT INTO todos (event_id, title, category, due_date, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [eventId, input.title, input.category, input.due_date || null, input.notes || null]
  );
  return result.rows[0];
};

export const getTodosByEventId = async (eventId: number): Promise<Todo[]> => {
  const result = await pool.query<Todo>(
    `SELECT * FROM todos
     WHERE event_id = $1
     ORDER BY
       CASE status
         WHEN 'in_progress' THEN 1
         WHEN 'pending' THEN 2
         WHEN 'done' THEN 3
       END,
       due_date ASC NULLS LAST,
       created_at ASC`,
    [eventId]
  );
  return result.rows;
};

export const updateTodo = async (
  todoId: number,
  input: Partial<CreateTodoInput & { status: string }>
): Promise<Todo> => {
  const fields = Object.keys(input);
  const values = Object.values(input);

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");

  const result = await pool.query<Todo>(
    `UPDATE todos SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, todoId]
  );

  if (result.rows.length === 0) {
    throw new Error("Todo not found");
  }

  return result.rows[0];
};

export const deleteTodo = async (todoId: number): Promise<void> => {
  const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING id", [todoId]);

  if (result.rows.length === 0) {
    throw new Error("Todo not found");
  }
};
