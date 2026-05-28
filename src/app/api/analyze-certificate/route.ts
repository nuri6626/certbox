import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "이미지가 없습니다." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
다음 이미지는 자격증, 수료증, 이수증, 상장 중 하나입니다.
이미지에서 보이는 정보를 추출해서 반드시 JSON만 반환하세요.

중요 규칙:
- "수료증", "이수증", "상장", "자격증" 같은 문서 유형명은 title로 쓰지 마세요.
- title에는 실제 과정명, 자격명, 교육명, 상명 또는 프로그램명을 넣으세요.
- 큰 글씨가 단순 문서 유형명인 경우, 그 아래 또는 주변에 있는 과정명/교육명을 우선 title로 추출하세요.
- category는 문서 성격에 따라 "자격증", "수료증", "이수증", "상장", "기타" 중 하나로 분류하세요.
- 수료번호, 상장번호, 자격번호, 등록번호, 발급번호가 보이면 certificateNumber에 넣으세요.
- 모르는 값은 빈 문자열로 반환하세요.

형식:
{
  "title": "실제 과정명, 자격명, 교육명 또는 상명",
  "issuer": "발급기관",
  "holderName": "이름",
  "issueDate": "YYYY-MM-DD",
  "expiryDate": "YYYY-MM-DD 또는 빈 문자열",
  "certificateNumber": "수료번호, 상장번호, 자격번호 또는 빈 문자열",
  "category": "자격증 | 수료증 | 이수증 | 상장 | 기타"
}
              `,
            },
            {
              type: "input_image",
              image_url: image,
              detail: "high",
            },
          ],
        },
      ],
    });

    const text = response.output_text;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "AI 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}