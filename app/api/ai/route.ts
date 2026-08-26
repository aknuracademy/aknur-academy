

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
    const { data: aiVideos, error: aiVideosError } = await supabase
  .from("videos")
  .select("title, ai_content")
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