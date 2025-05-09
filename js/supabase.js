// Supabase client initialization
const SUPABASE_URL = 'https://pmiwdthzccbznrxlcbez.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaXdkdGh6Y2Niem5yeGxjYmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDMzMDYsImV4cCI6MjA2MjM3OTMwNn0.GGaRTkHFbtxHbpnn9_BLzC5oCsxGcncRrd_okKfGrCc';

// Initialize the Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export the initialized client
if (typeof window !== 'undefined') {
  window.supabaseClient = supabase;
}