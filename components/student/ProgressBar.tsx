"use client";

import { supabase } from "@/lib/supabase";

type ProgressBarProps = {
  completed: number;
  total: number;
  studentId: number | null;
  courseId: number;
  studentName: string;
  courseName: string;
};

export default function ProgressBar({
  completed,
  total,
  studentId,
  courseId,
  studentName,
  courseName,
}: ProgressBarProps) {

  const percent =
    total === 0
      ? 0
      : Math.min(
          100,
          Math.round((completed / total) * 100)
        );

  async function openCertificate() {
  if (!studentId) {
    alert("Студент анықталмады.");
    return;
  }

  try {
    const { data: existingCertificate, error: selectError } =
      await supabase
        .from("certificates")
        .select(
          "certificate_number, completion_date"
        )
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    let certificateNumber =
      existingCertificate?.certificate_number;

    let completionDate =
      existingCertificate?.completion_date;

    if (!certificateNumber) {
      certificateNumber =
        `AKNUR-${new Date().getFullYear()}-${studentId}-${courseId}`;

      completionDate =
        new Date().toISOString().split("T")[0];

      const { error: insertError } =
        await supabase
          .from("certificates")
          .insert({
            student_id: studentId,
            course_id: courseId,
            certificate_number:
              certificateNumber,
            completion_date:
              completionDate,
          });

      if (insertError) {
        throw insertError;
      }
    }

    const formattedDate =
      completionDate
        ? new Date(
            `${completionDate}T00:00:00`
          ).toLocaleDateString("kk-KZ")
        : new Date().toLocaleDateString(
            "kk-KZ"
          );

    const query = new URLSearchParams({
      student: studentName,
      course: courseName,
      number: certificateNumber,
      date: formattedDate,
    });

    window.open(
      `/certificate?${query.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  } catch (error) {
    console.error(
      "Сертификат қатесі:",
      error
    );

    alert(
      "Сертификатты ашу кезінде қате шықты."
    );
  }
}

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold">
          Курс прогресі
        </span>

        <span className="font-bold text-green-600">
          {percent}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-green-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {percent === 100 ? (
        <div className="mt-4 space-y-4">
          <p className="font-semibold text-green-700">
            🎉 Құттықтаймыз! Курс толық аяқталды.
          </p>

          <button
            type="button"
            onClick={openCertificate}
            className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            🎓 Сертификатты алу
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          {completed} / {total} сабақ аяқталды
        </p>
      )}
    </div>
  );
}