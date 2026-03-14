-- Migration 013: Firebase Auth support
-- Adds firebase_uid to users and makes password_hash optional
-- (Firebase users authenticate via JWT, no local password needed)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;

ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;
