
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://quxfdpypuaxudzxmsemo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1eGZkcHlwdWF4dWR6eG1zZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDA3NzAsImV4cCI6MjA3Njc3Njc3MH0.lYYBNy8YF6RbF42W_M5J3q4bUMo9K85oe2gyXmhl3bE'
export const db = createClient(supabaseUrl, supabaseKey)