import { EditorClient } from "./EditorClient";

// ─── Editor Page (Server Component) ──────────────────────────────────────────
// Fetch initial script data server-side, pass to client editor
export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let initialScript = null;

  if (id !== "new") {
    try {
      const res = await fetch(`http://localhost:5000/api/scripts/${id}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        initialScript = data.data || null;
      }
    } catch {
      // Backend không khả dụng — editor sẽ hoạt động offline
    }
  }

  return <EditorClient initialScript={initialScript} scriptId={id} />;
}
