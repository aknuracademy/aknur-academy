"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MaterialModal from "@/components/dashboard/materials/MaterialModal";

import {
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialsByVideo,
  uploadMaterialFile,
} from "@/services/material.service";

import { getVideoById } from "@/services/video.service";

import type {
  CourseMaterial,
  MaterialType,
} from "@/types/material";

const materialLabels: Record<MaterialType, string> = {
  pdf: "📄 PDF",
  excel: "📊 Excel",
  word: "📝 Word",
  image: "🖼 Фото",
  text: "📖 Мәтін",
};

export default function VideoMaterialsPage() {
  const params = useParams();
  const videoId = Number(params.id);

  const [courseId, setCourseId] = useState<number | null>(
    null
  );

  const [materials, setMaterials] = useState<
    CourseMaterial[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] =
  useState<CourseMaterial | null>(null);

const [isEditMode, setIsEditMode] =
  useState(false);
  function handleEditMaterial(
  material: CourseMaterial
) {
  setEditingMaterial(material);
  setIsEditMode(true);
  setShowForm(true);
}

  useEffect(() => {
    async function loadPageData() {
      if (!videoId || Number.isNaN(videoId)) {
        setErrorMessage("Сабақ нөмірі дұрыс емес.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const [videoData, materialsData] =
          await Promise.all([
            getVideoById(videoId),
            getMaterialsByVideo(videoId),
          ]);

        setCourseId(videoData.course_id);
        setMaterials(materialsData);
      } catch (error) {
        console.error(
          "Материалдар бетін жүктеу қатесі:",
          error
        );

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Материалдарды жүктеу кезінде қате шықты."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, [videoId]);

  async function handleSaveMaterial(data: {
    title: string;
    description: string;
    materialType: MaterialType;
    content: string;
    file: File | null;
    isVisible: boolean;
allowDownload: boolean;
isRequired: boolean;
isPreview: boolean;
  }) {
    if (!courseId) {
      throw new Error("Курс мәліметі табылмады.");
    }

    try {
      setSaving(true);

      let fileUrl: string | undefined;

      if (
        data.materialType !== "text" &&
        data.file
      ) {
        fileUrl = await uploadMaterialFile(
          videoId,
          data.file
        );
      }

      if (editingMaterial) {
  await updateMaterial(editingMaterial.id, {
    title: data.title,
    description: data.description,
    material_type: data.materialType,
    file_url: fileUrl ?? editingMaterial.file_url ?? undefined,
    content:
      data.materialType === "text"
        ? data.content
        : undefined,
    is_visible: data.isVisible,
    allow_download: data.allowDownload,
    is_required: data.isRequired,
    is_preview: data.isPreview,
  });
} else {
  await createMaterial({
    course_id: courseId,
    video_id: videoId,
    title: data.title,
    description: data.description,
    material_type: data.materialType,
    file_url: fileUrl,
    content:
      data.materialType === "text"
        ? data.content
        : undefined,
    is_visible: data.isVisible,
    allow_download: data.allowDownload,
    is_required: data.isRequired,
    is_preview: data.isPreview,
  });
}


      const updatedMaterials =
        await getMaterialsByVideo(videoId);

      setMaterials(updatedMaterials);
      setEditingMaterial(null);
setIsEditMode(false);
      setShowForm(false);

      alert("Материал сәтті сақталды.");
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

      throw error;
    } finally {
      setSaving(false);
    }
  }
  async function handleDeleteMaterial(
  materialId: number
) {
  const confirmed = window.confirm(
    "Бұл материалды өшіргіңіз келе ме?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteMaterial(materialId);

    setMaterials((currentMaterials) =>
      currentMaterials.filter(
        (material) => material.id !== materialId
      )
    );

    alert("Материал өшірілді.");
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
    <main className="min-h-screen bg-gray-100 p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              📄 Сабақ материалдары
            </h1>

            <p className="mt-2 text-gray-500">
              Осы сабаққа тиесілі барлық материалдар.
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Сабақ ID: {videoId}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            disabled={saving}
            className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ➕ Материал қосу
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

            <p className="mt-4 font-medium text-gray-600">
              Материалдар жүктеліп жатыр...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-bold">
              Материалдарды жүктеу мүмкін болмады
            </p>

            <p className="mt-2 whitespace-pre-line text-sm">
              {errorMessage}
            </p>
          </div>
        ) : materials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="text-6xl">📂</div>

            <h2 className="mt-4 text-2xl font-semibold">
              Материал жоқ
            </h2>

            <p className="mt-2 text-gray-500">
              Осы сабаққа әлі материал қосылмаған.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className="rounded-2xl bg-white p-6 shadow"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      {
                        materialLabels[
                          material.material_type
                        ]
                      }
                    </span>

                    <h2 className="mt-3 text-xl font-bold text-gray-900">
                      {material.title}
                    </h2>

                    {material.description && (
                      <p className="mt-2 text-gray-600">
                        {material.description}
                      </p>
                    )}

                    {material.material_type ===
                      "text" &&
                      material.content && (
                        <div className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-gray-700">
                          {material.content}
                        </div>
                      )}
                  </div>


                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
  {material.file_url && (
    <a
      href={material.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-700"
    >
      👁 Файлды ашу
    </a>
  )}

  <button
    type="button"
    onClick={() =>
      handleEditMaterial(material)
    }
    className="rounded-lg bg-amber-500 px-5 py-3 font-medium text-white transition hover:bg-amber-600"
  >
    ✏️ Өзгерту
  </button>

  <button
    type="button"
    onClick={() =>
      handleDeleteMaterial(material.id)
    }
    className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
  >
    🗑 Жою
  </button>
</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MaterialModal
  open={showForm}
  onClose={() => {
    setShowForm(false);
    setEditingMaterial(null);
    setIsEditMode(false);
  }}
  initialMaterial={editingMaterial}
  onSave={handleSaveMaterial}
/>
              
    </main>
  );
}