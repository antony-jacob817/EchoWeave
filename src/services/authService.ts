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
  // ... your existing getSession and getUser methods ...

  async updateName(newName: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 1. Update Supabase Auth Metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: newName }
    });
    if (authError) throw authError;

    // 2. Update Public Users Table
    const { error: dbError } = await supabase
      .from("users")
      .update({ full_name: newName })
      .eq("id", user.id);
    
    if (dbError) throw dbError;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error("User not authenticated");

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (verifyError) throw new Error("Incorrect old password.");

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) throw updateError;
  },

  async deleteAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    await supabase.from("users").delete().eq("id", user.id);

    await supabase.auth.signOut();
    
  }
};
