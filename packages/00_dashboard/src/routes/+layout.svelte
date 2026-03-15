<script lang="ts">
  import '../app.css';
  import { goto } from '$app/navigation';
  import { logout } from '$lib/auth';
  import { Button } from '@oute/design-system';
  import Footer from '$lib/components/Footer.svelte';

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
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 19h20L12 2zm0 4l7 11H5l7-11z" />
              </svg>
            </div>
            <span class="text-lg font-bold text-white">Oute</span>
          </div>
          <div class="hidden md:flex gap-6">
            <a
              href="/"
              class="text-neutral-300 hover:text-white font-medium text-sm transition-colors"
              >Dashboard</a
            >
            <a
              href="/architect-chat"
              class="text-neutral-500 hover:text-neutral-300 font-medium text-sm transition-colors"
              >Architect Chat</a
            >
            <a
              href="/insights"
              class="text-neutral-500 hover:text-neutral-300 font-medium text-sm transition-colors"
              >Insights</a
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

          <Button variant="primary" size="sm" on:click={() => {}}>+ Nova Estimativa</Button>

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
  <main class="flex-1">
    <slot />
  </main>

  <Footer />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background-color: var(--color-dark-bg);
  }

  :global(html, body) {
    height: 100%;
  }
</style>
