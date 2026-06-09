import Link from "next/link";

type ScreenType = "home" | "upload" | "result" | "detail" | "schedule" | "vault";

type Props = {
  activeTab: "home" | "vault" | "calendar" | "community" | "mypage";
  setScreen?: (screen: ScreenType) => void;
};

export default function BottomTabBar({ activeTab, setScreen }: Props) {
  const iconClass = "h-[19px] w-[19px]";

  const itemClass = (tab: Props["activeTab"]) =>
    `flex flex-col items-center justify-center gap-1 ${
      activeTab === tab ? "text-gray-950" : "text-gray-400"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-[30px] bg-white px-7 pb-4 pt-3 shadow-[0_-8px_28px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-5 text-[10px] font-semibold">
        <Link
          href="/"
          onClick={(e) => {
            if (setScreen) {
              e.preventDefault();
              setScreen("home");
            }
          }}
          className={itemClass("home")}
        >
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4.5 11.5 12 5.5l7.5 6V20a1 1 0 0 1-1 1H15v-5.5H9V21H5.5a1 1 0 0 1-1-1v-8.5Z" />
          </svg>
          <span>홈</span>
        </Link>

        <Link
          href="/?tab=vault"
          onClick={(e) => {
            if (setScreen) {
              e.preventDefault();
              setScreen("vault");
            }
          }}
          className={itemClass("vault")}
        >
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
          </svg>
          <span>보관함</span>
        </Link>

        <Link href="/schedule" className={itemClass("calendar")}>
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4.5" y="5.5" width="15" height="14" rx="2.5" />
            <path d="M8 3.5v4M16 3.5v4M4.5 10h15" />
          </svg>
          <span>캘린더</span>
        </Link>

        <Link href="/community" className={itemClass("community")}>
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="10" r="2.5" />
            <path d="M4 20a5 5 0 0 1 10 0" />
            <path d="M15 20a4 4 0 0 1 5-3.5" />
          </svg>
          <span>커뮤니티</span>
        </Link>

        <Link href="/mypage" className={itemClass("mypage")}>
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
          </svg>
          <span>마이페이지</span>
        </Link>
      </div>
    </nav>
  );
}