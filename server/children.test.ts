import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("children router", () => {
  it("should list children for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const children = await caller.children.list();
    expect(Array.isArray(children)).toBe(true);
  });

  it("should create a child", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.children.create({
      name: "Test Child",
      initialBalance: 100,
      startDate: new Date(),
    });

    expect(result.success).toBe(true);
  });
});

describe("settings router", () => {
  it("should get and set settings", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.settings.set({
      key: "test-key",
      value: { test: "value" },
    });

    const setting = await caller.settings.get({ key: "test-key" });
    expect(setting).toEqual({ test: "value" });
  });
});
