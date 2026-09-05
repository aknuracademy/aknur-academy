"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import CourseHeader from "@/components/student/CourseHeader";
import LessonSidebar from "@/components/student/LessonSidebar";
import VideoPlayer from "@/components/student/VideoPlayer";
import LessonNavigation from "@/components/student/LessonNavigation";
import ProgressBar from "@/components/student/ProgressBar";
import CourseMaterials from "@/components/student/CourseMaterials";

import { getCourseById } from "@/services/course.service";
import { getVideosByCourse } from "@/services/video.service";
import {
  getCurrentStudent,
  getStudentCourseAccess,
} from "@/services/student.service";
import { getMaterialsByVideo } from "@/services/material.service";

import {
  getStudentProgress,
  markVideoCompleted,
} from "@/services/progress.service";

import type { Course } from "@/types/course";
import type { Video } from "@/types/video";
import type { CourseMaterial } from "@/types/material";

import { updateStudentSession } from "@/services/session.service";

export default function StudentCoursePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = Number(params.id);

  const [studentId, setStudentId] =
    useState<number | null>(null);

  const [studentName, setStudentName] =
    useState("");

  const [course, setCourse] =
    useState<Course | null>(null);

  const [videos, setVideos] =
    useState<Video[]>([]);

  const [selectedVideo, setSelectedVideo] =
    useState<Video | null>(null);

  const [materials, setMaterials] =
    useState<CourseMaterial[]>([]);

  const [
    completedVideoIds,
    setCompletedVideoIds,
  ] = useState<number[]>([]);

  const [completing, setCompleting] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

    const [isCourseLocked, setIsCourseLocked] =
  useState(false);

  const isCompleted = selectedVideo
    ? completedVideoIds.includes(
        selectedVideo.id
        
      )
    : false;

  const isCourseCompleted =
    videos.length > 0 &&
    completedVideoIds.length ===
      videos.length;

  useEffect(() => {
    async function loadCourse() {
      if (
        !courseId ||
        Number.isNaN(courseId)
      ) {
        setErrorMessage(
          "Курс нөмірі дұрыс емес."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const currentStudent =
          await getCurrentStudent();

        setStudentId(currentStudent.id);
        setStudentName(
          currentStudent.full_name
        );
        const courseData =
  await getCourseById(courseId);

if (!courseData) {
  setErrorMessage(
    "Курс табылмады."
  );
  return;
}

setCourse(courseData as Course);
        const courseAccess =
  await getStudentCourseAccess(
    currentStudent.id,
    courseId
  );


if (!courseAccess) {
  setIsCourseLocked(true);
}

if (
  courseAccess &&
  courseAccess.access_expires_at &&
  new Date(
    courseAccess.access_expires_at
  ).getTime() < Date.now()
) {
  setErrorMessage(
    "Бұл курсқа қолжетімділік мерзімі аяқталған."
  );
  return;
}

        
        const videoData =
          await getVideosByCourse(
            courseId
          );

        const loadedVideos =
          videoData as Video[];

        setVideos(loadedVideos);

        const progress =
          await getStudentProgress(
            currentStudent.id
          );

        const currentCourseVideoIds =
          loadedVideos.map(
            (video) => video.id
          );

        setCompletedVideoIds(
          progress
            .filter((item) =>
              currentCourseVideoIds.includes(
                item.video_id
              )
            )
            .map(
              (item) => item.video_id
            )
        );

        if (loadedVideos.length > 0) {
          setSelectedVideo(
            loadedVideos[0]
          );
        } else {
          setSelectedVideo(null);
        }
      } catch (error) {
        console.error(
          "Курсты жүктеу қатесі:",
          error
        );

        if (error instanceof Error) {
          setErrorMessage(
            error.message
          );
        } else {
          setErrorMessage(
            "Курсты жүктеу кезінде белгісіз қате шықты."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  useEffect(() => {
    async function loadSelectedVideoMaterials() {
      if (!selectedVideo?.id) {
        setMaterials([]);
        return;
      }

      try {
        const materialsData =
          await getMaterialsByVideo(
            selectedVideo.id
          );

        setMaterials(materialsData);
      } catch (error) {
        console.error(
          "Сабақ материалдарын жүктеу қатесі:",
          error
        );

        setMaterials([]);
      }
    }

    loadSelectedVideoMaterials();
  }, [selectedVideo?.id]);
  useEffect(() => {
  if (!selectedVideo?.id) {
    return;
  }

  updateStudentSession(
    window.location.pathname,
    selectedVideo.id
  );
}, [selectedVideo?.id]);

  function getSelectedVideoIndex() {
    if (!selectedVideo) {
      return -1;
    }

    return videos.findIndex(
      (video) =>
        video.id ===
        selectedVideo.id
    );
  }

  function openPreviousVideo() {
    const currentIndex =
      getSelectedVideoIndex();

    if (currentIndex > 0) {
      setSelectedVideo(
        videos[currentIndex - 1]
      );
    }
  }

  function openNextVideo() {
    const currentIndex =
      getSelectedVideoIndex();

    if (
      currentIndex >= 0 &&
      currentIndex <
        videos.length - 1
    ) {
      setSelectedVideo(
        videos[currentIndex + 1]
      );
    }
  }

  async function handleCompleteVideo() {
    if (
      !selectedVideo ||
      !studentId
    ) {
      return;
    }

    try {
      setCompleting(true);

      await markVideoCompleted(
        studentId,
        selectedVideo.id
      );

      setCompletedVideoIds(
        (currentIds) => {
          if (
            currentIds.includes(
              selectedVideo.id
            )
          ) {
            return currentIds;
          }

          return [
            ...currentIds,
            selectedVideo.id,
          ];
        }
      );

      const currentIndex =
        getSelectedVideoIndex();

      if (
        currentIndex >= 0 &&
        currentIndex <
          videos.length - 1
      ) {
        setSelectedVideo(
          videos[currentIndex + 1]
        );
      }
    } catch (error) {
      console.error(
        "Прогресті сақтау қатесі:",
        error
      );

      alert(
        "Сабақты аяқтау кезінде қате шықты."
      );
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl font-medium">
          Курс жүктеліп жатыр...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow">
          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Курс ашылмады
          </h1>

          <p className="mt-3 text-red-600">
            {errorMessage}
          </p>

          <div className="mt-6 flex flex-col gap-3">
  {errorMessage.includes(
  "қолжетімділік мерзімі аяқталған"
) && (
    <a
      href={`https://wa.me/77766565747?text=${encodeURIComponent(
        `Сәлеметсіз бе! Мен ${
          course?.title ?? "курс"
        } курсының мерзімін ұзартқым келеді.`
      )}`}
      target="_blank"
      rel="noreferrer"
      className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
    >
      Курс мерзімін ұзарту
    </a>
  )}

  <button
    type="button"
    onClick={() =>
      router.push(
        "/student/courses"
      )
    }
    className="rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50"
  >
    ← Артқа
  </button>
</div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-100">
      <CourseHeader
        course={course}
      />

      {isCourseLocked && course && (
  <div className="mx-auto mt-6 max-w-7xl px-5 lg:px-8">
    <div className="rounded-2xl bg-white p-6 text-center shadow">
      <div className="text-4xl">
        🔒
      </div>

      <h2 className="mt-3 text-xl font-bold">
        Бұл курс сатып алынбаған
      </h2>

      <p className="mt-2 text-gray-600">
        Курсты толық ашу үшін сатып алыңыз.
      </p>

      <a
        href={`https://wa.me/77766565747?text=${encodeURIComponent(
          `Сәлеметсіз бе! Мен ${course.title} курсын сатып алғым келеді.`
        )}`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-block rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
      >
        Курсты сатып алу
      </a>
    </div>
  </div>
)}

      {course && (
  <div className="mx-auto mt-6 max-w-7xl px-5 lg:px-8">
    <details className="group rounded-2xl bg-white p-6 shadow">
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <h2 className="text-xl font-bold text-green-700">
          📚 Курс туралы ақпарат
        </h2>

        <span className="text-3xl font-bold text-green-700 transition group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {course.full_description && (
          <div>
            <h3 className="font-bold text-gray-900">
              📝 Курс туралы
            </h3>
            <p className="mt-2 whitespace-pre-line text-gray-600">
              {course.full_description}
            </p>
          </div>
        )}

        {course.target_audience && (
          <div>
            <h3 className="font-bold text-gray-900">
              👥 Кімге арналған?
            </h3>
            <p className="mt-2 whitespace-pre-line text-gray-600">
              {course.target_audience}
            </p>
          </div>
        )}

        {course.learning_outcomes && (
          <div>
            <h3 className="font-bold text-gray-900">
              🎯 Курстан не үйренесіз?
            </h3>
            <p className="mt-2 whitespace-pre-line text-gray-600">
              {course.learning_outcomes}
            </p>
          </div>
        )}

        {course.course_includes && (
          <div>
            <h3 className="font-bold text-gray-900">
              📦 Курсқа не кіреді?
            </h3>
            <p className="mt-2 whitespace-pre-line text-gray-600">
              {course.course_includes}
            </p>
          </div>
        )}

        {course.access_info && (
          <div>
            <h3 className="font-bold text-gray-900">
              🔐 Қолжетімділік
            </h3>
            <p className="mt-2 whitespace-pre-line text-gray-600">
              {course.access_info}
            </p>
          </div>
        )}
      </div>
    </details>
  </div>
)}

      {isCourseCompleted && (
        <div className="mx-auto mt-6 max-w-7xl px-5 lg:px-8">
          <div className="rounded-2xl bg-green-100 p-6 text-center shadow">
            <div className="text-5xl">
              🎉
            </div>

            <h2 className="mt-3 text-2xl font-bold text-green-800">
              Құттықтаймыз!
            </h2>

            <p className="mt-2 text-green-700">
              Сіз бұл курстың барлық
              сабақтарын аяқтадыңыз.
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-6 p-5 lg:grid-cols-[350px_1fr] lg:p-8">
        <div className="space-y-6">
          <ProgressBar
  completed={completedVideoIds.length}
  total={videos.length}
  studentId={studentId}
  courseId={courseId}
  studentName={studentName}
  courseName={course?.title ?? ""}
/>

          <LessonSidebar
  videos={videos}
  selectedVideo={selectedVideo}
  onSelectVideo={
    setSelectedVideo
  }
  completedVideoIds={completedVideoIds}
/>
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow">
          <VideoPlayer
  selectedVideo={selectedVideo}
  isCompleted={isCompleted}
  completing={completing}
  onComplete={
    handleCompleteVideo
  }
  isLocked={isCourseLocked}
/>

          <CourseMaterials
  materials={materials}
  isLocked={isCourseLocked}
/>

          <LessonNavigation
            onPrevious={
              openPreviousVideo
            }
            onNext={
              openNextVideo
            }
            isFirst={
              getSelectedVideoIndex() <=
              0
            }
            isLast={
              getSelectedVideoIndex() ===
              videos.length - 1
            }
            isNextLocked={
              !isCompleted
            }
          />
        </section>
      </div>
    </main>
  );
}