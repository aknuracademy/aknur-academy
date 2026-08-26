import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json(
        { error: "Студент ID және пароль қажет." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль кемінде 6 таңбадан тұруы керек." },
        { status: 400 }
      );
    }

    const { error } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Password update error:", error);

    return NextResponse.json(
      { error: "Парольді өзгерту кезінде қате шықты." },
      { status: 500 }
    );
  }
}