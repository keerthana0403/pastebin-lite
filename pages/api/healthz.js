import { redis } from "@/lib/redis";

export default async function handler(req, res) {
  try {
    await redis.ping();
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
}
