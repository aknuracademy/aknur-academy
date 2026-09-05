"use client";

import { useRouter } from "next/navigation";

import type { Course } from "@/types/course";

export type CourseProgress = {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
};

type CourseListProps = {
  courses: Course[];
  courseProgress: CourseProgress[];
  expiredCourseIds?: number[];
  lockedCourseIds?: number[];
  showHeader?: boolean;
};

export default function CourseList({
  courses,
  courseProgress,
  expiredCourseIds,
  lockedCourseIds,
  showHeader = true,
}: CourseListProps) {

  const router = useRouter();

  return (
    <section>
      {showHeader && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">
            📚 Менің курстарым
          </h2>

          <p className="font-medium text-gray-600">
            Барлығы: {courses.length}
          </p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow">
          <div className="text-5xl">📚</div>

          <p className="mt-4 font-medium text-gray-600">
            Сізге әзірге курс тағайындалмаған.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const progress = courseProgress.find(
              (item) => item.courseId === course.id
            );

            const isExpired =
  expiredCourseIds?.includes(course.id) ?? false;

  const isLocked =
  lockedCourseIds?.includes(course.id) ?? false;

            const totalLessons =
              progress?.totalLessons ?? 0;

            const completedLessons =
              progress?.completedLessons ?? 0;

            const progressPercent =
              progress?.progressPercent ?? 0;

            return (
              <article
                key={course.id}
                className="flex flex-col rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-3xl">
                  📘
                </div>

                <h3 className="mt-5 text-xl font-bold text-green-700">
                  {course.title}
                </h3>

                <p className="mt-3 min-h-12 flex-1 text-gray-600">
                  {course.description ||
                    "Курс сабақтарын ашып, оқуды жалғастырыңыз."}
                </p>

                <div className="mt-6 rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-gray-600">
                      Курс прогресі
                    </p>

                    <p className="font-bold text-green-700">
                      {progressPercent}%
                    </p>
                  </div>

                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-gray-500">
                    {completedLessons} / {totalLessons} сабақ аяқталды
                  </p>
                </div>

                {isLocked ? (
  <div className="mt-6 space-y-3">
    <div className="rounded-lg bg-gray-100 px-5 py-3 text-center font-bold text-gray-600">
      🔒 Курс сатып алынбаған
    </div>

    <button
      type="button"
      onClick={() =>
        router.push(
          `/student/course/${course.id}`
        )
      }
      className="w-full rounded-lg border border-gray-300 px-5 py-3 font-bold text-gray-700 transition hover:bg-gray-50"
    >
      👁 Курсты көру
    </button>

    <a
      href={`https://wa.me/77766565747?text=${encodeURIComponent(
        `Сәлеметсіз бе! Мен ${course.title} курсын сатып алғым келеді.`
      )}`}
      target="_blank"
      rel="noreferrer"
      className="block w-full rounded-lg bg-green-600 px-5 py-3 text-center font-bold text-white transition hover:bg-green-700"
    >
      Курсты сатып алу
    </a>
  </div>
) : isExpired ? (
  
  <div className="mt-6 space-y-3">
    <div className="rounded-lg bg-red-50 px-5 py-3 text-center font-bold text-red-600">
      Мерзімі аяқталған
    </div>

    <a
      href={`https://wa.me/77766565747?text=${encodeURIComponent(
        `Сәлеметсіз бе! Мен ${course.title} курсының мерзімін ұзартқым келеді.`
      )}`}
      target="_blank"
      rel="noreferrer"
      className="block w-full rounded-lg bg-green-600 px-5 py-3 text-center font-bold text-white transition hover:bg-green-700"
    >
      Ұзарту
    </a>
  </div>
) : (
  <button
    type="button"
    onClick={() =>
      router.push(
        `/student/course/${course.id}`
      )
    }
    className="mt-6 w-full rounded-lg bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
  >
    {progressPercent > 0
      ? "▶️ Оқуды жалғастыру"
      : "▶️ Курсты бастау"}
  </button>
)}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}