"use client";

import { useEffect, useState } from "react";

import CourseMaterials from "@/components/student/CourseMaterials";

import {
  getCurrentStudent,
  getStudentCourses,
} from "@/services/student.service";

import { getMaterialsByCourse } from "@/services/material.service";

import type { Course } from "@/types/course";
import type { CourseMaterial } from "@/types/material";

type CourseWithMaterials = {
  course: Course;
  materials: CourseMaterial[];
};

export default function StudentMaterialsPage() {
  const [coursesWithMaterials, setCoursesWithMaterials] = useState<
    CourseWithMaterials[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadMaterials() {
      try {
        setLoading(true);
        setErrorMessage("");

        const student = await getCurrentStudent();

        if (!student) {
          throw new Error("Студент мәліметі табылмады.");
        }

        const assignedCourses = await getStudentCourses(student.id);

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

        const materialsData = await Promise.all(
          formattedCourses.map(async (course) => {
            const materials = await getMaterialsByCourse(course.id);

            return {
              course,
              materials,
            };
          })
        );

        setCoursesWithMaterials(materialsData);
      } catch (error) {
        console.error("Материалдарды жүктеу қатесі:", error);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Материалдарды жүктеу кезінде белгісіз қате шықты."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadMaterials();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

          <p className="mt-4 text-xl font-medium text-gray-700">
            Материалдар жүктеліп жатыр...
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
            Материалдарды жүктеу мүмкін болмады
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

  const visibleCourses = coursesWithMaterials.filter(({ materials }) =>
    materials.some((material) => material.is_visible)
  );

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📄 Материалдар
          </h1>

          <p className="mt-2 text-gray-600">
            Сізге тиесілі курстардың оқу материалдары
          </p>
        </div>

        {visibleCourses.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-gray-700">
              Әзірге қолжетімді материалдар жоқ.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {visibleCourses.map(({ course, materials }) => (
              <section
                key={course.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-xl font-bold text-green-700">
                    📚 {course.title}
                  </h2>
                </div>

                <CourseMaterials materials={materials} />
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}