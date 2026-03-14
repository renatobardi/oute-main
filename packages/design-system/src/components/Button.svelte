<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface $$Props extends HTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'icon' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    href?: string;
  }

  export let variant: 'primary' | 'outline' | 'icon' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let href: string | undefined = undefined;

  const variantClasses = {
    primary:
      'bg-primary-500 text-dark-bg font-bold hover:bg-primary-600 active:opacity-90 focus:ring-2 focus:ring-primary-500/50',
    outline:
      'bg-transparent text-primary-500 font-bold border-2 border-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20 focus:ring-2 focus:ring-primary-500/50',
    ghost:
      'bg-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5 focus:ring-2 focus:ring-neutral-500/50',
    icon: 'bg-transparent text-neutral-400 hover:text-neutral-200 focus:ring-1 focus:ring-neutral-500/50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  const iconSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  $: sizeClass = variant === 'icon' ? iconSizeClasses[size] : sizeClasses[size];
</script>

{#if href}
  <a
    {href}
    class="inline-flex items-center justify-center rounded-lg transition-colors duration-200 focus:outline-none {variantClasses[variant]} {sizeClass}"
    {...$$restProps}
  >
    <slot />
  </a>
{:else}
  <button
    class="inline-flex items-center justify-center rounded-lg transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed {variantClasses[variant]} {sizeClass}"
    {disabled}
    on:click
    {...$$restProps}
  >
    <slot />
  </button>
{/if}
