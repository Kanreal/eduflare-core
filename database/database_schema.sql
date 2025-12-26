-- ==========================================================
-- EduFlare Production Schema (Supabase PostgreSQL + RLS)
-- Fixed + Hardened (Production-Full)
-- ==========================================================

-- --------------------------
-- 0) EXTENSIONS
-- --------------------------
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- --------------------------
-- 1) ENUMS (Strict state machines)
-- --------------------------
create type public.user_role as enum ('student', 'staff', 'admin');

create type public.lead_status as enum ('new', 'hot', 'cold', 'converted', 'lost');
create type public.study_goal as enum ('diploma', 'bachelor', 'masters', 'phd');
create type public.preferred_country as enum ('china', 'india', 'turkey', 'other');

create type public.student_status as enum (
  'pending_contract',
  'contract_signed',
  'active_profile',
  'submitted_to_admin',
  'returned_by_admin',
  'submitted_to_uni',
  'returned_by_school',
  'offer_received',
  'offer_released',
  'completed',
  'cancelled'
);

create type public.contract_status as enum ('draft', 'pending_signature', 'signed', 'expired', 'cancelled');

create type public.document_type as enum (
  'passport',
  'transcript',
  'certificate',
  'bank_statement',
  'recommendation',
  'personal_statement',
  'admission_letter',
  'jw202',
  'contract',
  'receipt',
  'other'
);

create type public.document_status as enum ('pending', 'verified', 'error', 'locked', 'action_required');

create type public.university_application_status as enum (
  'draft',
  'pending_admin',
  'approved',
  'rejected',
  'submitted_to_uni',
  'returned_by_school',
  'accepted',
  'declined'
);

create type public.scholarship_type as enum ('self_support', 'partial_b', 'partial_a', 'full_b', 'full_a');

create type public.payment_type as enum ('opening_book', 'deposit', 'balance', 'refund');
create type public.invoice_status as enum ('pending', 'paid', 'overdue', 'refunded', 'cancelled');

create type public.ledger_entry_type as enum ('credit', 'debit');
create type public.ledger_category as enum ('payment', 'refund', 'commission', 'fee');

create type public.refund_reason as enum ('university_rejection', 'student_withdrawal', 'other');

create type public.appointment_type as enum ('consultation', 'document_submission', 'interview_prep', 'other');
create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');

create type public.notification_type as enum ('info', 'success', 'warning', 'error');

-- --------------------------
-- 2) BASE TABLES (Profiles + Role metadata)
-- --------------------------
-- profiles extends auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null,
  role public.user_role not null default 'student',
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional staff-only metadata
create table if not exists public.staff_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  department text,
  total_commission_earned numeric(12,2) not null default 0,
  pending_commission numeric(12,2) not null default 0,
  paid_commission numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional admin-only metadata
create table if not exists public.admin_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  permissions text[] not null default '{}',
  can_impersonate boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------
-- 3) LEADS (Phase A)
-- --------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  email text,
  phone text,

  status public.lead_status not null default 'new',
  source text not null default 'website'
    check (source in ('website', 'referral', 'event', 'manual', 'other')),

  study_goal public.study_goal,
  preferred_country public.preferred_country,
  message text,

  assigned_staff_id uuid references public.profiles(id),
  notes text,
  last_contact_at timestamptz,
  converted_at timestamptz,
  converted_to_student_id uuid references public.profiles(id),

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------
-- 4) STUDENTS (Master profile + locking)
-- --------------------------
create table if not exists public.students (
  id uuid primary key references public.profiles(id) on delete cascade,

  status public.student_status not null default 'pending_contract',
  assigned_staff_id uuid references public.profiles(id),

  -- Core identity
  nationality text,
  date_of_birth date,
  gender text check (gender in ('Male','Female','Other') or gender is null),
  marital_status text check (marital_status in ('Single','Married','Divorced','Widowed') or marital_status is null),
  native_language text,
  religion text,

  -- Passport
  passport_number text,
  passport_issued_at date,
  passport_expiry date,
  passport_place_of_birth text,

  -- Addresses
  current_address text,
  permanent_address text,
  home_country_address text,

  -- Emergency contact
  emergency_name text,
  emergency_relationship text,
  emergency_phone text,

  -- Financial supporter
  financial_supporter_name text,
  financial_supporter_type text,

  -- Optional background (keep minimal; avoid sensitive defaults)
  health_conditions text,
  criminal_record boolean default false,
  criminal_details text,

  -- Locking / controlled edits
  is_profile_locked boolean not null default false,
  locked_at timestamptz,
  locked_by uuid references public.profiles(id),
  unlocked_fields text[] not null default '{}',  -- admin-granted partial unlocks

  -- Offer visibility gate
  offers_unlocked boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Relational sub-tables (instead of JSONB)
create table if not exists public.student_education (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  institution text not null,
  degree text not null,
  field_of_study text,
  start_date date,
  end_date date,
  grade_gpa text,
  created_at timestamptz not null default now()
);

create table if not exists public.student_family (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  name text not null,
  relation text not null,
  phone text,
  occupation text,
  created_at timestamptz not null default now()
);

create table if not exists public.student_employment (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  employer text not null,
  job_title text not null,
  start_date date,
  end_date date,
  responsibilities text,
  created_at timestamptz not null default now()
);

-- --------------------------
-- 5) UNIVERSITIES + APPLICATIONS (2+3 strategy)
-- --------------------------
create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  city text,
  programs text[] not null default '{}',
  is_partner boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.university_applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  university_id uuid not null references public.universities(id),

  program text not null,
  status public.university_application_status not null default 'draft',
  priority int not null check (priority between 1 and 5),
  batch int not null check (batch in (1,2)),

  submitted_to_admin_at timestamptz,
  approved_at timestamptz,
  submitted_to_uni_at timestamptz,
  response_at timestamptz,

  returned_at timestamptz,
  return_reason text,
  returned_fields text[] not null default '{}',

  admin_notes text,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------
-- 6) CONTRACT TEMPLATES (Admin-managed) + CONTRACTS
-- --------------------------
create table if not exists public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version int not null default 1,
  body_md text not null, -- store template as markdown (or HTML)
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, version)
);

-- Pricing configuration (versioned)
create table if not exists public.pricing_config (
  id uuid primary key default gen_random_uuid(),
  version int not null,
  scholarship_type public.scholarship_type not null,

  total_service_fee numeric(12,2) not null,
  deposit_amount numeric(12,2) not null,
  credit_applied numeric(12,2) not null,
  client_pays numeric(12,2) not null,
  non_refundable_amount numeric(12,2) not null,

  is_active boolean not null default true,
  effective_from date not null default current_date,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),

  unique (version, scholarship_type)
);

-- Contracts snapshot pricing at signing time (financial truth)
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  staff_id uuid not null references public.profiles(id),

  template_id uuid references public.contract_templates(id),

  status public.contract_status not null default 'draft',

  scholarship_type public.scholarship_type,
  pricing_config_id uuid references public.pricing_config(id),

  -- SNAPSHOT pricing fields (do not change after signed)
  total_service_fee numeric(12,2) not null,
  deposit_amount numeric(12,2) not null,
  credit_applied numeric(12,2) not null,
  client_pays numeric(12,2) not null,
  non_refundable_amount numeric(12,2) not null default 500,

  -- signature + pdf
  signed_at timestamptz,
  signature_data text,
  pdf_url text,
  pdf_file_name text,

  expires_at timestamptz,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------
-- 7) DOCUMENTS (Supabase Storage paths)
-- --------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,

  name text not null,
  type public.document_type not null,

  -- prefer storage path; you can derive signed URLs in app
  file_path text,
  file_name text,
  file_size int,

  status public.document_status not null default 'pending',
  verified_at timestamptz,
  verified_by uuid references public.profiles(id),

  is_locked boolean not null default false,
  locked_at timestamptz,

  -- Hidden until payment/unlock (offer letters etc.)
  is_hidden boolean not null default false,

  error_message text,

  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------
-- 8) FINANCIAL SYSTEM (Invoices + Immutable Ledger)
-- --------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,

  type public.payment_type not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'USD' check (currency in ('TZS','USD','EUR')),
  status public.invoice_status not null default 'pending',

  due_date date not null,
  paid_at timestamptz,

  description text not null,

  receipt_file_path text,
  receipt_file_name text,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),

  -- reversal tracking (immutable workflow)
  is_reversal boolean not null default false,
  reverses_invoice_id uuid references public.invoices(id)
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),

  entry_type public.ledger_entry_type not null,
  category public.ledger_category not null,

  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'USD' check (currency in ('TZS','USD','EUR')),
  description text not null,

  student_id uuid references public.students(id),
  staff_id uuid references public.profiles(id),

  invoice_id uuid references public.invoices(id),
  contract_id uuid references public.contracts(id),

  is_reversal boolean not null default false,
  reverses_entry_id uuid references public.ledger_entries(id),

  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- --------------------------
-- 9) COMMISSIONS
-- --------------------------
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.profiles(id),
  student_id uuid not null references public.students(id),
  contract_id uuid not null references public.contracts(id),

  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','approved','paid','voided','clawback')),

  triggered_at timestamptz not null default now(),
  approved_at timestamptz,
  paid_at timestamptz,
  voided_at timestamptz,
  clawback_at timestamptz,

  clawback_reason text,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),

  unique (contract_id) -- prevent duplicates
);

-- --------------------------
-- 10) REFUND REQUESTS
-- --------------------------
create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),

  amount numeric(12,2) not null check (amount > 0),
  reason public.refund_reason not null,

  status text not null default 'pending' check (status in ('pending','approved','rejected')),

  retained_costs numeric(12,2) not null default 500,
  refundable_amount numeric(12,2) generated always as (amount - retained_costs) stored,

  requested_at timestamptz not null default now(),
  requested_by uuid references public.profiles(id),

  processed_at timestamptz,
  processed_by uuid references public.profiles(id),
  notes text,

  created_at timestamptz not null default now()
);

-- --------------------------
-- 11) APPOINTMENTS
-- --------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  staff_id uuid not null references public.profiles(id),

  title text not null,
  description text,
  date_time timestamptz not null,
  duration int not null default 60,

  type public.appointment_type not null,
  status public.appointment_status not null default 'scheduled',

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------
-- 12) NOTIFICATIONS
-- --------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),

  title text not null,
  message text not null,
  type public.notification_type not null default 'info',

  read boolean not null default false,

  link text,
  action_required boolean not null default false,

  created_at timestamptz not null default now()
);

-- --------------------------
-- 13) FIX REQUESTS (Student -> Admin/Staff workflow)
-- --------------------------
create table if not exists public.fix_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),

  field text not null,
  current_value text,
  requested_value text,
  reason text not null,

  status text not null default 'pending' check (status in ('pending','approved','rejected')),

  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),

  processed_at timestamptz,
  processed_by uuid references public.profiles(id)
);

-- --------------------------
-- 14) UNLOCK REQUESTS (Staff/Student -> Admin)
-- --------------------------
create table if not exists public.unlock_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),

  requested_by uuid not null references public.profiles(id),
  requested_by_role public.user_role not null,
  requested_fields text[] not null default '{}',
  reason text not null,

  status text not null default 'pending' check (status in ('pending','approved','rejected')),

  created_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references public.profiles(id),
  admin_notes text
);

-- --------------------------
-- 15) AUDIT LOGS (Immutable)
-- --------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  actor_id uuid references public.profiles(id),
  actor_role public.user_role,
  action text not null,

  entity_type text not null check (entity_type in (
    'lead','student','document','contract','application',
    'invoice','ledger','refund','commission','settings','user','template'
  )),
  entity_id uuid,

  details jsonb,
  is_override boolean not null default false,
  override_reason text,

  created_at timestamptz not null default now()
);

-- ==========================================================
-- INDEXES
-- ==========================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_assigned_staff on public.leads(assigned_staff_id);
create index if not exists idx_students_status on public.students(status);
create index if not exists idx_students_assigned_staff on public.students(assigned_staff_id);

create index if not exists idx_docs_student on public.documents(student_id);
create index if not exists idx_docs_status on public.documents(status);
create index if not exists idx_apps_student on public.university_applications(student_id);
create index if not exists idx_apps_status on public.university_applications(status);
create index if not exists idx_apps_priority_batch on public.university_applications(priority, batch);

create index if not exists idx_invoices_student on public.invoices(student_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_ledger_student on public.ledger_entries(student_id);
create index if not exists idx_ledger_staff on public.ledger_entries(staff_id);
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_notifications_user on public.notifications(user_id, read);

-- ==========================================================
-- UPDATED_AT triggers (simple)
-- ==========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_updated on public.leads;
create trigger trg_leads_updated before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists trg_students_updated on public.students;
create trigger trg_students_updated before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists trg_universities_updated on public.universities;
create trigger trg_universities_updated before update on public.universities
for each row execute function public.set_updated_at();

drop trigger if exists trg_university_apps_updated on public.university_applications;
create trigger trg_university_apps_updated before update on public.university_applications
for each row execute function public.set_updated_at();

drop trigger if exists trg_contract_templates_updated on public.contract_templates;
create trigger trg_contract_templates_updated before update on public.contract_templates
for each row execute function public.set_updated_at();

drop trigger if exists trg_contracts_updated on public.contracts;
create trigger trg_contracts_updated before update on public.contracts
for each row execute function public.set_updated_at();

drop trigger if exists trg_documents_updated on public.documents;
create trigger trg_documents_updated before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists trg_appointments_updated on public.appointments;
create trigger trg_appointments_updated before update on public.appointments
for each row execute function public.set_updated_at();

-- ==========================================================
-- HELPERS FOR RLS (clean policies)
-- ==========================================================
create or replace function public.is_admin()
returns boolean
language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active = true
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'staff' and p.is_active = true
  );
$$;

create or replace function public.is_student()
returns boolean
language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'student' and p.is_active = true
  );
$$;

create or replace function public.staff_assigned_student(student_uuid uuid)
returns boolean
language sql stable as $$
  select exists (
    select 1 from public.students s
    where s.id = student_uuid and s.assigned_staff_id = auth.uid()
  );
$$;

-- ==========================================================
-- IMMUTABILITY ENFORCEMENT
-- ==========================================================
create or replace function public.no_update_delete()
returns trigger as $$
begin
  raise exception 'Updates/deletes are not allowed on %', tg_table_name;
end;
$$ language plpgsql;

-- Ledger entries immutable
drop trigger if exists trg_ledger_immutable on public.ledger_entries;
create trigger trg_ledger_immutable
before update or delete on public.ledger_entries
for each row execute function public.no_update_delete();

-- Audit logs immutable
drop trigger if exists trg_audit_immutable on public.audit_logs;
create trigger trg_audit_immutable
before update or delete on public.audit_logs
for each row execute function public.no_update_delete();

-- Optional: block editing contracts after signed
create or replace function public.block_contract_edits_after_signed()
returns trigger as $$
begin
  if old.status = 'signed' then
    raise exception 'Signed contracts cannot be modified. Create a new contract version if needed.';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_contract_signed_lock on public.contracts;
create trigger trg_contract_signed_lock
before update or delete on public.contracts
for each row
when (old.status = 'signed')
execute function public.no_update_delete();

-- ==========================================================
-- STUDENT STATUS TRANSITION VALIDATION (example)
-- Extend this as your workflow finalizes.
-- ==========================================================
create or replace function public.validate_student_status_transition()
returns trigger as $$
begin
  if old.status = new.status then
    return new;
  end if;

  -- Pending -> contract_signed/cancelled
  if old.status = 'pending_contract' and new.status not in ('contract_signed','cancelled') then
    raise exception 'Invalid student status transition from % to %', old.status, new.status;
  end if;

  -- Contract signed -> active_profile/cancelled
  if old.status = 'contract_signed' and new.status not in ('active_profile','cancelled') then
    raise exception 'Invalid student status transition from % to %', old.status, new.status;
  end if;

  -- Active profile -> submitted_to_admin/cancelled
  if old.status = 'active_profile' and new.status not in ('submitted_to_admin','cancelled') then
    raise exception 'Invalid student status transition from % to %', old.status, new.status;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_student_status_validation on public.students;
create trigger trg_student_status_validation
before update on public.students
for each row
execute function public.validate_student_status_transition();

-- ==========================================================
-- ADDITIONAL VALIDATION TRIGGERS
-- ==========================================================

-- Passport expiry validation (6 months minimum)
create or replace function public.validate_passport_expiry()
returns trigger as $$
begin
  if new.passport_expiry < (current_date + interval '6 months') then
    raise exception 'Passport expiry must be at least 6 months from now';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists validate_passport_expiry_trigger on public.students;
create trigger validate_passport_expiry_trigger
  before insert or update on public.students
  for each row
  when (new.passport_expiry is not null)
  execute function public.validate_passport_expiry();

-- Enhanced commission trigger (more robust)
create or replace function public.create_commission_on_contract_sign()
returns trigger as $$
begin
  -- Only create commission if contract is signed AND deposit is paid
  if new.status = 'signed' and
     exists (select 1 from public.students where id = new.student_id and deposit_paid >= 750) and
     not exists (select 1 from public.commissions where contract_id = new.id) then

    insert into public.commissions (staff_id, student_id, contract_id, amount, triggered_at)
    values (new.staff_id, new.student_id, new.id, 20000, now());
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists commission_on_contract_sign_trigger on public.contracts;
create trigger commission_on_contract_sign_trigger
  after update on public.contracts
  for each row
  when (new.status = 'signed')
  execute function public.create_commission_on_contract_sign();

-- ==========================================================
-- AUDIT LOGGING (trigger helper)
-- ==========================================================
create or replace function public.write_audit_log()
returns trigger as $$
declare
  actor_role public.user_role;
begin
  select p.role into actor_role
  from public.profiles p
  where p.id = auth.uid();

  insert into public.audit_logs (
    actor_id,
    actor_role,
    action,
    entity_type,
    entity_id,
    details,
    created_at
  )
  values (
    auth.uid(),
    actor_role,
    tg_op || ' ' || tg_table_name,
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then old.id else new.id end), null),
    jsonb_build_object(
      'old', case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
      'new', case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
    ),
    now()
  );

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Audit on critical tables (add/remove as needed)
drop trigger if exists audit_leads on public.leads;
create trigger audit_leads
after insert or update or delete on public.leads
for each row execute function public.write_audit_log();

drop trigger if exists audit_students on public.students;
create trigger audit_students
after insert or update or delete on public.students
for each row execute function public.write_audit_log();

drop trigger if exists audit_documents on public.documents;
create trigger audit_documents
after insert or update or delete on public.documents
for each row execute function public.write_audit_log();

drop trigger if exists audit_contracts on public.contracts;
create trigger audit_contracts
after insert or update or delete on public.contracts
for each row execute function public.write_audit_log();

drop trigger if exists audit_invoices on public.invoices;
create trigger audit_invoices
after insert or update or delete on public.invoices
for each row execute function public.write_audit_log();

-- ==========================================================
-- RLS ENABLEMENT
-- ==========================================================
alter table public.profiles enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.admin_profiles enable row level security;

alter table public.leads enable row level security;
alter table public.students enable row level security;

alter table public.student_education enable row level security;
alter table public.student_family enable row level security;
alter table public.student_employment enable row level security;

alter table public.universities enable row level security;
alter table public.university_applications enable row level security;

alter table public.contract_templates enable row level security;
alter table public.pricing_config enable row level security;
alter table public.contracts enable row level security;

alter table public.documents enable row level security;

alter table public.invoices enable row level security;
alter table public.ledger_entries enable row level security;

alter table public.commissions enable row level security;
alter table public.refund_requests enable row level security;

alter table public.appointments enable row level security;
alter table public.notifications enable row level security;

alter table public.fix_requests enable row level security;
alter table public.unlock_requests enable row level security;

alter table public.audit_logs enable row level security;

-- ==========================================================
-- RLS POLICIES (Least-privilege, production-safe)
-- ==========================================================

-- ---------- PROFILES ----------
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

-- ---------- STAFF_PROFILES / ADMIN_PROFILES ----------
drop policy if exists "staff_profiles_admin_all" on public.staff_profiles;
create policy "staff_profiles_admin_all"
on public.staff_profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "staff_profiles_self_select" on public.staff_profiles;
create policy "staff_profiles_self_select"
on public.staff_profiles for select
using (auth.uid() = id);

drop policy if exists "admin_profiles_admin_all" on public.admin_profiles;
create policy "admin_profiles_admin_all"
on public.admin_profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_profiles_self_select" on public.admin_profiles;
create policy "admin_profiles_self_select"
on public.admin_profiles for select
using (auth.uid() = id);

-- ---------- LEADS ----------
drop policy if exists "leads_admin_all" on public.leads;
create policy "leads_admin_all"
on public.leads for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "leads_staff_select_assigned_or_unassigned" on public.leads;
create policy "leads_staff_select_assigned_or_unassigned"
on public.leads for select
using (
  public.is_staff() and (assigned_staff_id = auth.uid() or assigned_staff_id is null)
);

drop policy if exists "leads_staff_insert" on public.leads;
create policy "leads_staff_insert"
on public.leads for insert
with check (public.is_staff());

drop policy if exists "leads_staff_update_assigned_only" on public.leads;
create policy "leads_staff_update_assigned_only"
on public.leads for update
using (public.is_staff() and assigned_staff_id = auth.uid())
with check (public.is_staff() and assigned_staff_id = auth.uid());

-- ---------- STUDENTS ----------
drop policy if exists "students_admin_all" on public.students;
create policy "students_admin_all"
on public.students for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "students_student_select_own" on public.students;
create policy "students_student_select_own"
on public.students for select
using (auth.uid() = id);

drop policy if exists "students_staff_select_assigned" on public.students;
create policy "students_staff_select_assigned"
on public.students for select
using (public.is_staff() and assigned_staff_id = auth.uid());

-- Staff update only assigned and only when unlocked, unless admin has unlocked specific fields
drop policy if exists "students_staff_update_assigned_if_unlocked" on public.students;
create policy "students_staff_update_assigned_if_unlocked"
on public.students for update
using (
  public.is_staff()
  and assigned_staff_id = auth.uid()
  and is_profile_locked = false
)
with check (
  public.is_staff()
  and assigned_staff_id = auth.uid()
  and is_profile_locked = false
);

-- ---------- STUDENT SUB-TABLES ----------
-- Admin full
drop policy if exists "student_edu_admin_all" on public.student_education;
create policy "student_edu_admin_all"
on public.student_education for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "student_family_admin_all" on public.student_family;
create policy "student_family_admin_all"
on public.student_family for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "student_emp_admin_all" on public.student_employment;
create policy "student_emp_admin_all"
on public.student_employment for all
using (public.is_admin())
with check (public.is_admin());

-- Student select own
drop policy if exists "student_edu_student_select" on public.student_education;
create policy "student_edu_student_select"
on public.student_education for select
using (student_id = auth.uid());

drop policy if exists "student_family_student_select" on public.student_family;
create policy "student_family_student_select"
on public.student_family for select
using (student_id = auth.uid());

drop policy if exists "student_emp_student_select" on public.student_employment;
create policy "student_emp_student_select"
on public.student_employment for select
using (student_id = auth.uid());

-- Staff manage assigned student subrows if student not locked
drop policy if exists "student_edu_staff_manage_assigned" on public.student_education;
create policy "student_edu_staff_manage_assigned"
on public.student_education for all
using (
  public.is_staff()
  and public.staff_assigned_student(student_id)
  and exists (select 1 from public.students s where s.id = student_id and s.is_profile_locked = false)
)
with check (
  public.is_staff()
  and public.staff_assigned_student(student_id)
  and exists (select 1 from public.students s where s.id = student_id and s.is_profile_locked = false)
);

drop policy if exists "student_family_staff_manage_assigned" on public.student_family;
create policy "student_family_staff_manage_assigned"
on public.student_family for all
using (
  public.is_staff()
  and public.staff_assigned_student(student_id)
  and exists (select 1 from public.students s where s.id = student_id and s.is_profile_locked = false)
)
with check (
  public.is_staff()
  and public.staff_assigned_student(student_id)
  and exists (select 1 from public.students s where s.id = student_id and s.is_profile_locked = false)
);

drop policy if exists "student_emp_staff_manage_assigned" on public.student_employment;
create policy "student_emp_staff_manage_assigned"
on public.student_employment for all
using (
  public.is_staff()
  and public.staff_assigned_student(student_id)
  and exists (select 1 from public.students s where s.id = student_id and s.is_profile_locked = false)
)
with check (
  public.is_staff()
  and public.staff_assigned_student(student_id)
  and exists (select 1 from public.students s where s.id = student_id and s.is_profile_locked = false)
);

-- ---------- UNIVERSITIES ----------
-- Admin all; Staff/Students read-only
drop policy if exists "universities_admin_all" on public.universities;
create policy "universities_admin_all"
on public.universities for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "universities_read_all" on public.universities;
create policy "universities_read_all"
on public.universities for select
using (true);

-- ---------- UNIVERSITY APPLICATIONS ----------
drop policy if exists "apps_admin_all" on public.university_applications;
create policy "apps_admin_all"
on public.university_applications for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "apps_student_select_own" on public.university_applications;
create policy "apps_student_select_own"
on public.university_applications for select
using (student_id = auth.uid());

drop policy if exists "apps_staff_manage_assigned" on public.university_applications;
create policy "apps_staff_manage_assigned"
on public.university_applications for all
using (public.is_staff() and public.staff_assigned_student(student_id))
with check (public.is_staff() and public.staff_assigned_student(student_id));

-- ---------- CONTRACT TEMPLATES ----------
drop policy if exists "templates_admin_all" on public.contract_templates;
create policy "templates_admin_all"
on public.contract_templates for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "templates_staff_read" on public.contract_templates;
create policy "templates_staff_read"
on public.contract_templates for select
using (public.is_staff());

-- ---------- PRICING CONFIG ----------
drop policy if exists "pricing_admin_all" on public.pricing_config;
create policy "pricing_admin_all"
on public.pricing_config for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "pricing_read_for_staff" on public.pricing_config;
create policy "pricing_read_for_staff"
on public.pricing_config for select
using (public.is_staff());

-- ---------- CONTRACTS ----------
drop policy if exists "contracts_admin_all" on public.contracts;
create policy "contracts_admin_all"
on public.contracts for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "contracts_student_select_own" on public.contracts;
create policy "contracts_student_select_own"
on public.contracts for select
using (student_id = auth.uid());

drop policy if exists "contracts_staff_manage_own_students" on public.contracts;
create policy "contracts_staff_manage_own_students"
on public.contracts for all
using (public.is_staff() and public.staff_assigned_student(student_id))
with check (public.is_staff() and public.staff_assigned_student(student_id));

-- ---------- DOCUMENTS ----------
drop policy if exists "docs_admin_all" on public.documents;
create policy "docs_admin_all"
on public.documents for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "docs_staff_manage_assigned" on public.documents;
create policy "docs_staff_manage_assigned"
on public.documents for all
using (public.is_staff() and public.staff_assigned_student(student_id))
with check (public.is_staff() and public.staff_assigned_student(student_id));

drop policy if exists "docs_student_select_own_visible" on public.documents;
create policy "docs_student_select_own_visible"
on public.documents for select
using (
  student_id = auth.uid()
  and (
    is_hidden = false
    or exists (select 1 from public.students s where s.id = auth.uid() and s.offers_unlocked = true)
  )
);

-- ---------- INVOICES / LEDGER (Admin only; students can view their own invoices optionally)
drop policy if exists "invoices_admin_all" on public.invoices;
create policy "invoices_admin_all"
on public.invoices for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "invoices_student_select_own" on public.invoices;
create policy "invoices_student_select_own"
on public.invoices for select
using (student_id = auth.uid());

drop policy if exists "ledger_admin_select" on public.ledger_entries;
create policy "ledger_admin_select"
on public.ledger_entries for select
using (public.is_admin());

drop policy if exists "ledger_admin_insert" on public.ledger_entries;
create policy "ledger_admin_insert"
on public.ledger_entries for insert
with check (public.is_admin());

-- ---------- COMMISSIONS (Admin full; staff read own)
drop policy if exists "commissions_admin_all" on public.commissions;
create policy "commissions_admin_all"
on public.commissions for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "commissions_staff_select_own" on public.commissions;
create policy "commissions_staff_select_own"
on public.commissions for select
using (public.is_staff() and staff_id = auth.uid());

-- ---------- REFUNDS (Admin only)
drop policy if exists "refunds_admin_all" on public.refund_requests;
create policy "refunds_admin_all"
on public.refund_requests for all
using (public.is_admin())
with check (public.is_admin());

-- ---------- APPOINTMENTS (Admin all; staff manage own; student select own)
drop policy if exists "appointments_admin_all" on public.appointments;
create policy "appointments_admin_all"
on public.appointments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "appointments_staff_manage" on public.appointments;
create policy "appointments_staff_manage"
on public.appointments for all
using (public.is_staff() and staff_id = auth.uid())
with check (public.is_staff() and staff_id = auth.uid());

drop policy if exists "appointments_student_select_own" on public.appointments;
create policy "appointments_student_select_own"
on public.appointments for select
using (student_id = auth.uid());

-- ---------- NOTIFICATIONS (own only; admin can insert)
drop policy if exists "notifications_own_all" on public.notifications;
create policy "notifications_own_all"
on public.notifications for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "notifications_admin_insert" on public.notifications;
create policy "notifications_admin_insert"
on public.notifications for insert
with check (public.is_admin());

-- ---------- FIX REQUESTS (student create; staff/admin read by assignment; admin process)
drop policy if exists "fix_requests_student_insert" on public.fix_requests;
create policy "fix_requests_student_insert"
on public.fix_requests for insert
with check (public.is_student() and student_id = auth.uid());

drop policy if exists "fix_requests_student_select_own" on public.fix_requests;
create policy "fix_requests_student_select_own"
on public.fix_requests for select
using (student_id = auth.uid());

drop policy if exists "fix_requests_staff_select_assigned" on public.fix_requests;
create policy "fix_requests_staff_select_assigned"
on public.fix_requests for select
using (public.is_staff() and public.staff_assigned_student(student_id));

drop policy if exists "fix_requests_admin_all" on public.fix_requests;
create policy "fix_requests_admin_all"
on public.fix_requests for all
using (public.is_admin())
with check (public.is_admin());

-- ---------- UNLOCK REQUESTS (staff/student create; admin process)
drop policy if exists "unlock_requests_insert" on public.unlock_requests;
create policy "unlock_requests_insert"
on public.unlock_requests for insert
with check (
  requested_by = auth.uid()
  and (public.is_staff() or public.is_student())
);

drop policy if exists "unlock_requests_select_own" on public.unlock_requests;
create policy "unlock_requests_select_own"
on public.unlock_requests for select
using (requested_by = auth.uid());

drop policy if exists "unlock_requests_admin_all" on public.unlock_requests;
create policy "unlock_requests_admin_all"
on public.unlock_requests for all
using (public.is_admin())
with check (public.is_admin());

-- ---------- AUDIT LOGS (Admin only)
drop policy if exists "audit_admin_select" on public.audit_logs;
create policy "audit_admin_select"
on public.audit_logs for select
using (public.is_admin());

drop policy if exists "audit_admin_insert" on public.audit_logs;
create policy "audit_admin_insert"
on public.audit_logs for insert
with check (public.is_admin());

-- ==========================================================
-- ARCHIVE STRATEGY (Future-Proofing)
-- ==========================================================

-- Add archiving support for completed records
alter table public.students add column if not exists archived_at timestamptz;
alter table public.university_applications add column if not exists archived_at timestamptz;

-- Archive policy for completed students (after 2 years)
create or replace function public.archive_completed_students()
returns void as $$
begin
  update public.students
  set archived_at = now()
  where status = 'completed'
    and created_at < (now() - interval '2 years')
    and archived_at is null;
end;
$$ language plpgsql;

-- ==========================================================
-- SEED DATA (Pricing config v1)
-- ==========================================================
insert into public.pricing_config
  (version, scholarship_type, total_service_fee, deposit_amount, credit_applied, client_pays, non_refundable_amount, created_by)
values
  (1, 'self_support', 1000, 750, 500, 500, 500, null),
  (1, 'partial_b',   1250, 750, 500, 750, 500, null),
  (1, 'partial_a',   1500, 750, 500, 1000, 500, null),
  (1, 'full_b',      1750, 750, 500, 1250, 500, null),
  (1, 'full_a',      2000, 750, 500, 1500, 500, null)
on conflict do nothing;
