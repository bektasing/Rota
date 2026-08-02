import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Compass,
  Home,
  Library,
  Menu,
  RefreshCw,
  Settings,
  StickyNote,
  Target,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

/** Mobil alt navigasyon ve masaüstü yan navigasyonun ana beş öğesi. */
export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Ana Sayfa", path: ROUTES.home, icon: Home },
  { label: "Plan", path: ROUTES.planner, icon: CalendarDays },
  { label: "Çalış", path: ROUTES.timer, icon: Timer },
  { label: "İlerleme", path: ROUTES.progress, icon: TrendingUp },
  { label: "Daha Fazla", path: ROUTES.more, icon: Menu },
];

/** "Daha Fazla" menüsünün alt öğeleri. */
export const MORE_NAV_ITEMS: NavItem[] = [
  { label: "Dersler ve Konular", path: ROUTES.moreSubjects, icon: Library },
  { label: "Denemeler", path: ROUTES.moreExams, icon: ClipboardList },
  { label: "Yanlışlar", path: ROUTES.moreMistakes, icon: AlertTriangle },
  { label: "Tekrarlar", path: ROUTES.moreReviews, icon: RefreshCw },
  { label: "Hedefler", path: ROUTES.moreGoals, icon: Target },
  { label: "Kaynaklar", path: ROUTES.moreResources, icon: BookOpen },
  { label: "Notlar", path: ROUTES.moreNotes, icon: StickyNote },
  { label: "Bölüm Keşfi", path: ROUTES.moreDepartments, icon: Compass },
  { label: "Ayarlar", path: ROUTES.moreSettings, icon: Settings },
];
