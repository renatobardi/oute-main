<script lang="ts">
  export let status: 'em_andamento' | 'concluida' | 'pendente';

  const config: Record<string, { label: string; bg: string; text: string }> = {
    em_andamento: { label: 'EM ANDAMENTO', bg: 'bg-cyan-900/40', text: 'text-cyan-400' },
    concluida: { label: 'CONCLUÍDA', bg: 'bg-emerald-900/40', text: 'text-emerald-400' },
    pendente: { label: 'PENDENTE', bg: 'bg-amber-900/40', text: 'text-amber-400' },
  };

  $: current = config[status];
</script>

<span
  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide {current.bg} {current.text}"
>
  {current.label}
</span>
