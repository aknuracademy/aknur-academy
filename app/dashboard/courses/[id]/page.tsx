"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/common/PageHeader";
import {
  createModule,
  deleteModule,
  updateModule,
} from "@/services/module.service";

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
  position: number | null;
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

  const [courseTitle, setCourseTitle] = useState("");
const [courseDescription, setCourseDescription] = useState("");
const [coursePrice, setCoursePrice] = useState("");

const [editingModuleId, setEditingModuleId] =
  useState<number | null>(null);

const [editingModuleTitle, setEditingModuleTitle] =
  useState("");

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

      setCourse(courseData);

setCourseTitle(courseData.title ?? "");
setCourseDescription(courseData.description ?? "");
setCoursePrice(
  courseData.price !== null &&
  courseData.price !== undefined
    ? String(courseData.price)
    : ""
);

setFullDescription(
  courseData.full_description ?? ""
);

setTargetAudience(
  courseData.target_audience ?? ""
);

setLearningOutcomes(
  courseData.learning_outcomes ?? ""
);

setCourseIncludes(
  courseData.course_includes ?? ""
);

setAccessInfo(
  courseData.access_info ?? ""
);

      const {
        data: videoData,
        error: videoError,
      } = await supabase
        .from("videos")
        .select("id, title, course_id, module_id")
        .eq("course_id", courseId)
        .order("position", { ascending: true })

      if (videoError) {
        throw videoError;
      }

      const {
        data: moduleData,
        error: moduleError,
      } = await supabase
        .from("modules")
        .select("id, title, course_id, position")
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
  title: courseTitle.trim(),
  description:
    courseDescription.trim() || null,
  price:
    coursePrice.trim() !== ""
      ? Number(coursePrice)
      : null,
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
})
      .eq("id", courseId);

    if (error) {
      throw error;
    }

    setCourse((current) =>
      current
        ? {
            ...current,
            title: courseTitle.trim(),
description:
  courseDescription.trim() || null,
price:
  coursePrice.trim() !== ""
    ? Number(coursePrice)
    : null,
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

async function handleUpdateModuleTitle(
  moduleId: number
) {
  const newTitle = editingModuleTitle.trim();

  if (!newTitle) {
    alert("Модуль атауын жазыңыз.");
    return;
  }

  try {
    await updateModule(moduleId, newTitle);

    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              title: newTitle,
            }
          : module
      )
    );

    setEditingModuleId(null);
    setEditingModuleTitle("");

    alert("Модуль атауы өзгертілді.");
  } catch (error) {
    console.error(
      "Модульді өзгерту қатесі:",
      error
    );

    alert("Модульді өзгерту кезінде қате шықты.");
  }
}

async function handleDeleteVideo(videoId: number) {
  const confirmed = window.confirm(
    "Бұл сабақты өшіруге сенімдісіз бе?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", videoId);

    if (error) {
      throw error;
    }

    setVideos((current) =>
      current.filter((video) => video.id !== videoId)
    );

    alert("Сабақ өшірілді.");
  } catch (error) {
    console.error("Сабақты өшіру қатесі:", error);

    alert("Сабақты өшіру кезінде қате шықты.");
  }
}

async function handleMoveVideo(
  draggedVideoId: number,
  targetVideoId: number
) {
  const draggedVideo = videos.find(
    (video) => video.id === draggedVideoId
  );

  const targetVideo = videos.find(
    (video) => video.id === targetVideoId
  );

  if (!draggedVideo || !targetVideo) {
    return;
  }

  if (draggedVideo.module_id !== targetVideo.module_id) {
    return;
  }

  const groupVideos = videos.filter(
    (video) =>
      video.module_id === draggedVideo.module_id
  );

  const draggedIndex = groupVideos.findIndex(
    (video) => video.id === draggedVideoId
  );

  const targetIndex = groupVideos.findIndex(
    (video) => video.id === targetVideoId
  );

  if (
    draggedIndex === -1 ||
    targetIndex === -1
  ) {
    return;
  }

  const reorderedVideos = [...groupVideos];

  const [movedVideo] = reorderedVideos.splice(
    draggedIndex,
    1
  );

  reorderedVideos.splice(
    targetIndex,
    0,
    movedVideo
  );

  const updatedVideos = reorderedVideos.map(
    (video, index) => ({
      ...video,
      position: index + 1,
    })
  );

  setVideos((current) =>
  current
    .map((video) => {
      const updated = updatedVideos.find(
        (item) => item.id === video.id
      );

      return updated ?? video;
    })
    .sort(
      (a, b) =>
        (a.position ?? 9999) -
        (b.position ?? 9999)
    )
);

  try {
    await Promise.all(
      updatedVideos.map((video) =>
        supabase
          .from("videos")
          .update({
            position: video.position,
          })
          .eq("id", video.id)
      )
    );
  } catch (error) {
    console.error(
      "Сабақ ретін сақтау қатесі:",
      error
    );

    alert(
      "Сабақ ретін сақтау кезінде қате шықты."
    );

    await loadData();
  }
}
async function handleMoveModule(
  draggedModuleId: number,
  targetModuleId: number
) {
  const draggedIndex = modules.findIndex(
    (module) => module.id === draggedModuleId
  );

  const targetIndex = modules.findIndex(
    (module) => module.id === targetModuleId
  );

  if (
    draggedIndex === -1 ||
    targetIndex === -1 ||
    draggedIndex === targetIndex
  ) {
    return;
  }

  const reorderedModules = [...modules];

  const [movedModule] = reorderedModules.splice(
    draggedIndex,
    1
  );

  reorderedModules.splice(
    targetIndex,
    0,
    movedModule
  );

  const updatedModules = reorderedModules.map(
    (module, index) => ({
      ...module,
      position: index + 1,
    })
  );

  setModules(updatedModules);

  try {
    await Promise.all(
      updatedModules.map((module) =>
        supabase
          .from("modules")
          .update({
            position: module.position,
          })
          .eq("id", module.id)
      )
    );
  } catch (error) {
    console.error(
      "Модуль ретін сақтау қатесі:",
      error
    );

    alert(
      "Модуль ретін сақтау кезінде қате шықты."
    );

    await loadData();
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
  <div>
    <label className="mb-2 block font-medium text-gray-700">
      Курс атауы
    </label>

    <input
      type="text"
      value={courseTitle}
      onChange={(event) =>
        setCourseTitle(event.target.value)
      }
      placeholder="Курс атауы"
      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
    />
  </div>

  <div className="mt-6">
    <label className="mb-2 block font-medium text-gray-700">
      Қысқа сипаттама
    </label>

    <input
      type="text"
      value={courseDescription}
      onChange={(event) =>
        setCourseDescription(event.target.value)
      }
      placeholder="Курс туралы қысқа сипаттама"
      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
    />
  </div>

  <div className="mt-6">
    <label className="mb-2 block font-medium text-gray-700">
      Бағасы
    </label>

    <input
      type="number"
      min="0"
      value={coursePrice}
      onChange={(event) =>
        setCoursePrice(event.target.value)
      }
      placeholder="Мысалы: 44990"
      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
    />
  </div>

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
  draggable
  onDragStart={(event) => {
    event.dataTransfer.setData(
      "moduleId",
      String(module.id)
    );
  }}
  onDragOver={(event) => {
    event.preventDefault();
  }}
  onDrop={(event) => {
    event.preventDefault();

    const draggedModuleId = Number(
      event.dataTransfer.getData("moduleId")
    );

    if (
      draggedModuleId &&
      draggedModuleId !== module.id
    ) {
      handleMoveModule(
        draggedModuleId,
        module.id
      );
    }
  }}
  className="cursor-move rounded-2xl bg-white p-6 shadow"
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
                      <div className="flex flex-1 items-center gap-3">
  {editingModuleId === module.id ? (
    <div className="flex flex-1 items-center gap-2">
      <input
        type="text"
        value={editingModuleTitle}
        onChange={(event) =>
          setEditingModuleTitle(event.target.value)
        }
        onClick={(event) =>
          event.stopPropagation()
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
      />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleUpdateModuleTitle(module.id);
        }}
        className="shrink-0 rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        💾 Сақтау
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setEditingModuleId(null);
          setEditingModuleTitle("");
        }}
        className="shrink-0 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
      >
        Болдырмау
      </button>
    </div>
  ) : (
    <>
      <h3 className="text-2xl font-bold text-green-700">
        {isOpen ? "▼" : "▶"} 📁{" "}
        {module.title}
      </h3>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setEditingModuleId(module.id);
          setEditingModuleTitle(module.title);
        }}
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        ✏️ Өзгерту
      </button>
    </>
  )}
</div>

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
  draggable
  onDragStart={(event) => {
    event.dataTransfer.setData(
      "videoId",
      String(video.id)
    );
  }}
  onDragOver={(event) => {
    event.preventDefault();
  }}
  onDrop={(event) => {
    event.preventDefault();

    const draggedVideoId = Number(
      event.dataTransfer.getData("videoId")
    );

    if (
      draggedVideoId &&
      draggedVideoId !== video.id
    ) {
      handleMoveVideo(
        draggedVideoId,
        video.id
      );
    }
  }}
  className="cursor-move rounded-xl border border-gray-200 p-5"
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
                                    
                                    <button
  type="button"
  onClick={() => handleDeleteVideo(video.id)}
  className="inline-block rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
>
  🗑️ Өшіру
</button>
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
                  

                  <div className="space-y-4">
                    {videos
                      .filter(
                        (video) =>
                          video.module_id === null
                      )
                      .map((video, index) => (
                        <div
  key={video.id}
  draggable
  onDragStart={(event) => {
    event.dataTransfer.setData(
      "videoId",
      String(video.id)
    );
  }}
  onDragOver={(event) => {
    event.preventDefault();
  }}
  onDrop={(event) => {
    event.preventDefault();

    const draggedVideoId = Number(
      event.dataTransfer.getData("videoId")
    );

    if (
      draggedVideoId &&
      draggedVideoId !== video.id
    ) {
      handleMoveVideo(
        draggedVideoId,
        video.id
      );
    }
  }}
  className="cursor-move rounded-xl border border-gray-200 p-5"
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
                            <button
  type="button"
  onClick={() => handleDeleteVideo(video.id)}
  className="inline-block rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
>
  🗑️ Өшіру
</button>
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