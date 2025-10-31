import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhkudvrqdxfgtfyikbuc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa3VkdnJxZHhmZ3RmeWlrYnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDE4ODMsImV4cCI6MjA3NzQ3Nzg4M30.eGamX0C7lZ64SmdQNen2H5lH293yll2Jr7A7mtIK9FU';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
