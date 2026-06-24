import type { Certificate } from "../types/certificate";
import type { Goal } from "./goals";

export type Badge = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  isUnlocked: boolean;
};

export function getBadges(params: {
  certificates: Certificate[];
  completedGoals: Goal[];
  activeGoals: Goal[];
}) {
  const { certificates, completedGoals, activeGoals } = params;

  const hasCertificate = certificates.length > 0;
  const certificateCount = certificates.length;
  const completedGoalCount = completedGoals.length;
  const activeGoalCount = activeGoals.length;

  const hasSql = certificates.some((cert) =>
    cert.title.toLowerCase().includes("sql"),
  );

  const hasInfo = certificates.some((cert) => cert.title.includes("정보처리"));

  const hasComputer = certificates.some(
    (cert) => cert.title.includes("컴활") || cert.title.includes("컴퓨터활용"),
  );

  return [
    {
      id: "first-certificate",
      emoji: "🏅",
      title: "첫 자격증",
      description: "첫 번째 자격증을 등록했어요.",
      isUnlocked: hasCertificate,
    },
    {
      id: "certificate-5",
      emoji: "🥈",
      title: "자격증 5개 달성",
      description: "자격증을 5개 이상 등록했어요.",
      isUnlocked: certificateCount >= 5,
    },
    {
      id: "certificate-10",
      emoji: "🥇",
      title: "자격증 10개 달성",
      description: "자격증을 10개 이상 등록했어요.",
      isUnlocked: certificateCount >= 10,
    },
    {
      id: "first-goal",
      emoji: "🎯",
      title: "첫 목표 설정",
      description: "처음으로 자격증 목표를 만들었어요.",
      isUnlocked: activeGoalCount + completedGoalCount >= 1,
    },
    {
      id: "goal-complete",
      emoji: "🏆",
      title: "목표 달성자",
      description: "목표 인증을 완료했어요.",
      isUnlocked: completedGoalCount >= 1,
    },
    {
      id: "goal-master",
      emoji: "👑",
      title: "목표 마스터",
      description: "목표를 5개 이상 달성했어요.",
      isUnlocked: completedGoalCount >= 5,
    },
    {
      id: "sql-badge",
      emoji: "📊",
      title: "데이터 입문자",
      description: "SQL 관련 자격증을 보유하고 있어요.",
      isUnlocked: hasSql,
    },
    {
      id: "it-badge",
      emoji: "💻",
      title: "IT 커리어러",
      description: "정보처리 관련 자격증을 보유하고 있어요.",
      isUnlocked: hasInfo,
    },
    {
      id: "office-badge",
      emoji: "📁",
      title: "사무 실무형",
      description: "컴퓨터활용능력 관련 자격증을 보유하고 있어요.",
      isUnlocked: hasComputer,
    },
  ];
}
