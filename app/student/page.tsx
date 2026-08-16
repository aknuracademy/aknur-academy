"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentStudent,
  getStudentCourses,
} from "@/services/student.service";

import { getVideosByCourse } from "@/services/video.service";
import { getStudentProgress } from "@/services/progress.service";

import type { Course } from "@/types/course";
import type { Student } from "@/types/student";

import CourseList from "@/components/student/CourseList";

type CourseProgress = {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
};

export default function StudentPage() {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<
    CourseProgress[]
  >([]);

  const [totalLessons, setTotalLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStudentData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const studentData = await getCurrentStudent();

        if (!studentData) {
          throw new Error("Студент мәліметі табылмады.");
        }

        setStudent(studentData as Student);

        const assignedCourses = await getStudentCourses(
          studentData.id
        );

        const formattedCourses = assignedCourses
  .flatMap((item) => {
    if (!item.courses) {
      return [];
    }

    return Array.isArray(item.courses)
      ? item.courses
      : [item.courses];
  })
  .filter((course) => course !== null)
  .map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description ?? undefined,
  })) as Course[];

        setCourses(formattedCourses);

        const [courseVideos, progressData] =
          await Promise.all([
            Promise.all(
              formattedCourses.map((course) =>
                getVideosByCourse(course.id)
              )
            ),
            getStudentProgress(studentData.id),
          ]);

        const completedVideoIds = new Set(
          progressData.map(
            (progressItem) => progressItem.video_id
          )
        );

        const calculatedCourseProgress =
          formattedCourses.map((course, index) => {
            const videos = courseVideos[index] ?? [];

            const completedCourseLessons = videos.filter(
              (video) => completedVideoIds.has(video.id)
            ).length;

            const courseTotalLessons = videos.length;

            const progressPercent =
              courseTotalLessons > 0
                ? Math.round(
                    (completedCourseLessons /
                      courseTotalLessons) *
                      100
                  )
                : 0;

            return {
              courseId: course.id,
              totalLessons: courseTotalLessons,
              completedLessons: completedCourseLessons,
              progressPercent,
            };
          });

        setCourseProgress(calculatedCourseProgress);

        const lessonsCount = calculatedCourseProgress.reduce(
          (total, item) => total + item.totalLessons,
          0
        );

        const completedCount =
          calculatedCourseProgress.reduce(
            (total, item) =>
              total + item.completedLessons,
            0
          );

        const progressPercent =
          lessonsCount > 0
            ? Math.round(
                (completedCount / lessonsCount) * 100
              )
            : 0;

        setTotalLessons(lessonsCount);
        setCompletedLessons(completedCount);
        setOverallProgress(progressPercent);
        const completedCoursesCount = calculatedCourseProgress.filter(
  (item) => item.progressPercent === 100
).length;

setCertificateCount(completedCoursesCount);
      } catch (error) {
        console.error(
          "Студент мәліметтерін алу қатесі:",
          error
        );

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Студент мәліметтерін жүктеу кезінде қате шықты."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

          <p className="mt-4 text-xl font-medium text-gray-700">
            Жүктеліп жатыр...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-xl font-bold text-red-600">
            Мәліметтерді жүктеу мүмкін болмады
          </p>

          <p className="mt-3 whitespace-pre-line text-gray-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
          >
            Қайта жүктеу
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-gradient-to-r from-green-700 to-green-600 p-6 text-white shadow-lg md:p-8">
          <p className="text-lg text-green-100">
            👋 Қош келдіңіз!
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            {student?.full_name}
          </h1>

          <p className="mt-2 text-green-100">
            AKNUR Academy оқу платформасы
          </p>

          <p className="mt-1 text-sm text-green-200">
            {student?.email}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-green-100">
                📚 Курстар
              </p>

              <p className="mt-2 text-3xl font-bold">
                {courses.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-green-100">
                🎥 Сабақтар
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalLessons}
              </p>

              <p className="mt-1 text-xs text-green-100">
                {completedLessons} сабақ аяқталды
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-green-100">
                🏆 Сертификаттар
              </p>

              <p className="mt-2 text-3xl font-bold">
                {certificateCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-green-100">
                📈 Прогресс
              </p>

              <p className="mt-2 text-3xl font-bold">
                {overallProgress}%
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div id="courses" className="mt-10 scroll-mt-6">
  <CourseList
    courses={courses}
    courseProgress={courseProgress}
  />
</div>
        
      </div>
    </main>
  );
}