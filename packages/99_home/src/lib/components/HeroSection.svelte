<script lang="ts">
  export let headline = 'Olá! Sou seu Arquiteto de Software.';
  export let subtitle = 'Venha estimar seu próximo grande projeto!';
</script>

<section class="py-16 md:py-24 text-center px-6">
  <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
    {headline}
  </h1>
  <p class="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
    {subtitle}
  </p>
</section>

<style>
  section {
    background: linear-gradient(135deg, #0f1e23 0%, #162a31 50%, #0f1e23 100%);
  }
</style>
