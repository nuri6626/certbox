"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { getCertificates } from "../../lib/certificates";
import { getExams } from "../../lib/exams";
import { getLevelTitle, getProfile, type Profile } from "../../lib/profiles";
import { supabase } from "../../lib/supabase";
import type { Certificate } from "../../types/certificate";
import type { Exam } from "../../types/exam";

type StudyPlan = {
  period: string;
  difficultyText: string;
  examFee: string;
  weeklyPlan: string[];
};

type Recommendation = {
  title: string;
  category: string;
  reason: string;
  difficulty: "초급" | "중급" | "고급";
  badge: string;
  jobs: string[];
  salaryRange: string;
  companies: string[];
  jobKeyword: string;
  studyPlan: StudyPlan;
};

const beginnerRecommendations: Recommendation[] = [
  {
    title: "컴퓨터활용능력 2급",
    category: "사무 실무",
    reason: "자격증을 처음 시작하는 분들이 부담 없이 준비하기 좋아요.",
    difficulty: "초급",
    badge: "입문",
    jobs: ["사무보조", "행정직", "총무", "공공기관 행정"],
    salaryRange: "신입 기준 약 2,600만~3,400만원",
    companies: ["공공기관", "중소기업", "학교 행정실", "일반 사무직"],
    jobKeyword: "컴퓨터활용능력 사무",
    studyPlan: {
      period: "3~4주",
      difficultyText: "엑셀·문서작업 기초가 있다면 비교적 수월해요.",
      examFee: "과목 및 회차에 따라 상이",
      weeklyPlan: [
        "1주차: 필기 기본 개념과 자주 나오는 용어 정리",
        "2주차: 스프레드시트 주요 기능 실습",
        "3주차: 기출문제 풀이와 오답 정리",
        "4주차: 실기 반복 연습과 시간 관리",
      ],
    },
  },
  {
    title: "한국사능력검정시험",
    category: "공통 역량",
    reason: "공기업, 공공기관, 일부 채용 과정에서 활용도가 높아요.",
    difficulty: "초급",
    badge: "기본",
    jobs: ["공공기관 행정", "공기업 사무", "공무원 준비", "교육 행정"],
    salaryRange: "기관·직무별 상이",
    companies: ["공공기관", "공기업", "교육기관", "지방 출자출연기관"],
    jobKeyword: "한국사 공공기관",
    studyPlan: {
      period: "4~6주",
      difficultyText: "암기량이 많아 흐름 중심으로 잡는 것이 중요해요.",
      examFee: "급수 및 회차에 따라 상이",
      weeklyPlan: [
        "1주차: 선사~삼국시대 흐름 정리",
        "2주차: 고려~조선 전기 핵심 사건 정리",
        "3주차: 조선 후기~근현대사 정리",
        "4주차: 기출문제 풀이와 시대별 오답 정리",
      ],
    },
  },
  {
    title: "GTQ 포토샵",
    category: "디자인 실무",
    reason: "마케팅, 콘텐츠, 디자인 업무에 바로 활용하기 좋아요.",
    difficulty: "초급",
    badge: "실무",
    jobs: ["콘텐츠 디자이너", "마케팅 디자이너", "SNS 운영자", "쇼핑몰 MD"],
    salaryRange: "신입 기준 약 2,800만~3,600만원",
    companies: ["마케팅회사", "콘텐츠 제작사", "쇼핑몰", "스타트업"],
    jobKeyword: "GTQ 포토샵 디자인",
    studyPlan: {
      period: "3~5주",
      difficultyText: "툴 사용에 익숙해지는 것이 가장 중요해요.",
      examFee: "급수 및 접수 방식에 따라 상이",
      weeklyPlan: [
        "1주차: 포토샵 기본 도구와 레이어 이해",
        "2주차: 기출 유형별 작업 순서 익히기",
        "3주차: 시간 안에 완성하는 연습",
        "4주차: 자주 틀리는 기능 반복 실습",
      ],
    },
  },
  {
    title: "SQLD",
    category: "데이터 분석 입문",
    reason: "데이터 직무나 기획 직무로 확장하기 좋은 자격증이에요.",
    difficulty: "초급",
    badge: "추천",
    jobs: ["데이터 분석가", "서비스 기획자", "BI 담당자", "마케팅 데이터 분석"],
    salaryRange: "신입 기준 약 3,000만~4,200만원",
    companies: ["IT기업", "대기업 기획팀", "마케팅회사", "공공기관 전산직"],
    jobKeyword: "SQLD 데이터 분석",
    studyPlan: {
      period: "4~6주",
      difficultyText: "비전공자도 가능하지만 SQL 문제 풀이 반복이 중요해요.",
      examFee: "시험 회차 기준 확인 필요",
      weeklyPlan: [
        "1주차: 데이터 모델링 개념 정리",
        "2주차: SQL 기본 문법 학습",
        "3주차: JOIN, GROUP BY, 서브쿼리 문제 풀이",
        "4주차: 기출문제 풀이와 오답노트 정리",
      ],
    },
  },
];

const certificateBasedMap: Record<string, Recommendation[]> = {
  컴퓨터활용능력: [
    {
      title: "SQLD",
      category: "데이터 분석 입문",
      reason:
        "컴활과 함께 준비하면 사무 자동화에서 데이터 분석 역량으로 확장할 수 있어요.",
      difficulty: "초급",
      badge: "확장",
      jobs: ["데이터 분석가", "서비스 기획자", "BI 담당자", "영업관리"],
      salaryRange: "신입 기준 약 3,000만~4,200만원",
      companies: ["IT기업", "공공기관", "대기업 기획팀", "마케팅 데이터팀"],
      jobKeyword: "SQLD 데이터 분석",
      studyPlan: {
        period: "4~6주",
        difficultyText:
          "엑셀 활용 경험이 있다면 데이터 구조 이해에 도움이 돼요.",
        examFee: "시험 회차 기준 확인 필요",
        weeklyPlan: [
          "1주차: 데이터베이스와 모델링 기본 개념 이해",
          "2주차: SELECT, WHERE, ORDER BY 기본 문법 학습",
          "3주차: JOIN, GROUP BY, 함수 문제 풀이",
          "4주차: 기출문제 3회 이상 풀이 및 오답 정리",
        ],
      },
    },
    {
      title: "전산회계 2급",
      category: "회계 입문",
      reason: "사무 역량에 회계 기초를 더하면 지원 가능한 직무가 넓어져요.",
      difficulty: "초급",
      badge: "실무",
      jobs: ["회계 사무원", "경리", "총무", "세무사무소 보조"],
      salaryRange: "신입 기준 약 2,600만~3,400만원",
      companies: ["회계사무소", "세무사무소", "중소기업", "관리부서"],
      jobKeyword: "전산회계 회계사무",
      studyPlan: {
        period: "4~5주",
        difficultyText: "회계 기초 용어에 익숙해지는 것이 먼저예요.",
        examFee: "급수 및 회차에 따라 상이",
        weeklyPlan: [
          "1주차: 회계 기본 용어와 분개 이해",
          "2주차: 재무제표와 계정과목 정리",
          "3주차: 프로그램 입력 실습",
          "4주차: 기출문제 풀이와 실무 입력 반복",
        ],
      },
    },
  ],
  SQLD: [
    {
      title: "ADsP",
      category: "데이터 분석",
      reason: "SQL 기초를 바탕으로 데이터 분석 개념까지 확장하기 좋아요.",
      difficulty: "중급",
      badge: "다음단계",
      jobs: ["데이터 분석가", "마케팅 분석가", "서비스 기획자", "CRM 담당자"],
      salaryRange: "신입 기준 약 3,200만~4,500만원",
      companies: ["IT기업", "플랫폼기업", "마케팅회사", "금융권"],
      jobKeyword: "ADsP 데이터 분석",
      studyPlan: {
        period: "5~7주",
        difficultyText:
          "분석 개념과 통계 기초를 함께 봐야 해서 SQLD보다 조금 어려워요.",
        examFee: "시험 회차 기준 확인 필요",
        weeklyPlan: [
          "1주차: 데이터 분석 개요와 분석 프로세스 이해",
          "2주차: 통계 기초 개념 정리",
          "3주차: 데이터 마이닝과 분석 기법 학습",
          "4주차: 기출문제 풀이 및 오답 유형 정리",
        ],
      },
    },
    {
      title: "빅데이터분석기사",
      category: "데이터 전문",
      reason: "데이터 직무를 본격적으로 준비한다면 장기 목표로 좋아요.",
      difficulty: "고급",
      badge: "전문",
      jobs: ["데이터 분석가", "데이터 엔지니어", "AI 서비스 기획", "BI 매니저"],
      salaryRange: "신입~주니어 기준 약 3,500만~5,500만원",
      companies: ["대기업", "IT기업", "금융권", "공공 데이터 기관"],
      jobKeyword: "빅데이터분석기사",
      studyPlan: {
        period: "8~12주",
        difficultyText: "통계, 분석, 실기 준비가 필요해 장기 플랜이 좋아요.",
        examFee: "시험 회차 기준 확인 필요",
        weeklyPlan: [
          "1~2주차: 통계 기초와 데이터 분석 개념 정리",
          "3~4주차: 데이터 전처리와 분석 기법 학습",
          "5~6주차: 실기 유형과 도구 사용 연습",
          "7~8주차: 모의고사와 오답 정리",
        ],
      },
    },
  ],
  정보처리기사: [
    {
      title: "SQLD",
      category: "데이터베이스",
      reason: "IT 기본 역량에 데이터베이스 활용 능력을 더하기 좋아요.",
      difficulty: "초급",
      badge: "추천",
      jobs: ["개발자", "전산직", "서비스 기획자", "데이터 담당자"],
      salaryRange: "신입 기준 약 3,200만~4,800만원",
      companies: ["IT기업", "SI기업", "공공기관 전산직", "대기업 IT부서"],
      jobKeyword: "정보처리기사 SQLD",
      studyPlan: {
        period: "3~5주",
        difficultyText:
          "정보처리기사의 DB 기초가 있다면 빠르게 준비할 수 있어요.",
        examFee: "시험 회차 기준 확인 필요",
        weeklyPlan: [
          "1주차: SQLD 출제 범위와 데이터 모델링 정리",
          "2주차: SQL 기본 문법 문제 풀이",
          "3주차: 기출문제 집중 풀이",
          "4주차: 오답노트와 약점 유형 보완",
        ],
      },
    },
    {
      title: "AWS Cloud Practitioner",
      category: "클라우드 입문",
      reason: "개발·IT 기획 직무에서 클라우드 이해도를 보여주기 좋아요.",
      difficulty: "초급",
      badge: "IT",
      jobs: ["클라우드 운영", "백엔드 개발", "DevOps 입문", "IT 기획"],
      salaryRange: "신입~주니어 기준 약 3,500만~5,500만원",
      companies: ["클라우드 기업", "IT기업", "스타트업", "SI기업"],
      jobKeyword: "AWS 클라우드",
      studyPlan: {
        period: "3~4주",
        difficultyText: "클라우드 개념 중심이라 입문자가 시작하기 좋아요.",
        examFee: "공식 시험 기준 확인 필요",
        weeklyPlan: [
          "1주차: 클라우드 기본 개념과 AWS 주요 서비스 이해",
          "2주차: 컴퓨팅, 스토리지, 네트워크 서비스 정리",
          "3주차: 보안, 요금, 운영 개념 학습",
          "4주차: 샘플 문제와 모의고사 풀이",
        ],
      },
    },
  ],
  전기기사: [
    {
      title: "전기공사기사",
      category: "전기 실무",
      reason: "전기기사와 함께 취득하면 현장 실무 활용도가 높아져요.",
      difficulty: "중급",
      badge: "연계",
      jobs: ["전기공사 기술자", "시설관리", "현장관리", "전기감리"],
      salaryRange: "신입~주니어 기준 약 3,200만~4,800만원",
      companies: ["건설사", "전기공사업체", "시설관리회사", "공기업"],
      jobKeyword: "전기공사기사",
      studyPlan: {
        period: "6~8주",
        difficultyText: "전기기사 기초가 있으면 연계 학습이 가능해요.",
        examFee: "회차 및 등급 기준 확인 필요",
        weeklyPlan: [
          "1~2주차: 전기설비와 공사 관련 이론 정리",
          "3~4주차: 계산 문제와 법규 파트 학습",
          "5주차: 기출문제 풀이",
          "6주차: 오답 정리와 실전 모의고사",
        ],
      },
    },
    {
      title: "소방설비기사",
      category: "안전 관리",
      reason: "시설·안전관리 직무로 확장하기 좋아요.",
      difficulty: "중급",
      badge: "확장",
      jobs: ["소방안전관리자", "시설관리", "안전관리", "건물관리"],
      salaryRange: "신입~주니어 기준 약 3,000만~4,500만원",
      companies: ["시설관리회사", "건설사", "공공기관", "대형빌딩 관리사"],
      jobKeyword: "소방설비기사",
      studyPlan: {
        period: "6~8주",
        difficultyText: "전기·기계 개념과 소방 법규를 함께 봐야 해요.",
        examFee: "회차 및 등급 기준 확인 필요",
        weeklyPlan: [
          "1~2주차: 소방 원리와 설비 개념 정리",
          "3~4주차: 법규와 계산 문제 학습",
          "5주차: 기출문제 풀이",
          "6주차: 오답 정리와 빈출 유형 반복",
        ],
      },
    },
  ],
};

function getCertificateBasedRecommendations(certificates: Certificate[]) {
  const result: Recommendation[] = [];

  certificates.forEach((cert) => {
    const certName = cert.title || "";

    Object.keys(certificateBasedMap).forEach((keyword) => {
      if (certName.includes(keyword)) {
        result.push(...certificateBasedMap[keyword]);
      }
    });
  });

  return result.filter(
    (item, index, self) =>
      index === self.findIndex((target) => target.title === item.title),
  );
}

function createJobLinks(keyword: string) {
  const encodedKeyword = encodeURIComponent(keyword);

  return [
    {
      name: "사람인",
      url: `https://www.saramin.co.kr/zf_user/search?searchword=${encodedKeyword}`,
    },
    {
      name: "잡코리아",
      url: `https://www.jobkorea.co.kr/Search/?stext=${encodedKeyword}`,
    },
    {
      name: "인크루트",
      url: `https://search.incruit.com/list/search.asp?col=job&kw=${encodedKeyword}`,
    },
  ];
}

export default function AiPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<
    string | null
  >(null);

  useEffect(() => {
    const loadAiPage = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profileData = await getProfile(currentUser.id, currentUser.email);
        setProfile(profileData);

        const certificateData = await getCertificates(currentUser.id);
        setCertificates(certificateData);

        const examData = await getExams(currentUser.id);
        setExams(examData);
      }
    };

    loadAiPage();
  }, []);

  const displayName =
    profile?.nickname || user?.email?.split("@")[0] || "커리어스 유저";

  const aiRecommendations = useMemo(() => {
    const based = getCertificateBasedRecommendations(certificates);

    if (based.length > 0) {
      return based;
    }

    return beginnerRecommendations;
  }, [certificates]);

  const hasCertificateData = certificates.length > 0;
  const hasExamData = exams.length > 0;

  const handleAddGoal = (title: string) => {
    setSelectedRecommendation(title);

    const encodedTitle = encodeURIComponent(title);

    setTimeout(() => {
      window.location.href = `/goals?title=${encodedTitle}`;
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6">
          <p className="text-sm font-semibold text-violet-500">AI 추천</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            맞춤 자격증 추천
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {displayName}님의 커리어 활동을 바탕으로 추천해요.
          </p>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">현재 성장 상태</p>
              <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                Lv.{profile?.level || 1} {getLevelTitle(profile?.level || 1)}
              </h2>
            </div>

            <div className="rounded-2xl bg-violet-50 px-4 py-2 text-sm font-bold text-violet-600">
              {profile?.xp || 0} XP
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-gray-50 p-3 text-center">
              <p className="text-lg font-extrabold text-gray-900">
                {certificates.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-gray-400">
                보유 인증서
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 text-center">
              <p className="text-lg font-extrabold text-gray-900">
                {exams.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-gray-400">
                준비 시험
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 text-center">
              <p className="text-lg font-extrabold text-gray-900">
                {profile?.point || 0}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-gray-400">
                포인트
              </p>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[32px] bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
              ✦
            </div>

            <p className="text-sm font-bold text-violet-500">추천 분석</p>
          </div>

          <h2 className="mt-2 text-2xl font-extrabold leading-snug text-gray-900">
            {hasCertificateData
              ? "보유 자격증을 기준으로 다음 커리어를 추천했어요"
              : "아직 자격증 데이터가 없어 입문자 추천으로 시작해요"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {hasCertificateData
              ? "추천 자격증, 관련 직무, 채용공고, 학습 플랜을 함께 보여드려요."
              : "자격증을 등록하면 더 정확한 맞춤 추천과 학습 플랜을 받을 수 있어요."}
          </p>
        </section>

        {!hasCertificateData && (
          <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-400">추천 모드</p>
            <h2 className="mt-1 text-lg font-extrabold text-gray-900">
              처음 시작하기 좋은 자격증
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              현재는 보유 자격증이 없어서 많은 사용자가 처음 준비하는 기본
              자격증을 추천하고 있어요.
            </p>

            <button
              onClick={() => (window.location.href = "/certificates/new")}
              className="mt-4 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
            >
              자격증 등록하러 가기
            </button>
          </section>
        )}

        {hasCertificateData && (
          <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-400">분석 기준</p>
            <h2 className="mt-1 text-lg font-extrabold text-gray-900">
              보유 자격증 {certificates.length}개를 분석했어요
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {certificates.slice(0, 5).map((cert) => (
                <span
                  key={cert.id}
                  className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600"
                >
                  {cert.title}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          {aiRecommendations.map((item) => {
            const jobLinks = createJobLinks(item.jobKeyword);

            return (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                    {item.badge}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    {item.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm font-semibold text-gray-500">
                  {item.category}
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.reason}
                </p>

                <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-400">관련 직무</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.jobs.map((job) => (
                      <span
                        key={job}
                        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700"
                      >
                        {job}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-400">연봉 범위</p>
                  <p className="mt-1 text-sm font-extrabold text-gray-900">
                    {item.salaryRange}
                  </p>
                </div>

                <div className="mt-3 rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-400">
                    활용 기업/기관
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.companies.map((company) => (
                      <span
                        key={company}
                        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-violet-50 p-4">
                  <p className="text-xs font-bold text-violet-500">
                    추천 채용공고 검색
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {jobLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-white px-3 py-3 text-center text-xs font-extrabold text-violet-600"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-gray-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-violet-200">
                        AI 학습 플랜
                      </p>
                      <h4 className="mt-1 text-base font-extrabold">
                        예상 준비기간 {item.studyPlan.period}
                      </h4>
                    </div>

                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                      {item.difficulty}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-200">
                    {item.studyPlan.difficultyText}
                  </p>

                  <div className="mt-4 rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-bold text-violet-200">
                      응시료 정보
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {item.studyPlan.examFee}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {item.studyPlan.weeklyPlan.map((plan) => (
                      <div
                        key={plan}
                        className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold leading-6"
                      >
                        {plan}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleAddGoal(item.title)}
                  className="mt-4 w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
                >
                  {selectedRecommendation === item.title
                    ? "이동 중..."
                    : "목표로 추가하기"}
                </button>
              </div>
            );
          })}
        </section>

        {hasExamData && (
          <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-400">학습 플랜 힌트</p>
            <h2 className="mt-1 text-lg font-extrabold text-gray-900">
              준비 중인 시험이 있어요
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              등록한 시험 일정을 기준으로 추후 D-Day 학습 플랜 기능을 연결할 수
              있어요.
            </p>
          </section>
        )}
      </section>

      <BottomTabBar activeTab="home" />
    </main>
  );
}
