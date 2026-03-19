const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
async function makeBot() {
  const { data } = await supabase.auth.admin.createUser({ email: 'bot@crickarena.local', password: 'password123', email_confirm: true, user_metadata: { full_name: 'Bot' } });
  await supabase.from('profiles').insert({ id: data.user.id, email: data.user.email, full_name: 'Bot Admin', role: 'super_admin' });
}
makeBot();
