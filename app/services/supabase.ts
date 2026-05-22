/**
 * SUPABASE SERVICE - Mock client pour version sans authentification
 * En production, installer @supabase/supabase-js et activer cette configuration
 */

// Mock Supabase client - replace with real client in production
export const supabase = {
  auth: {
    signUp: async () => ({ data: null, error: null }),
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => ({ data: null, error: null }),
    getSession: async () => ({ data: null, error: null }),
  },
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
};
