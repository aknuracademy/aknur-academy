export type Video = {
  id: number;
  course_id: number;
  title: string;
  video_url: string;
  duration: string | null;
  created_at: string;

  courses?: {
    title: string;
  } | null;
};