<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import CTAButton from '$lib/components/CTAButton.svelte';
  import GithubLink from '$lib/components/GithubLink.svelte';
  import StatsSection from '$lib/components/StatsSection.svelte';
  import { getToken, initializeAuth } from '$lib/auth';

  let ctaHref = '/login';
  let ctaText = 'Entrar na Oute';

  onMount(() => {
    // Initialize auth from localStorage
    initializeAuth();

    // Check if user is already authenticated
    const token = getToken();
    if (token) {
      ctaHref = '/chat';
      ctaText = 'Entrar no Chat';
    }
  });

  function handleCTA() {
    goto(ctaHref);
  }
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
    <CTAButton text={ctaText} on:click={handleCTA} />
    <div class="mt-4">
      <GithubLink />
    </div>
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Stats Section -->
  <StatsSection />
</div>
