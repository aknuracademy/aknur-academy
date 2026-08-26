

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const authHeader = request.headers.get("authorization");

const accessToken = authHeader?.startsWith("Bearer ")
  ? authHeader.slice(7)
  : null;

if (!accessToken) {
  return NextResponse.json(
    {
      error: "Авторизация қажет.",
    },
    {
      status: 401,
    }
  );
}

const {
  data: { user },
  error: userError,
} = await supabaseAdmin.auth.getUser(accessToken);

if (userError || !user) {
  return NextResponse.json(
    {
      error: "Сессия жарамсыз. Жүйеге қайта кіріңіз.",
    },
    {
      status: 401,
    }
  );
}

const { data: student, error: studentError } =
  await supabaseAdmin
    .from("students")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

if (studentError || !student) {
  return NextResponse.json(
    {
      error: "Студент мәліметі табылмады.",
    },
    {
      status: 404,
    }
  );
}

const { data: studentCourses, error: studentCoursesError } =
  await supabaseAdmin
    .from("student_courses")
    .select("course_id")
    .eq("student_id", student.id);

if (studentCoursesError) {
  return NextResponse.json(
    {
      error: "Студент курстарын анықтау мүмкін болмады.",
    },
    {
      status: 500,
    }
  );
}

const allowedCourseIds =
  studentCourses?.map((item) => item.course_id) ?? [];

if (allowedCourseIds.length === 0) {
  return NextResponse.json(
    {
      error: "Сізге әзірге курс қолжетімді емес.",
    },
    {
      status: 403,
    }
  );
}

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          error: "Сұрақ бос болмауы керек.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY табылмады.",
        },
        {
          status: 500,
        }
      );
    }
    const { data: aiVideos, error: aiVideosError } =
  await supabaseAdmin
    .from("videos")
    .select("course_id, title, ai_content")
    .in("course_id", allowedCourseIds)
    .not("ai_content", "is", null);

if (aiVideosError) {
  console.error(
    "AI контентін жүктеу қатесі:",
    aiVideosError
  );
}

const aiContext =
  aiVideos
    ?.filter((video) => video.ai_content)
    .map(
      (video) =>
        `Сабақ: ${video.title}\n${video.ai_content}`
    )
    .join("\n\n") || "";

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",

          instructions: `
Сен AKNUR Academy оқу платформасындағы AI көмекшісің.

Негізгі контекст — Қазақстан Республикасы.

Студенттерге Қазақстандағы:
- жеке кәсіпкерлік;
- салық режимдері;
- 910, 200, 220 салық нысандары;
- ОПВ, СО, ВОСМС;
- ЭСФ, АВР;
- Kaspi Pay, онлайн касса;
- ИП ашу, жабу, тоқтату;
- ОКЭД;
- есептілік және кәсіпкерлік
тақырыптары бойынша түсінікті, қысқа әрі практикалық түрде жауап бер.

Егер студент "910 форма" деп сұраса, оны Қазақстандағы 910.00 салық нысаны деп түсін.

Жауап тілі:
- студент қазақша сұраса — қазақша жауап бер;
- орысша сұраса — орысша жауап бер.

Маңызды:
- нақты білмейтін ақпаратты ойдан шығарма;
- Қазақстан заңнамасы мен салық ережелері өзгеруі мүмкін екенін ескер;
- күмәнді жағдайда нақтылау қажет екенін айт;
- студентке күрделі терминдерді қарапайым тілмен түсіндір;
- жауапты қысқа, нақты және пайдалы етіп бер.
- студенттің сұрағы түсінікті болса, қайта нақтылау сұрағын қойма, бірден жауап бер;
- "910 форма деген не?", "200 форма деген не?", "ОПВ деген не?" сияқты қарапайым сұрақтарға міндетті түрде бірден түсіндірме бер;
- студенттен "нені білгіңіз келеді?" деп қайта сұрама;
- алдымен сұраққа тікелей жауап бер, қажет болса соңында ғана қосымша түсіндірме ұсын.
- 2026 жылғы Қазақстан салық ережелері бойынша 910.00 нысаны жартыжылдық есеп болып табылады және жылына 2 рет тапсырылады;
- егер Қазақстан салық нысандары бойынша сенімді дерек жоқ болса, ойдан жауап берме және "нақтылау қажет" деп айт;
Курс материалдары:
${aiContext}

Ереже:
- мүмкіндігінше жоғарыдағы курс материалдарына сүйеніп жауап бер;
- курс материалында нақты жауап бар болса, соны басым қолдан;
- курс материалында ақпарат жоқ болса, оны ойдан шығарма;
- қажет болса "Бұл ақпарат курс материалында жоқ" деп айт.
`,

          input: message,

          max_output_tokens: 700,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OpenAI API қатесі:",
        data
      );

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "AI жауабын алу кезінде қате шықты.",
        },
        {
          status: response.status,
        }
      );
    }

    const answer =
  data?.output
    ?.flatMap((item: any) => item?.content ?? [])
    ?.filter((content: any) => content?.type === "output_text")
    ?.map((content: any) => content?.text ?? "")
    ?.join("\n")
    ?.trim() || "";

    if (!answer) {
      return NextResponse.json(
        {
          error: "AI бос жауап қайтарды.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      answer,
    });
  } catch (error) {
    console.error(
      "AKNUR AI API қатесі:",
      error
    );

    return NextResponse.json(
      {
        error:
          "AKNUR AI сұранысын өңдеу кезінде қате шықты.",
      },
      {
        status: 500,
      }
    );
  }
}