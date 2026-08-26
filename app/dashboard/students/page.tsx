"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

type Student = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
  auth_user_id: string | null;
  role: string;
};

type Course = {
  id: number;
  title: string;
};

type LoginCredentials = {
  fullName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [
    newStudentCourseIds,
    setNewStudentCourseIds,
  ] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] =
    useState(false);

  const [savingCourses, setSavingCourses] =
    useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [
    selectedCourseIds,
    setSelectedCourseIds,
  ] = useState<number[]>([]);

  const [
    originalCourseIds,
    setOriginalCourseIds,
  ] = useState<number[]>([]);

  const [
    loginCredentials,
    setLoginCredentials,
  ] = useState<LoginCredentials | null>(null);

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  async function loadStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setStudents(data ?? []);
  }

  async function loadCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*");

  console.log("COURSES:", data);
    console.log("ERROR:", error);

  if (error) {
    alert(error.message);
    return;
  }

  setCourses(data ?? []);
}

  function toggleNewStudentCourse(
    courseId: number
  ) {
    setNewStudentCourseIds((currentIds) => {
      if (currentIds.includes(courseId)) {
        return currentIds.filter(
          (id) => id !== courseId
        );
      }

      return [...currentIds, courseId];
    });
  }

  async function handleAddStudent() {
    if (!fullName.trim()) {
      alert(
        "Студенттің аты-жөнін жазыңыз."
      );
      return;
    }

    if (!email.trim()) {
      alert(
        "Студенттің email мекенжайын жазыңыз."
      );
      return;
    }

    if (!email.includes("@")) {
      alert("Email дұрыс жазылмаған.");
      return;
    }

    if (newStudentCourseIds.length === 0) {
      alert(
        "Кемінде бір курсты таңдаңыз."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/students/invite",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email
              .trim()
              .toLowerCase(),
            courseIds:
              newStudentCourseIds,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Студентті қосу кезінде қате шықты."
        );
      }

      if (
        result.temporaryPassword &&
        result.loginEmail
      ) {
        setLoginCredentials({
          fullName: fullName.trim(),
          email: result.loginEmail,
          temporaryPassword:
            result.temporaryPassword,
          loginUrl:
            result.loginUrl ||
            `${window.location.origin}/login`,
        });
      } else {
        alert(
          result.message ||
            "Студенттің мәліметтері жаңартылды."
        );
      }

      setFullName("");
      setEmail("");
      setNewStudentCourseIds([]);

      await loadStudents();
    } catch (error) {
      console.error(
        "Студентті қосу қатесі:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Студентті қосу кезінде белгісіз қате шықты."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteStudent(
    id: number,
    studentName: string
  ) {
    const confirmed = window.confirm(
      `"${studentName}" студентін толық өшіргіңіз келе ме?\n\nОның логині, курстары және прогресі біржола өшіріледі.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/students/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            studentId: id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Студентті өшіру кезінде қате шықты."
        );
      }

      if (selectedStudent?.id === id) {
        closeCoursePanel();
      }

      alert(
        result.message ||
          "Студент барлық жерден толық өшірілді."
      );

      await loadStudents();
    } catch (error) {
      console.error(
        "Студентті толық өшіру қатесі:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Студентті өшіру кезінде белгісіз қате шықты."
        );
      }
    }
  }

 async function handleSetPassword(
  userId: string | null
) {
  if (!userId) {
    alert("Бұл студенттің Auth аккаунты табылмады.");
    return;
  }
  const password = window.prompt(
    "Студентке жаңа пароль енгізіңіз:"
  );

  if (!password) {
    return;
  }

  if (password.length < 6) {
    alert("Пароль кемінде 6 таңбадан тұруы керек.");
    return;
  }

  try {
    const response = await fetch(
      "/api/admin-set-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          password,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Парольді өзгерту мүмкін болмады."
      );
    }

    alert("Студенттің паролі сәтті орнатылды!");
  } catch (error) {
    console.error(
      "Пароль орнату қатесі:",
      error
    );

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Парольді орнату кезінде қате шықты.");
    }
  }
}

  async function openCoursePanel(
    student: Student
  ) {
    setSelectedStudent(student);
    setSelectedCourseIds([]);
    setOriginalCourseIds([]);
    setCoursesLoading(true);

    const { data, error } = await supabase
      .from("student_courses")
      .select("course_id")
      .eq("student_id", student.id);

    setCoursesLoading(false);

    if (error) {
      alert(error.message);
      setSelectedStudent(null);
      return;
    }

    const assignedCourseIds =
      data?.map((item) =>
        Number(item.course_id)
      ) ?? [];

    setSelectedCourseIds(
      assignedCourseIds
    );

    setOriginalCourseIds(
      assignedCourseIds
    );
  }

  function closeCoursePanel() {
    setSelectedStudent(null);
    setSelectedCourseIds([]);
    setOriginalCourseIds([]);
  }

  function toggleCourse(courseId: number) {
    setSelectedCourseIds((currentIds) => {
      if (currentIds.includes(courseId)) {
        return currentIds.filter(
          (id) => id !== courseId
        );
      }

      return [...currentIds, courseId];
    });
  }

  async function handleSaveCourses() {
    if (!selectedStudent) {
      return;
    }

    try {
      setSavingCourses(true);

      const courseIdsToAdd =
        selectedCourseIds.filter(
          (courseId) =>
            !originalCourseIds.includes(
              courseId
            )
        );

      const courseIdsToRemove =
        originalCourseIds.filter(
          (courseId) =>
            !selectedCourseIds.includes(
              courseId
            )
        );

      if (courseIdsToRemove.length > 0) {
        const { error: deleteError } =
          await supabase
            .from("student_courses")
            .delete()
            .eq(
              "student_id",
              selectedStudent.id
            )
            .in(
              "course_id",
              courseIdsToRemove
            );

        if (deleteError) {
          throw deleteError;
        }
      }

      if (courseIdsToAdd.length > 0) {
        const rowsToInsert =
          courseIdsToAdd.map(
            (courseId) => ({
              student_id:
                selectedStudent.id,
              course_id: courseId,
            })
          );

        const { error: insertError } =
          await supabase
            .from("student_courses")
            .insert(rowsToInsert);

        if (insertError) {
          throw insertError;
        }
      }

      alert(
        "Курстар сәтті тағайындалды!"
      );

      closeCoursePanel();
    } catch (error) {
      console.error(
        "Курстарды сақтау қатесі:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Курстарды сақтау кезінде қате шықты."
        );
      }
    } finally {
      setSavingCourses(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-gray-100 p-5 md:p-10">
        <h1 className="text-3xl font-bold md:text-4xl">
          👨‍🎓 Студенттер
        </h1>

        <p className="mt-3 text-gray-600">
          Студенттерді қосу және басқару
          бөлімі
        </p>

        <div className="mt-10 rounded-2xl bg-white p-6 shadow md:p-8">
          <h2 className="text-2xl font-bold">
            ➕ Жаңа студент қосу
          </h2>

          <label className="mt-6 block font-medium">
            Аты-жөні
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(event) =>
              setFullName(
                event.target.value
              )
            }
            placeholder="Мысалы: Айдана Серікқызы"
            className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-green-600"
          />

          <label className="mt-5 block font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Мысалы: aidana@gmail.com"
            className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-green-600"
          />

          <div className="mt-6">
            <p className="font-medium">
              Курстарды таңдаңыз
            </p>

            {courses.length === 0 ? (
              <div className="mt-3 rounded-xl bg-yellow-50 p-4 text-yellow-800">
                Әзірге курс қосылмаған.
              </div>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {courses.map((course) => {
                  const isChecked =
                    newStudentCourseIds.includes(
                      course.id
                    );

                  return (
                    <label
                      key={course.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                        isChecked
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          toggleNewStudentCourse(
                            course.id
                          )
                        }
                        className="h-5 w-5 accent-green-600"
                      />

                      <span className="font-medium">
                        {course.title}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddStudent}
            disabled={loading}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "Қосылып жатыр..."
              : "➕ Студент қосу"}
          </button>
        </div>

        <div className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">
              📋 Студенттер тізімі
            </h2>

            <p className="font-medium text-gray-600">
              Барлығы: {students.length}
            </p>
          </div>

          {students.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-white p-8 shadow">
              <p className="text-gray-500">
                Әзірге студент жоқ
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col justify-between gap-5 rounded-2xl bg-white p-6 shadow lg:flex-row lg:items-center"
                >
                  <div>
                    <Link
                      href={`/dashboard/students/${student.id}`}
                      className="text-xl font-bold text-green-700 hover:underline"
                    >
                      👤 {student.full_name}
                    </Link>

                    <p className="mt-2 break-all text-gray-600">
                      📧 {student.email}
                    </p>
                  </div>

                  <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        openCoursePanel(
                          student
                        )
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                    >
                      📚 Курстарды тағайындау
                    </button>

                    <button
  type="button"
  onClick={() =>
    handleSetPassword(student.auth_user_id)
  }
  className="rounded-lg bg-amber-500 px-4 py-2 ..."
>
  🔑 Пароль орнату
</button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteStudent(
                          student.id,
                          student.full_name
                        )
                      }
                      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                      🗑 Толық өшіру
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  📚 Курстарды тағайындау
                </h2>

                <p className="mt-2 font-medium text-green-700">
                  👤{" "}
                  {
                    selectedStudent.full_name
                  }
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedStudent.email}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCoursePanel}
                className="rounded-lg bg-gray-200 px-3 py-2 font-bold hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            {coursesLoading ? (
              <div className="mt-8 rounded-xl bg-gray-100 p-6 text-center">
                Курстар жүктеліп жатыр...
              </div>
            ) : courses.length === 0 ? (
              <div className="mt-8 rounded-xl bg-yellow-50 p-6 text-yellow-800">
                Әзірге курс қосылмаған.
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                {courses.map((course) => {
                  const isChecked =
                    selectedCourseIds.includes(
                      course.id
                    );

                  return (
                    <label
                      key={course.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                        isChecked
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          toggleCourse(
                            course.id
                          )
                        }
                        className="h-5 w-5 accent-green-600"
                      />

                      <span className="font-medium">
                        {course.title}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCoursePanel}
                disabled={savingCourses}
                className="rounded-lg bg-gray-200 px-6 py-3 font-bold hover:bg-gray-300 disabled:opacity-50"
              >
                Болдырмау
              </button>

              <button
                type="button"
                onClick={handleSaveCourses}
                disabled={
                  savingCourses ||
                  coursesLoading
                }
                className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {savingCourses
                  ? "Сақталып жатыр..."
                  : "✅ Сақтау"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loginCredentials && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="text-center">
              <div className="text-5xl">
                ✅
              </div>

              <h2 className="mt-4 text-2xl font-bold text-green-700">
                Студент сәтті қосылды!
              </h2>
            </div>

            <div className="mt-7 space-y-4 rounded-xl bg-gray-50 p-5">
              <div>
                <p className="text-sm text-gray-500">
                  Студент
                </p>

                <p className="font-bold">
                  {loginCredentials.fullName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Логин
                </p>

                <p className="break-all font-bold">
                  {loginCredentials.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Уақытша пароль
                </p>

                <p className="break-all font-mono text-lg font-bold text-red-600">
                  {
                    loginCredentials.temporaryPassword
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Кіру сілтемесі
                </p>

                <p className="break-all font-medium text-blue-700">
                  {loginCredentials.loginUrl}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Бұл мәліметтерді студентке
              жіберіңіз. Алғаш кіргеннен кейін
              парольді ауыстырғаны дұрыс.
            </p>

            <button
              type="button"
              onClick={() =>
                setLoginCredentials(null)
              }
              className="mt-6 w-full rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
            >
              Дайын
            </button>
          </div>
        </div>
      )}
    </div>
  );
}