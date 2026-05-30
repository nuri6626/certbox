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
다음 이미지는 자격증, 수료증, 이수증, 상장, 어학성적표 중 하나입니다.
이미지에서 보이는 정보를 추출해서 반드시 JSON만 반환하세요.

중요 규칙:
- "수료증", "이수증", "상장", "자격증", "성적표" 같은 문서 유형명은 title로 쓰지 마세요.
- title에는 실제 과정명, 자격명, 교육명, 상명, 시험명을 넣으세요.
- 큰 글씨가 단순 문서 유형명인 경우, 그 아래 또는 주변에 있는 과정명/교육명/시험명을 우선 title로 추출하세요.
- category는 문서 성격에 따라 "자격증", "수료증", "이수증", "상장", "어학성적", "민간자격", "기타" 중 하나로 분류하세요.
- 수료번호, 상장번호, 자격번호, 등록번호, 발급번호, 수험번호가 보이면 certificateNumber에 넣으세요.
- 점수, 등급, 합격등급이 보이면 score에 넣으세요.
- 모르는 값은 빈 문자열로 반환하세요.
- 등급, 레벨, ACTFL 등급이 보이면 grade에 넣으세요.
- TOEIC Speaking에서 ADVANCED LOW, INTERMEDIATE HIGH 같은 ACTFL 등급이 보이면 grade에 넣으세요.

어학성적표 규칙:
- TOEIC, TOEFL, IELTS, OPIc, TEPS, HSK, JLPT 등이 보이면 category는 "어학성적"으로 분류하세요.
- TOEIC 성적표의 경우 title은 "TOEIC"으로 반환하세요.
- TOEFL 성적표의 경우 title은 "TOEFL"로 반환하세요.
- IELTS 성적표의 경우 title은 "IELTS"로 반환하세요.
- OPIc 성적표의 경우 title은 "OPIc"으로 반환하세요.
- HSK 성적표의 경우 title은 "HSK"로 반환하세요.
- JLPT 성적표의 경우 title은 "JLPT"로 반환하세요.
- TOEIC에서 Listening, Reading, Total Score가 보이면 Total Score를 score에 넣으세요.
- OPIc, JLPT, HSK처럼 등급이 중요한 문서는 등급을 score에 넣으세요.
- 어학성적의 expiryDate는 명확히 보이면 추출하고, 보이지 않으면 issueDate 기준 2년 후 날짜를 계산해서 넣으세요.
- 단, issueDate도 불확실하면 expiryDate는 빈 문자열로 반환하세요.

날짜 규칙:
- 날짜는 반드시 YYYY-MM-DD 형식으로 반환하세요.
- "2026년 5월 1일"은 "2026-05-01"로 변환하세요.
- 발급일, 시험일, 취득일 중 가장 적절한 날짜를 issueDate에 넣으세요.
- 유효기간, 만료일, 인정기간 종료일이 보이면 expiryDate에 넣으세요.

형식:
{
  "title": "실제 과정명, 자격명, 교육명, 시험명 또는 상명",
  "issuer": "발급기관",
  "holderName": "이름",
  "issueDate": "YYYY-MM-DD",
  "expiryDate": "YYYY-MM-DD 또는 빈 문자열",
  "certificateNumber": "수료번호, 상장번호, 자격번호, 수험번호 또는 빈 문자열",
  "category": "자격증 | 수료증 | 이수증 | 상장 | 어학성적 | 민간자격 | 기타",
  "score": "점수, 등급 또는 빈 문자열"
  "grade": "등급, 레벨 또는 빈 문자열"
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