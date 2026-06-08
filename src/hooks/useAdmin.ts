import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AdminState {
  loading: boolean;
  isAdmin: boolean;
  user: User | null;
  checked: boolean;
}

export function useAdmin() {
  const [state, setState] = useState<AdminState>({
    loading: true,
    isAdmin: false,
    user: null,
    checked: false,
  });

  const checkAdmin = useCallback(async (currentUser: User) => {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      setState({
        loading: false,
        isAdmin: !!data,
        user: currentUser,
        checked: true,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        checked: true,
        isAdmin: prev.isAdmin,
      }));
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (mounted) setState({ loading: false, isAdmin: false, user: null, checked: true });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user && mounted) {
        await checkAdmin(user);
      } else if (mounted) {
        setState({ loading: false, isAdmin: false, user: null, checked: true });
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setState((prev) => ({ ...prev, loading: true }));
          await checkAdmin(session.user);
        } else {
          if (mounted) setState({ loading: false, isAdmin: false, user: null, checked: true });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ loading: false, isAdmin: false, user: null, checked: true });
  }, []);

  return { ...state, signOut };
}
