"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

import {
  createModule,
  deleteModule,
  getModulesByCourse,
  updateModule,
} from "@/services/module.service";

type Course = {
  id: number;
  title: string;
};

type Module = {
  id: number;
  course_id: number;
  title: string;
  position: number | null;
};

export default function CourseModulesPage() {
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  const [moduleTitle, setModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] =
    useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  useEffect(() => {
    if (!courseId || Number.isNaN(courseId)) {
      setLoading(false);
      return;
    }

    loadPageData();
  }, [courseId]);

  async function loadPageData() {
    try {
      setLoading(true);

      const { data: courseData, error: courseError } =
        await supabase
          .from("courses")
          .select("id, title")
          .eq("id", courseId)
          .single();

      if (courseError) {
        throw courseError;
      }

      const moduleData = await getModulesByCourse(courseId);

      setCourse(courseData as Course);
      setModules(moduleData as Module[]);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Мәліметтерді жүктеу кезінде қате шықты.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateModule(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanTitle = moduleTitle.trim();

    if (!cleanTitle) {
      alert("Модуль атауын жазыңыз.");
      return;
    }

    try {
      setSaving(true);

      await createModule(courseId, cleanTitle);

      setModuleTitle("");
      await loadPageData();

      alert("Модуль сәтті қосылды!");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Модульді қосу кезінде қате шықты.");
      }
    } finally {
      setSaving(false);
    }
  }

  function startEditing(module: Module) {
    setEditingModuleId(module.id);
    setEditingTitle(module.title);
  }

  function cancelEditing() {
    setEditingModuleId(null);
    setEditingTitle("");
  }

  async function handleUpdateModule(moduleId: number) {
    const cleanTitle = editingTitle.trim();

    if (!cleanTitle) {
      alert("Модуль атауын жазыңыз.");
      return;
    }

    try {
      setSaving(true);

      await updateModule(moduleId, cleanTitle);

      cancelEditing();
      await loadPageData();

      alert("Модуль атауы өзгертілді!");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Модульді өзгерту кезінде қате шықты.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteModule(
    moduleId: number,
    moduleTitle: string
  ) {
    const confirmed = window.confirm(
      `"${moduleTitle}" модулін өшіргіңіз келе ме?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(moduleId);

      await deleteModule(moduleId);
      await loadPageData();

      alert("Модуль өшірілді!");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Модульді өшіру кезінде қате шықты.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <p className="text-xl font-medium">
          Жүктеліп жатыр...
        </p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-red-600">
            Курс табылмады
          </h1>

          <Link
            href="/dashboard/courses"
            className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
          >
            ← Курстарға қайту
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/courses"
          className="inline-block rounded-lg bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
        >
          ← Курстарға қайту
        </Link>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow md:p-8">
          <p className="font-medium text-green-700">
            📚 Курс
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {course.title}
          </h1>

          <p className="mt-3 text-gray-600">
            Осы курсқа модульдер қосыңыз.
          </p>
        </div>

        <form
          onSubmit={handleCreateModule}
          className="mt-6 rounded-2xl bg-white p-6 shadow md:p-8"
        >
          <h2 className="text-2xl font-bold">
            ➕ Жаңа модуль қосу
          </h2>

          <label className="mt-6 block font-medium">
            Модуль атауы
          </label>

          <input
            type="text"
            value={moduleTitle}
            onChange={(event) =>
              setModuleTitle(event.target.value)
            }
            placeholder="Мысалы: 1-модуль. ИП ашу"
            className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-green-600"
          />

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving
              ? "Сақталып жатыр..."
              : "➕ Модуль қосу"}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              📁 Модульдер тізімі
            </h2>

            <p className="font-medium text-gray-600">
              Барлығы: {modules.length}
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-white p-8 shadow">
              <p className="text-gray-500">
                Бұл курсқа әзірге модуль қосылмаған.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  {editingModuleId === module.id ? (
                    <div>
                      <label className="block font-medium">
                        Модуль атауы
                      </label>

                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-green-600"
                      />

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateModule(module.id)
                          }
                          disabled={saving}
                          className="rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
                        >
                          ✅ Сақтау
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={saving}
                          className="rounded-lg bg-gray-200 px-5 py-3 font-bold hover:bg-gray-300"
                        >
                          Болдырмау
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {index + 1}-модуль
                        </p>

                        <h3 className="mt-1 text-xl font-bold text-green-700">
                          📁 {module.title}
                        </h3>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => startEditing(module)}
                          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                        >
                          ✏️ Өзгерту
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteModule(
                              module.id,
                              module.title
                            )
                          }
                          disabled={deletingId === module.id}
                          className="rounded-lg bg-red-500 px-5 py-3 font-medium text-white hover:bg-red-600 disabled:bg-gray-400"
                        >
                          {deletingId === module.id
                            ? "Өшіріліп жатыр..."
                            : "🗑️ Өшіру"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}