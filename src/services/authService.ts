import { supabase } from "@/lib/supabase";

export const authService = {
  async signup(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // After signup, insert into users table as requested
    if (data.user) {
      const { error: profileError } = await supabase
        .from("users")
        .insert([
          {
            id: data.user.id,
            full_name: fullName,
            email: email,
            plan: "free",
          },
        ]);
      
      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // We don't necessarily want to fail signup if profile creation fails, 
        // but for this task, we'll keep it simple.
      }
    }

    return data;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};
