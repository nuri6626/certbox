export type Goal = {
  id: string | number;
  userId: string;
  title: string;
  studyPeriod: string;
  memo: string;
  status: "진행중" | "완료";
  createdAt: string;
};
