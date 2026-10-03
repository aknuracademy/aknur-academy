"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getModulesByCourse } from "@/services/module.service";
import RichTextEditor from "@/components/RichTextEditor";

type Module = {
  id: number;
  title: string;
  course_id: number;
};

type VideoType = "youtube" | "mp4";

type DraftVideoBlock = {
  id: string;
  title: string;
  videoType: VideoType;
  videoUrl: string;
  file: File | null;

  texts: {
    id: string;
    content: string;
  }[];

  files: {
    id: string;
    file: File;
  }[];
};

function NewVideoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = Number(searchParams.get("courseId"));

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [selectedFile, setSelectedFile] =
  useState<File | null>(null);

  const [videoBlocks, setVideoBlocks] =
  useState<DraftVideoBlock[]>([]);

const [newVideoTitle, setNewVideoTitle] =
  useState("");

const [activeVideoBlockId, setActiveVideoBlockId] =
  useState<string | null>(null);

const [textContent, setTextContent] =
  useState("");

const [showTextEditor, setShowTextEditor] =
  useState(false);

  const [expandedVideoIds, setExpandedVideoIds] =
  useState<string[]>([]);

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
        contentType: file.type || "video/mp4",
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

  async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (!title.trim()) {
    alert("Сабақ атауын жазыңыз.");
    return;
  }

  if (videoBlocks.length === 0) {
    alert("Кемінде бір видео қосыңыз.");
    return;
  }

  try {
    setSaving(true);

    const preparedVideoBlocks: Array<
      DraftVideoBlock & {
        finalUrl: string;
      }
    > = [];

    // 1. Барлық видеоларды дайындаймыз
    for (const block of videoBlocks) {
      let finalUrl = block.videoUrl.trim();

      if (block.videoType === "mp4") {
        if (!block.file) {
          throw new Error(
            `"${block.title}" видеосының MP4 файлы табылмады.`
          );
        }

        finalUrl = await uploadVideoBlockFile(
          block.file
        );
      }

      if (
        block.videoType === "youtube" &&
        !finalUrl
      ) {
        throw new Error(
          `"${block.title}" видеосының YouTube сілтемесі жоқ.`
        );
      }

      preparedVideoBlocks.push({
        ...block,
        finalUrl,
      });
    }

    const firstVideo =
      preparedVideoBlocks[0];

    // 2. Негізгі сабақ жазбасын жасаймыз
    const { data: createdVideo, error: videoError } =
      await supabase
        .from("videos")
        .insert({
          title: title.trim(),
          video_url: firstVideo.finalUrl,
          video_type: firstVideo.videoType,
          course_id: courseId,
          module_id: moduleId
            ? Number(moduleId)
            : null,
        })
        .select("id")
        .single();

    if (videoError) {
      throw videoError;
    }

    // 3. Видео → мәтін → файл ретімен
    // lesson_blocks дайындаймыз
    const lessonBlocks = [];
    let position = 0;

    for (const block of preparedVideoBlocks) {
      // Видео
      lessonBlocks.push({
        lesson_id: createdVideo.id,
        block_type: "video",
        title: block.title,
        content: {
          type: block.videoType,
          url: block.finalUrl,
          fileName:
            block.file?.name ?? null,
        },
        position,
      });

      position += 1;

      // Осы видеоның мәтіндері
      for (const textBlock of block.texts) {
        lessonBlocks.push({
          lesson_id: createdVideo.id,
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
        const finalFileUrl =
          await uploadLessonFile(
            fileBlock.file
          );

        lessonBlocks.push({
          lesson_id: createdVideo.id,
          block_type: "file",
          title: fileBlock.file.name,
          content: {
            url: finalFileUrl,
            fileName: fileBlock.file.name,
            fileType:
              fileBlock.file.type || null,
            fileSize:
              fileBlock.file.size,
          },
          position,
        });

        position += 1;
      }
    }

    // 4. Барлық блоктарды сақтаймыз
    if (lessonBlocks.length > 0) {
      const { error: blockError } =
        await supabase
          .from("lesson_blocks")
          .insert(lessonBlocks);

      if (blockError) {
        throw blockError;
      }
    }

    alert("Сабақ сәтті сақталды!");

    router.push(
      `/dashboard/courses/${courseId}`
    );
    router.refresh();
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert(
        "Сабақты сақтау кезінде қате шықты."
      );
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

 

<div className="rounded-xl border-2 border-blue-500 p-4">
  <div className="grid gap-4 md:grid-cols-2">
    <div className="flex flex-col justify-center">
      <label className="mb-2 block font-medium text-blue-700">
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

      <button
        type="button"
        onClick={handleAddVideoBlock}
        className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        + Видео қосу
      </button>
    </div>

    <div>
      {videoType === "mp4" && selectedFile ? (
        <video
          src={URL.createObjectURL(selectedFile)}
          controls
          preload="metadata"
          className="aspect-video w-full rounded-lg bg-black object-contain"
        />
      ) : videoType === "youtube" && videoUrl.trim() ? (
        <iframe
          src={videoUrl
            .replace("watch?v=", "embed/")
            .replace("youtu.be/", "youtube.com/embed/")
            .replace("shorts/", "embed/")}
          title="Жаңа видео preview"
          className="aspect-video w-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500">
          Видео preview
        </div>
      )}
    </div>
  </div>
</div>

           {videoBlocks.length > 0 && (
  <div className="space-y-4">
    {videoBlocks.map((block) => (
      <div
        key={block.id}
        className="rounded-xl border border-blue-200 bg-blue-50 p-4"
      >
        <p className="font-semibold text-gray-900">
          🎬 {block.title}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {block.videoType === "youtube"
            ? "YouTube видео"
            : "MP4 видео"}
        </p>

        <div className="mt-3 overflow-hidden rounded-xl border bg-black">
  {block.videoType === "youtube" ? (
    <iframe
      src={block.videoUrl
        .replace("watch?v=", "embed/")
        .replace("youtu.be/", "youtube.com/embed/")
        .replace("shorts/", "embed/")}
      title={block.title}
      className="aspect-video w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  ) : block.file ? (
    <video
      src={URL.createObjectURL(block.file)}
      controls
      preload="metadata"
      className="aspect-video w-full bg-black object-contain"
    />
  ) : null}
</div>

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
                const file = event.target.files?.[0];

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
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white"
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
    <div className="mt-4 rounded-xl border bg-white p-4">
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
          <span className="text-sm font-medium">
            📝 Мәтін {index + 1}
          </span>

          <button
            type="button"
            onClick={() =>
              setVideoBlocks((current) =>
                current.map((item) =>
                  item.id === block.id
                    ? {
                        ...item,
                        texts: item.texts.filter(
                          (text) => text.id !== textBlock.id
                        ),
                      }
                    : item
                )
              )
            }
            className="text-sm font-medium text-red-600"
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
        <span>📎 {fileBlock.file.name}</span>

        <button
          type="button"
          onClick={() =>
            setVideoBlocks((current) =>
              current.map((item) =>
                item.id === block.id
                  ? {
                      ...item,
                      files: item.files.filter(
                        (file) => file.id !== fileBlock.id
                      ),
                    }
                  : item
              )
            )
          }
          className="font-medium text-red-600"
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