<script lang="ts">
  import ChatMessage from './ChatMessage.svelte';
  import InterviewHeader from './InterviewHeader.svelte';
  import { messages, currentInterview, chatWindowScrollState, estimationId, estimationStatus } from '$lib/stores/conversation';
  import { notePanelCollapsed, sidebarCollapsed } from '$lib/stores/ui';
  import { approveEstimation } from '$lib/api';
  import { onMount } from 'svelte';

  let approving = false;
  let feedbackMode = false;
  let feedbackText = '';

  async function handleApprove() {
    if (!$estimationId || approving) return;
    approving = true;
    try {
      await approveEstimation($estimationId, true);
      estimationStatus.set('running');
      feedbackMode = false;
    } catch (err) {
      console.error('[ChatWindow] Failed to approve estimation', err);
    } finally {
      approving = false;
    }
  }

  async function handleApproveWithFeedback() {
    if (!$estimationId || approving || !feedbackText.trim()) return;
    approving = true;
    try {
      await approveEstimation($estimationId, true, feedbackText.trim());
      estimationStatus.set('running');
      feedbackMode = false;
      feedbackText = '';
    } catch (err) {
      console.error('[ChatWindow] Failed to approve with feedback', err);
    } finally {
      approving = false;
    }
  }

  let scrollContainer: HTMLDivElement;
  let lastMessageRef: HTMLDivElement;
  let shouldAutoScroll = true;

  function updateScrollState() {
    if (!scrollContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const maxScroll = scrollHeight - clientHeight;
    const showTop = scrollTop > 10;
    const showBottom = scrollTop < maxScroll - 10;
    chatWindowScrollState.set({ showTopGradient: showTop, showBottomGradient: showBottom });
  }

  onMount(() => {
    // Listen for scroll events
    scrollContainer?.addEventListener('scroll', updateScrollState);

    // Initial state
    updateScrollState();

    // Intersection Observer para detectar se última mensagem está visível
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            shouldAutoScroll = true;
          } else if (entry.boundingClientRect.bottom < 0) {
            shouldAutoScroll = false;
          }
        });
      },
      { root: scrollContainer, threshold: 0.1 }
    );

    if (lastMessageRef) {
      observer.observe(lastMessageRef);
    }

    return () => {
      observer.disconnect();
      scrollContainer?.removeEventListener('scroll', updateScrollState);
    };
  });

  $: if (scrollContainer && shouldAutoScroll && $messages.length > 0) {
    // Auto-scroll to bottom when messages change (se user estava vendo o bottom)
    setTimeout(() => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }, 0);
  }
</script>

<div class="flex flex-col h-full">
  <!-- Header -->
  {#if $currentInterview}
    <InterviewHeader interview={$currentInterview} notePanelCollapsed={$notePanelCollapsed} sidebarCollapsed={$sidebarCollapsed} />
  {/if}

  <!-- Messages -->
  <div class="flex-1 relative overflow-hidden bg-[#000000]">
    <!-- Scrollable Content -->
    <div bind:this={scrollContainer} class="absolute inset-0 overflow-y-scroll">
      {#each $messages as message (message.id)}
        <ChatMessage
          sender={message.sender}
          content={message.content}
          timestamp={message.timestamp}
          userName={message.userName || 'User'}
          avatarColor={message.avatarColor || 'bg-slate-600'}
          avatarUrl={message.avatarUrl}
        />
      {/each}

      <!-- Botões de aprovação (fase 1 do pipeline) -->
      {#if $estimationStatus === 'awaiting_approval' && $estimationId}
        <div class="px-6 py-4">
          {#if !feedbackMode}
            <div class="flex flex-col gap-2 p-4 rounded-xl border border-primary-500/30 bg-primary-500/5">
              <p class="text-xs text-neutral-400 mb-2">Revise o escopo acima antes de continuar:</p>
              <div class="flex gap-3">
                <button
                  on:click={handleApprove}
                  disabled={approving}
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-[#0f1e23] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#if approving}
                    <span class="w-4 h-4 border-2 border-[#0f1e23]/40 border-t-transparent rounded-full animate-spin"></span>
                  {:else}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  {/if}
                  Aprovar e continuar
                </button>
                <button
                  on:click={() => { feedbackMode = true; }}
                  disabled={approving}
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary-500/40 hover:bg-primary-500/10 text-primary-400 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Enviar feedback
                </button>
              </div>
            </div>
          {:else}
            <div class="flex flex-col gap-3 p-4 rounded-xl border border-primary-500/30 bg-primary-500/5">
              <p class="text-xs text-neutral-400">Descreva o ajuste necessário:</p>
              <textarea
                bind:value={feedbackText}
                placeholder="Ex: Adicione integração com sistema legado..."
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                rows="3"
              ></textarea>
              <div class="flex gap-3">
                <button
                  on:click={handleApproveWithFeedback}
                  disabled={approving || !feedbackText.trim()}
                  class="flex-1 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-[#0f1e23] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {approving ? 'Enviando...' : 'Aprovar com feedback'}
                </button>
                <button
                  on:click={() => { feedbackMode = false; feedbackText = ''; }}
                  class="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-neutral-400 text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Ref para Intersection Observer detectar última mensagem -->
      <div bind:this={lastMessageRef} class="h-0"></div>
    </div>

    <!-- Top Gradient Fade (Fixed overlay) -->
    {#if $chatWindowScrollState.showTopGradient}
      <div
        class="pointer-events-none absolute top-0 left-0 right-0 transition-opacity duration-200"
        style="height: 40px; background: linear-gradient(to bottom, rgba(10, 10, 15, 0.95), transparent); z-index: 20;"
      ></div>
    {/if}

    <!-- Bottom Gradient Fade (Fixed overlay) -->
    {#if $chatWindowScrollState.showBottomGradient}
      <div
        class="pointer-events-none absolute bottom-0 left-0 right-0 transition-opacity duration-200"
        style="height: 40px; background: linear-gradient(to top, rgba(10, 10, 15, 0.95), transparent); z-index: 20;"
      ></div>
    {/if}
  </div>
</div>
