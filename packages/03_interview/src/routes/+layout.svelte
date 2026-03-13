<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authToken, user, logout, initializeAuth } from '$lib/auth';
  import { Button, OuteLogo } from '@oute/design-system';
  import Footer from '$lib/components/Footer.svelte';

  // TODO: Re-enable auth redirect when auth service is available
  // onMount(async () => {
  //   initializeAuth();
  //   if ($authToken === null && $page.url.pathname !== '/login') {
  //     await goto('/login');
  //   }
  // });

  async function handleLogout() {
    logout();
    await goto('/login');
  }
</script>

<div class="h-screen bg-dark-bg flex flex-col">
  <!-- Main Content -->
  <main class="flex-1 overflow-hidden bg-dark-surface">
    <slot />
  </main>


</div>
