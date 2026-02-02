import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const createEvent = async (req, res, io) => {
  try {
    const { actor_id, verb, object_type, object_id, target_user_id } = req.body;

    // Idempotency Check
    const existingEvent = await prisma.event.findFirst({
      where: {
        actor_id,
        verb,
        object_id,
        created_at: {
          gte: new Date(Date.now() - 5000), // 5 seconds window
        },
      },
    });

    if (existingEvent) {
      console.log("Duplicate event detected, skipping...");
      return res.status(200).json(existingEvent);
    }

    const newEvent = await prisma.event.create({
      data: { actor_id, verb, object_type, object_id, target_user_id },
    });

    io.to(target_user_id).emit("notification", newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET Feed  (Cursor-based Pagination)
export const getFeed = async (req, res) => {
  try {
    const { user_id, cursor, limit = 10 } = req.query;

    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const items = await prisma.event.findMany({
      take: parseInt(limit),

      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      where: { target_user_id: user_id },
      orderBy: { created_at: "desc" }, // Newest first
    });

    const nextCursor =
      items.length === parseInt(limit) ? items[items.length - 1].id : null;

    res.json({
      items,
      next_cursor: nextCursor,
    });
  } catch (error) {
    console.error("Feed Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { window = "1m" } = req.query; // Default 1 minute

    const now = new Date();
    let timeLimit = new Date();

    if (window === "1m") timeLimit = new Date(now.getTime() - 1 * 60000);
    else if (window === "5m") timeLimit = new Date(now.getTime() - 5 * 60000);
    else if (window === "1h") timeLimit = new Date(now.getTime() - 60 * 60000);

    // Prisma aggregation query
    const topEvents = await prisma.event.groupBy({
      by: ["object_id", "verb"],
      where: {
        created_at: { gte: timeLimit },
      },
      _count: {
        object_id: true,
      },
      orderBy: {
        _count: {
          object_id: "desc",
        },
      },
      take: 100, // Top 100 requirement
    });

    res.json(topEvents);
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
