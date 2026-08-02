import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { routeConfig } from "@/app/routes";
import { subjectRepository } from "@/repositories/subjectRepository";
import { userProfileRepository } from "@/repositories/userProfileRepository";
import { ThemeProvider } from "@/store/ThemeContext";

function renderAt(path: string) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [path] });
  return render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  );
}

describe("routing", () => {
  beforeEach(async () => {
    await subjectRepository.clear();
    await userProfileRepository.clear();
    // AppShell, kurulumu tamamlanmış bir profil olmadan ana rotaları göstermiyor
    // (Phase 1A); testler bu nedenle tamamlanmış bir profille çalışır.
    const now = new Date().toISOString();
    await userProfileRepository.add({
      id: "test-profile",
      name: "Test Kullanıcı",
      examDate: null,
      dailyStudyTargetMinutes: 180,
      weeklyStudyDays: [],
      preferredStudyHours: [],
      targetRanking: null,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  it("ana sayfada Dashboard'u gösterir", async () => {
    renderAt("/");
    expect(await screen.findByText(/Test Kullanıcı/)).toBeInTheDocument();
  });

  it("/plan yolunda Planlayıcı yer tutucusunu gösterir", async () => {
    renderAt("/plan");
    expect(await screen.findByRole("heading", { name: "Planlayıcı" })).toBeInTheDocument();
  });

  it("/calis yolunda Çalış yer tutucusunu gösterir", async () => {
    renderAt("/calis");
    expect(await screen.findByRole("heading", { name: "Çalış" })).toBeInTheDocument();
  });

  it("/daha-fazla yolunda menü öğelerini listeler", async () => {
    renderAt("/daha-fazla");
    const main = await screen.findByRole("main");
    expect(within(main).getByText("Ayarlar")).toBeInTheDocument();
    expect(within(main).getByText("Bölüm Keşfi")).toBeInTheDocument();
  });

  it("bilinmeyen bir yolda 404 ekranını gösterir", async () => {
    renderAt("/olmayan-sayfa");
    expect(await screen.findByRole("heading", { name: "Sayfa bulunamadı" })).toBeInTheDocument();
  });
});
