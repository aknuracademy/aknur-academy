import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

type DeleteStudentBody = {
  studentId?: number;
};

export async function DELETE(request: Request) {
  try {
    const body =
      (await request.json()) as DeleteStudentBody;

    const studentId = Number(body.studentId);

    if (!studentId || Number.isNaN(studentId)) {
      return NextResponse.json(
        {
          error: "Студент нөмірі дұрыс емес.",
        },
        { status: 400 }
      );
    }

    const {
      data: student,
      error: studentError,
    } = await supabaseAdmin
      .from("students")
      .select(
        "id, full_name, email, auth_user_id"
      )
      .eq("id", studentId)
      .maybeSingle();

    if (studentError) {
      throw studentError;
    }

    if (!student) {
      return NextResponse.json(
        {
          error: "Студент табылмады.",
        },
        { status: 404 }
      );
    }

    // Админді кездейсоқ өшірмеу үшін қорғаныс
    if (student.auth_user_id) {
      const {
        data: profile,
        error: profileError,
      } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("auth_user_id", student.auth_user_id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (profile?.role === "admin") {
        return NextResponse.json(
          {
            error:
              "Админ аккаунтын студенттер бөлімінен өшіруге болмайды.",
          },
          { status: 403 }
        );
      }
    }

    const { error: progressError } =
      await supabaseAdmin
        .from("student_video_progress")
        .delete()
        .eq("student_id", studentId);

    if (progressError) {
      throw progressError;
    }

    const { error: coursesError } =
      await supabaseAdmin
        .from("student_courses")
        .delete()
        .eq("student_id", studentId);

    if (coursesError) {
      throw coursesError;
    }

    const { error: deleteStudentError } =
      await supabaseAdmin
        .from("students")
        .delete()
        .eq("id", studentId);

    if (deleteStudentError) {
      throw deleteStudentError;
    }

    if (student.auth_user_id) {
      const { error: authDeleteError } =
        await supabaseAdmin.auth.admin.deleteUser(
          student.auth_user_id
        );

      if (authDeleteError) {
        throw authDeleteError;
      }
    }

    return NextResponse.json({
      message:
        "Студент барлық жерден толық өшірілді.",
    });
  } catch (error) {
    console.error(
      "Студентті толық өшіру қатесі:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Студентті өшіру кезінде белгісіз қате шықты.",
      },
      { status: 500 }
    );
  }
}