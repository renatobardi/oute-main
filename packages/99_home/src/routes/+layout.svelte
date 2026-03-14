<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
</script>

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
