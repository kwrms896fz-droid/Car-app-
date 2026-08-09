-- Carnet Garage — schéma initial (V1)
-- À exécuter dans l'éditeur SQL Supabase, ou via `supabase db push`.

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Les profils sont visibles par tous"
  on public.profiles for select
  using (true);

create policy "Un utilisateur peut créer son propre profil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Un utilisateur peut modifier son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Crée automatiquement un profil à l'inscription
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data ->> 'display_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. VEHICLES
-- ============================================================
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  type_vehicule text not null check (type_vehicule in ('voiture', 'moto')),
  brand text not null,
  model text not null,
  year integer check (year between 1900 and 2100),
  cover_photo_url text,
  is_public boolean not null default true,
  hide_budget boolean not null default false,
  created_at timestamptz not null default now()
);

create index vehicles_owner_id_idx on public.vehicles (owner_id);

alter table public.vehicles enable row level security;

create policy "Les véhicules publics sont visibles par tous, les privés par leur propriétaire"
  on public.vehicles for select
  using (is_public or owner_id = auth.uid());

create policy "Le propriétaire gère ses véhicules"
  on public.vehicles for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ============================================================
-- 3. MOD_ENTRIES (journal de modifications)
-- ============================================================
create table public.mod_entries (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  category text not null check (category in ('esthetique', 'mecanique', 'performance', 'confort')),
  title text not null,
  description text,
  price numeric(10, 2) check (price >= 0),
  photos text[] not null default '{}',
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index mod_entries_vehicle_id_idx on public.mod_entries (vehicle_id);

alter table public.mod_entries enable row level security;

create policy "Les entrées sont visibles si le véhicule est visible"
  on public.mod_entries for select
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = mod_entries.vehicle_id
        and (v.is_public or v.owner_id = auth.uid())
    )
  );

create policy "Seul le propriétaire du véhicule gère les entrées"
  on public.mod_entries for all
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = mod_entries.vehicle_id and v.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = mod_entries.vehicle_id and v.owner_id = auth.uid()
    )
  );

-- ============================================================
-- 4. MAINTENANCE_ITEMS (entretien classique)
-- ============================================================
create table public.maintenance_items (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  kind text not null check (kind in ('vidange', 'pneus', 'controle_technique', 'freins', 'autre')),
  label text not null,
  due_date date,
  due_mileage integer,
  last_done_date date,
  last_done_mileage integer,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index maintenance_items_vehicle_id_idx on public.maintenance_items (vehicle_id);

alter table public.maintenance_items enable row level security;

create policy "Seul le propriétaire du véhicule voit/gère son entretien"
  on public.maintenance_items for all
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = maintenance_items.vehicle_id and v.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = maintenance_items.vehicle_id and v.owner_id = auth.uid()
    )
  );

-- ============================================================
-- 5. FOLLOWS
-- ============================================================
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "Les relations de suivi sont publiques"
  on public.follows for select
  using (true);

create policy "Un utilisateur gère ses propres abonnements"
  on public.follows for all
  using (follower_id = auth.uid())
  with check (follower_id = auth.uid());

-- ============================================================
-- 6. MOD_ENTRY_LIKES
-- ============================================================
create table public.mod_entry_likes (
  mod_entry_id uuid not null references public.mod_entries (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (mod_entry_id, user_id)
);

alter table public.mod_entry_likes enable row level security;

create policy "Les likes sont publics"
  on public.mod_entry_likes for select
  using (true);

create policy "Un utilisateur gère ses propres likes"
  on public.mod_entry_likes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 7. COMMENTS
-- ============================================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  mod_entry_id uuid not null references public.mod_entries (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index comments_mod_entry_id_idx on public.comments (mod_entry_id);

alter table public.comments enable row level security;

create policy "Les commentaires sont visibles si l'entrée est visible"
  on public.comments for select
  using (
    exists (
      select 1 from public.mod_entries e
      join public.vehicles v on v.id = e.vehicle_id
      where e.id = comments.mod_entry_id
        and (v.is_public or v.owner_id = auth.uid())
    )
  );

create policy "Un utilisateur connecté peut commenter"
  on public.comments for insert
  with check (author_id = auth.uid());

create policy "Un utilisateur supprime ses propres commentaires"
  on public.comments for delete
  using (author_id = auth.uid());

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null check (type in ('follow', 'new_mod_entry', 'like', 'comment')),
  vehicle_id uuid references public.vehicles (id) on delete cascade,
  mod_entry_id uuid references public.mod_entries (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, read);

alter table public.notifications enable row level security;

create policy "Un utilisateur voit ses propres notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Un utilisateur marque ses notifications comme lues"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Notifie le propriétaire quand quelqu'un le suit
create function public.notify_on_follow()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end;
$$;

create trigger on_follow_created
  after insert on public.follows
  for each row execute procedure public.notify_on_follow();

-- Notifie le propriétaire d'une entrée quand elle reçoit un like
create function public.notify_on_like()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  vehicle_owner uuid;
begin
  select v.owner_id into vehicle_owner
  from public.mod_entries e
  join public.vehicles v on v.id = e.vehicle_id
  where e.id = new.mod_entry_id;

  if vehicle_owner is not null and vehicle_owner <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, mod_entry_id)
    values (vehicle_owner, new.user_id, 'like', new.mod_entry_id);
  end if;
  return new;
end;
$$;

create trigger on_like_created
  after insert on public.mod_entry_likes
  for each row execute procedure public.notify_on_like();

-- Notifie le propriétaire d'une entrée quand elle reçoit un commentaire
create function public.notify_on_comment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  vehicle_owner uuid;
begin
  select v.owner_id into vehicle_owner
  from public.mod_entries e
  join public.vehicles v on v.id = e.vehicle_id
  where e.id = new.mod_entry_id;

  if vehicle_owner is not null and vehicle_owner <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, mod_entry_id)
    values (vehicle_owner, new.author_id, 'comment', new.mod_entry_id);
  end if;
  return new;
end;
$$;

create trigger on_comment_created
  after insert on public.comments
  for each row execute procedure public.notify_on_comment();

-- Notifie chaque abonné quand un véhicule suivi reçoit une nouvelle entrée
create function public.notify_followers_on_new_entry()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  owner uuid;
begin
  select v.owner_id into owner from public.vehicles v where v.id = new.vehicle_id;

  insert into public.notifications (user_id, actor_id, type, vehicle_id, mod_entry_id)
  select f.follower_id, owner, 'new_mod_entry', new.vehicle_id, new.id
  from public.follows f
  where f.following_id = owner;

  return new;
end;
$$;

create trigger on_mod_entry_created
  after insert on public.mod_entries
  for each row execute procedure public.notify_followers_on_new_entry();

-- ============================================================
-- 9. SUBSCRIPTIONS (cache d'abonnement, source de vérité = RevenueCat)
-- ============================================================
create table public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  is_active boolean not null default false,
  plan text check (plan in ('monthly', 'yearly')),
  current_period_end timestamptz,
  revenuecat_customer_id text,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Un utilisateur voit son propre abonnement"
  on public.subscriptions for select
  using (user_id = auth.uid());

-- Pas d'insert/update côté client : géré par la fonction Edge / le webhook
-- RevenueCat avec la clé service_role.

-- ============================================================
-- 10. STORAGE (photos)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

create policy "Lecture publique des photos"
  on storage.objects for select
  using (bucket_id = 'vehicle-photos');

create policy "Un utilisateur connecté téléverse dans son propre dossier"
  on storage.objects for insert
  with check (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Un utilisateur gère ses propres photos"
  on storage.objects for update
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Un utilisateur supprime ses propres photos"
  on storage.objects for delete
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
