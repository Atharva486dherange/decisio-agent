-- Supabase SQL Schema for Decisio
-- Run this in your Supabase project's SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Decisions Table
create table if not exists public.decisions (
  id text primary key,
  meeting_title text not null,
  date text not null,
  topic text not null,
  decision text not null,
  speaker text,
  quote text,
  status text default 'active', -- 'active' | 'superseded'
  superseded_by text,
  superseded_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tasks Table
create table if not exists public.tasks (
  id text primary key,
  task text not null,
  owner text default 'Unassigned',
  deadline text,
  due_at timestamp with time zone,
  priority text default 'Medium', -- 'High' | 'Medium' | 'Low'
  status text default 'todo', -- 'todo' | 'in_progress' | 'done'
  commitment text default 'Firm', -- 'Firm' | 'Tentative' | 'Vague'
  risk_level text default 'Low', -- 'Low' | 'Medium' | 'High'
  quote text,
  meeting_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Audit Logs Table
create table if not exists public.audit_logs (
  id text primary key,
  kind text default 'task',
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) with public read/write policy for hackathon demo
alter table public.decisions enable row level security;
alter table public.tasks enable row level security;
alter table public.audit_logs enable row level security;

create policy "Public read decisions" on public.decisions for select using (true);
create policy "Public insert decisions" on public.decisions for insert with check (true);
create policy "Public update decisions" on public.decisions for update using (true);

create policy "Public read tasks" on public.tasks for select using (true);
create policy "Public insert tasks" on public.tasks for insert with check (true);
create policy "Public update tasks" on public.tasks for update using (true);
create policy "Public delete tasks" on public.tasks for delete using (true);

create policy "Public read audit" on public.audit_logs for select using (true);
create policy "Public insert audit" on public.audit_logs for insert with check (true);
