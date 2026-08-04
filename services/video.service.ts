import { supabase } from "@/lib/supabase";

export async function getVideosByCourse(courseId: number) {
  const { data, error } = await supabase
    .from("videos")
    .select(`
  id,
  course_id,
  module_id,
  title,
  video_url,
  duration,
  created_at,
  modules (
    id,
    title,
    position
  )
`)
    .eq("course_id", courseId)
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
export async function getVideoById(videoId: number) {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      id,
      course_id,
      module_id,
      title,
      video_url,
      duration,
      created_at
    `)
    .eq("id", videoId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}