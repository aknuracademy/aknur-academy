"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Video = {
  id: number;
  title: string;
  video_url: string;
  course_id: number;
  courses: {
    title: string;
  } | null;
};

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  const videoId = Number(params.id);

  useEffect(() => {
    if (!videoId) {
      return;
    }

    loadVideo();
  }, [videoId]);

  async function loadVideo() {
    const { data, error } = await supabase
      .from("videos")
      .select(`
        id,
        title,
        video_url,
        course_id,
        courses (
          title
        )
      `)
      .eq("id", videoId)
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setVideo({
  ...data,
  courses: Array.isArray(data.courses)
    ? data.courses[0]
    : data.courses,
} as Video);
    setLoading(false);
  }

  function getYouTubeEmbedUrl(url: string) {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes("youtu.be")) {
        const videoCode = parsedUrl.pathname.replace("/", "");
        return `https://www.youtube.com/embed/${videoCode}`;
      }

      if (parsedUrl.hostname.includes("youtube.com")) {
        const videoCode = parsedUrl.searchParams.get("v");

        if (videoCode) {
          return `https://www.youtube.com/embed/${videoCode}`;
        }

        if (parsedUrl.pathname.includes("/embed/")) {
          return url;
        }
      }

      return url;
    } catch {
      return url;
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        <p className="text-center text-gray-500">
          Жүктеліп жатыр...
        </p>
      </main>
    );
  }

  if (!video) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        <p className="text-center text-red-500">
          Видео табылмады
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/dashboard/videos")}
          className="mb-5 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          ← Артқа
        </button>

        <div className="rounded-2xl bg-white p-8 shadow">
          <p className="text-sm text-green-700">
            {video.courses?.title || "Курс атауы жоқ"}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {video.title}
          </h1>

          <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-black">
            <iframe
              src={getYouTubeEmbedUrl(video.video_url)}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </main>
  );
}