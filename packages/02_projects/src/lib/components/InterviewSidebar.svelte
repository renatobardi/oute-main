<script lang="ts">
  import { onMount } from 'svelte';
  import { currentProject, messages, notes } from '$lib/stores/conversation';
  import { sidebarCollapsed } from '$lib/stores/ui';
  import { OuteLogo } from '@oute/design-system';
  import { users } from '$lib/stores/users';
  import type { Project } from '$lib/types/index';

  let searchQuery = '';
  let contentEl: HTMLDivElement;
  let showTopGradient = false;
  let showBottomGradient = false;
  let projectList: Project[] = [];
  let creating = false;

  function handleScroll() {
    if (!contentEl) return;
    const { scrollTop, scrollHeight, clientHeight } = contentEl;
    showTopGradient = scrollTop > 0;
    showBottomGradient = scrollTop < scrollHeight - clientHeight - 1;
  }

  function selectProject(id: string) {
    const project = projectList.find((p) => p.id === id);
    if (project) {
      currentProject.set(project);
    }
  }

  function handleNewProject() {
    if (creating) return;
    creating = true;
    try {
      const newProject: Project = {
        id: crypto.randomUUID(),
        projectCode: `PRJ-${Date.now()}`,
        title: 'Novo Projeto',
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      projectList = [newProject, ...projectList];
      currentProject.set(newProject);
    } finally {
      creating = false;
    }
  }

  function formatDate(date: Date): string {
    return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(
      Math.round((new Date(date).getTime() - Date.now()) / 86400000),
      'day'
    );
  }

  $: filteredProjects = projectList.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

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
      on:click={handleNewProject}
      disabled={creating}
      class="flex w-4/5 mx-auto items-center justify-center gap-2 rounded-lg bg-transparent py-2.5 text-sm font-bold text-primary-500 border-2 border-primary-500 hover:bg-primary-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {creating ? 'Criando...' : 'New Project'}
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

    <!-- Project Items -->
    <div class="flex flex-col gap-1">
      {#each filteredProjects as project (project.id)}
        <button
          on:click={() => selectProject(project.id)}
          class="w-full text-left rounded-lg px-3 py-2 hover:bg-white/5 transition-colors {$currentProject?.id === project.id
            ? 'bg-primary-500/10 border border-primary-500/20 border-l-2 border-l-primary-500'
            : 'border border-transparent'}"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium text-primary-500">{project.projectCode}</span>
            <span class="text-[10px] font-bold text-primary-500 bg-primary-500/20 px-1.5 py-0.5 rounded uppercase">
              {project.status}
            </span>
          </div>
          <p class="text-sm font-medium text-white truncate">{project.title}</p>
          <p class="text-xs text-slate-600 mt-1">{formatDate(project.createdAt)}</p>
        </button>
      {/each}
    </div>

    <!-- Bottom Gradient Fade -->
    <div
      class="pointer-events-none sticky bottom-0 left-0 right-0 h-4 transition-opacity duration-200"
      style="background: linear-gradient(to top, var(--color-dark-bg), transparent); opacity: {showBottomGradient ? 1 : 0}; z-index: 10;"
    ></div>
  </div>

  <!-- Bottom Section (Fixed) -->
  {#if users.length > 0}
    <div class="flex items-center gap-2 border-t border-dark-bg py-6 px-6">
      <div class="size-8 rounded-full {users[0].avatarColor} flex items-center justify-center text-white font-semibold flex-shrink-0">{users[0].initials}</div>
      <p class="text-sm font-semibold text-white">{users[0].name}</p>
      <button class="text-neutral-500 hover:text-neutral-300 transition-colors ml-auto" aria-label="User options">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
    </div>
  {/if}
</aside>
