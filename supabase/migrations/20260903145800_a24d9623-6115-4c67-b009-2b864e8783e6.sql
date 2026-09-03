-- Roles
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users read own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Reels
create table public.reels (
  id uuid primary key default gen_random_uuid(),
  title text,
  caption text,
  video_path text not null,
  poster_path text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.reels to anon;
grant select, insert, update, delete on public.reels to authenticated;
grant all on public.reels to service_role;

alter table public.reels enable row level security;

create policy "Anyone can read published reels"
on public.reels for select to anon, authenticated
using (published = true);

create policy "Admins read all reels"
on public.reels for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins insert reels"
on public.reels for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins update reels"
on public.reels for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete reels"
on public.reels for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create table public.reel_products (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.reels(id) on delete cascade,
  handle text not null,
  title text not null,
  price_label text,
  image_url text,
  variant_id text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index reel_products_reel_id_idx on public.reel_products(reel_id);

grant select on public.reel_products to anon;
grant select, insert, update, delete on public.reel_products to authenticated;
grant all on public.reel_products to service_role;

alter table public.reel_products enable row level security;

create policy "Anyone can read tags of published reels"
on public.reel_products for select to anon, authenticated
using (exists (select 1 from public.reels r where r.id = reel_id and r.published = true));

create policy "Admins read all reel tags"
on public.reel_products for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins insert reel tags"
on public.reel_products for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins update reel tags"
on public.reel_products for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete reel tags"
on public.reel_products for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Storage policies for the private "reels" bucket
create policy "Public can read reel media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'reels');

create policy "Admins upload reel media"
on storage.objects for insert to authenticated
with check (bucket_id = 'reels' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update reel media"
on storage.objects for update to authenticated
using (bucket_id = 'reels' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete reel media"
on storage.objects for delete to authenticated
using (bucket_id = 'reels' and public.has_role(auth.uid(), 'admin'));