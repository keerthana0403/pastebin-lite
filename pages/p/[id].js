import { useState, useEffect } from "react";

export async function getServerSideProps({ req, params }) {
  const { id } = params;

  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/pastes/${id}`);

  if (!res.ok) {
    return { notFound: true };
  }

  const data = await res.json();

  return {
    props: {
      id,
      content: data.content,
      remainingViews: data.remaining_views,
      expiresAt: data.expires_at,
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
