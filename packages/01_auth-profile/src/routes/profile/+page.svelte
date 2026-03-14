<script lang="ts">
  import { goto } from '$app/navigation';
  import { logout } from '$lib/auth';

  export let data: { user: { uid: string; email?: string; name?: string; picture?: string } };

  let loggingOut = false;

  async function handleLogout() {
    loggingOut = true;
    try {
      await logout();
      await goto('/auth/login', { replaceState: true });
    } catch {
      loggingOut = false;
    }
  }

  $: initials = data.user.name
    ? data.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : data.user.email?.[0]?.toUpperCase() ?? '?';
</script>

<svelte:head>
  <title>OUTE — Meu Perfil</title>
</svelte:head>

<div class="page">
  <div class="card">
    <div class="avatar-area">
      {#if data.user.picture}
        <img src={data.user.picture} alt="Avatar" class="avatar-img" />
      {:else}
        <div class="avatar-placeholder">{initials}</div>
      {/if}
    </div>

    <div class="info">
      <h2 class="name">{data.user.name ?? 'Usuário'}</h2>
      <p class="email">{data.user.email ?? ''}</p>
    </div>

    <div class="actions">
      <button
        on:click={handleLogout}
        disabled={loggingOut}
        class="btn btn-logout"
        type="button"
      >
        {loggingOut ? 'Saindo...' : 'Sair'}
      </button>
    </div>
  </div>
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }

  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--color-dark-bg);
  }

  .card {
    background: var(--color-dark-surface);
    border: 1px solid var(--color-dark-border);
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    max-width: 360px;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  }

  .avatar-area {
    margin-bottom: 1.25rem;
  }

  .avatar-img {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
    margin: 0 auto;
    display: block;
  }

  .avatar-placeholder {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    background: var(--color-primary-500);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 auto;
  }

  .info {
    margin-bottom: 2rem;
  }

  .name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.25rem;
  }

  .email {
    color: var(--color-neutral-500);
    font-size: 0.875rem;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
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

  .btn-logout {
    background: color-mix(in srgb, var(--color-error) 10%, transparent);
    color: var(--color-error);
    border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
  }

  .btn-logout:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-error) 20%, transparent);
  }
</style>
