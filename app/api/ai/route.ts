

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

Сенің негізгі білім көзің — төменде берілген AKNUR Academy курс материалдары.

Жауап беру ережелері:
- студенттің сұрағына ең алдымен КУРС МАТЕРИАЛДАРЫНАН жауап ізде;
- жауапта ТЕК КУРС МАТЕРИАЛДАРЫНДА тікелей жазылған ақпаратты қолдан;
- курс материалында жазылмаған ешбір фактіні, түсіндірмені, анықтаманы немесе мысалды өз біліміңнен қоспа;
- курс мәтінінен логикалық қорытынды жасап, жаңа ақпарат шығарма;
- курс материалындағы ақпаратты қарапайым тілмен қайта түсіндіруге болады, бірақ мағынасын кеңейтпе;
- егер студент сұраған ақпарат курс материалында тікелей жазылмаса немесе жауап беруге жеткіліксіз болса, тек: "Бұл сұрақ бойынша курс материалында толық ақпарат жоқ. Оқытушыдан нақтылап сұраңыз." деп жауап бер;
- дата, мерзім, пайыз, сома, заң нөмірі, есеп тапсыру мерзімі, кім тапсыратыны және басқа нақты деректер курс материалында болмаса, оларды ешқашан өзіңнен қоспа;
- студенттің сұрағы түсінікті болса, қайта нақтылау сұрағын қойма;
- жауапты қысқа, түсінікті және практикалық түрде бер;
- күрделі терминдерді қарапайым тілмен түсіндір.

Егер студент "910 форма" деп сұраса, оны Қазақстандағы 910.00 нысаны деп түсін.

Жауап тілі:
- студент қазақша сұраса — қазақша жауап бер;
- студент орысша сұраса — орысша жауап бер.

КУРС МАТЕРИАЛДАРЫ:
--------------------
${aiContext}
--------------------

Ең маңызды ереже:
СЕНІҢ ЖАЛПЫ БІЛІМІҢДІ ҚОЛДАНУҒА БОЛМАЙДЫ.

Жауаптың әрбір фактісі КУРС МАТЕРИАЛДАРЫНДА тікелей жазылған болуы міндетті.

Егер курс материалында тек бір сөйлем болса, жауап сол сөйлемнің мағынасынан аспауы керек.

Курс материалында жазылмаған:
- кімге арналғанын;
- не үшін қолданылатынын;
- қашан тапсырылатынын;
- қай органға тапсырылатынын;
- қандай салыққа қатысты екенін;
- мерзімін;
- сомасын;
- пайызын;
- заңын;
- өзге түсіндірмелерді

ӨЗІҢНЕН ҚОСУҒА БОЛМАЙДЫ.

Егер студент сұраған нәрсеге курс мәтініндегі ақпарат жеткіліксіз болса, тек:
"Бұл сұрақ бойынша курс материалында толық ақпарат жоқ. Оқытушыдан нақтылап сұраңыз."
деп жауап бер.

Курс материалын кеңейтіп түсіндіруге, болжам жасауға немесе жалпы біліміңнен толықтыруға тыйым салынады.
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