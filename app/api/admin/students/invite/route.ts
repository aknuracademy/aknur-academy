import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";
function generateTemporaryPassword() {
  const randomPart = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 10);

  return `AkNUR!${randomPart}`;
}

type InviteStudentBody = {
  fullName?: string;
  email?: string;
  courseIds?: number[];
};

export async function POST(request: Request) {
  let newlyInvitedAuthUserId: string | null = null;
  let newlyCreatedStudentId: number | null = null;
  let temporaryPassword: string | null = null;

  try {
    const body =
      (await request.json()) as InviteStudentBody;

    const fullName = body.fullName?.trim();

    const email = body.email
      ?.trim()
      .toLowerCase();

    const courseIds = Array.from(
      new Set(
        (body.courseIds ?? []).filter(
          (courseId) =>
            Number.isInteger(courseId) &&
            courseId > 0
        )
      )
    );

    if (!fullName) {
      return NextResponse.json(
        {
          error:
            "Студенттің аты-жөнін жазыңыз.",
        },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          error:
            "Email дұрыс жазылмаған.",
        },
        { status: 400 }
      );
    }

    if (courseIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "Кемінде бір курсты таңдаңыз.",
        },
        { status: 400 }
      );
    }

    const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://www.aknuracademy.kz"
).replace(/\/$/, "");

    /*
     * 1. Email Auth-та бұрын бар ма?
     */
    const {
      data: authUsersData,
      error: authUsersError,
    } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (authUsersError) {
      throw authUsersError;
    }

    let authUser =
      authUsersData.users.find(
        (user) =>
          user.email?.toLowerCase() === email
      ) ?? null;

    let invitationSent = false;

    /*
     * 2. Auth-та жоқ болса — шақыру жібереміз
     */
    if (!authUser) {
      temporaryPassword =
  generateTemporaryPassword();

const {
  data: createUserData,
  error: createUserError,
} =
  await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      must_change_password: true,
    },
  });

if (createUserError) {
  return NextResponse.json(
    {
      error: createUserError.message,
    },
    { status: 400 }
  );
}

if (!createUserData.user) {
  return NextResponse.json(
    {
      error:
        "Auth пайдаланушысы құрылмады.",
    },
    { status: 500 }
  );
}

authUser = createUserData.user;
newlyInvitedAuthUserId = authUser.id;
invitationSent = true;
    }

    /*
     * 3. students кестесінде студент бар ма?
     */
    const {
      data: existingStudent,
      error: existingStudentError,
    } = await supabaseAdmin
      .from("students")
      .select(`
        id,
        full_name,
        email,
        auth_user_id
      `)
      .eq("email", email)
      .maybeSingle();

    if (existingStudentError) {
      throw existingStudentError;
    }

    let studentId: number;

    if (existingStudent) {
      /*
       * Бұрынғы студенттің аты мен Auth байланысын жаңарту
       */
      const { error: updateStudentError } =
        await supabaseAdmin
          .from("students")
          .update({
            full_name: fullName,
            auth_user_id: authUser.id,
          })
          .eq("id", existingStudent.id);

      if (updateStudentError) {
        throw updateStudentError;
      }

      studentId = existingStudent.id;
    } else {
      /*
       * Жаңа students жазбасын жасау
       */
      const {
        data: newStudent,
        error: newStudentError,
      } = await supabaseAdmin
        .from("students")
        .insert({
          full_name: fullName,
          email,
          auth_user_id: authUser.id,
        })
        .select("id")
        .single();

      if (newStudentError) {
        throw newStudentError;
      }

      studentId = newStudent.id;
      newlyCreatedStudentId = newStudent.id;
    }

    /*
     * 4. Бұрын бекітілген курстарды алу
     */
    const {
      data: existingStudentCourses,
      error: existingCoursesError,
    } = await supabaseAdmin
      .from("student_courses")
      .select("course_id")
      .eq("student_id", studentId);

    if (existingCoursesError) {
      throw existingCoursesError;
    }

    const existingCourseIds =
      existingStudentCourses?.map(
        (item) => Number(item.course_id)
      ) ?? [];

    /*
     * 5. Тек жаңа курстарды қосу
     */
    const courseIdsToAdd = courseIds.filter(
      (courseId) =>
        !existingCourseIds.includes(courseId)
    );

    if (courseIdsToAdd.length > 0) {
      const rowsToInsert =
        courseIdsToAdd.map((courseId) => ({
          student_id: studentId,
          course_id: courseId,
        }));

      const { error: coursesInsertError } =
        await supabaseAdmin
          .from("student_courses")
          .insert(rowsToInsert);

      if (coursesInsertError) {
        throw coursesInsertError;
      }
    }

    return NextResponse.json(
      {
  message: invitationSent
    ? "Студент уақытша парольмен қосылды."
    : "Бұл email бұрын тіркелген. Студенттің мәліметтері мен курстары жаңартылды.",
  studentId,
  invitationSent,
  addedCourseCount:
    courseIdsToAdd.length,
  loginEmail: email,
  temporaryPassword,
  loginUrl: `${siteUrl}/login`,
},
      {
        status: invitationSent ? 201 : 200,
      }
    );
  } catch (error) {
    console.error(
      "Студентті қосу қатесі:",
      error
    );

    /*
     * Тек осы сұраныста жаңа жасалған жазбаларды тазалаймыз.
     * Бұрыннан бар пайдаланушыны өшірмейміз.
     */
    if (newlyCreatedStudentId) {
      await supabaseAdmin
        .from("students")
        .delete()
        .eq("id", newlyCreatedStudentId);
    }

    if (newlyInvitedAuthUserId) {
      await supabaseAdmin.auth.admin.deleteUser(
        newlyInvitedAuthUserId
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Студентті қосу кезінде белгісіз қате шықты.",
      },
      { status: 500 }
    );
  }
}