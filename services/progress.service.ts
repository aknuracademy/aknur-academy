import { supabase } from "@/lib/supabase";

export async function getStudentProgress(
  studentId: number
) {
  const { data, error } = await supabase
    .from("student_video_progress")
    .select("*")
    .eq("student_id", studentId)
    .eq("completed", true);

  if (error) {
    const errorText =
      `MESSAGE: ${error.message}\n` +
      `CODE: ${error.code}\n` +
      `DETAILS: ${error.details ?? "жоқ"}\n` +
      `HINT: ${error.hint ?? "жоқ"}`;

    console.error(errorText);
    throw new Error(errorText);
  }

  return data ?? [];
}

export async function markVideoCompleted(
  studentId: number,
  videoId: number
) {
  const { error } = await supabase
    .from("student_video_progress")
    .upsert(
      {
        student_id: studentId,
        video_id: videoId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: "student_id,video_id",
      }
    );

  if (error) {
    const errorText =
      `MESSAGE: ${error.message}\n` +
      `CODE: ${error.code}\n` +
      `DETAILS: ${error.details ?? "жоқ"}\n` +
      `HINT: ${error.hint ?? "жоқ"}`;

    alert(errorText);
    console.error(errorText);

    throw new Error(errorText);
  }
}
export type CompletedCourse = {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  completedVideos: number;
  totalVideos: number;
  completedAt: string | null;
};


export async function getCompletedCourses(
  studentId: number
): Promise<CompletedCourse[]> {
  const { data: studentCourses, error: studentCoursesError } =
    await supabase
      .from("student_courses")
      .select(`
        course_id,
        courses (
          id,
          title,
          description,
          price
        )
      `)
      .eq("student_id", studentId);

  if (studentCoursesError) {
    throw new Error(studentCoursesError.message);
  }

  if (!studentCourses || studentCourses.length === 0) {
    return [];
  }

  const courseIds = studentCourses
    .map((item) => item.course_id)
    .filter((courseId): courseId is number => courseId !== null);

  const { data: videos, error: videosError } = await supabase
    .from("videos")
    .select("id, course_id")
    .in("course_id", courseIds);

  if (videosError) {
    throw new Error(videosError.message);
  }

  const videoIds = (videos ?? []).map((video) => video.id);

  if (videoIds.length === 0) {
    return [];
  }

  const { data: progress, error: progressError } = await supabase
    .from("student_video_progress")
    .select("video_id, completed_at")
    .eq("student_id", studentId)
    .eq("completed", true)
    .in("video_id", videoIds);

  if (progressError) {
    throw new Error(progressError.message);
  }

  const completedVideoIds = new Set(
    (progress ?? []).map((item) => item.video_id)
  );

  return studentCourses
    .map((studentCourse) => {
      const course = Array.isArray(studentCourse.courses)
        ? studentCourse.courses[0]
        : studentCourse.courses;

      if (!course) {
        return null;
      }

      const courseVideos = (videos ?? []).filter(
        (video) => video.course_id === course.id
      );

      const completedCourseVideos = courseVideos.filter((video) =>
        completedVideoIds.has(video.id)
      );

      if (
        courseVideos.length === 0 ||
        completedCourseVideos.length !== courseVideos.length
      ) {
        return null;
      }

      const completedDates = (progress ?? [])
        .filter((item) =>
          completedCourseVideos.some(
            (video) => video.id === item.video_id
          )
        )
        .map((item) => item.completed_at)
        .filter((date): date is string => Boolean(date))
        .sort();

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        completedVideos: completedCourseVideos.length,
        totalVideos: courseVideos.length,
        completedAt:
          completedDates.length > 0
            ? completedDates[completedDates.length - 1]
            : null,
      };
    })
    .filter(
      (course): course is CompletedCourse => course !== null
    );
}