<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
</script>

<div class="min-h-screen bg-[#0f1e23] flex flex-col">
  <!-- Navigation Bar -->
  <Navbar />

  <!-- Main Content -->
  <main class="flex-1">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-[#0f1e23] border-t border-[#21404a] py-6 px-6 text-center text-neutral-600 text-sm">
    © 2024 OUTE - Arquiteto de Software com IA. Todos os direitos reservados.
  </footer>
</div>
