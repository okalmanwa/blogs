// Script to check a user's profile role in Supabase
// Usage: node scripts/check-profile-role.js <email>

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.error('Usage: node scripts/check-profile-role.js <email>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function checkRole() {
  try {
    // Get user by email
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const user = usersData?.users?.find(u => u.email === email)

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      process.exit(1)
    }

    console.log(`\n👤 User: ${user.email}`)
    console.log(`   ID: ${user.id}\n`)

    // Get profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error(`❌ Error fetching profile:`, error.message)
      process.exit(1)
    }

    if (!profile) {
      console.log('⚠️  Profile does not exist')
    } else {
      console.log('📋 Profile:')
      console.log(`   Username: ${profile.username || 'N/A'}`)
      console.log(`   Full Name: ${profile.full_name || 'N/A'}`)
      console.log(`   Role: ${profile.role || 'NULL/EMPTY'}`)
      console.log(`   Created: ${profile.created_at || 'N/A'}`)
      
      if (profile.role !== 'admin') {
        console.log('\n⚠️  Role is not "admin"')
        console.log(`   Current role: "${profile.role}"`)
      } else {
        console.log('\n✅ Role is set to "admin"')
      }
    }

    console.log('\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkRole().catch(console.error)
