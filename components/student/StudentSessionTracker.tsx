"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  updateStudentSession,
} from "@/services/session.service";

type StudentSessionTrackerProps = {
  currentVideoId?: number;
};

export default function StudentSessionTracker({
  currentVideoId,
}: StudentSessionTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    async function updateSession() {
      await updateStudentSession(
        pathname,
        currentVideoId
      );
    }

    updateSession();

    const intervalId = window.setInterval(
      updateSession,
      30_000
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pathname, currentVideoId]);

  return null;
}