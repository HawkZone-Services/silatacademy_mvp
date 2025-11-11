export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      exam_answers: {
        Row: {
          answer_text: string | null;
          attempt_id: string;
          created_at: string | null;
          id: string;
          is_correct: boolean | null;
          points_earned: number | null;
          question_id: string;
          updated_at: string | null;
        };
        Insert: {
          answer_text?: string | null;
          attempt_id: string;
          created_at?: string | null;
          id?: string;
          is_correct?: boolean | null;
          points_earned?: number | null;
          question_id: string;
          updated_at?: string | null;
        };
        Update: {
          answer_text?: string | null;
          attempt_id?: string;
          created_at?: string | null;
          id?: string;
          is_correct?: boolean | null;
          points_earned?: number | null;
          question_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exam_answers_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: false;
            referencedRelation: "exam_attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
      exam_assignments: {
        Row: {
          assigned_at: string | null;
          exam_id: string;
          id: string;
          student_id: string;
        };
        Insert: {
          assigned_at?: string | null;
          exam_id: string;
          id?: string;
          student_id: string;
        };
        Update: {
          assigned_at?: string | null;
          exam_id?: string;
          id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exam_assignments_exam_id_fkey";
            columns: ["exam_id"];
            isOneToOne: false;
            referencedRelation: "exams";
            referencedColumns: ["id"];
          }
        ];
      };
      exam_attempts: {
        Row: {
          cheating_detected: boolean | null;
          created_at: string | null;
          exam_id: string;
          id: string;
          started_at: string | null;
          status: string | null;
          student_id: string;
          submitted_at: string | null;
          time_remaining_seconds: number | null;
          window_switches: number | null;
        };
        Insert: {
          cheating_detected?: boolean | null;
          created_at?: string | null;
          exam_id: string;
          id?: string;
          started_at?: string | null;
          status?: string | null;
          student_id: string;
          submitted_at?: string | null;
          time_remaining_seconds?: number | null;
          window_switches?: number | null;
        };
        Update: {
          cheating_detected?: boolean | null;
          created_at?: string | null;
          exam_id?: string;
          id?: string;
          started_at?: string | null;
          status?: string | null;
          student_id?: string;
          submitted_at?: string | null;
          time_remaining_seconds?: number | null;
          window_switches?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey";
            columns: ["exam_id"];
            isOneToOne: false;
            referencedRelation: "exams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_attempts_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      exam_results: {
        Row: {
          admin_approved: boolean | null;
          admin_approved_at: string | null;
          admin_approved_by: string | null;
          attempt_id: string;
          created_at: string | null;
          exam_id: string;
          feedback: string | null;
          graded_at: string | null;
          graded_by: string | null;
          id: string;
          instructor_comments: string | null;
          passed: boolean;
          practical_score: number | null;
          student_id: string;
          theoretical_score: number;
          total_score: number;
        };
        Insert: {
          admin_approved?: boolean | null;
          admin_approved_at?: string | null;
          admin_approved_by?: string | null;
          attempt_id: string;
          created_at?: string | null;
          exam_id: string;
          feedback?: string | null;
          graded_at?: string | null;
          graded_by?: string | null;
          id?: string;
          instructor_comments?: string | null;
          passed: boolean;
          practical_score?: number | null;
          student_id: string;
          theoretical_score: number;
          total_score: number;
        };
        Update: {
          admin_approved?: boolean | null;
          admin_approved_at?: string | null;
          admin_approved_by?: string | null;
          attempt_id?: string;
          created_at?: string | null;
          exam_id?: string;
          feedback?: string | null;
          graded_at?: string | null;
          graded_by?: string | null;
          id?: string;
          instructor_comments?: string | null;
          passed?: boolean;
          practical_score?: number | null;
          student_id?: string;
          theoretical_score?: number;
          total_score?: number;
        };
        Relationships: [
          {
            foreignKeyName: "exam_results_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: false;
            referencedRelation: "exam_attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_results_exam_id_fkey";
            columns: ["exam_id"];
            isOneToOne: false;
            referencedRelation: "exams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_results_graded_by_fkey";
            columns: ["graded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exam_results_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      exams: {
        Row: {
          belt_level: Database["public"]["Enums"]["belt_level"];
          created_at: string | null;
          created_by: string;
          description: string | null;
          end_date: string | null;
          id: string;
          passing_score: number;
          start_date: string | null;
          status: Database["public"]["Enums"]["exam_status"] | null;
          time_limit_minutes: number;
          title: string;
          total_points: number;
          updated_at: string | null;
        };
        Insert: {
          belt_level: Database["public"]["Enums"]["belt_level"];
          created_at?: string | null;
          created_by: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          passing_score?: number;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["exam_status"] | null;
          time_limit_minutes?: number;
          title: string;
          total_points?: number;
          updated_at?: string | null;
        };
        Update: {
          belt_level?: Database["public"]["Enums"]["belt_level"];
          created_at?: string | null;
          created_by?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          passing_score?: number;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["exam_status"] | null;
          time_limit_minutes?: number;
          title?: string;
          total_points?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exams_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: string;
          message: string;
          read: boolean | null;
          related_exam_id: string | null;
          title: string;
          type: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          message: string;
          read?: boolean | null;
          related_exam_id?: string | null;
          title: string;
          type?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          message?: string;
          read?: boolean | null;
          related_exam_id?: string | null;
          title?: string;
          type?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_related_exam_id_fkey";
            columns: ["related_exam_id"];
            isOneToOne: false;
            referencedRelation: "exams";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          belt_level: Database["public"]["Enums"]["belt_level"] | null;
          created_at: string | null;
          email: string;
          full_name: string;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          belt_level?: Database["public"]["Enums"]["belt_level"] | null;
          created_at?: string | null;
          email: string;
          full_name: string;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          belt_level?: Database["public"]["Enums"]["belt_level"] | null;
          created_at?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          correct_answer: string | null;
          created_at: string | null;
          exam_id: string;
          id: string;
          options: Json | null;
          order_index: number;
          points: number;
          question_text: string;
          question_type: Database["public"]["Enums"]["question_type"];
        };
        Insert: {
          correct_answer?: string | null;
          created_at?: string | null;
          exam_id: string;
          id?: string;
          options?: Json | null;
          order_index: number;
          points?: number;
          question_text: string;
          question_type: Database["public"]["Enums"]["question_type"];
        };
        Update: {
          correct_answer?: string | null;
          created_at?: string | null;
          exam_id?: string;
          id?: string;
          options?: Json | null;
          order_index?: number;
          points?: number;
          question_text?: string;
          question_type?: Database["public"]["Enums"]["question_type"];
        };
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey";
            columns: ["exam_id"];
            isOneToOne: false;
            referencedRelation: "exams";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "coach" | "student";
      belt_level: "white" | "yellow" | "green" | "blue" | "brown" | "black";
      exam_status: "draft" | "scheduled" | "active" | "completed" | "archived";
      question_type: "multiple_choice" | "written";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coach", "student"],
      belt_level: ["white", "yellow", "green", "blue", "brown", "black"],
      exam_status: ["draft", "scheduled", "active", "completed", "archived"],
      question_type: ["multiple_choice", "written"],
    },
  },
} as const;
