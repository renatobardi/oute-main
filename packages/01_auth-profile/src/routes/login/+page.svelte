<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { loginWithEmail, loginWithGoogle, loginWithGitHub } from '$lib/auth';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let activeProvider = '';

  // Para onde redirecionar após login
  $: redirectTo = $page.url.searchParams.get('redirect') ?? '/chat';

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
      await goto(redirectTo, { replaceState: true });
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
      await goto(redirectTo, { replaceState: true });
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
      await goto(redirectTo, { replaceState: true });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Falha no login com GitHub';
    } finally {
      loading = false;
      activeProvider = '';
    }
  }
</script>

<svelte:head>
  <title>OUTE — Entrar</title>
</svelte:head>

<div class="page">
  <div class="card">
    <!-- Logo -->
    <div class="logo-area">
      <h1 class="logo-title">OUTE</h1>
      <p class="logo-sub">Plataforma de Entrevistas</p>
    </div>

    <!-- Erro -->
    {#if error}
      <div class="error-box">{error}</div>
    {/if}

    <!-- Social Login -->
    <div class="social-buttons">
      <button
        on:click={handleGoogle}
        disabled={loading}
        class="btn btn-google"
        type="button"
      >
        {#if activeProvider === 'google'}
          <span class="spinner"></span>
        {:else}
          <svg class="icon" viewBox="0 0 24 24">
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
        class="btn btn-github"
        type="button"
      >
        {#if activeProvider === 'github'}
          <span class="spinner spinner-light"></span>
        {:else}
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        {/if}
        Continuar com GitHub
      </button>
    </div>

    <!-- Divider -->
    <div class="divider">
      <div class="divider-line"></div>
      <span class="divider-text">ou com email</span>
      <div class="divider-line"></div>
    </div>

    <!-- Email form -->
    <form on:submit|preventDefault={handleEmail} class="form">
      <div class="field">
        <label for="email" class="label">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="voce@exemplo.com"
          class="input"
          disabled={loading}
          autocomplete="email"
        />
      </div>

      <div class="field">
        <label for="password" class="label">Senha</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          class="input"
          disabled={loading}
          autocomplete="current-password"
        />
      </div>

      <button type="submit" disabled={loading} class="btn btn-primary">
        {#if activeProvider === 'email'}
          <span class="spinner spinner-light"></span>
          Entrando...
        {:else}
          Entrar com Email
        {/if}
      </button>
    </form>
  </div>
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) { background: #0f1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: #0f1117;
  }

  .card {
    background: #1a1d27;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  }

  .logo-area {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo-title {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .logo-sub {
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .error-box {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .social-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: background 0.15s, opacity 0.15s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-google {
    background: #fff;
    color: #1f2937;
  }

  .btn-google:hover:not(:disabled) {
    background: #f3f4f6;
  }

  .btn-github {
    background: #24292e;
    color: #fff;
  }

  .btn-github:hover:not(:disabled) {
    background: #2f363d;
  }

  .btn-primary {
    background: #6366f1;
    color: #fff;
    margin-top: 0.5rem;
  }

  .btn-primary:hover:not(:disabled) {
    background: #4f46e5;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-top-color: #374151;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  .spinner-light {
    border-color: rgba(255, 255, 255, 0.2);
    border-top-color: #fff;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }

  .divider-text {
    color: #6b7280;
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #d1d5db;
  }

  .input {
    padding: 0.625rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: #fff;
    font-size: 0.9375rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .input::placeholder {
    color: #6b7280;
  }

  .input:focus {
    border-color: #6366f1;
  }

  .input:disabled {
    opacity: 0.5;
  }
</style>
