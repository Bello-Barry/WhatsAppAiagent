import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    logger.fatal('Supabase URL and Anon Key are not configured in the .env file for the backend.');
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
