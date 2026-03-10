<script lang="ts">
  import CircularProgress from './CircularProgress.svelte';
  import StatusTag from './StatusTag.svelte';
  import TypeTag from './TypeTag.svelte';
  import AvatarGroup from './AvatarGroup.svelte';

  export let code: string;
  export let name: string;
  export let status: 'em_andamento' | 'concluida' | 'pendente';
  export let type: 'greenfield' | 'brownfield';
  export let progress: number;
  export let members: string[];
  export let lastUpdate: string;
</script>

<div
  class="estimation-card bg-[#162a31] border border-[#21404a] rounded-xl p-5 flex flex-col gap-4 hover:border-[#2d5560] transition-colors cursor-pointer"
>
  <div class="flex items-start justify-between">
    <div class="flex flex-col gap-2">
      <span class="text-[11px] text-neutral-500 font-mono">{code}</span>
      <h3 class="text-base font-semibold text-white">{name}</h3>
    </div>
    <CircularProgress percentage={progress} />
  </div>

  <div class="flex items-center gap-2 flex-wrap">
    <StatusTag {status} />
    <TypeTag {type} />
  </div>

  <div class="flex items-center justify-between mt-auto pt-2">
    <AvatarGroup avatars={members} />
    <span class="text-[11px] text-neutral-500">Ultima atualização: {lastUpdate}</span>
  </div>
</div>
