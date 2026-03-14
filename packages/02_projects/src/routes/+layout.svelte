<script lang="ts">
  import '../app.css';
  import { goto } from '$app/navigation';
  import { logout } from '$lib/auth';

  export let data: { user: import('$app/types').App.Locals['user'] };

  async function handleLogout() {
    await logout();
    await goto('/login');
  }
</script>

<div class="h-screen bg-dark-bg flex flex-col">
  <main class="flex-1 overflow-hidden bg-dark-surface">
    <slot />
  </main>
</div>
