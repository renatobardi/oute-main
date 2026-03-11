-- =============================================================================
-- Migration 002: UUID v7 Generator Function
-- =============================================================================
-- UUID v7 (RFC 9562): 48-bit unix timestamp (ms) + 4-bit version + 12-bit
-- random + 2-bit variant + 62-bit random.
--
-- Benefits over UUID v4:
--   - Time-ordered → better B-tree locality, fewer page splits
--   - Sortable by creation time
--   - Client-side generation without DB roundtrip
-- =============================================================================

CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
LANGUAGE plpgsql
VOLATILE PARALLEL SAFE
AS $$
DECLARE
  unix_ms  bigint;
  uuid_bytes bytea;
BEGIN
  unix_ms := (extract(epoch FROM clock_timestamp()) * 1000)::bigint;

  -- 16 random bytes
  uuid_bytes := gen_random_bytes(16);

  -- Overwrite first 6 bytes with timestamp (big-endian)
  uuid_bytes := set_byte(uuid_bytes, 0, (unix_ms >> 40)::int & 255);
  uuid_bytes := set_byte(uuid_bytes, 1, (unix_ms >> 32)::int & 255);
  uuid_bytes := set_byte(uuid_bytes, 2, (unix_ms >> 24)::int & 255);
  uuid_bytes := set_byte(uuid_bytes, 3, (unix_ms >> 16)::int & 255);
  uuid_bytes := set_byte(uuid_bytes, 4, (unix_ms >> 8)::int  & 255);
  uuid_bytes := set_byte(uuid_bytes, 5, unix_ms::int          & 255);

  -- Set version to 7 (byte 6: high nibble = 0111)
  uuid_bytes := set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112);

  -- Set variant to 2 (byte 8: high 2 bits = 10)
  uuid_bytes := set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128);

  RETURN encode(uuid_bytes, 'hex')::uuid;
END;
$$;

-- Helper: extract timestamp from UUID v7
CREATE OR REPLACE FUNCTION uuid_v7_to_timestamptz(uuid_val uuid)
RETURNS timestamptz
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
AS $$
  SELECT to_timestamp(
    (
      ('x' || lpad(left(replace(uuid_val::text, '-', ''), 12), 16, '0'))::bit(64)::bigint
    )::double precision / 1000.0
  );
$$;
