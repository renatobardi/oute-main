<script lang="ts">
  import ChatMessage from './ChatMessage.svelte';
  import ChatInput from './ChatInput.svelte';
  import InterviewHeader from './InterviewHeader.svelte';
  import { messages, currentInterview } from '$lib/stores/conversation';

  let scrollContainer: HTMLDivElement;

  $: if (scrollContainer) {
    // Auto-scroll to bottom when messages change
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
  </div>

  <!-- Input -->
  <ChatInput />
</div>
