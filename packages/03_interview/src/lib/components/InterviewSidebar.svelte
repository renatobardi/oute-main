<script lang="ts">
  import { onMount } from 'svelte';
  import { currentInterview, messages, notes } from '$lib/stores/conversation';
  import { sidebarCollapsed } from '$lib/stores/ui';
  import { OuteLogo } from '@oute/design-system';
  import { logout } from '$lib/auth';
  import { fetchInterviews, createInterview, fetchInterviewDetail } from '$lib/api';
  import { goto } from '$app/navigation';
  import UserAvatar from './UserAvatar.svelte';
  import type { Interview } from '$lib/types/index';

  export let user: { name?: string; email?: string; picture?: string } | null = null;

  let searchQuery = '';
  let contentEl: HTMLDivElement;
  let showTopGradient = false;
  let showBottomGradient = false;
  let interviewList: Interview[] = [];
  let creating = false;
  let showUserMenu = false;
  let loggingOut = false;

  onMount(async () => {
    interviewList = await fetchInterviews();
  });

  function handleScroll() {
    if (!contentEl) return;
    const { scrollTop, scrollHeight, clientHeight } = contentEl;
    showTopGradient = scrollTop > 0;
    showBottomGradient = scrollTop < scrollHeight - clientHeight - 1;
  }

  async function selectInterview(id: string) {
    const { interview, messages: msgs, note } = await fetchInterviewDetail(id);
    currentInterview.set(interview);
    messages.set(msgs);
    if (note) notes.set(note);
  }

  async function handleNewInterview() {
    if (creating) return;
    creating = true;
    try {
      await createInterview('Nova Entrevista');
      interviewList = await fetchInterviews();
      // Auto-select the new interview (first in list — sorted DESC)
      await selectInterview(interviewList[0].id);
    } catch (err) {
      console.error('[Sidebar] Failed to create interview', err);
    } finally {
      creating = false;
    }
  }

  async function handleLogout() {
    loggingOut = true;
    try {
      await logout();
      await goto('/login');
    } finally {
      loggingOut = false;
      showUserMenu = false;
    }
  }

  function formatDate(date: Date): string {
    return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(
      Math.round((new Date(date).getTime() - Date.now()) / 86400000),
      'day'
    );
  }

  $: filteredInterviews = interviewList.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.interviewCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: displayName = user?.name ?? user?.email ?? 'Usuário';
  $: displayEmail = user?.email ?? '';
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if showUserMenu}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="fixed inset-0 z-40" on:click={() => (showUserMenu = false)}></div>
{/if}

<aside class="sidebar-transition w-[340px] flex-shrink-0 border-r border-dark-bg bg-dark-bg flex flex-col h-full">
  <!-- Header Section -->
  <div class="flex flex-col gap-5 p-4">
    <!-- Logo and Icon Row -->
    <div class="flex items-center justify-between">
      <OuteLogo size="xs" showSlogan={false} horizontal />
      <button
        on:click={() => sidebarCollapsed.toggle()}
        class="flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors p-1"
        title="Collapse sidebar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect height="18" rx="5" ry="5" width="18" x="3" y="3"></rect>
          <line x1="12" x2="12" y1="3" y2="21"></line>
        </svg>
      </button>
    </div>

    <!-- Action Button -->
    <button
      on:click={handleNewInterview}
      disabled={creating}
      class="flex w-4/5 mx-auto items-center justify-center gap-2 rounded-lg bg-transparent py-2.5 text-sm font-bold text-primary-500 border-2 border-primary-500 hover:bg-primary-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {creating ? 'Criando...' : 'New Interview'}
    </button>
  </div>

  <!-- Toolbar Section (Fixed) -->
  <div class="px-4 py-2">
    <!-- Search with Sort/Filter Buttons Inside -->
    <div class="relative flex items-center bg-primary-500/10 border border-primary-500/20 rounded-lg">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search..."
        class="flex-1 bg-transparent px-3 py-2 text-xs text-neutral-300 placeholder-neutral-500 focus:outline-none"
      />
      <div class="flex items-center gap-1 pr-2">
        <button class="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Sort">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
        <button class="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Filter">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Content Section (Scrollable) -->
  <div
    bind:this={contentEl}
    on:scroll={handleScroll}
    class="flex-1 overflow-y-auto px-4 py-2 relative"
  >
    <!-- Top Gradient Fade -->
    <div
      class="pointer-events-none sticky top-0 left-0 right-0 h-4 transition-opacity duration-200"
      style="background: linear-gradient(to bottom, var(--color-dark-bg), transparent); opacity: {showTopGradient ? 1 : 0}; z-index: 10;"
    ></div>

    <!-- Interview Items -->
    <div class="flex flex-col gap-1">
      {#each filteredInterviews as interview (interview.id)}
        <button
          on:click={() => selectInterview(interview.id)}
          class="w-full text-left rounded-lg px-3 py-2 hover:bg-white/5 transition-colors {$currentInterview?.id === interview.id
            ? 'bg-primary-500/10 border border-primary-500/20 border-l-2 border-l-primary-500'
            : 'border border-transparent'}"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium text-primary-500">{interview.interviewCode}</span>
            <span class="text-[10px] font-bold text-primary-500 bg-primary-500/20 px-1.5 py-0.5 rounded uppercase">
              {interview.status}
            </span>
          </div>
          <p class="text-sm font-medium text-white truncate">{interview.title}</p>
          <p class="text-xs text-slate-600 mt-1">{formatDate(interview.createdAt)}</p>
        </button>
      {/each}
    </div>

    <!-- Bottom Gradient Fade -->
    <div
      class="pointer-events-none sticky bottom-0 left-0 right-0 h-4 transition-opacity duration-200"
      style="background: linear-gradient(to top, var(--color-dark-bg), transparent); opacity: {showBottomGradient ? 1 : 0}; z-index: 10;"
    ></div>
  </div>

  <!-- Bottom Section — User Profile (Fixed) -->
  <div class="relative border-t border-white/5">
    <button
      on:click={() => (showUserMenu = !showUserMenu)}
      class="w-full flex items-center gap-3 py-4 px-4 hover:bg-white/5 transition-colors"
    >
      <UserAvatar picture={user?.picture} name={displayName} size="md" color="bg-primary-700" />
      <div class="flex-1 min-w-0 text-left">
        <p class="text-sm font-semibold text-white truncate">{displayName}</p>
        {#if displayEmail}
          <p class="text-xs text-neutral-500 truncate">{displayEmail}</p>
        {/if}
      </div>
      <svg class="w-4 h-4 text-neutral-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    </button>

    <!-- User Menu Dropdown (opens upward) -->
    {#if showUserMenu}
      <div class="absolute bottom-full left-2 right-2 mb-1 z-50 bg-dark-sidebar border border-white/10 rounded-lg shadow-xl overflow-hidden">
        <a
          href="/auth/profile"
          class="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
          on:click={() => (showUserMenu = false)}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Perfil
        </a>
        <div class="border-t border-white/5"></div>
        <button
          on:click={handleLogout}
          disabled={loggingOut}
          class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          {loggingOut ? 'Saindo...' : 'Sair'}
        </button>
      </div>
    {/if}
  </div>
</aside>
