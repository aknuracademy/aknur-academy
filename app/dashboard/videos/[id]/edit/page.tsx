"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "@/components/RichTextEditor";

type Module = {
  id: number;
  title: string;
  course_id: number;
};

type VideoType = "youtube" | "mp4";

type EditableTextBlock = {
  id: string;
  dbId?: number;
  content: string;
};

type EditableFileBlock = {
  id: string;
  dbId?: number;
  file: File | null;
  fileName: string;
  url: string;
};

type EditableVideoBlock = {
  id: string;
  dbId?: number;
  title: string;
  videoType: VideoType;
  videoUrl: string;
  file: File | null;

  texts: EditableTextBlock[];
  files: EditableFileBlock[];
};

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();

  const videoId = Number(params.id);
  const [expandedVideoIds, setExpandedVideoIds] =
  useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [newVideoTitle, setNewVideoTitle] =
  useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [videoType, setVideoType] =
  useState<"youtube" | "mp4">("youtube");

const [selectedFile, setSelectedFile] =
  useState<File | null>(null);

  const [videoBlocks, setVideoBlocks] =
  useState<EditableVideoBlock[]>([]);

const [activeVideoBlockId, setActiveVideoBlockId] =
  useState<string | null>(null);

const [textContent, setTextContent] = useState("");
const [showTextEditor, setShowTextEditor] =
  useState(false);

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
    const { data: lessonBlockData, error: lessonBlockError } =
  await supabase
    .from("lesson_blocks")
    .select(
      "id, block_type, title, content, position"
    )
    .eq("lesson_id", videoId)
    .order("position", { ascending: true });

if (lessonBlockError) {
  alert(lessonBlockError.message);
  setLoading(false);
  return;
}

const loadedVideoBlocks: EditableVideoBlock[] = [];

let currentVideoBlock: EditableVideoBlock | null = null;

for (const block of lessonBlockData ?? []) {
  if (block.block_type === "video") {
    currentVideoBlock = {
      id: crypto.randomUUID(),
      dbId: block.id,
      title: block.title ?? "",
      videoType:
        block.content?.type === "mp4"
          ? "mp4"
          : "youtube",
      videoUrl: block.content?.url ?? "",
      file: null,
      texts: [],
      files: [],
    };

    loadedVideoBlocks.push(currentVideoBlock);
    continue;
  }

  if (!currentVideoBlock) {
    continue;
  }

  if (block.block_type === "text") {
    currentVideoBlock.texts.push({
      id: crypto.randomUUID(),
      dbId: block.id,
      content: block.content?.html ?? "",
    });
  }

  if (block.block_type === "file") {
    currentVideoBlock.files.push({
      id: crypto.randomUUID(),
      dbId: block.id,
      file: null,
      fileName:
        block.content?.fileName ??
        block.title ??
        "Файл",
      url: block.content?.url ?? "",
    });
  }
}

if (
  loadedVideoBlocks.length === 0 &&
  currentUrl
) {
  loadedVideoBlocks.push({
    id: crypto.randomUUID(),
    title: videoData.title ?? "Видео",
    videoType:
      currentUrl.includes("youtube.com") ||
      currentUrl.includes("youtu.be")
        ? "youtube"
        : "mp4",
    videoUrl: currentUrl,
    file: null,
    texts: [],
    files: [],
  });
}

setVideoBlocks(loadedVideoBlocks);
    setLoading(false);
  }

  function handleFileChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file =
    event.target.files?.[0] ?? null;

  setSelectedFile(file);
}

function handleAddVideoBlock() {
  if (!newVideoTitle.trim()) {
  alert("Видео атауын жазыңыз.");
  return;
}

  if (videoType === "youtube" && !videoUrl.trim()) {
    alert("YouTube сілтемесін жазыңыз.");
    return;
  }

  if (videoType === "mp4" && !selectedFile) {
    alert("MP4 файлды таңдаңыз.");
    return;
  }

  if (
    videoType === "mp4" &&
    selectedFile &&
    selectedFile.size > 50 * 1024 * 1024
  ) {
    alert("Файл көлемі 50 MB-тан аспауы керек.");
    return;
  }

  setVideoBlocks((current) => [
    ...current,
    {
      id: crypto.randomUUID(),
      title: newVideoTitle.trim(),
      videoType,
      videoUrl: videoUrl.trim(),
      file: selectedFile,
      texts: [],
      files: [],
    },
  ]);

  setNewVideoTitle("");
  setVideoUrl("");
  setSelectedFile(null);
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

async function uploadVideoBlockFile(file: File) {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error(
      "Файл көлемі 50 MB-тан аспауы керек."
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "mp4";

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } =
    await supabase.storage
      .from("course-videos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType:
          file.type || "video/mp4",
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("course-videos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

async function uploadLessonFile(file: File) {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "file";

  const safeFileName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-");

  const storageFileName =
    `${Date.now()}-${crypto.randomUUID()}-${safeFileName}.${extension}`;

  const { error: uploadError } =
    await supabase.storage
      .from("course-materials")
      .upload(storageFileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType:
          file.type ||
          "application/octet-stream",
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("course-materials")
    .getPublicUrl(storageFileName);

  return data.publicUrl;
}

  async function handleUpdateVideo(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
  alert("Сабақ атауын жазыңыз.");
  return;
}

    if (!moduleId) {
      alert("Модульді таңдаңыз.");
      return;
    }

    setSaving(true);

try {
  // Сабақтың негізгі мәліметтерін жаңарту
  const { error: videoUpdateError } =
    await supabase
      .from("videos")
      .update({
        title: title.trim(),
        duration: duration.trim() || null,
        module_id: Number(
          moduleId || originalModuleId
        ),
      })
      .eq("id", videoId);

  if (videoUpdateError) {
    throw videoUpdateError;
  }

  const lessonBlocks = [];
  let position = 0;

  for (const block of videoBlocks) {
    let finalVideoUrl = block.videoUrl;

    // Жаңа MP4 таңдалған болса жүктейміз
    if (
      block.videoType === "mp4" &&
      block.file
    ) {
      finalVideoUrl =
        await uploadVideoBlockFile(block.file);
    }

    if (!finalVideoUrl) {
      throw new Error(
        `"${block.title}" видеосының файлы немесе сілтемесі табылмады.`
      );
    }

    // Видео
    lessonBlocks.push({
      lesson_id: videoId,
      block_type: "video",
      title: block.title,
      content: {
        type: block.videoType,
        url: finalVideoUrl,
        fileName:
          block.file?.name ?? null,
      },
      position,
    });

    position += 1;

    // Осы видеоның мәтіндері
    for (const textBlock of block.texts) {
      lessonBlocks.push({
        lesson_id: videoId,
        block_type: "text",
        title: null,
        content: {
          html: textBlock.content,
        },
        position,
      });

      position += 1;
    }

    // Осы видеоның файлдары
    for (const fileBlock of block.files) {
      let finalFileUrl = fileBlock.url;

      if (fileBlock.file) {
        finalFileUrl =
          await uploadLessonFile(
            fileBlock.file
          );
      }

      if (!finalFileUrl) {
        throw new Error(
          `${fileBlock.fileName} файлын сақтау мүмкін болмады.`
        );
      }

      lessonBlocks.push({
        lesson_id: videoId,
        block_type: "file",
        title: fileBlock.fileName,
        content: {
          url: finalFileUrl,
          fileName: fileBlock.fileName,
          fileType:
            fileBlock.file?.type || null,
          fileSize:
            fileBlock.file?.size || null,
        },
        position,
      });

      position += 1;
    }
  }

  // Бұрынғы блоктарды өшіреміз
  const { error: deleteError } =
    await supabase
      .from("lesson_blocks")
      .delete()
      .eq("lesson_id", videoId);

  if (deleteError) {
    throw deleteError;
  }

  // Жаңартылған блоктарды қайта сақтаймыз
  if (lessonBlocks.length > 0) {
    const { error: insertError } =
      await supabase
        .from("lesson_blocks")
        .insert(lessonBlocks);

    if (insertError) {
      throw insertError;
    }
  }

  alert("Сабақ сәтті өзгертілді.");

  router.push("/dashboard/videos");
  router.refresh();
} catch (error) {
  alert(
    error instanceof Error
      ? error.message
      : "Сақтау кезінде қате шықты."
  );
} finally {
  setSaving(false);
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

<button
  type="button"
  onClick={handleAddVideoBlock}
  className="rounded-lg border border-blue-600 px-4 py-2 font-medium text-blue-700 hover:bg-blue-50"
>
  <div>
  <label className="mb-2 block font-medium">
    Жаңа видео атауы
  </label>

  <input
    type="text"
    value={newVideoTitle}
    onChange={(event) =>
      setNewVideoTitle(event.target.value)
    }
    placeholder="Мысалы: Кіріспе сабақ"
    className="w-full rounded-lg border p-3"
  />
</div>
  + Видео қосу
</button>

{videoBlocks.length > 0 && (
  <div className="space-y-4">
    {videoBlocks.map((block) => (
      <div
        key={block.id}
        className="rounded-xl border bg-gray-50 p-4"
      >
        <p className="font-semibold text-gray-900">
          🎬 {block.title}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {block.videoType === "youtube"
            ? "YouTube видео"
            : "MP4 видео"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveVideoBlockId(block.id);
              setTextContent("");
              setShowTextEditor(true);
            }}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"
          >
            + Мәтін қосу
          </button>

          <label className="cursor-pointer rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white">
            + Файл қосу

            <input
              type="file"
              className="hidden"
              onChange={(event) => {
                const file =
                  event.target.files?.[0];

                if (!file) return;

                setVideoBlocks((current) =>
                  current.map((item) =>
                    item.id === block.id
                      ? {
                          ...item,
                          files: [
                            ...item.files,
                            {
                              id: crypto.randomUUID(),
                              file,
                              fileName: file.name,
                              url: "",
                            },
                          ],
                        }
                      : item
                  )
                );

                event.target.value = "";
              }}
            />
          </label>

          <button
  type="button"
  onClick={() => {
    setVideoBlocks((current) =>
      current.filter(
        (item) => item.id !== block.id
      )
    );
  }}
  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
>
  🗑 Өшіру
</button>

<button
  type="button"
  onClick={() => {
    setExpandedVideoIds((current) =>
      current.includes(block.id)
        ? current.filter((id) => id !== block.id)
        : [...current, block.id]
    );
  }}
  className="rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
>
  {expandedVideoIds.includes(block.id)
    ? "▲ Жасыру"
    : "▼ Мәтін/файлдарды көрсету"}
</button>

        </div>

        {showTextEditor &&
  activeVideoBlockId === block.id && (
  <div className="rounded-xl border bg-white p-4">
    <p className="mb-3 font-semibold">
      Мәтін қосу
    </p>

    <RichTextEditor
      value={textContent}
      onChange={setTextContent}
    />

    <div className="mt-4 flex gap-2">
      <button
        type="button"
        onClick={() => {
          const cleanContent = textContent.trim();

          if (!cleanContent || !activeVideoBlockId) {
            return;
          }

          setVideoBlocks((current) =>
            current.map((videoBlock) =>
              videoBlock.id === activeVideoBlockId
                ? {
                    ...videoBlock,
                    texts: [
                      ...videoBlock.texts,
                      {
                        id: crypto.randomUUID(),
                        content: cleanContent,
                      },
                    ],
                  }
                : videoBlock
            )
          );

          setTextContent("");
          setShowTextEditor(false);
          setActiveVideoBlockId(null);
        }}
        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white"
      >
        Сақтау
      </button>

      <button
        type="button"
        onClick={() => {
          setTextContent("");
          setShowTextEditor(false);
          setActiveVideoBlockId(null);
        }}
        className="rounded-lg bg-gray-200 px-4 py-2"
      >
        Бас тарту
      </button>
    </div>
  </div>
)}

        {expandedVideoIds.includes(block.id) &&
  block.texts.length > 0 && (
    <div className="mt-4 space-y-2">

            {block.texts.map((textBlock, index) => (
  <div
    key={textBlock.id}
    className="rounded-lg border bg-white p-3"
  >
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className="text-sm font-medium">
        📝 Мәтін {index + 1}
      </p>

      <button
        type="button"
        onClick={() =>
          setVideoBlocks((current) =>
            current.map((item) =>
              item.id === block.id
                ? {
                    ...item,
                    texts: item.texts.filter(
                      (text) =>
                        text.id !== textBlock.id
                    ),
                  }
                : item
            )
          )
        }
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        🗑 Өшіру
      </button>
    </div>

    <div
      className="text-sm"
      dangerouslySetInnerHTML={{
        __html: textBlock.content,
      }}
    />
  </div>
))}
          </div>
        )}

        {expandedVideoIds.includes(block.id) &&
  block.files.length > 0 && (
    <div className="mt-4 space-y-2">
      
            {block.files.map((fileBlock) => (
  <div
    key={fileBlock.id}
    className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3 text-sm"
  >
    <span>
      📎 {fileBlock.fileName}
    </span>

    <button
      type="button"
      onClick={() =>
        setVideoBlocks((current) =>
          current.map((item) =>
            item.id === block.id
              ? {
                  ...item,
                  files: item.files.filter(
                    (file) =>
                      file.id !== fileBlock.id
                  ),
                }
              : item
          )
        )
      }
      className="font-medium text-red-600 hover:text-red-700"
    >
      🗑 Өшіру
    </button>
  </div>
))}
          </div>
        )}
      </div>
    ))}
  </div>
)}

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