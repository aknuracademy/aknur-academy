"use client";

import { useEffect, useState } from "react";

import CourseList from "@/components/student/CourseList";

import {
  getCurrentStudent,
  getStudentCourses,
} from "@/services/student.service";

import { getVideosByCourse } from "@/services/video.service";
import { getCourses } from "@/services/course.service";
import { getStudentProgress } from "@/services/progress.service";

import type { Course } from "@/types/course";

type CourseProgress = {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
};

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);

  const [expiredCourseIds, setExpiredCourseIds] =
  useState<number[]>([]);

  const [lockedCourseIds, setLockedCourseIds] =
  useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setErrorMessage("");

        const student = await getCurrentStudent();

        if (!student) {
          throw new Error("Студент мәліметі табылмады.");
        }

        const assignedCourses = await getStudentCourses(student.id);
        const allCourses = await getCourses();

        const assignedCourseIds = new Set(
  assignedCourses.map((item) => item.course_id)
);

const lockedIds = allCourses
  .filter(
    (course) =>
      !assignedCourseIds.has(course.id)
  )
  .map((course) => course.id);

setLockedCourseIds(lockedIds);

        const expiredIds = assignedCourses
  .filter((item) => {
    if (!item.access_expires_at) {
      return false;
    }

    return (
      new Date(item.access_expires_at).getTime() <
      Date.now()
    );
  })
  .map((item) => item.course_id);

setExpiredCourseIds(expiredIds);

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
    description:
      course.description ?? undefined,
  })) as Course[];

        setCourses(formattedCourses);

        const [courseVideos, progressData] = await Promise.all([
          Promise.all(
            formattedCourses.map((course) =>
              getVideosByCourse(course.id)
            )
          ),
          getStudentProgress(student.id),
        ]);

        const completedVideoIds = new Set(
          progressData.map((item) => item.video_id)
        );

        const calculatedProgress = formattedCourses.map(
          (course, index) => {
            const videos = courseVideos[index] ?? [];

            const completedLessons = videos.filter((video) =>
              completedVideoIds.has(video.id)
            ).length;

            const totalLessons = videos.length;

            const progressPercent =
              totalLessons > 0
                ? Math.round(
                    (completedLessons / totalLessons) * 100
                  )
                : 0;

            return {
              courseId: course.id,
              totalLessons,
              completedLessons,
              progressPercent,
            };
          }
        );

        setCourseProgress(calculatedProgress);
      } catch (error) {
        console.error("Курстарды жүктеу қатесі:", error);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Курстарды жүктеу кезінде белгісіз қате шықты."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

          <p className="mt-4 text-xl font-medium text-gray-700">
            Курстар жүктеліп жатыр...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-xl font-bold text-red-600">
            Курстарды жүктеу мүмкін болмады
          </p>

          <p className="mt-3 text-gray-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
          >
            Қайта жүктеу
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 pb-6 pt-20 md:p-10 lg:pt-10">
      <div className="mx-auto max-w-6xl">
        <CourseList
  courses={courses}
  courseProgress={courseProgress}
  expiredCourseIds={expiredCourseIds}
  lockedCourseIds={lockedCourseIds}
/>
      </div>
    </main>
  );
}