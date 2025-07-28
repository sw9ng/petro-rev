export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounting_entries: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          description: string
          entry_date: string
          entry_number: string
          id: string
          reference_id: string | null
          reference_type: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          description: string
          entry_date: string
          entry_number: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          entry_id: string
          id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          entry_id: string
          id?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          entry_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_entry_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "accounting_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      checks: {
        Row: {
          amount: number
          bank_name: string | null
          check_number: string | null
          check_type: string
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          drawer_name: string | null
          due_date: string
          given_company: string | null
          id: string
          image_url: string | null
          issue_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          bank_name?: string | null
          check_number?: string | null
          check_type: string
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          drawer_name?: string | null
          due_date: string
          given_company?: string | null
          id?: string
          image_url?: string | null
          issue_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_name?: string | null
          check_number?: string | null
          check_type?: string
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          drawer_name?: string | null
          due_date?: string
          given_company?: string | null
          id?: string
          image_url?: string | null
          issue_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_accounts: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
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
          customer_type: string | null
          debt_amount: number | null
          id: string
          name: string
          notes: string | null
          payable_amount: number | null
          phone: string | null
          receivable_amount: number | null
          station_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_type?: string | null
          debt_amount?: number | null
          id?: string
          name: string
          notes?: string | null
          payable_amount?: number | null
          phone?: string | null
          receivable_amount?: number | null
          station_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_type?: string | null
          debt_amount?: number | null
          id?: string
          name?: string
          notes?: string | null
          payable_amount?: number | null
          phone?: string | null
          receivable_amount?: number | null
          station_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      e_archive_invoices: {
        Row: {
          archive_id: string
          company_id: string
          created_at: string
          created_by: string
          currency_code: string
          customer_address: string | null
          customer_name: string
          customer_tax_number: string | null
          customer_tc_number: string | null
          gib_response: string | null
          gib_status: string
          grand_total: number
          id: string
          invoice_date: string
          invoice_number: string
          pdf_path: string | null
          tax_amount: number
          total_amount: number
          updated_at: string
          xml_content: string | null
        }
        Insert: {
          archive_id: string
          company_id: string
          created_at?: string
          created_by: string
          currency_code?: string
          customer_address?: string | null
          customer_name: string
          customer_tax_number?: string | null
          customer_tc_number?: string | null
          gib_response?: string | null
          gib_status?: string
          grand_total?: number
          id?: string
          invoice_date: string
          invoice_number: string
          pdf_path?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          xml_content?: string | null
        }
        Update: {
          archive_id?: string
          company_id?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          customer_address?: string | null
          customer_name?: string
          customer_tax_number?: string | null
          customer_tc_number?: string | null
          gib_response?: string | null
          gib_status?: string
          grand_total?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          pdf_path?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          xml_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "e_archive_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      e_invoices: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          currency_code: string
          ettn: string
          exchange_rate: number | null
          gib_response: string | null
          gib_status: string
          grand_total: number
          id: string
          invoice_date: string
          invoice_number: string
          invoice_type: string
          invoice_uuid: string
          pdf_path: string | null
          recipient_address: string | null
          recipient_tax_number: string | null
          recipient_title: string | null
          tax_amount: number
          total_amount: number
          updated_at: string
          xml_content: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          currency_code?: string
          ettn: string
          exchange_rate?: number | null
          gib_response?: string | null
          gib_status?: string
          grand_total?: number
          id?: string
          invoice_date: string
          invoice_number: string
          invoice_type: string
          invoice_uuid: string
          pdf_path?: string | null
          recipient_address?: string | null
          recipient_tax_number?: string | null
          recipient_title?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          xml_content?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          ettn?: string
          exchange_rate?: number | null
          gib_response?: string | null
          gib_status?: string
          grand_total?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string
          invoice_uuid?: string
          pdf_path?: string | null
          recipient_address?: string | null
          recipient_tax_number?: string | null
          recipient_title?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          xml_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "e_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_invoices: {
        Row: {
          account_id: string | null
          amount: number
          company_id: string
          company_title: string | null
          created_at: string
          created_by: string
          description: string
          e_invoice_number: string | null
          e_invoice_status: string | null
          e_invoice_uuid: string | null
          gib_status: string | null
          id: string
          invoice_date: string
          invoice_number: string | null
          payment_date: string | null
          payment_status: string
          send_date: string | null
          tax_number: string | null
          updated_at: string
          uyumsoft_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount?: number
          company_id: string
          company_title?: string | null
          created_at?: string
          created_by: string
          description: string
          e_invoice_number?: string | null
          e_invoice_status?: string | null
          e_invoice_uuid?: string | null
          gib_status?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          payment_date?: string | null
          payment_status?: string
          send_date?: string | null
          tax_number?: string | null
          updated_at?: string
          uyumsoft_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          company_id?: string
          company_title?: string | null
          created_at?: string
          created_by?: string
          description?: string
          e_invoice_number?: string | null
          e_invoice_status?: string | null
          e_invoice_uuid?: string | null
          gib_status?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          payment_date?: string | null
          payment_status?: string
          send_date?: string | null
          tax_number?: string | null
          updated_at?: string
          uyumsoft_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_invoices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "company_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_purchases: {
        Row: {
          created_at: string
          fuel_type: string
          id: string
          invoice_number: string | null
          liters: number
          notes: string | null
          purchase_date: string
          purchase_price_per_liter: number
          station_id: string
          supplier: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string
          fuel_type: string
          id?: string
          invoice_number?: string | null
          liters: number
          notes?: string | null
          purchase_date?: string
          purchase_price_per_liter: number
          station_id: string
          supplier?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string
          fuel_type?: string
          id?: string
          invoice_number?: string | null
          liters?: number
          notes?: string | null
          purchase_date?: string
          purchase_price_per_liter?: number
          station_id?: string
          supplier?: string | null
          total_amount?: number
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
          shift: string | null
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
          shift?: string | null
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
          shift?: string | null
          shift_id?: string | null
          station_id?: string
          total_amount?: number
        }
        Relationships: []
      }
      fuel_stock: {
        Row: {
          created_at: string
          current_stock: number
          fuel_type: string
          id: string
          station_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stock?: number
          fuel_type: string
          id?: string
          station_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stock?: number
          fuel_type?: string
          id?: string
          station_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      income_invoices: {
        Row: {
          account_id: string | null
          amount: number
          company_id: string
          company_title: string | null
          created_at: string
          created_by: string
          description: string
          e_invoice_number: string | null
          e_invoice_status: string | null
          e_invoice_uuid: string | null
          gib_status: string | null
          id: string
          invoice_date: string
          invoice_number: string | null
          payment_date: string | null
          payment_status: string
          send_date: string | null
          tax_number: string | null
          updated_at: string
          uyumsoft_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount?: number
          company_id: string
          company_title?: string | null
          created_at?: string
          created_by: string
          description: string
          e_invoice_number?: string | null
          e_invoice_status?: string | null
          e_invoice_uuid?: string | null
          gib_status?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          payment_date?: string | null
          payment_status?: string
          send_date?: string | null
          tax_number?: string | null
          updated_at?: string
          uyumsoft_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          company_id?: string
          company_title?: string | null
          created_at?: string
          created_by?: string
          description?: string
          e_invoice_number?: string | null
          e_invoice_status?: string | null
          e_invoice_uuid?: string | null
          gib_status?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          payment_date?: string | null
          payment_status?: string
          send_date?: string | null
          tax_number?: string | null
          updated_at?: string
          uyumsoft_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_invoices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "company_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel: {
        Row: {
          attendant_email: string | null
          attendant_password_hash: string | null
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
          attendant_email?: string | null
          attendant_password_hash?: string | null
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
          attendant_email?: string | null
          attendant_password_hash?: string | null
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
      petronet_files: {
        Row: {
          created_at: string | null
          file_hash: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          processed: boolean | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_hash: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          processed?: boolean | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_hash?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          processed?: boolean | null
          upload_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_premium: boolean | null
          last_sync_time: string | null
          petronet_auto_sync: boolean | null
          petronet_email: string | null
          petronet_password: string | null
          premium_expires_at: string | null
          station_name: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_premium?: boolean | null
          last_sync_time?: string | null
          petronet_auto_sync?: boolean | null
          petronet_email?: string | null
          petronet_password?: string | null
          premium_expires_at?: string | null
          station_name?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_premium?: boolean | null
          last_sync_time?: string | null
          petronet_auto_sync?: boolean | null
          petronet_email?: string | null
          petronet_password?: string | null
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
      tax_registry: {
        Row: {
          address: string | null
          city: string | null
          company_title: string
          created_at: string
          district: string | null
          email: string | null
          id: string
          phone: string | null
          tax_number: string
          tax_office: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_title: string
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          tax_number: string
          tax_office?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_title?: string
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          tax_number?: string
          tax_office?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      uyumsoft_accounts: {
        Row: {
          api_key_encrypted: string | null
          company_code: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          password_encrypted: string
          test_mode: boolean
          updated_at: string
          username: string
        }
        Insert: {
          api_key_encrypted?: string | null
          company_code: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          password_encrypted: string
          test_mode?: boolean
          updated_at?: string
          username: string
        }
        Update: {
          api_key_encrypted?: string | null
          company_code?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          password_encrypted?: string
          test_mode?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "uyumsoft_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_pump_attendant: {
        Args: { attendant_email_param: string; password_param: string }
        Returns: Json
      }
      get_attendant_shifts: {
        Args: {
          attendant_id_param: string
          station_id_param: string
          date_start_param?: string
          date_end_param?: string
          shift_filter_param?: string
        }
        Returns: {
          id: string
          start_time: string
          end_time: string
          cash_sales: number
          card_sales: number
          actual_amount: number
          over_short: number
          status: string
          veresiye: number
          bank_transfers: number
          loyalty_card: number
          shift_number: string
          bank_transfer_description: string
        }[]
      }
      hash_attendant_password: {
        Args: { password: string }
        Returns: string
      }
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
    Enums: {},
  },
} as const
