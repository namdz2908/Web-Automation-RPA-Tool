import Link from "next/link";
import { Plus, Play, FileText, Trash2, Clock } from "lucide-react";

// ─── Fetch scripts from Express backend (server-side) ─────────────────────────
async function getScripts() {
  try {
    const res = await fetch("http://localhost:5000/api/scripts", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

// ─── Home Page: Danh sách kịch bản ───────────────────────────────────────────
export default async function HomePage() {
  const scripts = await getScripts();

  return (
    <div className="min-h-screen bg-[var(--editor-bg)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--panel-border)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              RPA Workflow Editor
            </h1>
          </div>
          <Link
            href="/editor/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo kịch bản mới
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {scripts.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              Chưa có kịch bản nào
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Tạo kịch bản đầu tiên để bắt đầu tự động hóa trình duyệt web
            </p>
            <Link
              href="/editor/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo kịch bản mới
            </Link>
          </div>
        ) : (
          /* Scripts grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map(
              (script: {
                id: number;
                title: string;
                description: string | null;
                target_url: string;
                created_at: string;
                updated_at: string;
              }) => (
                <div
                  key={script.id}
                  className="bg-white rounded-xl border border-[var(--panel-border)] p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[var(--primary)]" />
                      <h3 className="font-semibold text-[var(--text-primary)] truncate">
                        {script.title}
                      </h3>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-all"
                      title="Xóa kịch bản"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {script.description && (
                    <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
                      {script.description}
                    </p>
                  )}

                  <p className="text-xs text-[var(--text-muted)] mb-4 truncate">
                    🔗 {script.target_url}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock className="w-3 h-3" />
                      {new Date(script.updated_at).toLocaleDateString("vi-VN")}
                    </div>
                    <Link
                      href={`/editor/${script.id}`}
                      className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                    >
                      Mở Editor →
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
