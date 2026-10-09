// Generated from the dedicated Creator Lab Supabase database.
// Project reference: aoyrijspyygqoyeajxpf (Frankfurt).
// Regenerate after each accepted SQL migration; do not hand-edit.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      creator_content_items: {
        Row: {
          created_at: string
          format: string
          id: string
          notes: string
          owner_label: string
          platforms: string[]
          sort_order: number
          stage: string
          tags: string[]
          target_date: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          format?: string
          id?: string
          notes?: string
          owner_label?: string
          platforms?: string[]
          sort_order?: number
          stage?: string
          tags?: string[]
          target_date?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          notes?: string
          owner_label?: string
          platforms?: string[]
          sort_order?: number
          stage?: string
          tags?: string[]
          target_date?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_content_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "creator_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_media_assets: {
        Row: {
          created_at: string
          file_name: string
          folder_id: string | null
          id: string
          mime_type: string
          object_path: string
          size_bytes: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          folder_id?: string | null
          id?: string
          mime_type: string
          object_path: string
          size_bytes: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          folder_id?: string | null
          id?: string
          mime_type?: string
          object_path?: string
          size_bytes?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_media_assets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "creator_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_media_assets_workspace_id_folder_id_fkey"
            columns: ["workspace_id", "folder_id"]
            isOneToOne: false
            referencedRelation: "creator_media_folders"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      creator_media_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_media_folders_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "creator_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_post_destinations: {
        Row: {
          account_handle: string
          account_label: string
          connection_mode: string
          created_at: string
          id: string
          last_error: string | null
          platform: string
          post_id: string
          provider_post_id: string | null
          published_at: string | null
          scheduled_at: string | null
          social_account_id: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          account_handle?: string
          account_label?: string
          connection_mode?: string
          created_at?: string
          id?: string
          last_error?: string | null
          platform: string
          post_id: string
          provider_post_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          social_account_id?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          account_handle?: string
          account_label?: string
          connection_mode?: string
          created_at?: string
          id?: string
          last_error?: string | null
          platform?: string
          post_id?: string
          provider_post_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          social_account_id?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_post_destinations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "creator_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_post_destinations_workspace_id_post_id_fkey"
            columns: ["workspace_id", "post_id"]
            isOneToOne: false
            referencedRelation: "creator_posts"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "creator_post_destinations_workspace_id_social_account_id_fkey"
            columns: ["workspace_id", "social_account_id"]
            isOneToOne: false
            referencedRelation: "creator_social_accounts"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      creator_posts: {
        Row: {
          created_at: string
          id: string
          original_content: Json
          platform_content: Json
          published_at: string | null
          scheduled_at: string | null
          source_content_item_id: string | null
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          original_content?: Json
          platform_content?: Json
          published_at?: string | null
          scheduled_at?: string | null
          source_content_item_id?: string | null
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          original_content?: Json
          platform_content?: Json
          published_at?: string | null
          scheduled_at?: string | null
          source_content_item_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_posts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "creator_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_posts_workspace_id_source_content_item_id_fkey"
            columns: ["workspace_id", "source_content_item_id"]
            isOneToOne: false
            referencedRelation: "creator_content_items"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      creator_social_accounts: {
        Row: {
          connection_mode: string
          connection_status: string
          created_at: string
          display_name: string
          id: string
          last_sync_at: string | null
          platform: string
          provider_account_id: string | null
          username: string
          workspace_id: string
        }
        Insert: {
          connection_mode?: string
          connection_status?: string
          created_at?: string
          display_name: string
          id?: string
          last_sync_at?: string | null
          platform: string
          provider_account_id?: string | null
          username: string
          workspace_id: string
        }
        Update: {
          connection_mode?: string
          connection_status?: string
          created_at?: string
          display_name?: string
          id?: string
          last_sync_at?: string | null
          platform?: string
          provider_account_id?: string | null
          username?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_social_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "creator_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_workspace_members: {
        Row: {
          created_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "creator_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      creator_can_edit: { Args: { target_workspace: string }; Returns: boolean }
      creator_create_workspace: {
        Args: { workspace_name: string; workspace_timezone?: string }
        Returns: string
      }
      creator_is_member: {
        Args: { target_workspace: string }
        Returns: boolean
      }
      creator_is_owner: { Args: { target_workspace: string }; Returns: boolean }
      creator_storage_workspace: { Args: { path: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
