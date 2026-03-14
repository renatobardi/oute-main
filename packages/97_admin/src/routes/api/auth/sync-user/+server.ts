/**
 * POST /api/auth/sync-user
 *
 * FASE 7: After Firebase login, upsert the user in PostgreSQL.
 * - If user exists by firebase_uid → update last_login_at, return db_user_id
 * - If user exists by email → link firebase_uid, return db_user_id
 * - If new user → create record, return db_user_id
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '@oute/shared';

export const POST: RequestHandler = async ({ locals }) => {
  const firebaseUser = locals.user;

  if (!firebaseUser) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const { uid, email, name, picture } = firebaseUser;
  const displayName = name ?? email?.split('@')[0] ?? 'Usuário';

  try {
    // 1. Try to find by firebase_uid
    const [existing] = await sql`
      SELECT id FROM users WHERE firebase_uid = ${uid} AND deleted_at IS NULL
    `;

    if (existing) {
      // Update last login
      await sql`
        UPDATE users SET last_login_at = NOW() WHERE id = ${existing.id}
      `;
      return json({ db_user_id: existing.id });
    }

    // 2. Try to find by email and link firebase_uid
    if (email) {
      const [byEmail] = await sql`
        SELECT id FROM users WHERE email = ${email} AND deleted_at IS NULL
      `;

      if (byEmail) {
        await sql`
          UPDATE users
          SET firebase_uid = ${uid}, last_login_at = NOW()
          WHERE id = ${byEmail.id}
        `;
        return json({ db_user_id: byEmail.id });
      }
    }

    // 3. Create new user
    const [newUser] = await sql`
      INSERT INTO users (email, name, avatar_url, firebase_uid, last_login_at)
      VALUES (
        ${email ?? `${uid}@firebase.local`},
        ${displayName},
        ${picture ?? null},
        ${uid},
        NOW()
      )
      RETURNING id
    `;

    return json({ db_user_id: newUser.id });

  } catch (err) {
    console.error('sync-user error:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
