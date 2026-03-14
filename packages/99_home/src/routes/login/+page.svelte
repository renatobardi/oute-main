<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/auth';

  let email = '';
  let password = '';
  let isLoading = false;
  let errorMessage = '';

  async function handleLogin() {
    // Validate inputs
    if (email === '' || password === '') {
      errorMessage = 'Por favor, preencha email e senha';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      // Call the login function from auth.ts
      // This will POST to /api/auth?action=login
      await login(email, password);

      // Success! Redirect to chat
      await goto('/chat');
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : 'Erro ao fazer login. Tente novamente.';
      // eslint-disable-next-line no-console
      console.error('Login error:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  }
</script>

<div class="flex items-center justify-center min-h-[calc(100vh-120px)]">
  <div class="w-full max-w-md">
    <div class="bg-dark-surface border border-dark-border rounded-lg p-8">
      <h1 class="text-2xl font-bold text-white mb-6 text-center">Login</h1>

      {#if errorMessage !== ''}
        <div class="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-100 text-sm">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-neutral-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            on:keydown={handleKeydown}
            placeholder="seu@email.com"
            disabled={isLoading}
            class="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-primary-600 disabled:opacity-50"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-neutral-300 mb-1">
            Senha
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            on:keydown={handleKeydown}
            placeholder="••••••••"
            disabled={isLoading}
            class="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-primary-600 disabled:opacity-50"
          />
        </div>

        <button
          on:click={handleLogin}
          disabled={isLoading}
          class="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>

      <p class="text-center text-sm text-neutral-400 mt-6">
        Teste com: <br />
        Email: <code class="text-primary-400">user@example.com</code> <br />
        Senha: <code class="text-primary-400">SecurePass123!</code>
      </p>
    </div>
  </div>
</div>
