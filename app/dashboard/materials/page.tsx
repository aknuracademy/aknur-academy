"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/components/Sidebar";

import { getCourses } from "@/services/course.service";
import { getVideosByCourse } from "@/services/video.service";

import {
  createMaterial,
  uploadMaterialFile,
} from "@/services/material.service";

import type { Course } from "@/types/course";
import type { Video } from "@/types/video";
import type { MaterialType } from "@/types/material";

export default function MaterialUploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [materialType, setMaterialType] =
    useState<MaterialType>("pdf");

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<number>(0);

  const [videos, setVideos] = useState<Video[]>([]);
  const [videoId, setVideoId] = useState<number>(0);

  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

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
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">
            Материал қосу
          </h1>

          <p className="mt-3 text-gray-600">
            Бұл бет арқылы курсқа PDF, Word,
            Excel, фото және мәтін қосамыз.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-1 block font-medium">
                Курс
              </label>

              <select
                value={courseId}
                onChange={(e) =>
                  setCourseId(
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-lg border bg-white p-3"
              >
                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.title}
                  </option>
                ))}
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
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-lg border bg-white p-3"
                disabled={videos.length === 0}
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
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full rounded-lg border bg-white p-3"
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
                className="min-h-28 w-full rounded-lg border bg-white p-3"
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
                className="w-full rounded-lg border bg-white p-3"
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

            {materialType === "text" ? (
              <div>
                <label className="mb-1 block font-medium">
                  Мәтін
                </label>

                <textarea
                  value={content}
                  onChange={(e) =>
                    setContent(
                      e.target.value
                    )
                  }
                  className="min-h-40 w-full rounded-lg border bg-white p-3"
                  placeholder="Материал мәтінін жазыңыз"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block font-medium">
                  Файл
                </label>

                <input
                  type="file"
                  onChange={(e) =>
                    setFile(
                      e.target.files?.[0] ??
                        null
                    )
                  }
                  className="w-full rounded-lg border bg-white p-3"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveMaterial}
              className="w-full rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
            >
              Материалды сақтау
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}