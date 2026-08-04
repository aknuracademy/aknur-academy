"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/common/PageHeader";

export default function DashboardPage() {
  const [courseCount, setCourseCount] = useState(0);
  const [moduleCount, setModuleCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  const [assignedCourseCount, setAssignedCourseCount] = useState(0);
const [completedLessonCount, setCompletedLessonCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  async function loadStatistics() {
  setLoading(true);

  const [
    coursesResult,
    modulesResult,
    videosResult,
    studentsResult,
    assignedCoursesResult,
    completedLessonsResult,
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("modules")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("videos")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("students")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("student_courses")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("student_video_progress")
      .select("*", { count: "exact", head: true })
      .eq("completed", true),
  ]);

  if (coursesResult.error) {
    console.error("Courses error:", coursesResult.error.message);
  }

  if (modulesResult.error) {
    console.error("Modules error:", modulesResult.error.message);
  }

  if (videosResult.error) {
    console.error("Videos error:", videosResult.error.message);
  }

  if (studentsResult.error) {
    console.error("Students error:", studentsResult.error.message);
  }

  if (assignedCoursesResult.error) {
    console.error(
      "Assigned courses error:",
      assignedCoursesResult.error.message
    );
  }

  if (completedLessonsResult.error) {
    console.error(
      "Completed lessons error:",
      completedLessonsResult.error.message
    );
  }

  setCourseCount(coursesResult.count ?? 0);
  setModuleCount(modulesResult.count ?? 0);
  setVideoCount(videosResult.count ?? 0);
  setStudentCount(studentsResult.count ?? 0);
  setAssignedCourseCount(assignedCoursesResult.count ?? 0);
  setCompletedLessonCount(completedLessonsResult.count ?? 0);

  setLoading(false);
}

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl">
          <PageHeader
  title="Dashboard"
  description="AKNUR Academy әкімшілік панелі"
/>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

  <Link
    href="/dashboard/courses"
    className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">Курстар</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {loading ? "..." : courseCount}
        </p>
      </div>

      <div className="text-4xl">📚</div>
    </div>
  </Link>

  <Link
    href="/dashboard/modules"
    className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">Модульдер</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {loading ? "..." : moduleCount}
        </p>
      </div>

      <div className="text-4xl">🗂️</div>
    </div>
  </Link>

  <Link
    href="/dashboard/videos"
    className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">Видеолар</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {loading ? "..." : videoCount}
        </p>
      </div>

      <div className="text-4xl">🎥</div>
    </div>
  </Link>

  <Link
    href="/dashboard/students"
    className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">Студенттер</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {loading ? "..." : studentCount}
        </p>
      </div>

      <div className="text-4xl">👨‍🎓</div>
    </div>
  </Link>

  <div className="rounded-2xl bg-white p-6 shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">
          Тағайындалған курстар
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {loading ? "..." : assignedCourseCount}
        </p>
      </div>

      <div className="text-4xl">🎓</div>
    </div>
  </div>

  <div className="rounded-2xl bg-white p-6 shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">
          Аяқталған сабақтар
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {loading ? "..." : completedLessonCount}
        </p>
      </div>

      <div className="text-4xl">🏆</div>
    </div>
  </div>

</div>

          <div className="mt-10 rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-gray-900">
              Жылдам әрекеттер
            </h2>

            <p className="mt-2 text-gray-500">
              Қажетті бөлімге бірден өтіңіз
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/dashboard/courses"
                className="rounded-xl bg-green-600 px-5 py-4 text-center font-semibold text-white transition hover:bg-green-700"
              >
                ➕ Курс қосу
              </Link>

              <Link
                href="/dashboard/modules"
                className="rounded-xl bg-blue-600 px-5 py-4 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                ➕ Модуль қосу
              </Link>

              <Link
                href="/dashboard/videos"
                className="rounded-xl bg-purple-600 px-5 py-4 text-center font-semibold text-white transition hover:bg-purple-700"
              >
                ➕ Видео қосу
              </Link>

              <Link
                href="/dashboard/students"
                className="rounded-xl bg-orange-500 px-5 py-4 text-center font-semibold text-white transition hover:bg-orange-600"
              >
                👨‍🎓 Студенттер
              </Link>
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-gray-900">
              Соңғы әрекеттер
            </h2>

            <p className="mt-4 text-gray-500">
              Әзірге соңғы әрекеттер тізімі қосылған жоқ.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}