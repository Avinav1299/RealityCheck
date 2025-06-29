import { createClient } from '@supabase/supabase-js';

// Use environment variables with better fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseKey !== 'your-anon-key' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co');

// Create client with mock credentials if real ones aren't available
export const supabase = createClient(
  hasValidCredentials ? supabaseUrl : 'https://mock.supabase.co',
  hasValidCredentials ? supabaseKey : 'mock-key'
);

// Export a flag to check if we're using real Supabase
export const isSupabaseConfigured = hasValidCredentials;

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          url: string;
          image_url: string | null;
          sector: string;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          url: string;
          image_url?: string | null;
          sector: string;
          published_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          url?: string;
          image_url?: string | null;
          sector?: string;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      image_checks: {
        Row: {
          id: string;
          article_id: string;
          image_url: string;
          match_count: number;
          earliest_date: string | null;
          context_urls: string[];
          confidence_score: number;
          status: 'verified' | 'suspicious' | 'manipulated';
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          image_url: string;
          match_count: number;
          earliest_date?: string | null;
          context_urls: string[];
          confidence_score: number;
          status: 'verified' | 'suspicious' | 'manipulated';
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          image_url?: string;
          match_count?: number;
          earliest_date?: string | null;
          context_urls?: string[];
          confidence_score?: number;
          status?: 'verified' | 'suspicious' | 'manipulated';
          created_at?: string;
        };
      };
      text_checks: {
        Row: {
          id: string;
          article_id: string;
          claim_text: string;
          verification_status: 'true' | 'false' | 'mixed' | 'unverified';
          confidence_score: number;
          citations: string[];
          reasoning: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          claim_text: string;
          verification_status: 'true' | 'false' | 'mixed' | 'unverified';
          confidence_score: number;
          citations: string[];
          reasoning: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          claim_text?: string;
          verification_status?: 'true' | 'false' | 'mixed' | 'unverified';
          confidence_score?: number;
          citations?: string[];
          reasoning?: string;
          created_at?: string;
        };
      };
      strategies: {
        Row: {
          id: string;
          article_id: string;
          summary: string;
          action_steps: string[];
          priority_level: 'low' | 'medium' | 'high' | 'critical';
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          summary: string;
          action_steps: string[];
          priority_level: 'low' | 'medium' | 'high' | 'critical';
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          summary?: string;
          action_steps?: string[];
          priority_level?: 'low' | 'medium' | 'high' | 'critical';
          created_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          article_id: string;
          user_rating: number;
          feedback_text: string | null;
          helpful: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          user_rating: number;
          feedback_text?: string | null;
          helpful: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          user_rating?: number;
          feedback_text?: string | null;
          helpful?: boolean;
          created_at?: string;
        };
      };
    };
  };
};