-- ============================================================================
-- ملاحظاتي — إعداد قاعدة بيانات Supabase
-- نفّذ هذا الملف كاملًا من: Supabase Dashboard > SQL Editor > New query
-- المفتاح السري غير مطلوب هنا، ولا ينبغي وضعه في ملفات الواجهة.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- الملفات الشخصية
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'مستخدم',
  hue integer not null default 235,
  welcome_seeded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists welcome_seeded boolean not null default false;

alter table public.profiles enable row level security;

revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- إنشاء الملف الشخصي تلقائيًا عند تسجيل حساب جديد.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, hue)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), ''),
      'مستخدم'
    ),
    floor(random() * 360)::integer
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- تعبئة الملفات الشخصية للحسابات الموجودة مسبقًا.
insert into public.profiles (id, name, hue)
select
  id,
  coalesce(
    nullif(trim(raw_user_meta_data ->> 'name'), ''),
    nullif(trim(split_part(coalesce(email, ''), '@', 1)), ''),
    'مستخدم'
  ),
  floor(random() * 360)::integer
from auth.users
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- الملاحظات
-- ----------------------------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  tags text[] not null default '{}'::text[],
  color text not null default 'default'
    check (color in ('default', 'indigo', 'rose', 'mint', 'amber', 'sky', 'lilac')),
  pinned boolean not null default false,
  favorite boolean not null default false,
  archived boolean not null default false,
  trashed boolean not null default false,
  trashed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_updated_idx
  on public.notes (user_id, updated_at desc);

create index if not exists notes_user_trashed_idx
  on public.notes (user_id, trashed, trashed_at);

alter table public.notes enable row level security;

revoke all on public.notes from anon;
grant select, insert, update, delete on public.notes to authenticated;

drop policy if exists "notes_select_own" on public.notes;
create policy "notes_select_own"
on public.notes for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "notes_insert_own" on public.notes;
create policy "notes_insert_own"
on public.notes for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "notes_update_own" on public.notes;
create policy "notes_update_own"
on public.notes for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "notes_delete_own" on public.notes;
create policy "notes_delete_own"
on public.notes for delete
to authenticated
using ((select auth.uid()) = user_id);

-- تحديث وقت آخر تعديل فقط عند تغيّر المحتوى.
create or replace function public.touch_note_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.title is distinct from old.title
     or new.content is distinct from old.content
     or new.tags is distinct from old.tags then
    new.updated_at = now();
  else
    new.updated_at = old.updated_at;
  end if;
  return new;
end;
$$;

drop trigger if exists notes_touch_updated_at on public.notes;
create trigger notes_touch_updated_at
before update on public.notes
for each row execute function public.touch_note_updated_at();

-- ----------------------------------------------------------------------------
-- حذف الحساب ذاتيًا
-- يحذف المستخدم الحالي فقط. الحذف من auth.users يُزيل الملف والملاحظات تلقائيًا.
-- ----------------------------------------------------------------------------
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
