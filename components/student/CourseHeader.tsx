import type { Course } from "@/types/course";
import BackButton from "@/components/student/BackButton";

type CourseHeaderProps = {
  course: Course | null;
};

export default function CourseHeader({
  course,
}: CourseHeaderProps) {
  return (
    <header className="bg-green-700 px-5 py-6 text-white shadow">
      <div className="mx-auto max-w-7xl">
        <BackButton
  href="/student/courses"
  text="← Артқа"
/>

        <h1 className="mt-5 text-3xl font-bold">
          📘 {course?.title}
        </h1>

        <p className="mt-2 text-green-100">
          {course?.description ||
            "Курс сабақтарын ретімен қарап шығыңыз."}
        </p>
      </div>
    </header>
  );
}