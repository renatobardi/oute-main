<script lang="ts">
  export let sender: 'user' | 'ai';
  export let content: string;
  export let timestamp: Date;

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div
  class="flex gap-3 px-6 py-4 {sender === 'user'
    ? 'justify-end'
    : 'justify-start'}"
>
  <div
    class="max-w-xs px-4 py-2 rounded-lg {sender === 'user'
      ? 'bg-primary-600 text-white'
      : 'bg-[#21404a] text-neutral-200'}"
  >
    <p class="text-sm">{content}</p>
    <p class="text-xs mt-1 {sender === 'user' ? 'text-primary-100' : 'text-neutral-500'}">
      {formatTime(timestamp)}
    </p>
  </div>
</div>
