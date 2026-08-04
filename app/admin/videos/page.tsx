"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminVideosPage() {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setMessage("");
  }

  async function handleUpload() {
    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setMessage(
        "❌ Файл көлемі 50 MB-тан аспауы керек."
      );

      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const fileExtension =
        selectedFile.name
          .split(".")
          .pop()
          ?.toLowerCase() || "mp4";

      const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("course-videos")
          .upload(fileName, selectedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: selectedFile.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data } =
        supabase.storage
          .from("course-videos")
          .getPublicUrl(fileName);

      setMessage(
        `✅ Видео сәтті жүктелді: ${data.publicUrl}`
      );

      setSelectedFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Белгісіз қате шықты.";

      setMessage(
        `❌ Видео жүктелмеді: ${errorMessage}`
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-green-700">
          Видео сабақтарды басқару
        </h1>

        <p className="mt-3 text-gray-600">
          MP4 файлды Supabase Storage-қа
          жүктеңіз.
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-6">
          <label className="block font-semibold text-gray-800">
            MP4 видео таңдаңыз
          </label>

          <input
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            className="mt-4 block w-full rounded-lg border border-gray-300 p-3"
          />

          {selectedFile && (
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <p className="font-medium text-green-800">
                Таңдалған файл:
              </p>

              <p className="mt-1 text-sm text-green-700">
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

          <button
            type="button"
            onClick={handleUpload}
            disabled={
              !selectedFile || uploading
            }
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {uploading
              ? "Жүктеліп жатыр..."
              : "Видеоны жүктеу"}
          </button>

          {message && (
            <div className="mt-5 break-all rounded-lg bg-gray-100 p-4 text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}