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
import { getCurrentStudent } from "@/services/student.service";
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

          <button
            type="button"
            onClick={() =>
              router.push(
                "/student/courses"
              )
            }
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
          >
            ← Артқа
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-100">
      <CourseHeader
        course={course}
      />

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
            completed={
              completedVideoIds.length
            }
            total={videos.length}
            studentName={studentName}
            courseName={
              course?.title ?? ""
            }
          />

          <LessonSidebar
            videos={videos}
            selectedVideo={selectedVideo}
            onSelectVideo={
              setSelectedVideo
            }
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
          />

          <CourseMaterials
            materials={materials}
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