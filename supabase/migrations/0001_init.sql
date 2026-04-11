-- Participants table: email -> ticket_number lookup
create table if not exists public.participants (
  email text primary key,
  ticket_number text not null,
  uploaded_at timestamptz not null default now()
);

alter table public.participants enable row level security;

-- Event settings: singleton row (id = 1)
create table if not exists public.event_settings (
  id int primary key default 1 check (id = 1),
  event_id text,
  event_name text,
  updated_at timestamptz not null default now()
);

alter table public.event_settings enable row level security;
