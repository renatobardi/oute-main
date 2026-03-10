<script lang="ts">
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let isLoading = false;

  async function handleLogin() {
    isLoading = true;
    try {
      // TODO: Implement actual login
      console.log('Login attempt:', { email, password });
      await goto('/dashboard');
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex items-center justify-center min-h-[calc(100vh-120px)]">
  <div class="w-full max-w-md">
    <div class="bg-[#162a31] border border-[#21404a] rounded-lg p-8">
      <h1 class="text-2xl font-bold text-white mb-6 text-center">Login</h1>

      <div class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-neutral-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="seu@email.com"
            class="w-full bg-[#0f1e23] border border-[#21404a] rounded px-3 py-2 text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-primary-600"
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
            placeholder="••••••••"
            class="w-full bg-[#0f1e23] border border-[#21404a] rounded px-3 py-2 text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-primary-600"
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
    </div>
  </div>
</div>
