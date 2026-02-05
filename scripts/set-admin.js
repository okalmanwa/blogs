// Script to set a user as admin in Supabase
// Usage: node scripts/set-admin.js <email>
// Example: node scripts/set-admin.js admin@cornell.edu

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env')
  process.exit(1)
}

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.error('Usage: node scripts/set-admin.js <email>')
  console.error('Example: node scripts/set-admin.js admin@cornell.edu')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setAdmin() {
  console.log(`🔍 Looking up user: ${email}...\n`)

  try {
    // Get user by email - list all users and find by email
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error(`❌ Error fetching users:`, usersError.message)
      process.exit(1)
    }

    const user = usersData?.users?.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ User not found: ${email}`)
      console.error('   Make sure the user exists in Supabase Auth first')
      process.exit(1)
    }

    const userId = user.id
    console.log(`✓ Found user: ${user.email} (ID: ${userId})`)

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log(`📝 Profile exists, updating role to 'admin'...`)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)

      if (updateError) {
        console.error(`❌ Error updating profile:`, updateError.message)
        process.exit(1)
      }

      console.log(`✅ Successfully set ${email} as admin!`)
    } else {
      console.log(`📝 Profile doesn't exist, creating with admin role...`)
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: email.split('@')[0] || 'admin',
          full_name: userData.user.user_metadata?.full_name || null,
          role: 'admin',
        })

      if (insertError) {
        console.error(`❌ Error creating profile:`, insertError.message)
        process.exit(1)
      }

      console.log(`✅ Successfully created admin profile for ${email}!`)
    }

    // Verify the update
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, role, email')
      .eq('id', userId)
      .single()

    console.log('\n📋 Updated profile:')
    console.log(`   Email: ${email}`)
    console.log(`   Username: ${profile?.username || 'N/A'}`)
    console.log(`   Role: ${profile?.role || 'N/A'}`)
    console.log('\n✅ Done! You can now log in and access the admin dashboard.\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

setAdmin().catch(console.error)
