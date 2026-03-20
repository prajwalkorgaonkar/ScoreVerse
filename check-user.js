const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ijuwuupkzabyvsfilmqe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqdXd1dXBremFieXZzZmlsbXFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc3NjIzNywiZXhwIjoyMDg5MzUyMjM3fQ.7yn9G43FUtDJfX3iGSBZZyaDfLx6NUJtUX1XkMLr4wM';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const email = 'scoreversebusiness@gmail.com';
  
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  
  console.log('--- USER IN AUTH.USERS ---');
  console.log('ID:', user?.id);
  console.log('Email:', user?.email);
  
  if (user) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id);
    console.log('\n--- PROFILE IN PROFILES TABLE ---');
    console.log(data);
    if (error) console.error(error);
    
    if (!data || data.length === 0) {
      console.log('Profile missing! Creating one...');
      const { data: inserted, error: iErr } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: 'ScoreVerse Admin',
        role: 'super_admin',
        is_approved: true
      }).select();
      console.log('Insert Result:', inserted);
      if (iErr) console.error('Insert Error:', iErr);
    } else {
        console.log('Profile exists!');
    }
  }
}
run();
