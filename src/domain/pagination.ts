export type Paginated<T> = {
  data: T[];
  next_cursor?: string | null;
  current_cursor?: string | null;
};
