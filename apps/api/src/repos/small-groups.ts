import { desc } from "drizzle-orm";

import { db } from "../db/index.js";
import { smallGroups } from "../db/schema.js";

type NewSmallGroup = typeof smallGroups.$inferInsert;

export const create = async (data: NewSmallGroup) => {
  const [group] = await db.insert(smallGroups).values(data).returning();
  return group;
};

export const getRecent = async () => {
  const [group] = await db.select().from(smallGroups).orderBy(desc(smallGroups.createdAt)).limit(1);
  return group;
};
