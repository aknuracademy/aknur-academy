"use client";

import { useEffect, useMemo, useState } from "react";

import type { Video } from "@/types/video";

type ModuleInfo = {
  id: number;
  title: string;
  position?: number | null;
};

type VideoWithModule = Video & {
  module_id?: number | null;
  modules?: ModuleInfo | null;
};

type LessonSidebarProps = {
  videos: VideoWithModule[];
  selectedVideo: Video | null;
  onSelectVideo: (video: Video) => void;
};

type VideoGroup = {
  moduleId: number | null;
  moduleTitle: string;
  modulePosition: number;
  videos: VideoWithModule[];
};

export default function LessonSidebar({
  videos,
  selectedVideo,
  onSelectVideo,
}: LessonSidebarProps) {
  const groupedVideos = useMemo(() => {
    const groups = videos.reduce<VideoGroup[]>((result, video) => {
      const moduleId =
        video.modules?.id ?? video.module_id ?? null;

      const moduleTitle =
        video.modules?.title ?? "Модульсіз сабақтар";

      const modulePosition =
        video.modules?.position ?? 9999;

      const existingGroup = result.find(
        (group) => group.moduleId === moduleId
      );

      if (existingGroup) {
        existingGroup.videos.push(video);
      } else {
        result.push({
          moduleId,
          moduleTitle,
          modulePosition,
          videos: [video],
        });
      }

      return result;
    }, []);

    groups.sort((a, b) => {
      if (a.modulePosition !== b.modulePosition) {
        return a.modulePosition - b.modulePosition;
      }

      if (a.moduleId === null) return 1;
      if (b.moduleId === null) return -1;

      return a.moduleId - b.moduleId;
    });

    return groups;
  }, [videos]);

  const [openedModuleId, setOpenedModuleId] =
    useState<number | null>(null);

  useEffect(() => {
    if (groupedVideos.length === 0) {
      setOpenedModuleId(null);
      return;
    }

    const selectedGroup = groupedVideos.find((group) =>
      group.videos.some(
        (video) => video.id === selectedVideo?.id
      )
    );

    setOpenedModuleId(
      selectedGroup?.moduleId ??
        groupedVideos[0].moduleId
    );
  }, [groupedVideos, selectedVideo?.id]);

  function toggleModule(moduleId: number | null) {
    setOpenedModuleId((currentModuleId) =>
      currentModuleId === moduleId ? null : moduleId
    );
  }


  return (
    <aside className="h-fit overflow-hidden rounded-2xl bg-white shadow">
      <div className="border-b p-5">
        <h2 className="text-xl font-bold">
          📚 Курс сабақтары
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Барлығы: {videos.length} сабақ
        </p>
      </div>

      {videos.length === 0 ? (
        <div className="p-6 text-gray-500">
          Бұл курсқа әзірге сабақ қосылмаған.
        </div>
      ) : (
        <div className="max-h-[650px] overflow-y-auto p-3">
          {groupedVideos.map((group) => {
            const isOpen =
              openedModuleId === group.moduleId;

            const lessonsWithNumbers = group.videos.map(
  (video, index) => ({
    video,
    lessonNumber: index + 1,
  })
);

            return (
              <section
                key={group.moduleId ?? "no-module"}
                className="mb-3"
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleModule(group.moduleId)
                  }
                  className="flex w-full items-center justify-between gap-4 rounded-xl bg-gray-100 px-4 py-3 text-left transition hover:bg-gray-200"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-sm font-bold text-gray-600">
                      {isOpen ? "▼" : "▶"}
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-gray-800">
                        📁 {group.moduleTitle}
                      </h3>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-gray-500">
                    {group.videos.length} сабақ
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-2">
                    {lessonsWithNumbers.map(
                      ({ video, lessonNumber }) => {
                        const isSelected =
                          selectedVideo?.id === video.id;

                        return (
                          <button
                            key={video.id}
                            type="button"
                            onClick={() =>
                              onSelectVideo(video)
                            }
                            className={`mb-2 flex w-full items-center gap-3 rounded-xl p-4 text-left transition ${
                              isSelected
                                ? "bg-green-600 text-white"
                                : "bg-gray-50 hover:bg-green-50"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                                isSelected
                                  ? "bg-white text-green-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {lessonNumber}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs opacity-75">
                                {lessonNumber}-сабақ
                              </p>

                              <p className="mt-1 font-semibold">
                                {video.title}
                              </p>

                              {video.duration && (
                                <p className="mt-1 text-xs opacity-75">
                                  ⏱ {video.duration}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </aside>
  );
}