"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/common/PageHeader";

type Course = {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  full_description: string | null;
  target_audience: string | null;
  learning_outcomes: string | null;
  course_includes: string | null;
  access_info: string | null;
};

type Video = {
  id: number;
  title: string;
  course_id: number;
  module_id: number | null;
};

type Module = {
  id: number;
  title: string;
  course_id: number;
};

export default function CourseLessonsPage() {
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  const [targetAudience, setTargetAudience] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [courseIncludes, setCourseIncludes] = useState("");
  const [accessInfo, setAccessInfo] = useState("");

  const [fullDescription, setFullDescription] = useState("");

  const [openedModule, setOpenedModule] =
    useState<number | null>(null);

  const [studentCount, setStudentCount] = useState(0);
  const [moduleCount, setModuleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  useEffect(() => {
    if (!courseId || Number.isNaN(courseId)) {
      setLoading(false);
      return;
    }

    loadData();
  }, [courseId]);

  async function loadData() {
    try {
      setLoading(true);

      const {
        data: courseData,
        error: courseError,
      } = await supabase
        .from("courses")
        .select(
  "id, title, description, price, full_description, target_audience, learning_outcomes, course_includes, access_info"
)
        .eq("id", courseId)
        .single();

      if (courseError) {
        throw courseError;
      }

      const {
        data: videoData,
        error: videoError,
      } = await supabase
        .from("videos")
        .select("id, title, course_id, module_id")
        .eq("course_id", courseId)
        .order("id", { ascending: true });

      if (videoError) {
        throw videoError;
      }

      const {
        data: moduleData,
        error: moduleError,
      } = await supabase
        .from("modules")
        .select("id, title, course_id")
        .eq("course_id", courseId)
        .order("position", { ascending: true });

      if (moduleError) {
        throw moduleError;
      }

      const {
        count: studentsCount,
        error: studentsError,
      } = await supabase
        .from("student_courses")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("course_id", courseId);

      if (studentsError) {
        throw studentsError;
      }

      const {
        count: modulesCount,
        error: modulesCountError,
      } = await supabase
        .from("modules")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("course_id", courseId);

      if (modulesCountError) {
        throw modulesCountError;
      }

      setCourse(courseData as Course);
      setFullDescription(
  (courseData as Course).full_description ?? ""
);
setTargetAudience(
  (courseData as Course).target_audience ?? ""
);
setLearningOutcomes(courseData.learning_outcomes ?? "");
setCourseIncludes(
  (courseData as Course).course_includes ?? ""
);

setAccessInfo(
  (courseData as Course).access_info ?? ""
);
      setVideos((videoData ?? []) as Video[]);
      setModules((moduleData ?? []) as Module[]);
      setStudentCount(studentsCount ?? 0);
      setModuleCount(modulesCount ?? 0);
    } catch (error) {
      console.error(
        "Курс мәліметтерін жүктеу қатесі:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Мәліметтерді жүктеу кезінде қате шықты."
        );
      }
    } finally {
      setLoading(false);
    }
  }
  async function saveCourseDetails() {
  try {
    const { error } = await supabase
      .from("courses")
      .update({
        full_description: fullDescription.trim() || null,
        target_audience: targetAudience.trim() || null,
        learning_outcomes: learningOutcomes.trim() || null,
        course_includes: courseIncludes.trim() || null,
        access_info: accessInfo.trim() || null,
      })
      .eq("id", courseId);

    if (error) {
      throw error;
    }

    setCourse((current) =>
      current
        ? {
            ...current,
            full_description:
              fullDescription.trim() || null,
            target_audience:
              targetAudience.trim() || null,
            learning_outcomes:
              learningOutcomes.trim() || null,
            course_includes:
              courseIncludes.trim() || null,
            access_info:
              accessInfo.trim() || null,
          }
        : current
    );

    alert("Курс мәліметтері сәтті сақталды.");
  } catch (error) {
    console.error(
      "Курс мәліметтерін сақтау қатесі:",
      error
    );

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Сақтау кезінде қате шықты.");
    }
  }
}

async function handleAddModule() {
  const title = newModuleTitle.trim();

  if (!title) {
    alert("Модуль атауын жазыңыз.");
    return;
  }

  try {
    const nextPosition =
      modules.length > 0
        ? modules.length + 1
        : 1;

    const { data, error } = await supabase
      .from("modules")
      .insert({
        course_id: courseId,
        title,
        position: nextPosition,
      })
      .select("id, title, course_id")
      .single();

    if (error) {
      throw error;
    }

    setModules((current) => [
      ...current,
      data as Module,
    ]);

    setModuleCount((current) => current + 1);
    setNewModuleTitle("");

    alert("Модуль сәтті қосылды.");
  } catch (error) {
    console.error("Модуль қосу қатесі:", error);

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Модуль қосу кезінде қате шықты.");
    }
  }
}

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl font-medium">
          Жүктеліп жатыр...
        </p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-2xl bg-white p-8 shadow">
          <p className="text-xl font-bold text-red-600">
            Курс табылмады
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-5 md:p-10">
        <div className="mx-auto max-w-5xl">
          <PageHeader
            title={course.title}
            description="Курс сабақтарын басқару бөлімі"
          />

          <Link
            href="/dashboard/courses"
            className="inline-block rounded-lg bg-gray-200 px-4 py-2 font-medium transition hover:bg-gray-300"
          >
            ← Курстарға қайту
          </Link>

          <details className="group mt-6 rounded-2xl bg-white p-6 shadow">
  <summary className="flex cursor-pointer list-none items-center justify-between">
    <h2 className="text-2xl font-bold text-green-700">
      📚 Курс туралы ақпарат
    </h2>

    <span className="text-3xl font-bold text-green-700 transition group-open:rotate-45">
      +
    </span>
  </summary>

  <div className="mt-6">
    <p className="text-gray-600">
      {course.description ||
        "Курс сипаттамасы жазылмаған."}
    </p>

    <p className="mt-4 font-medium text-gray-700">
      Бағасы:{" "}
      {course.price !== null
        ? `${course.price.toLocaleString("kk-KZ")} ₸`
        : "Көрсетілмеген"}
    </p>

    <div className="mt-6">
      <label className="mb-2 block font-medium text-gray-700">
        Толық сипаттама
      </label>

      <textarea
        value={fullDescription}
        onChange={(event) =>
          setFullDescription(event.target.value)
        }
        rows={8}
        placeholder="Курс туралы толық ақпаратты жазыңыз..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
      />
    </div>

    <div className="mt-6">
      <label className="mb-2 block font-medium text-gray-700">
        Кімге арналған?
      </label>

      <textarea
        value={targetAudience}
        onChange={(event) =>
          setTargetAudience(event.target.value)
        }
        rows={6}
        placeholder="Мысалы: Жаңадан ИП ашқан кәсіпкерлерге..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
      />
    </div>

    <div className="mt-6">
      <label className="mb-2 block font-medium text-gray-700">
        Курстан не үйренесіз?
      </label>

      <textarea
        value={learningOutcomes}
        onChange={(event) =>
          setLearningOutcomes(event.target.value)
        }
        rows={6}
        placeholder="Мысалы: ИП ашу, салық режимін таңдау, есеп тапсыру..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
      />
    </div>

    <div className="mt-6">
      <label className="mb-2 block font-medium text-gray-700">
        Курсқа не кіреді?
      </label>

      <textarea
        value={courseIncludes}
        onChange={(event) =>
          setCourseIncludes(event.target.value)
        }
        rows={6}
        placeholder="Мысалы: видео сабақтар, материалдар, чат, сертификат..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
      />
    </div>

    <div className="mt-6">
      <label className="mb-2 block font-medium text-gray-700">
        Қолжетімділік мерзімі
      </label>

      <textarea
        value={accessInfo}
        onChange={(event) =>
          setAccessInfo(event.target.value)
        }
        rows={4}
        placeholder="Мысалы: Видео сабақтарға 1 жыл қолжетімділік, 1 ай кері байланыс..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
      />
    </div>

    <button
      type="button"
      onClick={saveCourseDetails}
      className="mt-6 w-full rounded-xl bg-green-700 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-800"
    >
      💾 Өзгерістерді сақтау
    </button>
  </div>
</details>
          
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                👥 Студенттер
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {studentCount}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                📁 Модульдер
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {moduleCount}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                🎥 Сабақтар
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {videos.length}
              </h3>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow">
  <h2 className="text-2xl font-bold">
    📁 Жаңа модуль қосу
  </h2>

  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
    <input
      type="text"
      value={newModuleTitle}
      onChange={(event) =>
        setNewModuleTitle(event.target.value)
      }
      placeholder="Модуль атауы"
      className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
    />

    <button
      type="button"
      onClick={handleAddModule}
      className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
    >
      ➕ Модуль қосу
    </button>
  </div>
</div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">
              🎥 Курс сабақтары
            </h2>

            <Link
              href={`/dashboard/videos/new?courseId=${courseId}`}
              className="rounded-lg bg-green-600 px-5 py-3 text-center font-bold text-white transition hover:bg-green-700"
            >
              ➕ Жаңа сабақ қосу
            </Link>
          </div>

          {videos.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-8 shadow">
              <p className="text-gray-500">
                Бұл курсқа әзірге сабақ қосылмаған.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {modules.map((module) => {
                const moduleVideos = videos.filter(
                  (video) =>
                    video.module_id === module.id
                );

                const isOpen =
                  openedModule === module.id;

                return (
                  <div
                    key={module.id}
                    className="rounded-2xl bg-white p-6 shadow"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenedModule(
                          isOpen ? null : module.id
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <h3 className="text-2xl font-bold text-green-700">
                        {isOpen ? "▼" : "▶"} 📁{" "}
                        {module.title}
                      </h3>

                      <span className="shrink-0 text-sm font-medium text-gray-500">
                        {moduleVideos.length} сабақ
                      </span>
                    </button>

                    {isOpen && (
                      <>
                        {moduleVideos.length === 0 ? (
                          <p className="mt-4 text-gray-500">
                            Бұл модульге әзірге сабақ
                            қосылмаған.
                          </p>
                        ) : (
                          <div className="mt-5 space-y-4">
                            {moduleVideos.map(
                              (video, index) => (
                                <div
                                  key={video.id}
                                  className="rounded-xl border border-gray-200 p-5"
                                >
                                  <p className="text-sm text-gray-500">
                                    {index + 1}-сабақ
                                  </p>

                                  <h4 className="mt-1 text-xl font-bold">
                                    {video.title}
                                  </h4>

                                  <div className="mt-4 flex flex-wrap gap-3">
                                    <Link
                                      href={`/dashboard/videos/${video.id}/edit`}
                                      className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                                    >
                                      ✏️ Сабақты өзгерту
                                    </Link>

                                    <Link
                                      href={`/dashboard/videos/${video.id}/materials`}
                                      className="inline-block rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
                                    >
                                      📄 Материал қосу
                                    </Link>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {videos.some(
                (video) => video.module_id === null
              ) && (
                <div className="rounded-2xl bg-white p-6 shadow">
                  <h3 className="text-2xl font-bold text-orange-600">
                    📂 Модульсіз сабақтар
                  </h3>

                  <div className="mt-5 space-y-4">
                    {videos
                      .filter(
                        (video) =>
                          video.module_id === null
                      )
                      .map((video, index) => (
                        <div
                          key={video.id}
                          className="rounded-xl border border-gray-200 p-5"
                        >
                          <p className="text-sm text-gray-500">
                            {index + 1}-сабақ
                          </p>

                          <h4 className="mt-1 text-xl font-bold">
                            {video.title}
                          </h4>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <Link
                              href={`/dashboard/videos/${video.id}/edit`}
                              className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                            >
                              ✏️ Сабақты өзгерту
                            </Link>

                            <Link
                              href={`/dashboard/videos/${video.id}/materials`}
                              className="inline-block rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
                            >
                              📄 Материал қосу
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}