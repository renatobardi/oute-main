<script lang="ts">
  import ChatMessage from './ChatMessage.svelte';
  import InterviewHeader from './InterviewHeader.svelte';
  import { messages, currentInterview, chatWindowScrollState } from '$lib/stores/conversation';
  import { onMount } from 'svelte';

  let scrollContainer: HTMLDivElement;
  let lastMessageRef: HTMLDivElement;
  let shouldAutoScroll = true;

  onMount(() => {
    // Update scroll state continuously
    const scrollInterval = setInterval(() => {
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const maxScroll = scrollHeight - clientHeight;
        const showTop = scrollTop > 0;
        const showBottom = scrollTop < maxScroll - 1;
        chatWindowScrollState.set({ showTopGradient: showTop, showBottomGradient: showBottom });
      }
    }, 50);

    // Intersection Observer para detectar se última mensagem está visível
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            shouldAutoScroll = true;
          } else if (entry.boundingClientRect.bottom < 0) {
            // User scrolled up
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
      clearInterval(scrollInterval);
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
  <div bind:this={scrollContainer} class="flex-1 overflow-y-auto bg-[#000000] relative">
    <!-- Top Gradient Fade -->
    <div
      class="pointer-events-none sticky top-0 left-0 right-0 h-4 transition-opacity duration-200"
      class:opacity-0={!$chatWindowScrollState.showTopGradient}
      class:opacity-100={$chatWindowScrollState.showTopGradient}
      style="background: linear-gradient(to bottom, #000000, transparent); z-index: 10;"
    />

    {#each $messages as message (message.id)}
      <ChatMessage
        sender={message.sender}
        content={message.content}
        timestamp={message.timestamp}
      />
    {/each}

    <!-- Bottom Gradient Fade -->
    <div
      class="pointer-events-none sticky bottom-0 left-0 right-0 h-4 transition-opacity duration-200"
      class:opacity-0={!$chatWindowScrollState.showBottomGradient}
      class:opacity-100={$chatWindowScrollState.showBottomGradient}
      style="background: linear-gradient(to top, #000000, transparent); z-index: 10;"
    />

    <!-- Ref para Intersection Observer detectar última mensagem -->
    <div bind:this={lastMessageRef} class="h-0" />
  </div>
</div>
