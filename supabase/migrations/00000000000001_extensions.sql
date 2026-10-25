-- 00000000000001_extensions.sql
-- Enable required Postgres extensions for Level 2.

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";
create extension if not exists ltree;

-- The `app` schema holds helper functions and internal routines.
create schema if not exists app;

-- Grant usage on the app schema to authenticated and anonymous roles
-- (policies will further restrict what they can actually do).
grant usage on schema app to authenticated, anon;

comment on schema app is 'Internal helper functions for Neatly authorization and scope resolution.';
