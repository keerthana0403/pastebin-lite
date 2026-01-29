import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

export default function Home() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createPaste = async () => {
    setError("");

    if (!content.trim()) {
      setError("Paste content cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? Number(ttl) : undefined,
          max_views: maxViews ? Number(maxViews) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create paste");
        setLoading(false);
        return;
      }

      router.push(`/p/${data.id}`);
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Pastebin Lite</h1>

      <textarea
        className={styles.textarea}
        placeholder="Paste your text here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className={styles.options}>
        <input
          type="number"
          placeholder="TTL (seconds)"
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Views"
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.button}
        onClick={createPaste}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Paste"}
      </button>
    </main>
  );
}
