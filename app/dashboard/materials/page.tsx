"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/Sidebar";

import { getCourses } from "@/services/course.service";
import { getVideosByCourse } from "@/services/video.service";

import {
  createMaterial,
  uploadMaterialFile,
  getMaterialsByCourse,
  deleteMaterial,
  updateMaterial,
} from "@/services/material.service";

import type { Course } from "@/types/course";
import type { Video } from "@/types/video";
import type {
  CourseMaterial,
  MaterialType,
} from "@/types/material";

type ActiveTab = "add" | "list";

export default function MaterialUploadPage() {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("add");

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState(0);

  const [videos, setVideos] = useState<Video[]>([]);
  const [videoId, setVideoId] = useState(0);

  const [materials, setMaterials] = useState<
    CourseMaterial[]
  >([]);

  // Жаңа материал
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [materialType, setMaterialType] =
    useState<MaterialType>("pdf");

  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(
    null
  );

  const [saving, setSaving] = useState(false);

  // Өзгерту
  const [editingMaterial, setEditingMaterial] =
    useState<CourseMaterial | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] =
    useState("");

  const [editMaterialType, setEditMaterialType] =
    useState<MaterialType>("pdf");

  const [editContent, setEditContent] =
    useState("");

  const [editFile, setEditFile] =
    useState<File | null>(null);

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses();

        setCourses(data);

        if (data.length > 0) {
          setCourseId(data[0].id);
        }
      } catch (error) {
        console.error(
          "Курстарды жүктеу қатесі:",
          error
        );
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    async function loadVideos() {
      if (!courseId) {
        setVideos([]);
        setVideoId(0);
        return;
      }

      try {
        const data =
          await getVideosByCourse(courseId);

        setVideos(data);

        if (data.length > 0) {
          setVideoId(data[0].id);
        } else {
          setVideoId(0);
        }
      } catch (error) {
        console.error(
          "Сабақтарды жүктеу қатесі:",
          error
        );

        setVideos([]);
        setVideoId(0);
      }
    }

    loadVideos();
  }, [courseId]);

  async function loadMaterials() {
    if (!courseId) {
      setMaterials([]);
      return;
    }

    try {
      const data =
        await getMaterialsByCourse(courseId);

      setMaterials(data);
    } catch (error) {
      console.error(
        "Материалдарды жүктеу қатесі:",
        error
      );

      setMaterials([]);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, [courseId]);

  async function handleSaveMaterial() {
    if (!courseId) {
      alert("Курсты таңдаңыз.");
      return;
    }

    if (!videoId) {
      alert("Сабақты таңдаңыз.");
      return;
    }

    if (!title.trim()) {
      alert("Материал атауын жазыңыз.");
      return;
    }

    try {
      setSaving(true);

      let fileUrl: string | undefined;

      if (materialType === "text") {
        if (!content.trim()) {
          alert("Материал мәтінін жазыңыз.");
          return;
        }
      } else {
        if (!file) {
          alert("Файлды таңдаңыз.");
          return;
        }

        fileUrl = await uploadMaterialFile(
          videoId,
          file
        );
      }

      await createMaterial({
        course_id: courseId,
        video_id: videoId,
        title: title.trim(),
        description:
          description.trim() || undefined,
        material_type: materialType,
        file_url: fileUrl,
        content:
          materialType === "text"
            ? content.trim()
            : undefined,
      });

      alert("Материал сәтті сақталды.");

      setTitle("");
      setDescription("");
      setContent("");
      setFile(null);

      await loadMaterials();

      setActiveTab("list");
    } catch (error) {
      console.error(
        "Материалды сақтау қатесі:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Материалды сақтау кезінде қате шықты."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function handleStartEdit(
    material: CourseMaterial
  ) {
    setEditingMaterial(material);

    setEditTitle(material.title);

    setEditDescription(
      material.description ?? ""
    );

    setEditMaterialType(
      material.material_type
    );

    setEditContent(
      material.content ?? ""
    );

    setEditFile(null);
  }

  function handleCancelEdit() {
    setEditingMaterial(null);
    setEditTitle("");
    setEditDescription("");
    setEditContent("");
    setEditFile(null);
  }

  async function handleUpdateMaterial() {
    if (!editingMaterial) {
      return;
    }

    if (!editTitle.trim()) {
      alert("Материал атауын жазыңыз.");
      return;
    }

    if (
      editMaterialType === "text" &&
      !editContent.trim()
    ) {
      alert("Материал мәтінін жазыңыз.");
      return;
    }

    try {
      setUpdating(true);

      let fileUrl =
        editingMaterial.file_url ?? undefined;

      if (editMaterialType === "text") {
        fileUrl = undefined;
      } else if (editFile) {
        if (!editingMaterial.video_id) {
  alert("Материалға сабақ байланыстырылмаған.");
  return;
}

fileUrl = await uploadMaterialFile(
  editingMaterial.video_id,
  editFile
);
      }

      await updateMaterial(
        editingMaterial.id,
        {
          title: editTitle.trim(),

          description:
            editDescription.trim() ||
            undefined,

          material_type:
            editMaterialType,

          file_url: fileUrl,

          content:
            editMaterialType === "text"
              ? editContent.trim()
              : undefined,

          is_visible:
            editingMaterial.is_visible ??
            true,

          allow_download:
            editingMaterial.allow_download ??
            true,

          is_required:
            editingMaterial.is_required ??
            false,

          is_preview:
            editingMaterial.is_preview ??
            false,
        }
      );

      alert("Материал өзгертілді.");

      handleCancelEdit();

      await loadMaterials();
    } catch (error) {
      console.error(
        "Материалды өзгерту қатесі:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Материалды өзгерту кезінде қате шықты."
        );
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteMaterial(
    material: CourseMaterial
  ) {
    const confirmed = window.confirm(
      `"${material.title}" материалын өшіруге сенімдісіз бе?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMaterial(material.id);

      alert("Материал өшірілді.");

      if (
        editingMaterial?.id === material.id
      ) {
        handleCancelEdit();
      }

      await loadMaterials();
    } catch (error) {
      console.error(
        "Материалды өшіру қатесі:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Материалды өшіру кезінде қате шықты."
        );
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">
            PDF материалдар
          </h1>

          <p className="mt-2 text-gray-600">
            Курс сабақтарына PDF, Word,
            Excel, фото және мәтін
            материалдарын басқарыңыз.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setActiveTab("add")
              }
              className={`rounded-xl px-5 py-4 font-bold transition ${
                activeTab === "add"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 shadow"
              }`}
            >
              ➕ Материал қосу
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("list")
              }
              className={`rounded-xl px-5 py-4 font-bold transition ${
                activeTab === "list"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 shadow"
              }`}
            >
              📚 Қосылған материалдар
            </button>
          </div>

          {activeTab === "add" && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow">
              <h2 className="text-2xl font-bold">
                Материал қосу
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-1 block font-medium">
                    Курс
                  </label>

                  <select
                    value={courseId}
                    onChange={(e) =>
                      setCourseId(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  >
                    {courses.map(
                      (course) => (
                        <option
                          key={course.id}
                          value={course.id}
                        >
                          {course.title}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium">
                    Сабақ
                  </label>

                  <select
                    value={videoId}
                    onChange={(e) =>
                      setVideoId(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full rounded-lg border p-3"
                    disabled={
                      videos.length === 0
                    }
                  >
                    {videos.length === 0 ? (
                      <option value={0}>
                        Бұл курста сабақ жоқ
                      </option>
                    ) : (
                      videos.map((video) => (
                        <option
                          key={video.id}
                          value={video.id}
                        >
                          {video.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium">
                    Материал атауы
                  </label>

                  <input
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border p-3"
                    placeholder="Мысалы: Салық кодексі"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">
                    Сипаттама
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    className="min-h-28 w-full rounded-lg border p-3"
                    placeholder="Материал туралы қысқаша сипаттама"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">
                    Материал түрі
                  </label>

                  <select
                    value={materialType}
                    onChange={(e) =>
                      setMaterialType(
                        e.target
                          .value as MaterialType
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  >
                    <option value="pdf">
                      PDF
                    </option>
                    <option value="word">
                      Word
                    </option>
                    <option value="excel">
                      Excel
                    </option>
                    <option value="image">
                      Фото
                    </option>
                    <option value="text">
                      Мәтін
                    </option>
                  </select>
                </div>

                {materialType ===
                "text" ? (
                  <textarea
                    value={content}
                    onChange={(e) =>
                      setContent(
                        e.target.value
                      )
                    }
                    className="min-h-40 w-full rounded-lg border p-3"
                    placeholder="Материал мәтінін жазыңыз"
                  />
                ) : (
                  <input
                    type="file"
                    onChange={(e) =>
                      setFile(
                        e.target
                          .files?.[0] ??
                          null
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  />
                )}

                <button
                  type="button"
                  onClick={
                    handleSaveMaterial
                  }
                  disabled={saving}
                  className="w-full rounded-lg bg-green-600 px-5 py-3 font-bold text-white disabled:bg-gray-400"
                >
                  {saving
                    ? "Сақталып жатыр..."
                    : "Материалды сақтау"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "list" && (
            <div className="mt-8">
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block font-medium">
                      Курс бойынша сүзу
                    </label>

                    <select
                      value={courseId}
                      onChange={(e) =>
                        setCourseId(
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full rounded-lg border p-3"
                    >
                      {courses.map(
                        (course) => (
                          <option
                            key={course.id}
                            value={course.id}
                          >
                            {course.title}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="rounded-lg bg-gray-100 px-4 py-3">
                    Барлығы:{" "}
                    {materials.length}
                  </div>
                </div>
              </div>

              <h2 className="mt-8 text-2xl font-bold">
                Қосылған материалдар
              </h2>

              <div className="mt-4 space-y-4">
                {materials.map(
                  (material) => (
                    <div
                      key={material.id}
                      className="rounded-2xl bg-white p-5 shadow"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-lg font-bold">
                            {material.title}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Түрі:{" "}
                            {
                              material.material_type
                            }
                          </p>

                          {material.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {
                                material.description
                              }
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {material.file_url && (
                            <a
                              href={
                                material.file_url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border px-4 py-2 text-sm font-bold"
                            >
                              👁 Қарау
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleStartEdit(
                                material
                              )
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                          >
                            ✏️ Өзгерту
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteMaterial(
                                material
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white"
                          >
                            🗑 Өшіру
                          </button>
                        </div>
                      </div>

                      {editingMaterial?.id ===
                        material.id && (
                        <div className="mt-5 space-y-4 border-t pt-5">
                          <h3 className="font-bold">
                            ✏️ Материалды
                            өзгерту
                          </h3>

                          <input
                            value={
                              editTitle
                            }
                            onChange={(e) =>
                              setEditTitle(
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border p-3"
                            placeholder="Материал атауы"
                          />

                          <textarea
                            value={
                              editDescription
                            }
                            onChange={(e) =>
                              setEditDescription(
                                e.target.value
                              )
                            }
                            className="min-h-24 w-full rounded-lg border p-3"
                            placeholder="Сипаттама"
                          />

                          <select
                            value={
                              editMaterialType
                            }
                            onChange={(e) =>
                              setEditMaterialType(
                                e.target
                                  .value as MaterialType
                              )
                            }
                            className="w-full rounded-lg border p-3"
                          >
                            <option value="pdf">
                              PDF
                            </option>
                            <option value="word">
                              Word
                            </option>
                            <option value="excel">
                              Excel
                            </option>
                            <option value="image">
                              Фото
                            </option>
                            <option value="text">
                              Мәтін
                            </option>
                          </select>

                          {editMaterialType ===
                          "text" ? (
                            <textarea
                              value={
                                editContent
                              }
                              onChange={(e) =>
                                setEditContent(
                                  e.target
                                    .value
                                )
                              }
                              className="min-h-32 w-full rounded-lg border p-3"
                              placeholder="Мәтін"
                            />
                          ) : (
                            <div>
                              <p className="mb-1 text-sm text-gray-500">
                                Файлды
                                ауыстырғыңыз
                                келсе ғана жаңа
                                файл таңдаңыз
                              </p>

                              <input
                                type="file"
                                onChange={(e) =>
                                  setEditFile(
                                    e.target
                                      .files?.[0] ??
                                      null
                                  )
                                }
                                className="w-full rounded-lg border p-3"
                              />
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={
                                handleUpdateMaterial
                              }
                              disabled={
                                updating
                              }
                              className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-bold text-white disabled:bg-gray-400"
                            >
                              {updating
                                ? "Сақталуда..."
                                : "Өзгерісті сақтау"}
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleCancelEdit
                              }
                              className="rounded-lg border px-5 py-3 font-bold"
                            >
                              Болдырмау
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}