require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function checkUsers() {
  const { data, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Users status:')
  const hardcodedEmails = ['admin@cornell.edu', 'student@cornell.edu', 'viewer@cornell.edu']
  data.users
    .filter(u => hardcodedEmails.includes(u.email))
    .forEach(u => {
      console.log(`  ${u.email}: ${u.email_confirmed_at ? 'Confirmed ✓' : 'NOT CONFIRMED ✗'}`)
    })
}

checkUsers().catch(console.error)
