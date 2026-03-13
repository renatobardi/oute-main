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

<div class="min-h-screen bg-dark-bg flex flex-col">
  <!-- Navigation Bar -->
  <nav class="bg-dark-surface border-b border-dark-border">
    <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
      <div class="flex items-center gap-8">
        <OuteLogo size="sm" showSlogan={false} horizontal />
        <div class="hidden md:flex gap-6">
          <a
            href="/"
            class="text-neutral-500 hover:text-neutral-300 font-medium text-sm transition-colors"
            >Dashboard</a
          >
          <a
            href="/interviews"
            class="text-neutral-300 hover:text-white font-medium text-sm transition-colors"
            >Interviews</a
          >
          <a
            href="/projects"
            class="text-neutral-500 hover:text-neutral-300 font-medium text-sm transition-colors"
            >Projects</a
          >
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div
          class="hidden sm:flex items-center gap-2 bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5"
        >
          <svg
            class="w-4 h-4 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Quick search..."
            class="bg-transparent border-none outline-none text-sm text-neutral-300 placeholder-neutral-500 w-32"
          />
        </div>

        <Button variant="primary" size="sm" on:click={() => {}}>+ New Interview</Button>

        <button
          class="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white"
          title="User"
          on:click={handleLogout}
        >
          U
        </button>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="flex-1 overflow-hidden bg-dark-surface">
    <slot />
  </main>

  <Footer />
</div>
