-- Programa de indicação: pastor indica outro pastor pelo link
-- (?ref=<user_id>, capturado num cookie pelo proxy.ts e repassado no
-- signUp() — ver services/auth/index.ts), e quando o indicado PAGA de
-- verdade (nunca só cadastro, nunca grant manual), os dois ganham dias
-- grátis de Pro — ver grantReferralRewardIfEligible() em
-- services/billing/referral.ts, chamada de dentro de
-- activateSubscriptionFromPurchase() (o único ponto por onde toda
-- ativação de pagamento real passa).

-- =====================================================================
-- 1. PROFILES.REFERRED_BY
-- =====================================================================
-- Quem indicou esta conta — setado uma única vez, no momento do
-- cadastro (handle_new_user, abaixo), nunca depois.
alter table public.profiles
  add column if not exists referred_by uuid references auth.users(id) on delete set null;

-- Preenchido pelo raw_user_meta_data (mesmo mecanismo já usado para
-- "name") — envolto em bloco protegido: um valor malformado ou uma
-- referência a um usuário que não existe NUNCA pode travar o cadastro
-- em si (profile ainda é criado normalmente, só sem referred_by).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');

  begin
    update public.profiles
      set referred_by = (new.raw_user_meta_data ->> 'referred_by')::uuid
      where id = new.id
        and new.raw_user_meta_data ->> 'referred_by' is not null
        and (new.raw_user_meta_data ->> 'referred_by')::uuid <> new.id;
  exception when others then
    null; -- referred_by malformado ou inexistente: ignora, cadastro segue normal
  end;

  return new;
end;
$$;

-- =====================================================================
-- 2. REFERRAL_REWARDS
-- =====================================================================
-- Uma linha por PESSOA INDICADA (chave primária) — garante que o bônus
-- só é concedido uma única vez por indicação, mesmo que
-- activateSubscriptionFromPurchase rode de novo (retry de webhook,
-- renovação futura etc.).
create table if not exists public.referral_rewards (
  referred_user_id uuid primary key references auth.users(id) on delete cascade,
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referrer_bonus_days int not null,
  referred_bonus_days int not null,
  created_at timestamptz not null default now()
);

create index if not exists referral_rewards_referrer_idx
  on public.referral_rewards (referrer_user_id);

alter table public.referral_rewards enable row level security;

-- Só o referrer pode ver suas próprias indicações premiadas (pra
-- mostrar "você já indicou N pessoas" em /conta) — quem foi indicado
-- não precisa ver essa linha, já sabe que usou um link de indicação.
drop policy if exists "select_own_referral_rewards" on public.referral_rewards;
create policy "select_own_referral_rewards"
  on public.referral_rewards
  for select
  to authenticated
  using (auth.uid() = referrer_user_id);

-- Sem policy de INSERT: só o service role (grantReferralRewardIfEligible,
-- rodando como admin) grava aqui.
