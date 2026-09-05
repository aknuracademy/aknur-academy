import type { Video } from "@/types/video";

type VideoPlayerProps = {
  selectedVideo: Video | null;
  isCompleted: boolean;
  onComplete: () => void;
  completing: boolean;
  isLocked?: boolean;
};

function isMp4Video(url: string) {
  const cleanUrl = url.split("?")[0].toLowerCase();

  return cleanUrl.endsWith(".mp4");
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");

      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      if (parsedUrl.pathname.includes("/embed/")) {
        return url;
      }

      if (parsedUrl.pathname.includes("/shorts/")) {
        const videoId =
          parsedUrl.pathname.split("/shorts/")[1];

        return `https://www.youtube.com/embed/${videoId}`;
      }

      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return url;
  } catch {
    return url;
  }
}

export default function VideoPlayer({
  selectedVideo,
  isCompleted,
  onComplete,
  completing,
  isLocked = false,
}: VideoPlayerProps) {

  if (!selectedVideo) {
    return (
      <div className="flex min-h-[450px] items-center justify-center p-8 text-center">
        <div>
          <div className="text-6xl">🎥</div>

          <h2 className="mt-5 text-2xl font-bold">
            Сабақ таңдалмаған
          </h2>

          <p className="mt-2 text-gray-500">
            Сол жақтан сабақты таңдаңыз.
          </p>
        </div>
      </div>
    );
  }

  if (isLocked) {
  return (
    <div className="flex min-h-[450px] items-center justify-center p-8 text-center">
      <div>
        <div className="text-6xl">🔒</div>

        <h2 className="mt-5 text-2xl font-bold">
          Бұл сабақ жабық
        </h2>

        <p className="mt-2 text-gray-500">
          Видеосабақты көру үшін курсты сатып алыңыз.
        </p>
      </div>
    </div>
  );
}

  const videoUrl = selectedVideo.video_url;
  const isMp4 = isMp4Video(videoUrl);

  return (
    <>
      <div className="bg-black">
        <div className="aspect-video">
          {isMp4 ? (
            <video
              src={videoUrl}
              title={selectedVideo.title}
              className="h-full w-full"
              controls
              playsInline
              preload="metadata"
              onEnded={onComplete}
            >
              Браузеріңіз бұл видеоны қолдамайды.
            </video>
          ) : (
            <iframe
              src={getYouTubeEmbedUrl(videoUrl)}
              title={selectedVideo.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <p className="font-medium text-green-700">
          🎥 Сабақ
        </p>

        <h2 className="mt-2 text-2xl font-bold md:text-3xl">
          {selectedVideo.title}
        </h2>

        {selectedVideo.duration && (
          <p className="mt-3 text-sm text-gray-500">
            ⏱ Сабақ ұзақтығы:{" "}
            {selectedVideo.duration}
          </p>
        )}

        <p className="mt-4 text-gray-600">
          Видеоны толық көріп, келесі сабаққа өтіңіз.
        </p>

        <button
          type="button"
          onClick={onComplete}
          disabled={isCompleted || completing}
          className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {completing
            ? "Сақталып жатыр..."
            : isCompleted
              ? "✅ Сабақ аяқталды"
              : "Сабақты аяқтау"}
        </button>
      </div>
    </>
  );
}