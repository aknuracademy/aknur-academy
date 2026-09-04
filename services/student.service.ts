import { supabase } from "@/lib/supabase";


export async function getStudentById(studentId: number) {
  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      email
    `)
    .eq("id", studentId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCurrentStudent() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error("Пайдаланушы жүйеге кірмеген.");
  }

  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      email,
      auth_user_id
    `)
    .eq("auth_user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getStudentCourses(studentId: number) {
  const { data, error } = await supabase
    .from("student_courses")
    .select(`
  course_id,
  access_expires_at,
  courses (
    id,
    title,
    description
  )
`)
    .eq("student_id", studentId);

  if (error) {
    throw error;
  }

  return data ?? [];
}
export async function getStudentCourseAccess(
  studentId: number,
  courseId: number
) {
  const { data, error } = await supabase
    .from("student_courses")
    .select(`
      course_id,
      access_expires_at
    `)
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}