import { describe, expect, it } from "vitest";
import { allowedProjectTransitions, transitionProject } from "../../src/domain/projects/lifecycle";
describe("project lifecycle", () => {
    it("allows a deliberate delivery path", () => {
        expect(transitionProject("PLANNED", "ACTIVE")).toBe("ACTIVE");
        expect(transitionProject("ACTIVE", "REVIEW")).toBe("REVIEW");
        expect(transitionProject("REVIEW", "DELIVERED")).toBe("DELIVERED");
        expect(transitionProject("DELIVERED", "CLOSED")).toBe("CLOSED");
    });
    it("supports blocking and resuming without skipping review", () => {
        expect(allowedProjectTransitions("ACTIVE")).toContain("BLOCKED");
        expect(transitionProject("BLOCKED", "ACTIVE")).toBe("ACTIVE");
        expect(() => transitionProject("BLOCKED", "DELIVERED")).toThrow(/cannot transition/);
    });
});
