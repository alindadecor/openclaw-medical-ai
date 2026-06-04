import { getCloudflareContext } from "@opennextjs/cloudflare";

function getDB(): D1Database {
  const { env } = getCloudflareContext();
  return env.DB;
}

// ── Users ────────────────────────────────────────────────

export async function createUser(
  id: string,
  email: string,
  passwordHash: string,
  name: string
) {
  const db = getDB();
  await db
    .prepare(
      "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)"
    )
    .bind(id, email, passwordHash, name)
    .run();
}

export async function getUserByEmail(email: string) {
  const db = getDB();
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<{
      id: string;
      email: string;
      password_hash: string;
      name: string;
      plan: string;
      created_at: string;
    }>();
}

export async function getUserById(id: string) {
  const db = getDB();
  return db
    .prepare("SELECT id, email, name, plan, created_at FROM users WHERE id = ?")
    .bind(id)
    .first<{
      id: string;
      email: string;
      name: string;
      plan: string;
      created_at: string;
    }>();
}

// ── Chat Sessions ────────────────────────────────────────

export async function createChatSession(
  id: string,
  userId: string,
  title: string,
  projectId?: string
) {
  const db = getDB();
  await db
    .prepare(
      "INSERT INTO chat_sessions (id, user_id, project_id, title) VALUES (?, ?, ?, ?)"
    )
    .bind(id, userId, projectId ?? null, title)
    .run();
}

export async function getUserSessions(userId: string, projectId?: string) {
  const db = getDB();
  if (projectId) {
    return db
      .prepare(
        "SELECT * FROM chat_sessions WHERE user_id = ? AND project_id = ? ORDER BY updated_at DESC LIMIT 50"
      )
      .bind(userId, projectId)
      .all<{
        id: string;
        user_id: string;
        project_id: string | null;
        title: string;
        created_at: string;
        updated_at: string;
      }>();
  }
  return db
    .prepare(
      "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50"
    )
    .bind(userId)
    .all<{
      id: string;
      user_id: string;
      project_id: string | null;
      title: string;
      created_at: string;
      updated_at: string;
    }>();
}

export async function updateSessionTitle(id: string, title: string) {
  const db = getDB();
  await db
    .prepare(
      "UPDATE chat_sessions SET title = ?, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(title, id)
    .run();
}

// ── Chat Messages ────────────────────────────────────────

export async function saveChatMessage(
  id: string,
  sessionId: string,
  role: string,
  content: string,
  citations?: string,
  confidence?: number
) {
  const db = getDB();
  await db
    .prepare(
      "INSERT INTO chat_messages (id, session_id, role, content, citations, confidence) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, sessionId, role, content, citations ?? null, confidence ?? null)
    .run();
}

export async function getSessionMessages(sessionId: string) {
  const db = getDB();
  return db
    .prepare(
      "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC"
    )
    .bind(sessionId)
    .all<{
      id: string;
      session_id: string;
      role: string;
      content: string;
      citations: string | null;
      confidence: number | null;
      created_at: string;
    }>();
}

// ── API Keys ─────────────────────────────────────────────

export async function createApiKey(
  id: string,
  userId: string,
  keyHash: string,
  name: string
) {
  const db = getDB();
  await db
    .prepare(
      "INSERT INTO api_keys (id, user_id, key_hash, name) VALUES (?, ?, ?, ?)"
    )
    .bind(id, userId, keyHash, name)
    .run();
}

export async function getUserApiKeys(userId: string) {
  const db = getDB();
  return db
    .prepare(
      "SELECT id, name, key_hash, last_used, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC"
    )
    .bind(userId)
    .all<{
      id: string;
      name: string;
      key_hash: string;
      last_used: string | null;
      created_at: string;
    }>();
}

export async function deleteApiKey(id: string, userId: string) {
  const db = getDB();
  await db
    .prepare("DELETE FROM api_keys WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run();
}

// ── Projects (Workspaces) ────────────────────────────────

export async function createProject(
  id: string,
  userId: string,
  name: string,
  description: string
) {
  const db = getDB();
  await db
    .prepare(
      "INSERT INTO projects (id, user_id, name, description) VALUES (?, ?, ?, ?)"
    )
    .bind(id, userId, name, description)
    .run();
}

export async function getUserProjects(userId: string) {
  const db = getDB();
  return db
    .prepare(
      "SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC"
    )
    .bind(userId)
    .all<{
      id: string;
      user_id: string;
      name: string;
      description: string;
      created_at: string;
      updated_at: string;
    }>();
}

export async function updateProject(
  id: string,
  userId: string,
  name: string,
  description: string
) {
  const db = getDB();
  await db
    .prepare(
      "UPDATE projects SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    )
    .bind(name, description, id, userId)
    .run();
}

export async function deleteProject(id: string, userId: string) {
  const db = getDB();
  await db
    .prepare("DELETE FROM projects WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run();
}

// ── Usage Logs ───────────────────────────────────────────

export async function incrementUsage(userId: string) {
  const db = getDB();
  const today = new Date().toISOString().split("T")[0];
  await db
    .prepare(
      `INSERT INTO usage_logs (id, user_id, date, query_count, tokens_used)
       VALUES (?, ?, ?, 1, 0)
       ON CONFLICT(user_id, date) DO UPDATE SET query_count = query_count + 1`
    )
    .bind(crypto.randomUUID(), userId, today)
    .run();
}
