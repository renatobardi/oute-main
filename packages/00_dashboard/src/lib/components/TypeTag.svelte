<script lang="ts">
  export let type: 'greenfield' | 'brownfield';

  const config: Record<string, { label: string; bg: string; text: string }> = {
    greenfield: { label: 'GREENFIELD', bg: 'bg-teal-900/40', text: 'text-teal-400' },
    brownfield: { label: 'BROWNFIELD', bg: 'bg-slate-700/50', text: 'text-slate-300' },
  };

  $: current = config[type];
</script>

<span
  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide {current.bg} {current.text}"
>
  {current.label}
</span>
