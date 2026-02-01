import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Children queries
export async function getChildrenByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { children } = await import("../drizzle/schema");
  return db.select().from(children).where(eq(children.userId, userId));
}

export async function getChildById(childId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { children } = await import("../drizzle/schema");
  const result = await db.select().from(children)
    .where(eq(children.id, childId))
    .limit(1);
  return result[0]?.userId === userId ? result[0] : undefined;
}

export async function createChild(data: { userId: number; name: string; initialBalance?: number; startDate?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { children } = await import("../drizzle/schema");
  const result = await db.insert(children).values({
    userId: data.userId,
    name: data.name,
    initialBalance: data.initialBalance ?? 0,
    startDate: data.startDate,
    totalPoints: data.initialBalance ?? 0,
  });
  return result;
}

export async function updateChild(childId: number, userId: number, data: { name?: string; initialBalance?: number; startDate?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { children } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.update(children)
    .set(data)
    .where(and(eq(children.id, childId), eq(children.userId, userId)));
}

export async function deleteChild(childId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { children } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(children).where(and(eq(children.id, childId), eq(children.userId, userId)));
}

// Activities queries
export async function getActivitiesByChild(childId: number, userId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  const { activities } = await import("../drizzle/schema");
  const { and, desc } = await import("drizzle-orm");
  let query = db.select().from(activities)
    .where(and(eq(activities.childId, childId), eq(activities.userId, userId)))
    .orderBy(desc(activities.date));
  if (limit) {
    query = query.limit(limit) as any;
  }
  return query;
}

export async function createActivity(data: { userId: number; childId: number; name: string; points: number; category: string; date: Date; multiplier: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { activities } = await import("../drizzle/schema");
  const result = await db.insert(activities).values(data);
  return result;
}

export async function deleteActivity(activityId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { activities } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(activities).where(and(eq(activities.id, activityId), eq(activities.userId, userId)));
}

// Custom Activities queries
export async function getCustomActivitiesByChild(childId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { customActivities } = await import("../drizzle/schema");
  const { and, asc } = await import("drizzle-orm");
  return db.select().from(customActivities)
    .where(and(eq(customActivities.childId, childId), eq(customActivities.userId, userId)))
    .orderBy(asc(customActivities.orderIndex));
}

export async function createCustomActivity(data: { userId: number; childId: number; activityId: string; name: string; points: number; category: string; orderIndex: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { customActivities } = await import("../drizzle/schema");
  const result = await db.insert(customActivities).values(data);
  return result;
}

export async function updateCustomActivity(id: number, userId: number, data: { name?: string; points?: number; orderIndex?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { customActivities } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.update(customActivities)
    .set(data)
    .where(and(eq(customActivities.id, id), eq(customActivities.userId, userId)));
}

export async function deleteCustomActivity(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { customActivities } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(customActivities).where(and(eq(customActivities.id, id), eq(customActivities.userId, userId)));
}

// Settings queries
export async function getSetting(userId: number, key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const { settings } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  const result = await db.select().from(settings)
    .where(and(eq(settings.userId, userId), eq(settings.key, key)))
    .limit(1);
  return result[0];
}

export async function upsertSetting(userId: number, key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { settings } = await import("../drizzle/schema");
  
  const existing = await getSetting(userId, key);
  if (existing) {
    const { and } = await import("drizzle-orm");
    await db.update(settings)
      .set({ value })
      .where(and(eq(settings.userId, userId), eq(settings.key, key)));
  } else {
    await db.insert(settings).values({ userId, key, value });
  }
}

// Expenses queries
export async function getExpensesByChild(childId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { expenses } = await import("../drizzle/schema");
  const { and, desc } = await import("drizzle-orm");
  return db.select().from(expenses)
    .where(and(eq(expenses.childId, childId), eq(expenses.userId, userId)))
    .orderBy(desc(expenses.date));
}

export async function createExpense(data: { userId: number; childId: number; description: string; amount: number; date: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { expenses } = await import("../drizzle/schema");
  const result = await db.insert(expenses).values(data);
  return result;
}

export async function deleteExpense(expenseId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { expenses } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(expenses).where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)));
}

// Parent Data queries
export async function getParentData(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { parentData } = await import("../drizzle/schema");
  const result = await db.select().from(parentData)
    .where(eq(parentData.userId, userId))
    .limit(1);
  return result[0];
}

export async function upsertParentData(data: { userId: number; name: string; gender?: string; appStartDate: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { parentData } = await import("../drizzle/schema");
  
  const existing = await getParentData(data.userId);
  if (existing) {
    await db.update(parentData)
      .set({ name: data.name, gender: data.gender, appStartDate: data.appStartDate })
      .where(eq(parentData.userId, data.userId));
  } else {
    await db.insert(parentData).values(data);
  }
}
