// Script to set up hardcoded users in Supabase
// Run this once to create the hardcoded users

import { createClient } from '@supabase/supabase-js'
import { HARDCODED_USERS } from './hardcoded-users'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupHardcodedUsers() {
  console.log('Setting up hardcoded users...')

  for (const [role, userData] of Object.entries(HARDCODED_USERS)) {
    try {
      // Try to create the user first
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      })

      if (createError) {
        // If user already exists, try to find and update them
        if (createError.message?.includes('already registered') || createError.message?.includes('already exists')) {
          console.log(`User ${userData.email} already exists, finding and updating...`)
          
          // List users and find by email
          const { data: usersData } = await supabase.auth.admin.listUsers()
          const existingUser = usersData?.users?.find((u: any) => u.email === userData.email)

          if (existingUser) {
            // Update password
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: userData.password,
            })

            // Update profile
            await supabase
              .from('profiles')
              .upsert({
                id: existingUser.id,
                username: userData.username,
                full_name: userData.full_name,
                role: userData.role,
              })

            console.log(`✓ Updated ${role} user: ${userData.email}`)
          } else {
            console.error(`Could not find existing user ${userData.email} to update`)
          }
        } else {
          console.error(`Error creating ${role} user:`, createError)
        }
        continue
      }

      // User was created successfully
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
          console.error(`Error creating profile for ${role}:`, profileError)
        } else {
          console.log(`✓ Created ${role} user: ${userData.email}`)
        }
      }
    } catch (error) {
      console.error(`Error setting up ${role} user:`, error)
    }
  }

  console.log('\nHardcoded users setup complete!')
  console.log('\nLogin credentials:')
  console.log('Admin:   admin@cornell.edu / admin123')
  console.log('Student: student@cornell.edu / student123')
  console.log('Viewer:  viewer@cornell.edu / viewer123')
}

setupHardcodedUsers().catch(console.error)
