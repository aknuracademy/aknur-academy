"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/common/PageHeader";
import { supabase } from "@/lib/supabase";

type Student = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
};

type Course = {
  id: number;
  title: string;
};
type Video = {
  id: number;
  title: string;
};
type StudentSession = {
  id: number;
  device_name: string | null;
  browser_name: string | null;
  operating_system: string | null;
  current_path: string | null;
  current_video_id: number | null;
  is_active: boolean;
  first_seen_at: string;
  last_seen_at: string;
  logged_out_at: string | null;
};

export default function StudentDetailsPage() {
  const params = useParams();

  const studentId = Number(
    Array.isArray(params.id) ? params.id[0] : params.id
  );

  const [student, setStudent] = useState<Student | null>(null);
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);

  const [totalVideos, setTotalVideos] = useState(0);
const [completedVideos, setCompletedVideos] = useState(0);
const [progressPercent, setProgressPercent] = useState(0);

const [studentSessions, setStudentSessions] =
  useState<StudentSession[]>([]);

const [sessionsLoading, setSessionsLoading] =
  useState(true);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentVideo, setCurrentVideo] =
  useState<Video | null>(null);

  useEffect(() => {
  if (!studentId || Number.isNaN(studentId)) {
    setErrorMessage(
      "Студенттің ID нөмірі дұрыс емес."
    );
    setLoading(false);
    return;
  }

  loadStudentDetails();
  loadStudentSessions(studentId);

  const intervalId = window.setInterval(() => {
    loadStudentSessions(studentId);
  }, 10_000);

  return () => {
    window.clearInterval(intervalId);
  };
}, [studentId]);

  async function loadStudentDetails() {
    setLoading(true);
    setErrorMessage("");

    const { data: studentData, error: studentError } =
      await supabase
        .from("students")
        .select("id, full_name, email, created_at")
        .eq("id", studentId)
        .single();

    if (studentError) {
      setErrorMessage("Студент туралы ақпарат табылмады.");
      setLoading(false);
      return;
    }

    setStudent(studentData);

    const { data: studentCoursesData, error: studentCoursesError } =
      await supabase
        .from("student_courses")
        .select("course_id")
        .eq("student_id", studentId);

    if (studentCoursesError) {
      setErrorMessage(studentCoursesError.message);
      setLoading(false);
      return;
    }

    const courseIds =
      studentCoursesData?.map((item) => Number(item.course_id)) ?? [];

    if (courseIds.length === 0) {
  setAssignedCourses([]);
  setTotalVideos(0);
  setCompletedVideos(0);
  setProgressPercent(0);
  setLoading(false);
  return;
}

    const { data: coursesData, error: coursesError } =
      await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds)
        .order("id", { ascending: false });

    if (coursesError) {
      setErrorMessage(coursesError.message);
      setLoading(false);
      return;
    }

    setAssignedCourses(coursesData ?? []);

const { data: videosData, error: videosError } = await supabase
  .from("videos")
  .select("id")
  .in("course_id", courseIds);

if (videosError) {
  setErrorMessage(videosError.message);
  setLoading(false);
  return;
}

const videoIds =
  videosData?.map((video) => Number(video.id)) ?? [];

const totalVideoCount = videoIds.length;

setTotalVideos(totalVideoCount);

if (videoIds.length === 0) {
  setCompletedVideos(0);
  setProgressPercent(0);
  setLoading(false);
  return;
}

const { data: progressData, error: progressError } =
  await supabase
    .from("student_video_progress")
    .select("video_id")
    .eq("student_id", studentId)
    .eq("completed", true)
    .in("video_id", videoIds);

if (progressError) {
  setErrorMessage(progressError.message);
  setLoading(false);
  return;
}

const completedVideoCount = progressData?.length ?? 0;

const calculatedProgress = Math.round(
  (completedVideoCount / totalVideoCount) * 100
);

setCompletedVideos(completedVideoCount);
setProgressPercent(calculatedProgress);
setLoading(false);
  }
  async function loadStudentSessions(
  studentId: number
) {
  try {
    setSessionsLoading(true);

    const { data, error } = await supabase
      .from("student_sessions")
      .select(`
        id,
        device_name,
        browser_name,
        operating_system,
        current_path,
        current_video_id,
        is_active,
        first_seen_at,
        last_seen_at,
        logged_out_at
      `)
      .eq("student_id", studentId)
      .order("last_seen_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    console.log("Student ID:", studentId);
console.log("Sessions:", data);
console.log("Error:", error);

    setStudentSessions(data ?? []);
    const activeSessionWithVideo =
  (data ?? []).find(
    (session) =>
      session.is_active &&
      session.current_video_id
  );

if (activeSessionWithVideo?.current_video_id) {
  const { data: videoData, error: videoError } =
    await supabase
      .from("videos")
      .select("id, title")
      .eq(
        "id",
        activeSessionWithVideo.current_video_id
      )
      .maybeSingle();

  if (videoError) {
    console.error(
      "Қазіргі сабақты жүктеу қатесі:",
      videoError
    );
    setCurrentVideo(null);
  } else {
    setCurrentVideo(videoData);
  }
} else {
  setCurrentVideo(null);
}
  } catch (error) {
    console.error(
      "Студент сессияларын жүктеу қатесі:",
      error
    );

    setStudentSessions([]);
  } finally {
    setSessionsLoading(false);
  }
}

  function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("kk-KZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateValue));
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-5 md:p-10">
        <div className="mx-auto max-w-5xl">
          <PageHeader
            title="Студент туралы ақпарат"
            description="Студенттің жеке мәліметтері мен тағайындалған курстары"
          />

          {loading ? (
            <div className="rounded-2xl bg-white p-8 shadow">
              <p className="text-gray-600">
                Студент туралы ақпарат жүктеліп жатыр...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl bg-red-50 p-6 text-red-700 shadow">
              {errorMessage}
            </div>
          ) : student ? (
            <>
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-2xl bg-white p-6 shadow">
    <p className="text-sm text-gray-500">📚 Курстар</p>
    <h3 className="mt-2 text-3xl font-bold">
      {assignedCourses.length}
    </h3>
  </div>

  <div className="rounded-2xl bg-white p-6 shadow">
    <p className="text-sm text-gray-500">🎥 Сабақтар</p>
    <h3 className="mt-2 text-3xl font-bold">
      {totalVideos}
    </h3>
  </div>

  <div className="rounded-2xl bg-white p-6 shadow">
    <p className="text-sm text-gray-500">
      ✅ Аяқталған
    </p>
    <h3 className="mt-2 text-3xl font-bold">
      {completedVideos}
    </h3>
  </div>

  <div className="rounded-2xl bg-white p-6 shadow">
    <p className="text-sm text-gray-500">
      📈 Прогресс
    </p>

    <h3 className="mt-2 text-3xl font-bold">
      {progressPercent}%
    </h3>

    <div className="mt-4 h-3 w-full rounded-full bg-gray-200">
      <div
        className="h-3 rounded-full bg-green-600 transition-all"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  </div>
</div>
<div className="mt-8 rounded-2xl bg-white p-6 shadow md:p-8">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <h2 className="text-2xl font-bold text-gray-900">
      📱 Құрылғылар және сессиялар
    </h2>

    <p className="font-medium text-gray-600">
      Белсенді:{" "}
      {
        studentSessions.filter(
          (session) => session.is_active
        ).length
      }
    </p>
  </div>

  {sessionsLoading ? (
    <div className="mt-6 rounded-xl bg-gray-100 p-5 text-gray-600">
      Сессиялар жүктеліп жатыр...
    </div>
  ) : studentSessions.length === 0 ? (
    <div className="mt-6 rounded-xl bg-yellow-50 p-5 text-yellow-800">
      Бұл студенттің сессиялары әлі тіркелмеген.
    </div>
  ) : (
    <div className="mt-6 space-y-4">
      {studentSessions.map((session) => {
        const lastSeenDate = new Date(
          session.last_seen_at
        );

        const minutesAgo = Math.floor(
          (Date.now() - lastSeenDate.getTime()) /
            60000
        );

        const isOnline =
          session.is_active &&
          minutesAgo <= 2;

        return (
          <div
            key={session.id}
            className="rounded-xl border border-gray-200 p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      isOnline
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />

                  <p className="font-bold">
                    {isOnline
                      ? "Қазір онлайн"
                      : "Оффлайн"}
                  </p>
                </div>

                <p className="mt-3 text-gray-700">
                  💻{" "}
                  {session.device_name ||
                    "Белгісіз құрылғы"}
                </p>

                <p className="mt-1 text-gray-700">
                  🌐{" "}
                  {session.browser_name ||
                    "Белгісіз браузер"}
                </p>

                <p className="mt-1 text-gray-700">
                  ⚙️{" "}
                  {session.operating_system ||
                    "Белгісіз жүйе"}
                </p>

                {session.current_path && (
                  
                  <p className="mt-1 break-all text-gray-700">
                    📍 {session.current_path}
                  </p>
                )}
                {session.current_video_id &&
  currentVideo?.id === session.current_video_id && (
    <div className="mt-3 rounded-lg bg-blue-50 p-3">
      <p className="text-sm text-blue-600">
        Қазір ашылған сабақ
      </p>

      <p className="mt-1 font-bold text-blue-900">
        🎥 {currentVideo.title}
      </p>
    </div>
  )}
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  Соңғы белсенділік:
                </p>

                <p className="mt-1 font-medium text-gray-700">
                  {new Intl.DateTimeFormat(
                    "kk-KZ",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  ).format(lastSeenDate)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

              <div className="mt-8 rounded-2xl bg-white p-6 shadow md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    📚 Тағайындалған курстар
                  </h2>

                  <p className="font-medium text-gray-600">
                    Барлығы: {assignedCourses.length}
                  </p>
                </div>

                {assignedCourses.length === 0 ? (
                  <div className="mt-6 rounded-xl bg-yellow-50 p-5 text-yellow-800">
                    Бұл студентке әзірге курс тағайындалмаған.
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {assignedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-xl border border-gray-200 p-5"
                      >
                        <p className="font-semibold text-gray-900">
                          🎓 {course.title}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}