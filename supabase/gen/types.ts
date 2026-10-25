/**
 * Generated database types for Neatly (Level 2 schema).
 * These mirror the Postgres schema in supabase/migrations.
 * Kept in sync with the database; regenerate with `supabase gen types`.
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          color: string | null;
          locale: string;
          timezone: string;
          is_blocked: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          color?: string | null;
          locale?: string;
          timezone?: string;
          is_blocked?: boolean;
          created_by?: string | null;
        };
        Update: {
          email?: string | null;
          phone?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          color?: string | null;
          locale?: string;
          timezone?: string;
          is_blocked?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          profile: string;
          timezone: string;
          locale: string;
          branding: Json;
          settings: Json;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          profile?: string;
          timezone?: string;
          locale?: string;
          branding?: Json;
          settings?: Json;
          is_demo?: boolean;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          profile?: string;
          timezone?: string;
          locale?: string;
          branding?: Json;
          settings?: Json;
          is_demo?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      org_features: {
        Row: {
          id: string;
          org_id: string;
          feature_key: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          feature_key: string;
          enabled?: boolean;
          created_by?: string | null;
        };
        Update: {
          feature_key?: string;
          enabled?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          role_id: string;
          status: string;
          scopes: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id: string;
          role_id: string;
          status?: string;
          scopes?: Json;
          created_by?: string | null;
        };
        Update: {
          role_id?: string;
          status?: string;
          scopes?: Json;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      roles: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          key: string;
          description: string | null;
          is_template: boolean;
          is_system: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          key: string;
          description?: string | null;
          is_template?: boolean;
          is_system?: boolean;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          key?: string;
          description?: string | null;
          is_template?: boolean;
          is_system?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      permissions: {
        Row: {
          id: string;
          key: string;
          description: string;
          category: string;
          confidential_class: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          description: string;
          category?: string;
          confidential_class?: string | null;
          created_by?: string | null;
        };
        Update: {
          key?: string;
          description?: string;
          category?: string;
          confidential_class?: string | null;
        };
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          org_id: string;
          parent_id: string | null;
          path: string;
          name: string;
          head_id: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          parent_id?: string | null;
          path?: string;
          name: string;
          head_id?: string | null;
          color?: string | null;
          created_by?: string | null;
        };
        Update: {
          parent_id?: string | null;
          path?: string;
          name?: string;
          head_id?: string | null;
          color?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      teams: {
        Row: {
          id: string;
          org_id: string;
          department_id: string | null;
          name: string;
          lead_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          department_id?: string | null;
          name: string;
          lead_id?: string | null;
          created_by?: string | null;
        };
        Update: {
          department_id?: string | null;
          name?: string;
          lead_id?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          created_by?: string | null;
        };
        Update: {
          team_id?: string;
          user_id?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          org_id: string;
          email: string | null;
          phone: string | null;
          role_id: string;
          scopes: Json;
          token_hash: string;
          invited_by: string;
          expires_at: string;
          accepted_at: string | null;
          revoked_at: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          email?: string | null;
          phone?: string | null;
          role_id: string;
          scopes?: Json;
          token_hash: string;
          invited_by: string;
          expires_at: string;
          created_by?: string | null;
        };
        Update: {
          email?: string | null;
          phone?: string | null;
          role_id?: string;
          scopes?: Json;
          accepted_at?: string | null;
          revoked_at?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      devices: {
        Row: {
          id: string;
          user_id: string;
          device_name: string | null;
          device_id: string;
          last_active_at: string;
          created_at: string;
          revoked_at: string | null;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_name?: string | null;
          device_id: string;
          created_by?: string | null;
        };
        Update: {
          device_name?: string | null;
          last_active_at?: string;
          revoked_at?: string | null;
        };
      };
      audit_log: {
        Row: {
          id: string;
          org_id: string | null;
          user_id: string | null;
          action: string;
          table_name: string | null;
          row_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          metadata: Json;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          org_id?: string | null;
          user_id?: string | null;
          action: string;
          table_name?: string | null;
          row_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          metadata?: Json;
          created_by?: string | null;
        };
        Update: never;
      };
      role_templates: {
        Row: {
          key: string;
          name: string;
          description: string | null;
          is_system: boolean;
          profile_scope: string;
          permission_keys: string[];
          confidential_classes: string[];
          created_at: string;
        };
        Insert: {
          key: string;
          name: string;
          description?: string | null;
          is_system?: boolean;
          profile_scope?: string;
          permission_keys: string[];
          confidential_classes: string[];
        };
        Update: {
          name?: string;
          description?: string | null;
          profile_scope?: string;
          permission_keys?: string[];
          confidential_classes?: string[];
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      app_clearance: {
        Args: { target_org_id: string };
        Returns: { class: string }[];
      };
      app_has_perm: {
        Args: { target_org_id: string; perm_key: string; target_space_id?: string };
        Returns: boolean;
      };
      app_is_member: {
        Args: { target_org_id: string };
        Returns: boolean;
      };
      app_visible_spaces: {
        Args: { target_org_id: string };
        Returns: { space_id: string }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
