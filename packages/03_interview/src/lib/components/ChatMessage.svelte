<script lang="ts">
  import { OuteLogo } from '@oute/design-system';

  export let sender: 'user' | 'ai';
  export let content: string;
  export let timestamp: Date;
  export let userName: string = 'U';
  export let avatarColor: string = 'bg-slate-600';

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
</script>

<div
  class="flex gap-3 px-6 py-4 {sender === 'user'
    ? 'justify-end'
    : 'justify-start'}"
>
  <div
    class="relative max-w-xs px-4 py-2 rounded-lg border border-[#21404a] {sender === 'user'
      ? 'bg-[#0f1e23] text-white'
      : 'bg-[#0f1e23] text-white'}"
  >
    {#if sender === 'ai'}
      <div class="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-[#000000] rounded-full border border-[#21404a]">
        <div class="w-3 h-3">
          <OuteLogo size="xs" showSlogan={false} horizontal={false} />
        </div>
      </div>
    {:else}
      <div class="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center {avatarColor} rounded-full border border-[#21404a] text-xs font-bold text-white">
        {getInitials(userName)}
      </div>
    {/if}
    <p class="text-sm">{content}</p>
    <p class="text-xs mt-1 {sender === 'user' ? 'text-neutral-500' : 'text-neutral-500'}">
      {formatTime(timestamp)}
    </p>
  </div>
</div>
