-- Security hardening (no behaviour change for the website).

-- 1) API roles never need TRUNCATE / TRIGGER / REFERENCES (TRUNCATE ignores RLS).
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;

-- 2) Trigger-only functions must not be callable through /rest/v1/rpc.
revoke execute on function public.auto_confirm_email()        from public, anon, authenticated;
revoke execute on function public.handle_new_user()           from public, anon, authenticated;
revoke execute on function public.protect_profile_privileges() from public, anon, authenticated;

-- 3) Admin RPCs already check is_admin() inside, but anonymous visitors have no reason to call them.
revoke execute on function public.admin_delete_listing(uuid)                  from public, anon;
revoke execute on function public.admin_delete_profile(uuid)                  from public, anon;
revoke execute on function public.admin_toggle_featured(uuid)                 from public, anon;
revoke execute on function public.admin_toggle_sold(uuid)                     from public, anon;
revoke execute on function public.admin_toggle_sponsored(uuid)                from public, anon;
revoke execute on function public.admin_update_listing_status(uuid, text, text) from public, anon;
revoke execute on function public.admin_verify_dealer(uuid)                   from public, anon;

-- 4) E-mails are auto-confirmed on sign-up, so nobody may register the reserved platform address
--    (the website UI treats it as the built-in admin identity).
create or replace function public.block_reserved_signup_emails()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(new.email, '')) in ('admin@sellsolar.pk') then
    raise exception 'This e-mail address is reserved.' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.block_reserved_signup_emails() from public, anon, authenticated;

drop trigger if exists block_reserved_signup_emails on auth.users;
create trigger block_reserved_signup_emails
  before insert on auth.users
  for each row execute function public.block_reserved_signup_emails();
