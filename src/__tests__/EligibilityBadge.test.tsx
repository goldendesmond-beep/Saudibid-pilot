import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EligibilityBadge } from "../components/feed/EligibilityBadge";
import { useLocaleStore } from "../store/localeStore";

describe("EligibilityBadge Component", () => {
  it("renders Passed state in English", () => {
    useLocaleStore.getState().setLocale("en");
    render(<EligibilityBadge passed={true} failedCriteria={[]} warnings={[]} />);
    expect(screen.getByText("Passed")).toBeInTheDocument();
  });

  it("renders Passed state in Arabic", () => {
    useLocaleStore.getState().setLocale("ar");
    render(<EligibilityBadge passed={true} failedCriteria={[]} warnings={[]} />);
    expect(screen.getByText("مؤهل")).toBeInTheDocument();
  });

  it("renders Failed state with criteria in English", () => {
    useLocaleStore.getState().setLocale("en");
    render(<EligibilityBadge passed={false} failedCriteria={["turnover insufficient"]} warnings={[]} />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders Warnings state in Arabic", () => {
    useLocaleStore.getState().setLocale("ar");
    render(<EligibilityBadge passed={true} failedCriteria={[]} warnings={["near deadline"]} />);
    expect(screen.getByText("تنبيهات")).toBeInTheDocument();
  });
});
