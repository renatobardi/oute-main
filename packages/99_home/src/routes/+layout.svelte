<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
</script>

<svelte:head>
  <!-- Open Graph Meta Tags for Social Media Preview -->
  <meta property="og:title" content="Oute - Seu Arquiteto de Software com IA" />
  <meta property="og:description" content="Plataforma inteligente para arquitetar e validar projetos de software. Explore soluções inovadoras com inteligência artificial." />
  <meta property="og:url" content="https://oute.pro" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Oute - Seu Arquiteto de Software com IA" />
  <meta name="twitter:description" content="Plataforma inteligente para arquitetar e validar projetos de software." />
</svelte:head>

<div class="min-h-screen bg-dark-bg flex flex-col">
  <!-- Navigation Bar -->
  <Navbar />

  <!-- Main Content -->
  <main class="flex-1">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-dark-bg border-t border-dark-border py-6 px-6 text-center text-neutral-600 text-sm">
    © 2024 OUTE - Arquiteto de Software com IA. Todos os direitos reservados.
  </footer>
</div>
