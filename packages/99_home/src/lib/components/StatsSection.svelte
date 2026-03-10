<script lang="ts">
  import StatCard from './StatCard.svelte';
</script>

<section class="bg-[#162a31] border-t border-[#21404a] py-12 md:py-16 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
      <StatCard number={57} label="Projetos já estimados" />
      <StatCard number={127} label="Arquitetos" />
      <StatCard number="∞" label="Impacto para tecnologia" />
    </div>
  </div>
</section>
