

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://raeyllcxrqookwbzzdhd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZXlsbGN4cnFvb2t3Ynp6ZGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NTU0NTAsImV4cCI6MjA3NjUzMTQ1MH0.W8GrPae3QeQEDL_Z4HuZNX0u0m676Gwi4flgWpTt8js'
export const db = createClient(supabaseUrl, supabaseKey)