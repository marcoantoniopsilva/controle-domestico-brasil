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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      auto_search_results: {
        Row: {
          address: string
          area: number
          bathrooms: number
          bedrooms: number
          condo: number
          created_at: string
          fire_insurance: number
          id: string
          images: string[] | null
          iptu: number
          is_extracted: boolean
          other_fees: number
          parking_spaces: number
          rent: number
          search_criteria: Json
          search_query: string
          source_url: string
          title: string
          total_monthly_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          area: number
          bathrooms?: number
          bedrooms?: number
          condo?: number
          created_at?: string
          fire_insurance?: number
          id?: string
          images?: string[] | null
          iptu?: number
          is_extracted?: boolean
          other_fees?: number
          parking_spaces?: number
          rent: number
          search_criteria?: Json
          search_query: string
          source_url: string
          title: string
          total_monthly_cost: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          area?: number
          bathrooms?: number
          bedrooms?: number
          condo?: number
          created_at?: string
          fire_insurance?: number
          id?: string
          images?: string[] | null
          iptu?: number
          is_extracted?: boolean
          other_fees?: number
          parking_spaces?: number
          rent?: number
          search_criteria?: Json
          search_query?: string
          source_url?: string
          title?: string
          total_monthly_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bot_config: {
        Row: {
          bot_name: string
          company_name: string
          created_at: string
          fallback_message: string
          id: string
          updated_at: string
          user_id: string
          welcome_message: string
        }
        Insert: {
          bot_name?: string
          company_name?: string
          created_at?: string
          fallback_message?: string
          id?: string
          updated_at?: string
          user_id: string
          welcome_message?: string
        }
        Update: {
          bot_name?: string
          company_name?: string
          created_at?: string
          fallback_message?: string
          id?: string
          updated_at?: string
          user_id?: string
          welcome_message?: string
        }
        Relationships: []
      }
      category_budgets: {
        Row: {
          categoria_nome: string
          categoria_tipo: string
          created_at: string
          id: string
          orcamento: number
          updated_at: string
          usuario_id: string
        }
        Insert: {
          categoria_nome: string
          categoria_tipo: string
          created_at?: string
          id?: string
          orcamento?: number
          updated_at?: string
          usuario_id: string
        }
        Update: {
          categoria_nome?: string
          categoria_tipo?: string
          created_at?: string
          id?: string
          orcamento?: number
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          contact_name: string | null
          created_at: string
          id: string
          last_message: string | null
          last_message_time: string
          phone_number: string
          user_id: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_time?: string
          phone_number: string
          user_id: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_time?: string
          phone_number?: string
          user_id?: string
        }
        Relationships: []
      }
      keywords: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          keyword: string
          response: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          keyword: string
          response: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          keyword?: string
          response?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lancamentos: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string | null
          ganhos: number | null
          id: number
          parcelas: number
          quem_gastou: string
          tipo: string
          usuario_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data: string
          descricao?: string | null
          ganhos?: number | null
          id?: number
          parcelas?: number
          quem_gastou: string
          tipo: string
          usuario_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string | null
          ganhos?: number | null
          id?: number
          parcelas?: number
          quem_gastou?: string
          tipo?: string
          usuario_id?: string
          valor?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_from_bot: boolean
          message_text: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_from_bot?: boolean
          message_text: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_from_bot?: boolean
          message_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          area: number
          bathrooms: number
          bedrooms: number
          condo: number
          created_at: string
          final_score: number
          fire_insurance: number
          floor: string | null
          id: string
          images: string[] | null
          iptu: number
          location_summary: string | null
          other_fees: number
          parking_spaces: number
          rent: number
          scores: Json
          source_url: string | null
          title: string
          total_monthly_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          area: number
          bathrooms?: number
          bedrooms?: number
          condo?: number
          created_at?: string
          final_score?: number
          fire_insurance?: number
          floor?: string | null
          id?: string
          images?: string[] | null
          iptu?: number
          location_summary?: string | null
          other_fees?: number
          parking_spaces?: number
          rent: number
          scores?: Json
          source_url?: string | null
          title: string
          total_monthly_cost: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          area?: number
          bathrooms?: number
          bedrooms?: number
          condo?: number
          created_at?: string
          final_score?: number
          fire_insurance?: number
          floor?: string | null
          id?: string
          images?: string[] | null
          iptu?: number
          location_summary?: string | null
          other_fees?: number
          parking_spaces?: number
          rent?: number
          scores?: Json
          source_url?: string | null
          title?: string
          total_monthly_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      simulacoes_orcamento: {
        Row: {
          ano: number
          categoria_nome: string
          categoria_tipo: string
          created_at: string
          id: string
          mes: number
          updated_at: string
          usuario_id: string
          valor_previsto: number
        }
        Insert: {
          ano?: number
          categoria_nome: string
          categoria_tipo: string
          created_at?: string
          id?: string
          mes: number
          updated_at?: string
          usuario_id: string
          valor_previsto?: number
        }
        Update: {
          ano?: number
          categoria_nome?: string
          categoria_tipo?: string
          created_at?: string
          id?: string
          mes?: number
          updated_at?: string
          usuario_id?: string
          valor_previsto?: number
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address: string
          cep: string | null
          created_at: string
          custom_label: string | null
          id: string
          label: string
          latitude: number | null
          longitude: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          cep?: string | null
          created_at?: string
          custom_label?: string | null
          id?: string
          label: string
          latitude?: number | null
          longitude?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          cep?: string | null
          created_at?: string
          custom_label?: string | null
          id?: string
          label?: string
          latitude?: number | null
          longitude?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_criteria_preferences: {
        Row: {
          ativo: boolean
          created_at: string
          criterio_nome: string
          id: string
          peso: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          criterio_nome: string
          id?: string
          peso?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          criterio_nome?: string
          id?: string
          peso?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          faixa_preco: string | null
          id: string
          intencao: string | null
          objetivo_principal: string
          objetivo_principal_multi: string[] | null
          phone: string | null
          profile_type: string
          regiao_referencia: string | null
          situacao_moradia: string
          situacao_moradia_multi: string[] | null
          updated_at: string
          user_id: string
          valor_principal: string
          valor_principal_multi: string[] | null
        }
        Insert: {
          created_at?: string
          faixa_preco?: string | null
          id?: string
          intencao?: string | null
          objetivo_principal: string
          objetivo_principal_multi?: string[] | null
          phone?: string | null
          profile_type: string
          regiao_referencia?: string | null
          situacao_moradia: string
          situacao_moradia_multi?: string[] | null
          updated_at?: string
          user_id: string
          valor_principal: string
          valor_principal_multi?: string[] | null
        }
        Update: {
          created_at?: string
          faixa_preco?: string | null
          id?: string
          intencao?: string | null
          objetivo_principal?: string
          objetivo_principal_multi?: string[] | null
          phone?: string | null
          profile_type?: string
          regiao_referencia?: string | null
          situacao_moradia?: string
          situacao_moradia_multi?: string[] | null
          updated_at?: string
          user_id?: string
          valor_principal?: string
          valor_principal_multi?: string[] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waha_config: {
        Row: {
          api_token: string
          api_url: string
          created_at: string
          id: string
          instance_id: string
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_token: string
          api_url: string
          created_at?: string
          id?: string
          instance_id: string
          phone_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_token?: string
          api_url?: string
          created_at?: string
          id?: string
          instance_id?: string
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_finance_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_verified: boolean
          phone_number: string
          report_frequency: string
          report_hour: number
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          phone_number: string
          report_frequency?: string
          report_hour?: number
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          phone_number?: string
          report_frequency?: string
          report_hour?: number
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
      whatsapp_verification_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone_number: string
          usuario_id: string
          verified_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone_number: string
          usuario_id: string
          verified_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone_number?: string
          usuario_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
