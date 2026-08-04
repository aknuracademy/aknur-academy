
"use client";

import { useState } from "react";
import type { MaterialType } from "@/types/material";

import { useEffect } from "react";
import { getCourses } from "@/services/course.service";
import type { Course } from "@/types/course";

export default function MaterialUploadPage() {
    const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [materialType, setMaterialType] =
  useState<MaterialType>("pdf");
  const [courses, setCourses] = useState<Course[]>([]);
const [courseId, setCourseId] = useState<number>(0);
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
      console.error(error);
    }
  }

  loadCourses();
}, []);

  return (
    <main className="mx-auto max-w-3xl p-8">
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
        setCourseId(Number(e.target.value))
      }
      className="w-full rounded-lg border p-3"
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
      Материал атауы
    </label>

    <input
      type="text"
      value={title}
      onChange={(e) =>
        setTitle(e.target.value)
      }
      className="w-full rounded-lg border p-3"
      placeholder="Мысалы: Салық кодексі"
    />
  </div>
  <div>
  <label className="mb-1 block font-medium">
    Материал түрі
  </label>

  <select
    value={materialType}
    onChange={(e) =>
      setMaterialType(e.target.value as MaterialType)
    }
    className="w-full rounded-lg border p-3"
  >
    <option value="pdf">PDF</option>
    <option value="word">Word</option>
    <option value="excel">Excel</option>
    <option value="image">Фото</option>
    <option value="text">Мәтін</option>
  </select>
</div>

</div>
    </main>
  );
}