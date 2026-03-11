-- =============================================================================
-- Migration 005: IAM - Identity & Access Management
-- =============================================================================
-- Tables: users, organizations, organization_members, refresh_tokens
-- =============================================================================

-- ─── users ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            uuid          PRIMARY KEY DEFAULT uuid_generate_v7(),
  email         varchar(255)  NOT NULL,
  password_hash varchar(255)  NOT NULL,
  name          varchar(255)  NOT NULL,
  avatar_url    varchar(512),
  last_login_at timestamptz,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE UNIQUE INDEX idx_users_email
  ON users (email) WHERE deleted_at IS NULL;

CREATE INDEX idx_users_created_at
  ON users (created_at);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── organizations ───────────────────────────────────────────────────────────

CREATE TABLE organizations (
  id         uuid          PRIMARY KEY DEFAULT uuid_generate_v7(),
  name       varchar(255)  NOT NULL,
  slug       varchar(100)  NOT NULL,
  logo_url   varchar(512),
  settings   jsonb         NOT NULL DEFAULT '{}',
  created_at timestamptz   NOT NULL DEFAULT now(),
  updated_at timestamptz   NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX idx_organizations_slug
  ON organizations (slug) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── organization_members ────────────────────────────────────────────────────

CREATE TABLE organization_members (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  organization_id uuid        NOT NULL REFERENCES organizations(id),
  user_id         uuid        NOT NULL REFERENCES users(id),
  role            user_role   NOT NULL DEFAULT 'member',
  joined_at       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX idx_org_members_org_user
  ON organization_members (organization_id, user_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_org_members_org_id
  ON organization_members (organization_id);

CREATE INDEX idx_org_members_user_id
  ON organization_members (user_id);

CREATE TRIGGER trg_org_members_updated_at
  BEFORE UPDATE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── refresh_tokens ──────────────────────────────────────────────────────────

CREATE TABLE refresh_tokens (
  id          uuid         PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id     uuid         NOT NULL REFERENCES users(id),
  token_hash  varchar(128) NOT NULL UNIQUE,
  device_info varchar(512),
  expires_at  timestamptz  NOT NULL,
  revoked     boolean      NOT NULL DEFAULT false,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX idx_refresh_tokens_user_id
  ON refresh_tokens (user_id);

CREATE INDEX idx_refresh_tokens_user_active
  ON refresh_tokens (user_id) WHERE revoked = false;

CREATE TRIGGER trg_refresh_tokens_updated_at
  BEFORE UPDATE ON refresh_tokens
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
