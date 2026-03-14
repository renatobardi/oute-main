/**
 * Busca o UUID do usuário no PostgreSQL a partir do firebase_uid.
 * Retorna null se não encontrar (usuário ainda não sincronizado).
 */
import { getDb } from '@oute/shared';

export async function getDbUserId(firebaseUid: string): Promise<string | null> {
  const sql = getDb();
  const [row] = await sql`
    SELECT id FROM users WHERE firebase_uid = ${firebaseUid} AND deleted_at IS NULL
  `;
  return row?.id ?? null;
}
