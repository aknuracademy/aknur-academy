export type Course = {
  id: number;
  title: string;
  description?: string | null;
  price?: number | null;
  full_description?: string | null;
  target_audience?: string | null;
  learning_outcomes?: string | null;
  course_includes?: string | null;
  access_info?: string | null;
};