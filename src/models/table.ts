export interface Table {
  id: number;
  event_id: number;
  name: string;
  capacity: number;
  created_at: Date;
}

export interface CreateTableInput {
  name: string;
  capacity: number;
}