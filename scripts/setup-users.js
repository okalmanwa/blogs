// Run this script to set up hardcoded users: node scripts/setup-users.js
// Make sure your .env has SUPABASE_SERVICE_ROLE_KEY set

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const HARDCODED_USERS = {
  admin: {
    email: 'admin@cornell.edu',
    password: 'admin123',
    username: 'admin',
    full_name: 'Admin User',
    role: 'admin',
  },
  student: {
    email: 'student@cornell.edu',
    password: 'student123',
    username: 'student',
    full_name: 'Student User',
    role: 'student',
  },
  viewer: {
    email: 'viewer@cornell.edu',
    password: 'viewer123',
    username: 'viewer',
    full_name: 'Viewer User',
    role: 'viewer',
  },
}

async function setupHardcodedUsers() {
  console.log('🚀 Setting up hardcoded users...\n')

  for (const [role, userData] of Object.entries(HARDCODED_USERS)) {
    try {
      // Check if user already exists
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
      
      let existingUser = null
      if (existingUsers?.users) {
        existingUser = existingUsers.users.find(u => u.email === userData.email)
      }

      if (existingUser) {
        console.log(`📝 User ${userData.email} already exists, updating...`)
        
        // Update password and confirm email
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password: userData.password,
          email_confirm: true,
        })

        if (updateError) {
          console.error(`   ⚠️  Error updating password:`, updateError.message)
        }

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: existingUser.id,
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role,
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error(`   ⚠️  Error updating profile:`, profileError.message)
        } else {
          console.log(`   ✓ Updated ${role} user: ${userData.email}`)
        }
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        })

        if (createError) {
          console.error(`   ❌ Error creating ${role} user:`, createError.message)
          continue
        }

        if (newUser.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: newUser.user.id,
              username: userData.username,
              full_name: userData.full_name,
              role: userData.role,
            })

          if (profileError) {
            console.error(`   ⚠️  Error creating profile:`, profileError.message)
          } else {
            console.log(`   ✓ Created ${role} user: ${userData.email}`)
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Error setting up ${role} user:`, error.message)
    }
  }

  console.log('\n✅ Hardcoded users setup complete!\n')
  console.log('📋 Login credentials:')
  console.log('   Admin:   admin@cornell.edu / admin123')
  console.log('   Student: student@cornell.edu / student123')
  console.log('   Viewer:  viewer@cornell.edu / viewer123\n')
}

setupHardcodedUsers().catch(console.error)
