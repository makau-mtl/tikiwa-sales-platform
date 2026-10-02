alter table projects
  add column nearby_landmarks text[] not null default '{}',
  add column development_type text not null default 'controlled'
    check (development_type in ('controlled', 'free')),
  add column titles_ready boolean not null default false,
  add column title_type text
    check (title_type in ('freehold', 'leasehold')),
  add column cash_price numeric(12,2) check (cash_price is null or cash_price >= 0),
  add column deposit_amount numeric(12,2) check (deposit_amount is null or deposit_amount >= 0),
  add column installment_months integer check (installment_months is null or installment_months > 0);