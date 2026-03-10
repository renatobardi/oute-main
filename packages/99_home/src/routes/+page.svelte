<script lang="ts">
  import HeroSection from '$lib/components/HeroSection.svelte';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import CTAButton from '$lib/components/CTAButton.svelte';
  import GithubLink from '$lib/components/GithubLink.svelte';
  import StatsSection from '$lib/components/StatsSection.svelte';
</script>

<div class="flex flex-col min-h-[calc(100vh-120px)]">
  <!-- Hero Section -->
  <HeroSection />

  <!-- Search Input -->
  <div class="max-w-7xl mx-auto w-full px-6 mb-6">
    <SearchInput />
  </div>

  <!-- CTA Section -->
  <div class="text-center mb-12">
    <CTAButton href="/dashboard" text="Entrar na Oute" />
    <div class="mt-4">
      <GithubLink />
    </div>
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Stats Section -->
  <StatsSection />
</div>
