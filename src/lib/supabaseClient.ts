import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private'
import type { Database } from '$lib/database.types'
export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY)