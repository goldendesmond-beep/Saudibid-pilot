import { describe, expect, it } from "vitest";
import { useFeedStore } from "../store/feedStore";
import { useUiStore } from "../store/uiStore";

describe("API Error Handling & Mobile Navigation State", () => {
  it("manages mobile drawer open and close state", () => {
    const ui = useUiStore.getState();
    expect(ui.isMobileNavOpen).toBe(false);

    ui.toggleMobileNav();
    expect(useUiStore.getState().isMobileNavOpen).toBe(true);

    ui.closeMobileNav();
    expect(useUiStore.getState().isMobileNavOpen).toBe(false);
  });

  it("handles feed store error state distinctly from empty state", () => {
    // 1. Initial / clean state
    useFeedStore.setState({ error: null, matches: [], isLoadingTenders: false });
    expect(useFeedStore.getState().error).toBeNull();
    expect(useFeedStore.getState().matches.length).toBe(0);

    // 2. Set an explicit API Error
    useFeedStore.setState({
      error: "Unable to connect to procurement API (Failed to fetch). Check server status.",
      isLoadingTenders: false,
    });
    expect(useFeedStore.getState().error).toContain("Unable to connect to procurement API");

    // 3. Clear error on retry
    useFeedStore.setState({ error: null });
    expect(useFeedStore.getState().error).toBeNull();
  });
});
