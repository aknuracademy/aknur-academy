"use client";

import { useEffect, useState } from "react";

import type {
  CourseMaterial,
  MaterialType,
} from "@/types/material";

type MaterialModalProps = {
  open: boolean;
  onClose: () => void;
  initialMaterial?: CourseMaterial | null;

  onSave: (data: {
    title: string;
    description: string;
    materialType: MaterialType;
    content: string;
    file: File | null;
    isVisible: boolean;
    allowDownload: boolean;
    isRequired: boolean;
    isPreview: boolean;
  }) => Promise<void>;
};

export default function MaterialModal({
  open,
  onClose,
  onSave,
  initialMaterial = null,
}: MaterialModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [materialType, setMaterialType] =
    useState<MaterialType>("pdf");

  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isVisible, setIsVisible] = useState(true);
  const [allowDownload, setAllowDownload] =
    useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(initialMaterial);
  const isTextMaterial = materialType === "text";

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialMaterial) {
      setTitle(initialMaterial.title);
      setDescription(
        initialMaterial.description ?? ""
      );
      setMaterialType(
        initialMaterial.material_type
      );
      setContent(initialMaterial.content ?? "");
      setFile(null);

      setIsVisible(initialMaterial.is_visible);
      setAllowDownload(
        initialMaterial.allow_download
      );
      setIsRequired(initialMaterial.is_required);
      setIsPreview(initialMaterial.is_preview);

      return;
    }

    setTitle("");
    setDescription("");
    setMaterialType("pdf");
    setContent("");
    setFile(null);

    setIsVisible(true);
    setAllowDownload(true);
    setIsRequired(false);
    setIsPreview(false);
  }, [open, initialMaterial]);

  if (!open) {
    return null;
  }

  function handleClose() {
    if (saving) {
      return;
    }

    onClose();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Материал атауын жазыңыз.");
      return;
    }

    if (isTextMaterial && !content.trim()) {
      alert("Материал мәтінін жазыңыз.");
      return;
    }

    const hasExistingFile =
      Boolean(initialMaterial?.file_url);

    if (
      !isTextMaterial &&
      !file &&
      !hasExistingFile
    ) {
      alert("Файлды таңдаңыз.");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        materialType,
        content,
        file,
        isVisible,
        allowDownload,
        isRequired,
        isPreview,
      });

      onClose();
    } catch (error) {
      console.error(
        "Материал формасын сақтау қатесі:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode
              ? "✏️ Материалды өзгерту"
              : "➕ Материал қосу"}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
            aria-label="Жабу"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <div>
            <label
              htmlFor="material-title"
              className="mb-2 block font-medium text-gray-700"
            >
              Материал атауы
            </label>

            <input
              id="material-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Мысалы: Өтініш үлгісі"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="material-description"
              className="mb-2 block font-medium text-gray-700"
            >
              Қысқаша сипаттамасы
            </label>

            <textarea
              id="material-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={3}
              placeholder="Материал туралы қысқаша мәлімет"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="material-type"
              className="mb-2 block font-medium text-gray-700"
            >
              Материал түрі
            </label>

            <select
              id="material-type"
              value={materialType}
              onChange={(event) => {
                const selectedType =
                  event.target.value as MaterialType;

                setMaterialType(selectedType);
                setFile(null);

                if (selectedType !== "text") {
                  setContent("");
                }
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="pdf">📄 PDF</option>
              <option value="word">📝 Word</option>
              <option value="excel">📊 Excel</option>
              <option value="image">🖼 Фото</option>
              <option value="text">📖 Мәтін</option>
            </select>
          </div>

          {isTextMaterial ? (
            <div>
              <label
                htmlFor="material-content"
                className="mb-2 block font-medium text-gray-700"
              >
                Материал мәтіні
              </label>

              <textarea
                id="material-content"
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                rows={8}
                placeholder="Студентке көрсетілетін мәтінді жазыңыз..."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="material-file"
                className="mb-2 block font-medium text-gray-700"
              >
                {isEditMode
                  ? "Жаңа файл таңдау"
                  : "Файл таңдау"}
              </label>

              {isEditMode &&
                initialMaterial?.file_url && (
                  <p className="mb-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                    Қазіргі файл сақталады. Ауыстыру
                    қажет болса, жаңа файл таңдаңыз.
                  </p>
                )}

              <input
                id="material-file"
                type="file"
                onChange={(event) =>
                  setFile(
                    event.target.files?.[0] ?? null
                  )
                }
                accept={
                  materialType === "pdf"
                    ? ".pdf,application/pdf"
                    : materialType === "word"
                      ? ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      : materialType === "excel"
                        ? ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : "image/*"
                }
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-green-100 file:px-4 file:py-2 file:font-medium file:text-green-700 hover:file:bg-green-200"
              />

              {file && (
                <p className="mt-2 text-sm text-gray-500">
                  Таңдалған файл:{" "}
                  <span className="font-medium text-gray-700">
                    {file.name}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="space-y-3 rounded-xl bg-gray-50 p-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(event) =>
                  setIsVisible(event.target.checked)
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                Студентке көрсету
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(event) =>
                  setAllowDownload(
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                Жүктеуге рұқсат беру
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(event) =>
                  setIsRequired(event.target.checked)
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                Міндетті материал
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isPreview}
                onChange={(event) =>
                  setIsPreview(event.target.checked)
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                Алдын ала қарауға ашық
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Болдырмау
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Сақталып жатыр..."
                : isEditMode
                  ? "💾 Өзгерісті сақтау"
                  : "💾 Сақтау"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}