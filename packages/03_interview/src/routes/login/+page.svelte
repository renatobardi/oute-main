<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { loginWithEmail, loginWithGoogle, loginWithGitHub } from '$lib/auth';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let activeProvider = '';

  $: redirectTo = $page.url.searchParams.get('redirect') ?? '/';

  async function handleEmail() {
    if (!email || !password) {
      error = 'Preencha email e senha';
      return;
    }
    loading = true;
    activeProvider = 'email';
    error = '';
    try {
      await loginWithEmail(email, password);
      await goto(redirectTo);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Falha no login';
    } finally {
      loading = false;
      activeProvider = '';
    }
  }

  async function handleGoogle() {
    loading = true;
    activeProvider = 'google';
    error = '';
    try {
      await loginWithGoogle();
      await goto(redirectTo);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Falha no login com Google';
    } finally {
      loading = false;
      activeProvider = '';
    }
  }

  async function handleGitHub() {
    loading = true;
    activeProvider = 'github';
    error = '';
    try {
      await loginWithGitHub();
      await goto(redirectTo);
    } catch (err: any) {
      if (err?.code === 'auth/account-exists-with-different-credential') {
        error = 'Este email já está cadastrado com outro método de login. Tente com Google ou Email.';
      } else {
        error = err instanceof Error ? err.message : 'Falha no login com GitHub';
      }
    } finally {
      loading = false;
      activeProvider = '';
    }
  }
</script>

<div class="min-h-screen bg-dark-bg flex items-center justify-center p-4">
  <div class="bg-dark-surface rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/10">

    <!-- Logo -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white tracking-tight">OUTE</h1>
      <p class="text-neutral-400 mt-1 text-sm">Interview Platform</p>
    </div>

    <!-- Error -->
    {#if error}
      <div class="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4">
        {error}
      </div>
    {/if}

    <!-- Social Login -->
    <div class="space-y-3 mb-6">
      <button
        on:click={handleGoogle}
        disabled={loading}
        class="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-2.5 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {#if activeProvider === 'google'}
          <span class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
        {:else}
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        {/if}
        Continuar com Google
      </button>

      <button
        on:click={handleGitHub}
        disabled={loading}
        class="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white py-2.5 rounded-lg font-medium hover:bg-[#2f363d] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {#if activeProvider === 'github'}
          <span class="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></span>
        {:else}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        {/if}
        Continuar com GitHub
      </button>
    </div>

    <!-- Divider -->
    <div class="relative mb-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-white/10"></div>
      </div>
      <div class="relative flex justify-center text-xs">
        <span class="bg-dark-surface px-2 text-neutral-500">ou com email</span>
      </div>
    </div>

    <!-- Email form -->
    <form on:submit|preventDefault={handleEmail} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-neutral-300 mb-1">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          disabled={loading}
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-neutral-300 mb-1">Senha</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {#if activeProvider === 'email'}
          <span class="flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></span>
            Entrando...
          </span>
        {:else}
          Entrar com Email
        {/if}
      </button>
    </form>
  </div>
</div>
