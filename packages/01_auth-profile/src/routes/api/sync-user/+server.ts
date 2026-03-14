/**
 * POST /auth/api/sync-user
 *
 * Após login Firebase, faz o upsert do usuário no PostgreSQL.
 * - Encontrou por firebase_uid → atualiza last_login_at
 * - Encontrou por email → vincula firebase_uid
 * - Novo usuário → cria registro
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '@oute/shared';

export const POST: RequestHandler = async ({ locals }) => {
  const firebaseUser = locals.user;

  if (!firebaseUser) {
    return json({ error: 'Não autorizado' }, { status: 401 });
  }

  const sql = getDb();
  const { uid, email, name, picture } = firebaseUser;
  const displayName = name ?? email?.split('@')[0] ?? 'Usuário';

  try {
    // 1. Busca por firebase_uid
    const [existing] = await sql`
      SELECT id FROM users WHERE firebase_uid = ${uid} AND deleted_at IS NULL
    `;

    if (existing) {
      await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${existing.id}`;
      return json({ db_user_id: existing.id });
    }

    // 2. Busca por email e vincula o firebase_uid
    if (email) {
      const [byEmail] = await sql`
        SELECT id FROM users WHERE email = ${email} AND deleted_at IS NULL
      `;

      if (byEmail) {
        await sql`
          UPDATE users SET firebase_uid = ${uid}, last_login_at = NOW()
          WHERE id = ${byEmail.id}
        `;
        return json({ db_user_id: byEmail.id });
      }
    }

    // 3. Cria novo usuário
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
    return json({ error: 'Erro interno' }, { status: 500 });
  }
};
