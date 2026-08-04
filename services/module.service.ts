import { supabase } from "@/lib/supabase";

export async function getModulesByCourse(courseId: number) {
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createModule(
  courseId: number,
  title: string
) {
  const { error } = await supabase
    .from("modules")
    .insert({
      course_id: courseId,
      title,
    });

  if (error) {
    throw error;
  }
}

export async function deleteModule(id: number) {
  const { error } = await supabase
    .from("modules")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateModule(
  id: number,
  title: string
) {
  const { error } = await supabase
    .from("modules")
    .update({
      title,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}