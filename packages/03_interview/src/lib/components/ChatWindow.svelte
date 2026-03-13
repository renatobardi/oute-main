<script lang="ts">
  import ChatMessage from './ChatMessage.svelte';
  import InterviewHeader from './InterviewHeader.svelte';
  import { messages, currentInterview } from '$lib/stores/conversation';
  import { onMount } from 'svelte';

  let scrollContainer: HTMLDivElement;
  let lastMessageRef: HTMLDivElement;
  let shouldAutoScroll = true;

  onMount(() => {
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
  <div bind:this={scrollContainer} class="flex-1 overflow-y-auto bg-[#0f1e23]">
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
</div>
