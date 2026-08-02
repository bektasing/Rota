import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { AppShell } from "@/app/AppShell";
import { NotFoundPage } from "@/app/NotFoundPage";
import { ROUTES } from "@/constants/routes";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { DepartmentsPage } from "@/features/departments/pages/DepartmentsPage";
import { ExamsPage } from "@/features/exams/pages/ExamsPage";
import { GoalsPage } from "@/features/goals/pages/GoalsPage";
import { MistakesPage } from "@/features/mistakes/pages/MistakesPage";
import { MorePage } from "@/features/more/pages/MorePage";
import { NotesPage } from "@/features/notes/pages/NotesPage";
import { PlannerPage } from "@/features/planner/pages/PlannerPage";
import { ResourcesPage } from "@/features/resources/pages/ResourcesPage";
import { ReviewsPage } from "@/features/reviews/pages/ReviewsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { StatisticsPage } from "@/features/statistics/pages/StatisticsPage";
import { SubjectsPage } from "@/features/subjects/pages/SubjectsPage";
import { TimerPage } from "@/features/timer/pages/TimerPage";

export const routeConfig: RouteObject[] = [
  {
    path: ROUTES.home,
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: ROUTES.planner.slice(1), element: <PlannerPage /> },
      { path: ROUTES.timer.slice(1), element: <TimerPage /> },
      { path: ROUTES.progress.slice(1), element: <StatisticsPage /> },
      { path: ROUTES.more.slice(1), element: <MorePage /> },
      { path: ROUTES.moreSubjects.slice(1), element: <SubjectsPage /> },
      { path: ROUTES.moreExams.slice(1), element: <ExamsPage /> },
      { path: ROUTES.moreMistakes.slice(1), element: <MistakesPage /> },
      { path: ROUTES.moreReviews.slice(1), element: <ReviewsPage /> },
      { path: ROUTES.moreGoals.slice(1), element: <GoalsPage /> },
      { path: ROUTES.moreResources.slice(1), element: <ResourcesPage /> },
      { path: ROUTES.moreNotes.slice(1), element: <NotesPage /> },
      { path: ROUTES.moreDepartments.slice(1), element: <DepartmentsPage /> },
      { path: ROUTES.moreSettings.slice(1), element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routeConfig);
