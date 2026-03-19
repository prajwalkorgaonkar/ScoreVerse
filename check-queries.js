const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkQueries() {
  console.log('Running all dashboard queries...');
  
  const results = await Promise.all([
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'manager'),
    supabase.from('matches')
      .select('*, team1:teams!matches_team1_id_fkey(name, short_name, color), team2:teams!matches_team2_id_fkey(name, short_name, color)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('tournaments').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  results.forEach((res, i) => {
    if (res.error) console.error(`ERROR IN QUERY ${i}:`, res.error);
    else console.log(`Query ${i} SUCCEEDED. Data:`, res.count !== null ? res.count : (res.data?.length + ' rows'));
  });
}

checkQueries();
