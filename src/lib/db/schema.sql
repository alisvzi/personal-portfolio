-- Schema for the portfolio database (PostgreSQL / Neon).
--
-- The tables mirror the previous MongoDB collections one-for-one, and every
-- column maps to a field the application already used. Nothing is normalised
-- beyond what the data actually needs: `gallery` and `technologies` stay as
-- jsonb because they are read and written whole, as part of their parent row.
--
-- Naming: columns are snake_case; the data layer maps them to the camelCase
-- domain types in src/types. `order` is a reserved word, so ordering columns
-- are called `sort_order`.
--
-- Idempotent: safe to run against an existing database.

create table if not exists contents (
  id                  uuid primary key default gen_random_uuid(),
  hero_title          text not null,
  hero_subtitle       text not null,
  hero_description    text not null,
  about_text          text not null,
  contact_email       text not null,
  contact_phone       text not null,
  -- Persian variants are optional by design: when empty the renderer falls
  -- back to the base column, so a half-translated record is still valid.
  hero_title_fa       text,
  hero_subtitle_fa    text,
  hero_description_fa text,
  about_text_fa       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists projects (
  id                    uuid primary key default gen_random_uuid(),
  -- Nullable to match the old schema: records predating detail pages have no
  -- slug, and the data layer derives one at read time.
  slug                  text unique,
  title                 text not null,
  title_fa              text,
  description           text not null,
  description_fa        text,
  long_description      text,
  long_description_fa   text,
  role                  text,
  year                  text,
  client                text,
  image_url             text not null,
  image_placeholder_url text,
  gallery               jsonb not null default '[]'::jsonb,
  github_url            text,
  project_url           text,
  -- Comma-separated, exactly as the admin panel submits it.
  technologies          text not null,
  featured              boolean not null default false,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Mirrors the sort in the data layer so the listing is served from the index.
create index if not exists projects_listing_idx
  on projects (featured desc, sort_order asc, id desc);

create table if not exists skills (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  name_fa    text,
  category   text,
  level      integer,
  icon       text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skills_order_idx on skills (sort_order asc, name asc);

create table if not exists experiences (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  company         text not null,
  period          text not null,
  description     text not null,
  technologies    jsonb not null default '[]'::jsonb,
  -- Persian variants. Each one falls back to its base column when empty, so an
  -- entry saved in one language still renders on the other locale.
  title_fa        text,
  company_fa      text,
  period_fa       text,
  description_fa  text,
  technologies_fa jsonb not null default '[]'::jsonb,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- `create table if not exists` is a no-op on a database that already has the
-- table, so the Persian columns above need their own migration step for
-- deployments created before they existed.
alter table experiences
  add column if not exists title_fa        text,
  add column if not exists company_fa      text,
  add column if not exists period_fa       text,
  add column if not exists description_fa  text,
  add column if not exists technologies_fa jsonb not null default '[]'::jsonb;

create index if not exists experiences_order_idx
  on experiences (sort_order asc, id desc);

create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_created_idx on messages (created_at desc);

create table if not exists users (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  -- bcrypt hash. Plain-text passwords are never stored.
  password   text not null,
  role       text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
