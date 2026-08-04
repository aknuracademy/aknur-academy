"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Course = {
  id: number;
  title: string;
};

type Module = {
  id: number;
  course_id: number;
  title: string;
  position: number;
  courses: {
    title: string;
  } | null;
};

export default function ModulesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("1");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
    loadModules();
  }, []);

  async function loadCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setCourses(data ?? []);
  }

  async function loadModules() {
    const { data, error } = await supabase
      .from("modules")
      .select(`
        id,
        course_id,
        title,
        position,
        courses (
          title
        )
      `)
      .order("course_id", { ascending: true })
      .order("position", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setModules(
      (data ?? []).map((module) => ({
        ...module,
        courses: Array.isArray(module.courses)
          ? module.courses[0]
          : module.courses,
      })) as Module[]
    );
  }

  async function handleAddModule() {
    if (!courseId) {
      alert("Курсты таңдаңыз.");
      return;
    }

    if (!title.trim()) {
      alert("Модуль атауын жазыңыз.");
      return;
    }

    const numericPosition = Number(position);

    if (!numericPosition || numericPosition < 1) {
      alert("Модуль ретін дұрыс жазыңыз.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("modules")
      .insert({
        course_id: Number(courseId),
        title: title.trim(),
        position: numericPosition,
      });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Модуль қосылды!");

    setTitle("");
    setPosition("1");

    await loadModules();
  }

  async function handleDeleteModule(
    id: number,
    moduleTitle: string
  ) {
    const confirmed = window.confirm(
      `"${moduleTitle}" модулін өшіргіңіз келе ме?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("modules")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Модуль өшірілді!");

    await loadModules();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow md:p-8">
          <h1 className="text-3xl font-bold">
            📁 Модуль қосу
          </h1>

          <p className="mt-2 text-gray-500">
            Модульді керекті курсқа тіркеңіз
          </p>

          <label className="mt-6 block font-medium">
            Курс
          </label>

          <select
            value={courseId}
            onChange={(event) =>
              setCourseId(event.target.value)
            }
            className="mt-2 w-full rounded-lg border p-3"
          >
            <option value="">
              Курсты таңдаңыз
            </option>

            {courses.map((course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.title}
              </option>
            ))}
          </select>

          <label className="mt-5 block font-medium">
            Модуль атауы
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Мысалы: 1-модуль. ИП ашу"
            className="mt-2 w-full rounded-lg border p-3"
          />

          <label className="mt-5 block font-medium">
            Модуль реті
          </label>

          <input
            type="number"
            min="1"
            value={position}
            onChange={(event) =>
              setPosition(event.target.value)
            }
            className="mt-2 w-full rounded-lg border p-3"
          />

          <button
            type="button"
            onClick={handleAddModule}
            disabled={saving}
            className="mt-6 w-full rounded-lg bg-green-600 p-3 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {saving
              ? "Сақталуда..."
              : "➕ Модуль қосу"}
          </button>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow md:p-8">
          <h2 className="text-2xl font-bold">
            📚 Қосылған модульдер
          </h2>

          {modules.length === 0 ? (
            <p className="mt-4 text-gray-500">
              Әзірге модуль жоқ
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="rounded-xl border p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-green-700">
                        {module.position}. {module.title}
                      </h3>

                      <p className="mt-2 text-gray-600">
                        Курс:{" "}
                        {module.courses?.title ||
                          "Курс атауы жоқ"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteModule(
                          module.id,
                          module.title
                        )
                      }
                      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                      🗑️ Өшіру
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}