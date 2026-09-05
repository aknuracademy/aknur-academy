"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Module = {
  id: number;
  title: string;
  course_id: number;
};

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();

  const videoId = Number(params.id);

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [videoType, setVideoType] =
  useState<"youtube" | "mp4">("youtube");

const [selectedFile, setSelectedFile] =
  useState<File | null>(null);

  const [courseId, setCourseId] = useState<number | null>(null);
  const [moduleId, setModuleId] = useState("");
  const [originalModuleId, setOriginalModuleId] =
  useState("");

  const [modules, setModules] = useState<Module[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!videoId || Number.isNaN(videoId)) {
      return;
    }

    loadVideo();
  }, [videoId]);

  async function loadVideo() {
    setLoading(true);

    const { data: videoData, error: videoError } =
      await supabase
        .from("videos")
        .select(
          "title, video_url, duration, course_id, module_id"
        )
        .eq("id", videoId)
        .single();

    if (videoError) {
      alert(videoError.message);
      setLoading(false);
      return;
    }

    setTitle(videoData.title ?? "");
    setVideoUrl(videoData.video_url ?? "");
    const currentUrl = videoData.video_url ?? "";

setVideoType(
  currentUrl.includes("youtube.com") ||
  currentUrl.includes("youtu.be")
    ? "youtube"
    : "mp4"
);
    setDuration(videoData.duration ?? "");
    setCourseId(videoData.course_id);

    const currentModuleId =
  videoData.module_id
    ? String(videoData.module_id)
    : "";

setModuleId(currentModuleId);
setOriginalModuleId(currentModuleId);

    const { data: moduleData, error: moduleError } =
      await supabase
        .from("modules")
        .select("id, title, course_id")
        .eq("course_id", videoData.course_id)
        .order("position", { ascending: true });

    if (moduleError) {
      alert(moduleError.message);
      setLoading(false);
      return;
    }

    setModules((moduleData ?? []) as Module[]);
    setLoading(false);
  }

  function handleFileChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file =
    event.target.files?.[0] ?? null;

  setSelectedFile(file);
}

async function uploadMp4File() {
  if (!selectedFile) {
    throw new Error("MP4 файлды таңдаңыз.");
  }

  if (selectedFile.size > 50 * 1024 * 1024) {
    throw new Error(
      "Файл көлемі 50 MB-тан аспауы керек."
    );
  }

  const extension =
    selectedFile.name
      .split(".")
      .pop()
      ?.toLowerCase() || "mp4";

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } =
    await supabase.storage
      .from("course-videos")
      .upload(fileName, selectedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType:
          selectedFile.type || "video/mp4",
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("course-videos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

  async function handleUpdateVideo(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim() || !videoUrl.trim()) {
      alert("Видео атауы мен сілтемесін толтырыңыз.");
      return;
    }

    if (!moduleId) {
      alert("Модульді таңдаңыз.");
      return;
    }

    setSaving(true);

    let finalVideoUrl = videoUrl.trim();

if (videoType === "mp4" && selectedFile) {
  finalVideoUrl = await uploadMp4File();
}

if (videoType === "youtube" && !finalVideoUrl) {
  alert("YouTube сілтемесін енгізіңіз.");
  setSaving(false);
  return;
}

    const { error } = await supabase
      .from("videos")
      .update({
        title: title.trim(),
        video_url: finalVideoUrl,
        duration: duration.trim() || null,
        module_id: Number(
  moduleId || originalModuleId
),
      })
      .eq("id", videoId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Видео сәтті өзгертілді.");
    router.push("/dashboard/videos");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p className="text-center">Жүктелуде...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <button
  type="button"
  onClick={() => router.push("/dashboard")}
  className="mb-6 rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
>
  ← Админ панельге
</button>

        <h1 className="text-3xl font-bold text-green-700">
          Видео сабақты өңдеу
        </h1>

        <form
          onSubmit={handleUpdateVideo}
          className="mt-8 space-y-5"
        >
          

          <div>
            <label className="mb-2 block font-medium">
              Видео атауы
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Модуль
            </label>

            <select
              value={moduleId}
              onChange={(event) =>
                setModuleId(event.target.value)
              }
              className="w-full rounded-lg border p-3"
            >
              <option value="">
                Модульді таңдаңыз
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

            <div>
  <label className="mb-2 block font-medium">
    Видео түрі
  </label>

  <div className="flex gap-6">
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        name="videoType"
        checked={videoType === "youtube"}
        onChange={() => {
          setVideoType("youtube");
          setSelectedFile(null);
        }}
      />
      YouTube
    </label>

    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        name="videoType"
        checked={videoType === "mp4"}
        onChange={() => {
          setVideoType("mp4");
        }}
      />
      MP4 файл
    </label>
  </div>
</div>

            {courseId && modules.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                Бұл курсқа модуль қосылмаған.
              </p>
            )}
          </div>

          <div>
  {videoType === "youtube" ? (
    <>
      <label className="mb-2 block font-medium">
        YouTube сілтемесі
      </label>

      <input
        type="url"
        value={videoUrl}
        onChange={(event) =>
          setVideoUrl(event.target.value)
        }
        placeholder="https://youtube.com/..."
        className="w-full rounded-lg border p-3"
      />
    </>
  ) : (
    <>
      <label className="mb-2 block font-medium">
        MP4 видео
      </label>

      <input
        type="file"
        accept="video/mp4"
        onChange={handleFileChange}
        className="w-full rounded-lg border p-3"
      />

      {selectedFile && (
        <p className="mt-2 text-sm text-green-700">
          Таңдалған файл: {selectedFile.name}
        </p>
      )}
    </>
  )}
</div>

          <div>
            <label className="mb-2 block font-medium">
              Видео ұзақтығы
            </label>

            <input
              type="text"
              value={duration}
              onChange={(event) =>
                setDuration(event.target.value)
              }
              placeholder="Мысалы: 12 минут"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {saving
              ? "Сақталуда..."
              : "Өзгерістерді сақтау"}
          </button>
        </form>
      </div>
    </main>
  );
}