<script lang="ts">
  import EstimationCard from '$lib/components/EstimationCard.svelte';
  import CreateCard from '$lib/components/CreateCard.svelte';
  import ViewToggle from '$lib/components/ViewToggle.svelte';
  import FilterDropdown from '$lib/components/FilterDropdown.svelte';

  let viewMode: 'grid' | 'list' = 'grid';

  const estimations = [
    {
      code: 'OUT-101',
      name: 'Mobile Banking App',
      status: 'em_andamento' as const,
      type: 'greenfield' as const,
      progress: 45,
      members: ['Ana', 'Bruno', 'Carlos', 'Diana', 'Eduardo'],
      lastUpdate: '2h atrás',
    },
    {
      code: 'OUT-102',
      name: 'E-commerce Platform',
      status: 'concluida' as const,
      type: 'brownfield' as const,
      progress: 88,
      members: ['Felipe', 'Gabriela'],
      lastUpdate: '5h atrás',
    },
    {
      code: 'OUT-103',
      name: 'Legacy Migration',
      status: 'pendente' as const,
      type: 'brownfield' as const,
      progress: 22,
      members: ['Helena'],
      lastUpdate: '1d atrás',
    },
    {
      code: 'OUT-104',
      name: 'Internal CRM Tool',
      status: 'em_andamento' as const,
      type: 'greenfield' as const,
      progress: 65,
      members: ['Igor', 'Julia', 'Karen'],
      lastUpdate: '3h atrás',
    },
  ];
</script>

<div class="max-w-7xl mx-auto px-6 py-8">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
    <div>
      <h1 class="text-3xl font-bold text-white mb-2">Estimations</h1>
      <p class="text-sm text-neutral-400 max-w-md">
        Overview of AI-driven project scopes, budget forecasts, and architect confidence metrics.
      </p>
    </div>

    <div class="flex items-center gap-3">
      <ViewToggle bind:active={viewMode} />
      <FilterDropdown
        label="Status"
        icon="&#x2261;"
        options={['Todos', 'Em Andamento', 'Concluída', 'Pendente']}
      />
      <FilterDropdown
        label="Tipo"
        icon="&#x25CB;"
        options={['Todos', 'Greenfield', 'Brownfield']}
      />
    </div>
  </div>

  <!-- Estimation Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {#each estimations as estimation}
      <EstimationCard
        code={estimation.code}
        name={estimation.name}
        status={estimation.status}
        type={estimation.type}
        progress={estimation.progress}
        members={estimation.members}
        lastUpdate={estimation.lastUpdate}
      />
    {/each}
    <CreateCard />
  </div>
</div>
