import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreBreakdown } from "../components/feed/ScoreBreakdown";
import { useLocaleStore } from "../store/localeStore";

describe("ScoreBreakdown Component", () => {
  it("renders final, rule, and semantic percentages in English", () => {
    useLocaleStore.getState().setLocale("en");
    render(<ScoreBreakdown finalScore={0.88} ruleScore={0.9} semanticScore={0.85} />);
    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Overall Match Score:")).toBeInTheDocument();
  });

  it("renders labels in Arabic", () => {
    useLocaleStore.getState().setLocale("ar");
    render(<ScoreBreakdown finalScore={0.88} ruleScore={0.9} semanticScore={0.85} />);
    expect(screen.getByText("درجة المطابقة الإجمالية:")).toBeInTheDocument();
  });
});
