import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  children: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getChildrenByUserId } = await import("./db");
      return getChildrenByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        initialBalance: z.number().optional(),
        startDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createChild } = await import("./db");
        await createChild({ userId: ctx.user.id, ...input });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        initialBalance: z.number().optional(),
        startDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateChild } = await import("./db");
        const { id, ...data } = input;
        await updateChild(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteChild } = await import("./db");
        await deleteChild(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  activities: router({
    list: protectedProcedure
      .input(z.object({ childId: z.number(), limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const { getActivitiesByChild } = await import("./db");
        return getActivitiesByChild(input.childId, ctx.user.id, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        childId: z.number(),
        name: z.string(),
        points: z.number(),
        category: z.string(),
        date: z.date(),
        multiplier: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createActivity } = await import("./db");
        await createActivity({ userId: ctx.user.id, ...input });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteActivity } = await import("./db");
        await deleteActivity(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  customActivities: router({
    list: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getCustomActivitiesByChild } = await import("./db");
        return getCustomActivitiesByChild(input.childId, ctx.user.id);
      }),
    create: protectedProcedure
      .input(z.object({
        childId: z.number(),
        activityId: z.string(),
        name: z.string(),
        points: z.number(),
        category: z.string(),
        orderIndex: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCustomActivity } = await import("./db");
        await createCustomActivity({ userId: ctx.user.id, ...input });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        points: z.number().optional(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateCustomActivity } = await import("./db");
        const { id, ...data } = input;
        await updateCustomActivity(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteCustomActivity } = await import("./db");
        await deleteCustomActivity(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  settings: router({
    get: protectedProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ ctx, input }) => {
        const { getSetting } = await import("./db");
        const setting = await getSetting(ctx.user.id, input.key);
        return setting ? JSON.parse(setting.value) : null;
      }),
    set: protectedProcedure
      .input(z.object({ key: z.string(), value: z.any() }))
      .mutation(async ({ ctx, input }) => {
        const { upsertSetting } = await import("./db");
        await upsertSetting(ctx.user.id, input.key, JSON.stringify(input.value));
        return { success: true };
      }),
  }),

  expenses: router({
    list: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getExpensesByChild } = await import("./db");
        return getExpensesByChild(input.childId, ctx.user.id);
      }),
    create: protectedProcedure
      .input(z.object({
        childId: z.number(),
        description: z.string(),
        amount: z.number(),
        date: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createExpense } = await import("./db");
        await createExpense({ userId: ctx.user.id, ...input });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteExpense } = await import("./db");
        await deleteExpense(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  parentData: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const { getParentData } = await import("./db");
      return getParentData(ctx.user.id);
    }),
    upsert: protectedProcedure
      .input(z.object({
        name: z.string(),
        gender: z.string().optional(),
        appStartDate: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { upsertParentData } = await import("./db");
        await upsertParentData({ userId: ctx.user.id, ...input });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
