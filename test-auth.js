const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ijuwuupkzabyvsfilmqe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqdXd1dXBremFieXZzZmlsbXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzYyMzcsImV4cCI6MjA4OTM1MjIzN30.P86b6MN3K5uJPqyy0sRvmJi4irWOSfdNH0SBRPv5oxs';

// Use ANON key to simulate a browser user subject to RLS
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const email = 'scoreversebusiness@gmail.com';
  const password = 'Password123!';
  
  console.log('Logging in as', email);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (authError) {
    console.error('Login error:', authError);
    return;
  }
  
  console.log('Logged in successfully. User ID:', authData.user.id);
  console.log('Session token:', authData.session.access_token.substring(0, 15) + '...');
  
  // Now attempt to read from profiles table (subject to RLS)
  const { data, error } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
  
  if (error) {
    console.error('\n--- RLS ERROR OCCURRED ---');
    console.error(error);
  } else {
    console.log('\n--- PROFILE FETCHED SUCCESSFULLY ---');
    console.log(data);
  }
}
run();
