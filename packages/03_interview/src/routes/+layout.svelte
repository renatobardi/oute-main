<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { firebaseUser, isAuthenticated, logout } from '$lib/auth';

  export let data: { user: import('$app/types').App.Locals['user'] };

  // Redirect to login if not authenticated (skip login page itself)
  onMount(() => {
    const unsubscribe = isAuthenticated.subscribe((authenticated) => {
      if (!authenticated && $page.url.pathname !== '/login') {
        // Only redirect once Firebase has finished initializing
        setTimeout(() => {
          if (!authenticated) goto('/login');
        }, 1000);
      }
    });
    return unsubscribe;
  });

  async function handleLogout() {
    await logout();
    await goto('/login');
  }
</script>

<div class="h-screen bg-dark-bg flex flex-col">
  <!-- Main Content -->
  <main class="flex-1 overflow-hidden bg-dark-surface">
    <slot />
  </main>


</div>
