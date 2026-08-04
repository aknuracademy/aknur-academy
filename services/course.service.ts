import { supabase } from "@/lib/supabase";

export async function getCourses() {
  const { data: sessionData } =
    await supabase.auth.getSession();

  console.log(
    "Қазіргі user:",
    sessionData.session?.user.email
  );

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("id", { ascending: false });

  console.log("Курстар:", data);
  console.log("Курстар қатесі:", error);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCourseById(courseId: number) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createCourse(courseData: {
  title: string;
  description?: string;
  price?: number;
}) {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: courseData.title,
      description: courseData.description ?? "",
      price: courseData.price ?? 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCourse(
  courseId: number,
  courseData: {
    title?: string;
    description?: string;
    price?: number;
  }
) {
  const { data, error } = await supabase
    .from("courses")
    .update(courseData)
    .eq("id", courseId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCourse(courseId: number) {
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }
}