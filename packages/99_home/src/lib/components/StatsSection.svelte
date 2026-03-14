<script lang="ts">
  import StatCard from './StatCard.svelte';
</script>

<section class="bg-black py-6 md:py-8 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <StatCard number={57} label="Projetos já estimados" />
      <StatCard number={127} label="Arquitetos" />
      <StatCard number="∞" label="Impacto para tecnologia" />
    </div>
  </div>
</section>
