"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import BackButton from "@/components/student/BackButton";

export default function CertificatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const studentName =
    searchParams.get("student") ||
    "АКНҰР САНАБЕКҚЫЗЫ";

  const courseName =
    searchParams.get("course") ||
    "ИП НӨЛДЕН КОМБО КУРС";

  const certificateNumber =
    searchParams.get("number") ||
    "AKNUR-2026-000001";

  const completionDate =
    searchParams.get("date") ||
    new Date().toLocaleDateString("kk-KZ");

  const downloadPDF = async () => {
  if (!certificateRef.current) {
    return;
  }

  try {
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      onclone: (clonedDocument) => {
  const certificate = clonedDocument.querySelector(
    '[data-certificate="true"]'
  ) as HTMLElement | null;

  if (!certificate) {
    return;
  }

  certificate.style.backgroundColor = "#ffffff";

  certificate
    .querySelectorAll<HTMLElement>("*")
    .forEach((element) => {
      const classNames = Array.from(element.classList);

      if (classNames.includes("text-green-700")) {
        element.style.color = "#15803d";
      }

      if (classNames.includes("text-green-600")) {
        element.style.color = "#16a34a";
      }

      if (classNames.includes("text-amber-600")) {
        element.style.color = "#d97706";
      }

      if (classNames.includes("text-amber-700")) {
        element.style.color = "#b45309";
      }

      if (classNames.includes("text-gray-900")) {
        element.style.color = "#111827";
      }

      if (classNames.includes("text-gray-700")) {
        element.style.color = "#374151";
      }

      if (classNames.includes("text-gray-600")) {
        element.style.color = "#4b5563";
      }

      if (classNames.includes("text-gray-500")) {
        element.style.color = "#6b7280";
      }

      if (classNames.includes("text-gray-400")) {
        element.style.color = "#9ca3af";
      }

      if (classNames.includes("bg-white")) {
        element.style.backgroundColor = "#ffffff";
      }

      if (classNames.includes("bg-green-50")) {
        element.style.backgroundColor = "#f0fdf4";
      }

      if (classNames.includes("bg-amber-50")) {
        element.style.backgroundColor = "#fffbeb";
      }

      if (classNames.includes("bg-amber-400")) {
        element.style.backgroundColor = "#fbbf24";
      }

      if (classNames.includes("bg-gray-300")) {
        element.style.backgroundColor = "#d1d5db";
      }

      if (classNames.includes("bg-gray-400")) {
        element.style.backgroundColor = "#9ca3af";
      }

      if (classNames.includes("border-green-700")) {
        element.style.borderColor = "#15803d";
      }

      if (classNames.includes("border-green-100")) {
        element.style.borderColor = "#dcfce7";
      }

      if (classNames.includes("border-amber-400")) {
        element.style.borderColor = "#fbbf24";
      }

      if (classNames.includes("border-r-green-700")) {
        element.style.borderRightColor = "#15803d";
      }

      if (classNames.includes("border-t-green-700")) {
        element.style.borderTopColor = "#15803d";
      }

      if (classNames.includes("border-b-transparent")) {
        element.style.borderBottomColor = "transparent";
      }

      if (classNames.includes("border-l-transparent")) {
        element.style.borderLeftColor = "transparent";
      }
    });
},
    });

    const imageData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvasRatio = canvas.width / canvas.height;
    const pageRatio = pageWidth / pageHeight;

    let imageWidth = pageWidth;
    let imageHeight = pageHeight;

    if (canvasRatio > pageRatio) {
      imageHeight = pageWidth / canvasRatio;
    } else {
      imageWidth = pageHeight * canvasRatio;
    }

    const x = (pageWidth - imageWidth) / 2;
    const y = (pageHeight - imageHeight) / 2;

    pdf.addImage(
      imageData,
      "PNG",
      x,
      y,
      imageWidth,
      imageHeight
    );

    const safeStudentName = studentName
      .trim()
      .replace(/[<>:"/\\|?*]+/g, "-");

    pdf.save(`AKNUR-Certificate-${safeStudentName}.pdf`);
  } catch (error) {
    console.error("PDF жасау кезінде қате шықты:", error);
    alert("PDF жүктеу кезінде қате шықты.");
  }
};

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto mb-6 flex w-full max-w-[1120px] items-center justify-between gap-4">
        <BackButton href="/student/certificates" />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            🖨 Басып шығару
          </button>

          <button
            type="button"
            onClick={downloadPDF}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            ⬇ PDF жүктеу
          </button>
        </div>
      </div>

      <div
        ref={certificateRef}
        className="mx-auto w-full max-w-[1120px]"
        data-certificate="true"
      >
        <section className="relative aspect-[1.414/1] overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Сыртқы жасыл жиек */}
          <div className="absolute inset-0 border-[10px] border-green-700" />

          {/* Ішкі алтын жиек */}
          <div className="absolute inset-5 border border-amber-400" />

          {/* Бұрыштағы сәндік элементтер */}
          <div className="absolute left-0 top-0 h-36 w-36 border-b-[70px] border-r-[70px] border-b-transparent border-r-green-700" />

          <div className="absolute bottom-0 right-0 h-36 w-36 border-l-[70px] border-t-[70px] border-l-transparent border-t-green-700" />

          {/* Негізгі контент */}
          <div className="relative z-10 flex h-full flex-col px-16 py-12 md:px-24 md:py-16">
            <header className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">
                Қазақстандағы кәсіпкерлерге арналған
              </p>

              <h1 className="mt-3 text-4xl font-extrabold tracking-wide text-green-700 md:text-6xl">
                AKNUR ACADEMY
              </h1>

              <p className="mt-2 text-sm text-gray-500 md:text-base">
                Онлайн білім беру платформасы
              </p>
            </header>

            <div className="mt-8 text-center md:mt-10">
              <h2 className="text-3xl font-bold tracking-[0.18em] text-gray-900 md:text-5xl">
                СЕРТИФИКАТ
              </h2>

              <div className="mx-auto mt-4 h-[2px] w-48 bg-amber-400" />
            </div>

            <div className="mt-8 flex-1 text-center md:mt-10">
              <p className="text-base text-gray-500 md:text-lg">
                Осы сертификат беріледі
              </p>

              <h3
  className="mt-5 text-2xl font-semibold text-gray-900 md:text-4xl"
  style={{
    fontFamily: "Arial, Helvetica, sans-serif",
    letterSpacing: "0.03em",
  }}
>
  {studentName.toLocaleUpperCase("kk-KZ")}
</h3>

              <div className="mx-auto mt-4 h-px w-2/3 bg-gray-300" />

              <p className="mt-7 text-base text-gray-600 md:text-xl">
                төмендегі курсты толық әрі сәтті аяқтағаны үшін
              </p>

              <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-green-100 bg-green-50 px-6 py-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                  Курс атауы
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
                  {courseName}
                </p>
              </div>
            </div>

            <footer className="grid grid-cols-3 items-end gap-6">
              <div className="text-sm text-gray-700 md:text-base">
                <p className="font-semibold">
                  Берілген күні
                </p>

                <p className="mt-1">
                  {completionDate}
                </p>

                <p className="mt-3 font-semibold">
                  Сертификат №
                </p>

                <p className="mt-1">
                  {certificateNumber}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-50 text-center">
                  <div>
                    <p className="text-2xl">🏅</p>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      Certified
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right text-sm text-gray-700 md:text-base">
                <p className="font-bold text-gray-900">
                  Акнур Санабекқызы
                </p>

                <div className="ml-auto mt-3 h-px w-48 bg-gray-400" />

                <p className="mt-2">
                  Founder
                </p>

                <p className="font-semibold text-green-700">
                  AKNUR Academy
                </p>
              </div>
            </footer>

            <p className="mt-5 text-center text-xs uppercase tracking-[0.25em] text-gray-400">
              Verified by AKNUR Academy
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}