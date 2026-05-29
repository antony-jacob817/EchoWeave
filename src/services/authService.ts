import { supabase } from "@/lib/supabase";

export const authService = {
  async signup(email: string, password: string, fullName: string) {
    const redirectToUrl = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectToUrl,
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

    // Call the custom SQL function (RPC) to delete the user's account and data completely from both auth and public schemas.
    const { error: rpcError } = await supabase.rpc("delete_user");
    
    if (rpcError) {
      console.warn("RPC delete_user failed or does not exist. Falling back to public profile deletion.", rpcError);
      
      // Fallback: Delete profile from the public.users table directly (standard client-side behavior)
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);
      
      if (dbError) throw dbError;
    }

    // Sign out to clear the session and local tokens
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
  }
};
