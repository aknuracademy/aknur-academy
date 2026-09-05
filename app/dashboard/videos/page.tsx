"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

import type { Course } from "@/types/course";
import type { Video } from "@/types/video";

type VideoType = "youtube" | "mp4";

export default function VideosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  const [courseId, setCourseId] = useState("");

  const [modules, setModules] = useState<
    {
      id: number;
      title: string;
      course_id: number;
    }[]
  >([]);

  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");

  const [videoType, setVideoType] =
    useState<VideoType>("youtube");

  const [videoUrl, setVideoUrl] = useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCourses();
    loadVideos();
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

  async function loadModules(selectedCourseId: string) {
    if (!selectedCourseId) {
      setModules([]);
      setModuleId("");
      return;
    }

    const { data, error } = await supabase
      .from("modules")
      .select("id, title, course_id")
      .eq("course_id", Number(selectedCourseId))
      .order("position", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setModules(data ?? []);
    setModuleId("");
  }

  async function loadVideos() {
    const { data, error } = await supabase
      .from("videos")
      .select(`
        id,
        course_id,
        title,
        video_url,
        duration,
        created_at,
        courses (
          title
        )
      `)
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setVideos(
      (data ?? []).map((video) => ({
        ...video,
        courses: Array.isArray(video.courses)
          ? video.courses[0]
          : video.courses,
      })) as Video[]
    );
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setMessage("");
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

  async function handleAddVideo() {
    if (!courseId) {
      alert("Курсты таңдаңыз.");
      return;
    }

    if (!moduleId) {
      alert("Модульді таңдаңыз.");
      return;
    }

    if (!title.trim()) {
      alert("Видео атауын жазыңыз.");
      return;
    }

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

    setSaving(true);
    setMessage("");

    try {
      let finalVideoUrl = videoUrl.trim();

      if (videoType === "mp4") {
        setMessage("⏳ MP4 видео жүктеліп жатыр...");
        finalVideoUrl = await uploadMp4File();
      }

      const { error } = await supabase
        .from("videos")
        .insert({
          course_id: Number(courseId),
          module_id: Number(moduleId),
          title: title.trim(),
          video_url: finalVideoUrl,
          duration: duration.trim() || null,
        });

      if (error) {
        throw error;
      }

      setMessage("✅ Видео сәтті қосылды!");

      setCourseId("");
      setModules([]);
      setModuleId("");
      setTitle("");
      setVideoType("youtube");
      setVideoUrl("");
      setSelectedFile(null);
      setDuration("");

      await loadVideos();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Белгісіз қате шықты.";

      setMessage(
        `❌ Видео қосылмады: ${errorMessage}`
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVideo(
    id: number,
    videoTitle: string
  ) {
    const confirmed = window.confirm(
      `"${videoTitle}" видеосын өшіргіңіз келе ме?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Видео өшірілді!");
    await loadVideos();
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-5 md:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-6 shadow md:p-8">
            <h1 className="text-3xl font-bold">
              🎥 Видео сабақ қосу
            </h1>

            <p className="mt-2 text-gray-500">
              YouTube немесе MP4 видеоны курсқа тіркеңіз
            </p>

            <label className="mt-6 block font-medium">
              Курс
            </label>

            <select
              value={courseId}
              onChange={(event) => {
                const selectedCourseId =
                  event.target.value;

                setCourseId(selectedCourseId);
                loadModules(selectedCourseId);
              }}
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
              Модуль
            </label>

            <select
              value={moduleId}
              onChange={(event) =>
                setModuleId(event.target.value)
              }
              disabled={
                !courseId || modules.length === 0
              }
              className="mt-2 w-full rounded-lg border p-3 disabled:bg-gray-100"
            >
              <option value="">
                {!courseId
                  ? "Алдымен курсты таңдаңыз"
                  : modules.length === 0
                    ? "Бұл курста модуль жоқ"
                    : "Модульді таңдаңыз"}
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

            <label className="mt-5 block font-medium">
              Видео атауы
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Мысалы: 1-сабақ. ИП ашу"
              className="mt-2 w-full rounded-lg border p-3"
            />

            <label className="mt-5 block font-medium">
              Видео түрі
            </label>

            <div className="mt-3 flex gap-6">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="videoType"
                  checked={videoType === "youtube"}
                  onChange={() => {
                    setVideoType("youtube");
                    setSelectedFile(null);
                    setMessage("");
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
                    setVideoUrl("");
                    setMessage("");
                  }}
                />
                MP4 файл
              </label>
            </div>

            {videoType === "youtube" ? (
              <>
                <label className="mt-5 block font-medium">
                  YouTube сілтемесі
                </label>

                <input
                  type="url"
                  value={videoUrl}
                  onChange={(event) =>
                    setVideoUrl(event.target.value)
                  }
                  placeholder="https://youtube.com/..."
                  className="mt-2 w-full rounded-lg border p-3"
                />
              </>
            ) : (
              <>
                <label className="mt-5 block font-medium">
                  MP4 видео
                </label>

                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handleFileChange}
                  className="mt-2 block w-full rounded-lg border p-3"
                />

                {selectedFile && (
                  <div className="mt-3 rounded-lg bg-green-50 p-4">
                    <p className="font-medium text-green-800">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Көлемі:{" "}
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={handleAddVideo}
              disabled={saving}
              className="mt-6 w-full rounded-lg bg-green-600 p-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving
                ? "Жүктеліп жатыр..."
                : "➕ Видео қосу"}
            </button>

            {message && (
              <div className="mt-4 break-all rounded-lg bg-gray-100 p-4 text-sm">
                {message}
              </div>
            )}
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow md:p-8">
            <h2 className="text-2xl font-bold">
              📚 Қосылған видеолар
            </h2>

            {videos.length === 0 ? (
              <p className="mt-4 text-gray-500">
                Әзірге видео жоқ
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex h-full flex-col rounded-xl border p-5"
                  >
                    <div className="flex h-full flex-col">
                      <div>
                        <h3 className="text-xl font-bold text-green-700">
                          {video.title}
                        </h3>

                        <p className="mt-2 text-gray-600">
                          Курс:{" "}
                          {video.courses?.title ||
                            "Курс атауы жоқ"}
                        </p>

                        <p className="mt-1 text-gray-600">
                          ⏱️ Ұзақтығы:{" "}
                          {video.duration ||
                            "Көрсетілмеген"}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          Қосылған күні:{" "}
                          {new Date(
                            video.created_at
                          ).toLocaleDateString(
                            "kk-KZ"
                          )}
                        </p>
                      </div>

                     <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
  <a
    href={`/dashboard/videos/${video.id}`}
    className="rounded-lg bg-blue-500 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-blue-600"
  >
    ▶ Көру
  </a>

  <a
    href={`/dashboard/videos/${video.id}/edit`}
    className="rounded-lg bg-yellow-500 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-yellow-600"
  >
    ✏️ Өңдеу
  </a>

  <button
    type="button"
    onClick={() =>
      handleDeleteVideo(
        video.id,
        video.title
      )
    }
    className="rounded-lg bg-red-500 px-2 py-2 text-xs font-semibold text-white hover:bg-red-600"
  >
    🗑 Өшіру
  </button>
</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}