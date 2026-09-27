"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

import type { Course } from "@/types/course";
import type { Video } from "@/types/video";
import RichTextEditor from "@/components/RichTextEditor";

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

    type DraftVideoBlock = {
  id: string;
  videoType: VideoType;
  videoUrl: string;
  file: File | null;
};

const [videoBlocks, setVideoBlocks] =
  useState<DraftVideoBlock[]>([]);

  type DraftFileBlock = {
  id: string;
  file: File;
};

const [fileBlocks, setFileBlocks] =
  useState<DraftFileBlock[]>([]);

  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [showTextEditor, setShowTextEditor] =
  useState(false);

const [textContent, setTextContent] =
  useState("");

  type DraftTextBlock = {
  id: string;
  content: string;
};

const [textBlocks, setTextBlocks] =
  useState<DraftTextBlock[]>([]);

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

if (file && file.size > 50 * 1024 * 1024) {
  alert("Файл көлемі 50 MB-тан аспауы керек.");

  event.target.value = "";
  setSelectedFile(null);

  return;
}

setSelectedFile(file);
setMessage("");
  }

  function handleMaterialFileChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  setFileBlocks((current) => [
    ...current,
    {
      id: crypto.randomUUID(),
      file,
    },
  ]);

  event.target.value = "";
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

    if (videoBlocks.length === 0) {
  alert("Кемінде бір видео қосыңыз.");
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

      const {
  data: createdVideo,
  error: videoInsertError,
} = await supabase
  .from("videos")
  .insert({
    course_id: Number(courseId),
    module_id: Number(moduleId),
    title: title.trim(),
    video_url: finalVideoUrl,
    duration: duration.trim() || null,
  })
  .select("id")
  .single();

if (videoInsertError) {
  throw videoInsertError;
}

if (!createdVideo) {
  throw new Error("Сабақ ID алынбады.");
}

const preparedVideoBlocks = [];

for (const block of videoBlocks) {
  if (block.videoType === "youtube") {
    preparedVideoBlocks.push({
      ...block,
      finalUrl: block.videoUrl,
    });

    continue;
  }

  if (!block.file) {
    throw new Error("MP4 файл табылмады.");
  }

  const extension =
    block.file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "mp4";

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } =
    await supabase.storage
      .from("course-videos")
      .upload(fileName, block.file, {
        cacheControl: "3600",
        upsert: false,
        contentType:
          block.file.type || "video/mp4",
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("course-videos")
    .getPublicUrl(fileName);

  preparedVideoBlocks.push({
    ...block,
    finalUrl: data.publicUrl,
  });
}

const preparedFileBlocks = [];

for (const block of fileBlocks) {
  const file = block.file;

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "file";

  const safeFileName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-");

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}-${safeFileName}.${extension}`;

  const { error: uploadError } =
    await supabase.storage
      .from("course-materials")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType:
          file.type || "application/octet-stream",
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("course-materials")
    .getPublicUrl(fileName);

  preparedFileBlocks.push({
    ...block,
    finalUrl: data.publicUrl,
  });
}

const lessonBlocks = [
  ...textBlocks.map((block, index) => ({
    lesson_id: createdVideo.id,
    block_type: "text",
    title: `Мәтін ${index + 1}`,
    content: {
      html: block.content,
    },
    position: index,
  })),

  ...preparedVideoBlocks.map((block, index) => ({
    lesson_id: createdVideo.id,
    block_type: "video",
    title: `Видео ${index + 1}`,
    content: {
      type: block.videoType,
      url: block.finalUrl,
      fileName: block.file?.name ?? null,
    },
    position: textBlocks.length + index,
  })),

  ...preparedFileBlocks.map((block, index) => ({
    lesson_id: createdVideo.id,
    block_type: "file",
    title: `Файл ${index + 1}`,
    content: {
      url: block.finalUrl,
      fileName: block.file.name,
      fileType: block.file.type || null,
      fileSize: block.file.size,
    },
    position:
      textBlocks.length +
      preparedVideoBlocks.length +
      index,
  })),
];

if (lessonBlocks.length > 0) {
  const { error: blockInsertError } =
    await supabase
      .from("lesson_blocks")
      .insert(lessonBlocks);

  if (blockInsertError) {
    throw blockInsertError;
  }
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
      setTextBlocks([]);
setTextContent("");
setShowTextEditor(false);
setVideoBlocks([]);
setFileBlocks([]);

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

            <div className="mt-5">
  <button
    type="button"
    onClick={() => setShowTextEditor(true)}
    className="rounded-lg border border-green-600 px-4 py-2 font-medium text-green-700 hover:bg-green-50"
  >
    + Мәтін қосу
    {textBlocks.length > 0 && (
  <div className="mt-4 space-y-3">
    {textBlocks.map((block, index) => (
      <div
        key={block.id}
        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-medium text-gray-700">
            📝 Мәтін {index + 1}
          </span>

          <button
            type="button"
            onClick={() =>
              setTextBlocks((current) =>
                current.filter(
                  (item) => item.id !== block.id
                )
              )
            }
            className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            🗑 Өшіру
          </button>
        </div>

        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{
            __html: block.content,
          }}
        />
      </div>
    ))}
  </div>
)}
  </button>
</div>

{showTextEditor && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Мәтін қосу
        </h2>

        <button
          type="button"
          onClick={() => setShowTextEditor(false)}
          className="rounded-lg bg-gray-100 px-3 py-2"
        >
          ✕
        </button>
      </div>

      <RichTextEditor
        value={textContent}
        onChange={setTextContent}
      />

      <div className="mt-6 flex justify-end gap-3">
  <button
    type="button"
    onClick={() => {
      setTextContent("");
      setShowTextEditor(false);
    }}
    className="rounded-lg bg-gray-200 px-5 py-3 font-medium"
  >
    Болдырмау
  </button>

  <button
    type="button"
    onClick={() => {
      const cleanContent = textContent.trim();

      if (
        !cleanContent ||
        cleanContent === "<p></p>"
      ) {
        alert("Мәтін жазыңыз.");
        return;
      }

      setTextBlocks((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          content: cleanContent,
        },
      ]);

      setTextContent("");
      setShowTextEditor(false);
    }}
    className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
  >
    💾 Сақтау
  </button>
</div>
    </div>
  </div>
)}

<div className="mt-5">
  <label className="mb-2 block font-medium">
    Файл қосу
  </label>

  <input
    type="file"
    onChange={handleMaterialFileChange}
    className="block w-full rounded-lg border p-3"
  />

  {fileBlocks.length > 0 && (
    <div className="mt-4 space-y-3">
      {fileBlocks.map((block, index) => (
        <div
          key={block.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
        >
          <div>
            <p className="font-medium">
              📎 Файл {index + 1}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {block.file.name}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setFileBlocks((current) =>
                current.filter(
                  (item) => item.id !== block.id
                )
              )
            }
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            🗑 Өшіру
          </button>
        </div>
      ))}
    </div>
  )}
</div>

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
  onClick={() => {
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

    setVideoBlocks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        videoType,
        videoUrl: videoUrl.trim(),
        file: selectedFile,
      },
    ]);

    setVideoType("youtube");
    setVideoUrl("");
    setSelectedFile(null);
  }}
  className="mt-4 rounded-lg border border-blue-600 px-4 py-2 font-medium text-blue-700 hover:bg-blue-50"
>
  + Видео қосу
</button>

{videoBlocks.length > 0 && (
  <div className="mt-4 space-y-3">
    {videoBlocks.map((block, index) => (
      <div
        key={block.id}
        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-gray-800">
              🎬 Видео {index + 1}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {block.videoType === "youtube"
                ? "YouTube"
                : "MP4 файл"}
            </p>

            {block.videoType === "youtube" &&
              block.videoUrl && (
                <p className="mt-1 break-all text-sm text-blue-600">
                  {block.videoUrl}
                </p>
              )}

            {block.videoType === "mp4" &&
              block.file && (
                <p className="mt-1 text-sm text-gray-600">
                  {block.file.name}
                </p>
              )}
          </div>

          <button
            type="button"
            onClick={() =>
              setVideoBlocks((current) =>
                current.filter(
                  (item) => item.id !== block.id
                )
              )
            }
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            🗑 Өшіру
          </button>
        </div>
      </div>
    ))}
  </div>
)}

            <button
              type="button"
              onClick={handleAddVideo}
              disabled={saving}
              className="mt-6 w-full rounded-lg bg-green-600 p-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving
  ? "Сақталуда..."
  : "💾 Сабақты сақтау"}
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