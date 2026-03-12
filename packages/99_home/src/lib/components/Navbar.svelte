<script lang="ts">
	import OuteLogo from './OuteLogo.svelte';
</script>

<nav class="bg-[#162a31] border-b border-[#21404a]">
  <div class="max-w-7xl mx-auto px-6 py-3 flex items-center">
    <!-- Logo (Left) -->
    <OuteLogo size="md" showSlogan={true} />

    <!-- Right Section (Nav Links + Button) -->
    <div class="ml-auto flex items-center gap-8">
      <!-- Nav Links -->
      <div class="hidden md:flex gap-6">
        <a
          href="#documentation"
          class="text-neutral-500 hover:text-neutral-300 font-medium text-sm transition-colors"
        >
          Documentação
        </a>
        <a
          href="#pricing"
          class="text-neutral-500 hover:text-neutral-300 font-medium text-sm transition-colors"
        >
          Preços
        </a>
      </div>

      <!-- Create Account Button -->
      <button class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
        Criar Conta
      </button>
    </div>
  </div>
</nav>
