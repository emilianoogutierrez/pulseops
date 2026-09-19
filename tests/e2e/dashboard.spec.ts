import { expect, test } from "@playwright/test";
async function signIn(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@pulseops.local");
    await page.getByLabel("Password").fill(process.env.DEMO_PASSWORD || "pulseops-demo-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
}
test("authenticated dashboard exposes persisted operating data", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Good afternoon, Demo." })).toBeVisible();
    await expect(page.getByText("Qualified pipeline")).toBeVisible();
    await expect(page.getByText("Best opportunities to move today")).toBeVisible();
});
test("mobile shell keeps core navigation visible after authentication", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
});
test("proposal detail preserves commercial scope and can create delivery", async ({ page }) => {
    await signIn(page);
    await page.goto("/proposals");
    const sentProposal = page.getByText("Rebuild operations dashboard").first();
    if (await sentProposal.count()) {
        await sentProposal.click();
        await expect(page.getByText("Acceptance criteria")).toBeVisible();
        const accept = page.getByRole("button", { name: "Accept & create project" });
        if (await accept.count()) {
            await accept.click();
            await expect(page).toHaveURL(/\/projects\//);
            await expect(page.getByText("Deliverables")).toBeVisible();
        }
    }
});
test("global command search supports keyboard selection", async ({ page }) => {
    await signIn(page);
    await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
    await expect(page.getByRole("dialog", { name: "Search PulseOps" })).toBeVisible();
    await page.getByLabel("Search PulseOps").press("ArrowDown");
    await page.getByLabel("Search PulseOps").press("Escape");
    await expect(page.getByRole("dialog", { name: "Search PulseOps" })).toHaveCount(0);
});
test("pipeline exposes operator filters and create entry point", async ({ page }) => {
    await signIn(page);
    await page.goto("/opportunities");
    await expect(page.getByPlaceholder("Search opportunity or client")).toBeVisible();
    await expect(page.getByRole("link", { name: "New opportunity" })).toBeVisible();
});
test("payment detail exposes append-only reconciliation", async ({ page }) => {
    await signIn(page);
    await page.goto("/payments");
    const pending = page.getByText("Atlas Labs").first();
    if (await pending.count()) {
        await pending.click();
        await expect(page.getByText("Settlement ledger")).toBeVisible();
        await expect(page.getByRole("button", { name: "Record settlement" })).toBeVisible();
    }
});
