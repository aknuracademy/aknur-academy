"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getModulesByCourse } from "@/services/module.service";

type Module = {
  id: number;
  title: string;
  course_id: number;
};

function NewVideoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = Number(searchParams.get("courseId"));

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [selectedFile, setSelectedFile] =
  useState<File | null>(null);

  const [videoType, setVideoType] =
    useState<"youtube" | "mp4">("youtube");
  const [moduleId, setModuleId] = useState("");

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!courseId || Number.isNaN(courseId)) {
      setLoading(false);
      return;
    }

    loadModules();
  }, [courseId]);

  async function loadModules() {
    try {
      setLoading(true);

      const data = await getModulesByCourse(courseId);
      setModules((data ?? []) as Module[]);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Модульдерді жүктеу кезінде қате шықты.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0] ?? null;

  setSelectedFile(file);
}
async function uploadMp4File() {
  if (!selectedFile) {
    throw new Error("MP4 файлды таңдаңыз.");
  }

  const extension =
    selectedFile.name.split(".").pop() || "mp4";

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("course-videos")
    .upload(fileName, selectedFile);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("course-videos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
  videoType === "youtube" &&
  !videoUrl.trim()
) {
  alert("YouTube сілтемесін жазыңыз.");
  return;
}

if (
  videoType === "mp4" &&
  !selectedFile
) {
  alert("MP4 файлды таңдаңыз.");
  return;
}

    try {
      setSaving(true);
      let finalVideoUrl = videoUrl.trim();

if (videoType === "mp4") {
  finalVideoUrl = await uploadMp4File();
}

      const { error } = await supabase.from("videos").insert({
        title: title.trim(),
        video_url: finalVideoUrl,
        video_type: videoType,
        course_id: courseId,
        module_id: moduleId ? Number(moduleId) : null,
      });

      if (error) {
        throw error;
      }

      alert("Сабақ сәтті сақталды!");

      router.push(`/dashboard/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Сабақты сақтау кезінде қате шықты.");
      }
    } finally {
      setSaving(false);
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

  if (!courseId || Number.isNaN(courseId)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-red-600">
            Курс анықталмады
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/courses")
            }
            className="mt-5 rounded-lg bg-green-600 px-5 py-3 font-bold text-white"
          >
            ← Курстарға қайту
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() =>
            router.push(`/dashboard/courses/${courseId}`)
          }
          className="rounded-lg bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
        >
          ← Сабақтарға қайту
        </button>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow md:p-8">
          <h1 className="text-3xl font-bold text-green-700">
            ➕ Жаңа сабақ қосу
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            <div>
              <label className="block font-semibold">
                Сабақ атауы
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Мысалы: ИП деген не?"
                className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block font-semibold">
                Видео түрі
              </label>

              <select
                value={videoType}
                onChange={(event) =>
                  setVideoType(
                    event.target.value as "youtube" | "mp4"
                  )
                }
                className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-green-600"
              >
                <option value="youtube">
                  YouTube
                </option>

                <option value="mp4">
                  MP4
                </option>
              </select>
            </div>

            {videoType === "youtube" ? (
  <div>
    <label className="block font-semibold">
      YouTube сілтемесі
    </label>

    <input
      type="text"
      value={videoUrl}
      onChange={(event) =>
        setVideoUrl(event.target.value)
      }
      placeholder="https://www.youtube.com/watch?v=..."
      className="mt-2 w-full rounded-lg border p-3"
    />
  </div>
) : (
  <div>
    <label className="block font-semibold">
      MP4 файл
    </label>

    <input
      type="file"
      accept="video/mp4"
      onChange={handleFileChange}
      className="mt-2 w-full rounded-lg border p-3"
    />

    {selectedFile && (
      <p className="mt-2 text-sm text-green-600">
        Таңдалған файл: {selectedFile.name}
      </p>
    )}
  </div>
)}

            <div>
              <label className="block font-semibold">
                Модуль
              </label>

              <select
                value={moduleId}
                onChange={(event) =>
                  setModuleId(event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-green-600"
              >
                <option value="">
                  Модуль таңдалмаған
                </option>

                {modules.map((module) => (
                  <option
                    key={module.id}
                    value={module.id}
                  >
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-green-600 p-4 font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving
                ? "Сақталып жатыр..."
                : "Сабақты сақтау"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
export default function NewVideoPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-xl font-medium">
            Жүктеліп жатыр...
          </p>
        </main>
      }
    >
      <NewVideoPageContent />
    </Suspense>
  );
}