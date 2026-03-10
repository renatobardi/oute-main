<script lang="ts">
  import MetricBadge from './MetricBadge.svelte';
  import { notes, exportNotes } from '$lib/stores/conversation';

  let editMode = false;
  let editContent = $notes.content;

  function handleSave() {
    notes.update((n) => ({
      ...n,
      content: editContent,
    }));
    editMode = false;
  }

  function handleExport() {
    const exportText = exportNotes();
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-notes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="flex flex-col h-full">
  <!-- Header -->
  <div class="px-4 py-4 border-b border-[#21404a]">
    <h3 class="text-sm font-semibold text-white">Conversation Notes</h3>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
    <!-- Metrics -->
    <div class="space-y-2">
      <MetricBadge label="Progress" value={`${$notes.metrics.progress}%`} icon="📊" />
      <MetricBadge label="Estimated Hours" value={$notes.metrics.estimatedHours} icon="⏱️" />
      <MetricBadge label="Budget" value={$notes.metrics.budget} icon="💰" />
    </div>

    <!-- Tags -->
    {#if $notes.tags.length > 0}
      <div>
        <p class="text-xs text-neutral-500 mb-2">Tags</p>
        <div class="flex flex-wrap gap-2">
          {#each $notes.tags as tag}
            <span class="px-2 py-1 bg-primary-600/10 text-primary-400 text-xs rounded">
              {tag}
            </span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Notes -->
    <div>
      <p class="text-xs text-neutral-500 mb-2">Notes</p>
      {#if editMode}
        <textarea
          bind:value={editContent}
          class="w-full bg-[#0f1e23] border border-[#21404a] rounded px-3 py-2 text-xs text-neutral-300 resize-none focus:outline-none focus:border-primary-600"
          rows="6"
        ></textarea>
        <div class="flex gap-2 mt-2">
          <button
            on:click={handleSave}
            class="flex-1 py-1 px-2 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded transition-colors"
          >
            Save
          </button>
          <button
            on:click={() => (editMode = false)}
            class="flex-1 py-1 px-2 bg-neutral-700 hover:bg-neutral-600 text-white text-xs rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      {:else}
        <p class="text-xs text-neutral-300 bg-[#0f1e23] p-3 rounded min-h-20 whitespace-pre-wrap">
          {$notes.content}
        </p>
        <button
          on:click={() => (editMode = true)}
          class="w-full mt-2 py-1 px-2 bg-neutral-700 hover:bg-neutral-600 text-white text-xs rounded transition-colors"
        >
          Edit
        </button>
      {/if}
    </div>
  </div>

  <!-- Footer -->
  <div class="px-4 py-3 border-t border-[#21404a]">
    <button
      on:click={handleExport}
      class="w-full py-2 px-3 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-medium rounded transition-colors"
    >
      📥 Export Notes
    </button>
  </div>
</div>
