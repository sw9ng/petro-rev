export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_transactions: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          description: string | null
          id: string
          payment_method: string | null
          personnel_id: string
          shift_id: string | null
          station_id: string
          status: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          payment_method?: string | null
          personnel_id: string
          shift_id?: string | null
          station_id: string
          status?: string
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          personnel_id?: string
          shift_id?: string | null
          station_id?: string
          status?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_transactions_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          station_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          station_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          station_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      fuel_sales: {
        Row: {
          amount: number
          created_at: string
          fuel_type: string
          id: string
          liters: number
          personnel_id: string
          price_per_liter: number
          sale_time: string
          shift_id: string | null
          station_id: string
          total_amount: number
        }
        Insert: {
          amount?: number
          created_at?: string
          fuel_type: string
          id?: string
          liters?: number
          personnel_id: string
          price_per_liter?: number
          sale_time?: string
          shift_id?: string | null
          station_id: string
          total_amount?: number
        }
        Update: {
          amount?: number
          created_at?: string
          fuel_type?: string
          id?: string
          liters?: number
          personnel_id?: string
          price_per_liter?: number
          sale_time?: string
          shift_id?: string | null
          station_id?: string
          total_amount?: number
        }
        Relationships: []
      }
      personnel: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          join_date: string | null
          name: string
          phone: string | null
          role: string
          station_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          join_date?: string | null
          name: string
          phone?: string | null
          role: string
          station_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          join_date?: string | null
          name?: string
          phone?: string | null
          role?: string
          station_id?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_premium: boolean | null
          premium_expires_at: string | null
          station_name: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          station_name?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          station_name?: string | null
        }
        Relationships: []
      }
      shift_bank_details: {
        Row: {
          amount: number
          bank_name: string
          created_at: string
          id: string
          shift_id: string
        }
        Insert: {
          amount?: number
          bank_name: string
          created_at?: string
          id?: string
          shift_id: string
        }
        Update: {
          amount?: number
          bank_name?: string
          created_at?: string
          id?: string
          shift_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_bank_details_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          actual_amount: number | null
          bank_transfer_description: string | null
          bank_transfers: number | null
          card_sales: number | null
          cash_sales: number | null
          created_at: string | null
          customer_id: string | null
          end_time: string | null
          expected_amount: number | null
          id: string
          loyalty_card: number | null
          over_short: number | null
          personnel_id: string
          shift_number: string | null
          start_time: string
          station_id: string
          status: string
          veresiye: number | null
        }
        Insert: {
          actual_amount?: number | null
          bank_transfer_description?: string | null
          bank_transfers?: number | null
          card_sales?: number | null
          cash_sales?: number | null
          created_at?: string | null
          customer_id?: string | null
          end_time?: string | null
          expected_amount?: number | null
          id?: string
          loyalty_card?: number | null
          over_short?: number | null
          personnel_id: string
          shift_number?: string | null
          start_time: string
          station_id: string
          status?: string
          veresiye?: number | null
        }
        Update: {
          actual_amount?: number | null
          bank_transfer_description?: string | null
          bank_transfers?: number | null
          card_sales?: number | null
          cash_sales?: number | null
          created_at?: string | null
          customer_id?: string | null
          end_time?: string | null
          expected_amount?: number | null
          id?: string
          loyalty_card?: number | null
          over_short?: number | null
          personnel_id?: string
          shift_number?: string | null
          start_time?: string
          station_id?: string
          status?: string
          veresiye?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_personnel_id_fkey"
            columns: ["personnel_id"]
            isOneToOne: false
            referencedRelation: "personnel"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_user_premium: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
