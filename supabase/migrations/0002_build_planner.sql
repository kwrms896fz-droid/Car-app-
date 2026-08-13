-- Carnet Garage — planificateur de préparation (V2)
-- À exécuter après 0001_init.sql, dans l'éditeur SQL Supabase ou via `supabase db push`.

-- ============================================================
-- 1. Colonnes additionnelles
-- ============================================================
alter table public.vehicles
  add column mileage integer check (mileage is null or mileage >= 0);

alter table public.mod_entries
  add column resulting_horsepower integer check (resulting_horsepower is null or resulting_horsepower between 0 and 3000);

-- ============================================================
-- 2. POWER_LOGS — résultats banc / piste, alimente la timeline de puissance
-- ============================================================
create table public.power_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  recorded_date date not null default current_date,
  horsepower integer check (horsepower between 0 and 3000),
  torque_nm integer check (torque_nm is null or torque_nm between 0 and 5000),
  source text not null default 'estime' check (source in ('banc', 'estime', 'constructeur')),
  track_name text,
  lap_time_seconds numeric(6, 2) check (lap_time_seconds is null or lap_time_seconds > 0),
  notes text,
  created_at timestamptz not null default now()
);

create index power_logs_vehicle_id_idx on public.power_logs (vehicle_id, recorded_date);

alter table public.power_logs enable row level security;

create policy "Les résultats sont visibles si le véhicule est visible"
  on public.power_logs for select
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = power_logs.vehicle_id
        and (v.is_public or v.owner_id = auth.uid())
    )
  );

create policy "Seul le propriétaire du véhicule gère ses résultats"
  on public.power_logs for all
  using (
    exists (select 1 from public.vehicles v where v.id = power_logs.vehicle_id and v.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.vehicles v where v.id = power_logs.vehicle_id and v.owner_id = auth.uid())
  );

-- ============================================================
-- 3. BUILD_PROJECTS + BUILD_PROJECT_ITEMS — calculateur de budget
-- Outil de planification privé : pas de policy de lecture publique.
-- ============================================================
create table public.build_projects (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  title text not null,
  target_horsepower integer check (target_horsepower is null or target_horsepower between 0 and 3000),
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'done')),
  created_at timestamptz not null default now()
);

create index build_projects_vehicle_id_idx on public.build_projects (vehicle_id);

alter table public.build_projects enable row level security;

create policy "Seul le propriétaire du véhicule gère ses projets"
  on public.build_projects for all
  using (
    exists (select 1 from public.vehicles v where v.id = build_projects.vehicle_id and v.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.vehicles v where v.id = build_projects.vehicle_id and v.owner_id = auth.uid())
  );

create table public.build_project_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.build_projects (id) on delete cascade,
  label text not null,
  category text not null check (category in ('esthetique', 'performance', 'confort', 'main_oeuvre', 'autre')),
  estimated_price numeric(10, 2) check (estimated_price is null or estimated_price >= 0),
  difficulty text check (difficulty in ('facile', 'moyen', 'difficile')),
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create index build_project_items_project_id_idx on public.build_project_items (project_id);

alter table public.build_project_items enable row level security;

create policy "Seul le propriétaire du véhicule gère les lignes de ses projets"
  on public.build_project_items for all
  using (
    exists (
      select 1 from public.build_projects p
      join public.vehicles v on v.id = p.vehicle_id
      where p.id = build_project_items.project_id and v.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.build_projects p
      join public.vehicles v on v.id = p.vehicle_id
      where p.id = build_project_items.project_id and v.owner_id = auth.uid()
    )
  );
