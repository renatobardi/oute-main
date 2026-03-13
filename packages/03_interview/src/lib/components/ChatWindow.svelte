<script lang="ts">
  import ChatMessage from './ChatMessage.svelte';
  import InterviewHeader from './InterviewHeader.svelte';
  import { messages, currentInterview, chatWindowScrollState } from '$lib/stores/conversation';
  import { onMount } from 'svelte';

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
    <InterviewHeader interview={$currentInterview} />
  {/if}

  <!-- Messages -->
  <div class="flex-1 relative overflow-hidden bg-[#000000]">
    <!-- Scrollable Content -->
    <div bind:this={scrollContainer} class="absolute inset-0 overflow-y-auto">
      {#each $messages as message (message.id)}
        <ChatMessage
          sender={message.sender}
          content={message.content}
          timestamp={message.timestamp}
        />
      {/each}

      <!-- Ref para Intersection Observer detectar última mensagem -->
      <div bind:this={lastMessageRef} class="h-0" />
    </div>

    <!-- Top Gradient Fade (Fixed overlay) -->
    <div
      class="pointer-events-none absolute top-0 left-0 right-0 h-12 transition-opacity duration-200"
      class:opacity-0={!$chatWindowScrollState.showTopGradient}
      class:opacity-100={$chatWindowScrollState.showTopGradient}
      style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent); z-index: 10;"
    />

    <!-- Bottom Gradient Fade (Fixed overlay) -->
    <div
      class="pointer-events-none absolute bottom-0 left-0 right-0 h-12 transition-opacity duration-200"
      class:opacity-0={!$chatWindowScrollState.showBottomGradient}
      class:opacity-100={$chatWindowScrollState.showBottomGradient}
      style="background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent); z-index: 10;"
    />
  </div>
</div>
