import { useState, useEffect } from "react";
import { redis } from "../../lib/redis";

export async function getServerSideProps({ params }) {
  const { id } = params;

  // Fetch paste directly from Redis
  const paste = await redis.get(`paste:${id}`);

  if (!paste) {
    return { notFound: true };
  }

  const now = Date.now();

  // TTL check
  if (paste.expires_at && now > paste.expires_at) {
    await redis.del(`paste:${id}`);
    return { notFound: true };
  }

  // Max views check (do NOT increment here)
  if (paste.max_views !== null && paste.views >= paste.max_views) {
    return { notFound: true };
  }

  return {
    props: {
      id, // pass the paste ID to the client
      content: paste.content,
      remainingViews: paste.max_views !== null ? paste.max_views - paste.views : null,
      expiresAt: paste.expires_at || null,
    },
  };
}

export default function PastePage({ id, content, remainingViews, expiresAt }) {
  // For client-side formatted date
  const [expiresString, setExpiresString] = useState(null);

  // For live remaining views
  const [liveViews, setLiveViews] = useState(remainingViews);

  useEffect(() => {
    if (expiresAt) {
      setExpiresString(new Date(expiresAt).toLocaleString());
    }

    // Fetch remaining views from API without incrementing
    async function fetchViews() {
      try {
        const res = await fetch(`/api/pastes/${id}?increment=false`);
        if (res.ok) {
          const data = await res.json();
          setLiveViews(data.remaining_views);
        } else if (res.status === 404) {
          setLiveViews(0); // paste deleted
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchViews();
  }, [id, expiresAt]);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h2>Paste</h2>

      <pre
        style={{
          background: "#f4f4f4",
          padding: 15,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </pre>

      <div style={{ marginTop: 10, fontSize: 14 }}>
        {liveViews !== null && <p>Remaining views: {liveViews}</p>}
        {expiresString && <p>Expires at: {expiresString}</p>}
      </div>
    </main>
  );
}
