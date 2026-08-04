export type MaterialType =
  | "pdf"
  | "excel"
  | "word"
  | "image"
  | "text";

export interface CourseMaterial {
  id: number;
  course_id: number;
  video_id: number | null;
  title: string;
  description: string | null;
  material_type: MaterialType;
  file_url: string | null;
  content: string | null;
  position: number;
  is_visible: boolean;
allow_download: boolean;
is_required: boolean;
is_preview: boolean;
  created_at: string;
  
}