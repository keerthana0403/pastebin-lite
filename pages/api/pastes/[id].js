import { redis } from "@/lib/redis";
import { getNow } from "@/lib/time";

export default async function handler(req, res) {
  const { id, increment } = req.query; // get increment query param

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1️⃣ Fetch paste
  const key = `paste:${id}`;
  const paste = await redis.get(key);

  if (!paste) {
    return res.status(404).json({ error: "Paste not found" });
  }

  const now = getNow(req);

  // 2️⃣ Check TTL expiry
  if (paste.expires_at && now >= paste.expires_at) {
    await redis.del(key); // cleanup
    return res.status(404).json({ error: "Paste expired" });
  }

  // 3️⃣ Check view limit
  if (paste.max_views !== null && paste.views >= paste.max_views) {
    await redis.del(key); // cleanup
    return res.status(404).json({ error: "View limit exceeded" });
  }

  // 4️⃣ Increment views only if increment !== "false"
  let updatedViews = paste.views;
  if (increment !== "false" && paste.max_views !== null) {
    updatedViews = paste.views + 1;
    await redis.set(key, {
      ...paste,
      views: updatedViews,
    });
  }

  // 5️⃣ Prepare response
  const remainingViews =
    paste.max_views === null
      ? null
      : Math.max(paste.max_views - updatedViews, 0);

  return res.status(200).json({
    content: paste.content,
    remaining_views: remainingViews,
    expires_at: paste.expires_at
      ? new Date(paste.expires_at).toISOString()
      : null,
  });
}
