import { redis } from "@/lib/redis";
import { getNow } from "@/lib/time";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, ttl_seconds, max_views } = req.body;

  // 1️⃣ Validate content
  if (typeof content !== "string" || content.trim() === "") {
    return res
      .status(400)
      .json({ error: "content must be a non-empty string" });
  }

  // 2️⃣ Validate ttl_seconds
  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
  ) {
    return res
      .status(400)
      .json({ error: "ttl_seconds must be an integer >= 1" });
  }

  // 3️⃣ Validate max_views
  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views < 1)
  ) {
    return res
      .status(400)
      .json({ error: "max_views must be an integer >= 1" });
  }

  // 4️⃣ Create paste object
  const id = nanoid(8);
  const now = getNow(req);

  const paste = {
    id,
    content,
    created_at: now,
    expires_at: ttl_seconds ? now + ttl_seconds * 1000 : null,
    max_views: max_views ?? null,
    views: 0,
  };

  // 5️⃣ Save to Redis
  await redis.set(`paste:${id}`, paste);

  // 6️⃣ Build response URL
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  return res.status(201).json({
    id,
    url: `${baseUrl}/p/${id}`,
  });
}
