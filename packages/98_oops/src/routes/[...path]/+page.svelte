<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] font-[Inter,sans-serif] text-slate-100 antialiased">

  <!-- Grid pattern background -->
  <div class="absolute inset-0 grid-pattern pointer-events-none"></div>

  <!-- Decorative blobs -->
  <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style="background: rgba(6,188,249,0.10);"></div>
  <div class="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[100px]" style="background: rgba(6,188,249,0.05);"></div>

  <!-- Navbar -->
  <nav class="absolute top-0 w-full px-6 py-6 lg:px-12 flex justify-between items-center border-b border-slate-800/50 backdrop-blur-md z-10">
    <!-- Oute Logo (inline, idêntico ao OuteLogo do design-system, size="sm" horizontal) -->
    <div class="flex items-center gap-3">
      <svg style="width:2rem;height:2rem;flex-shrink:0;" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="oute-logo-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" style="stop-color:#22D3EE" />
            <stop offset="100%" style="stop-color:#0EA5E9" />
          </linearGradient>
        </defs>
        <path d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50" stroke="url(#oute-logo-gradient)" stroke-linecap="round" stroke-width="12" />
        <rect fill="url(#oute-logo-gradient)" height="30" rx="8" width="16" x="42" y="35" />
      </svg>
      <span class="text-lg font-bold text-white">Oute</span>
    </div>
    <a
      href="/"
      class="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-primary-500 transition-colors"
    >
      <span class="material-symbols-outlined text-sm">help_outline</span>
      Docs
    </a>
  </nav>

  <!-- Main content -->
  <main class="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl">

    <!-- Card -->
    <div class="mb-8 relative group">
      <div class="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" style="background: linear-gradient(to right, rgba(6,188,249,0.5), rgba(37,99,235,0.5));"></div>
      <div class="relative px-8 py-6 border border-slate-800 backdrop-blur-xl rounded-2xl glow-effect" style="background: rgba(15,23,42,0.5);">
        <span class="text-xs font-mono font-semibold tracking-widest uppercase mb-2 block" style="color: var(--color-primary-500);">Status Code: 404</span>
        <h1 class="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-4">
          Arquiteto não <span style="color: var(--color-primary-500);">encontrado</span>
        </h1>
      </div>
    </div>

    <!-- Description + code block -->
    <div class="space-y-4 mb-10">
      <p class="text-lg md:text-xl text-slate-400 font-medium">
        Parece que essa rota não foi definida no seu projeto.
      </p>
      <div class="inline-flex flex-col items-start gap-2 px-6 py-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-left">
        <div class="flex items-center gap-2">
          <span class="text-red-400">GET</span>
          <span class="text-slate-400">{$page.url.pathname}</span>
        </div>
        <div class="text-slate-500">
          // Erro: O endpoint sofreu um refactoring inesperado ou simplesmente desistiu de existir.
        </div>
        <div class="flex items-center gap-2">
          <span style="color: var(--color-primary-500);">suggestion:</span>
          <span class="text-slate-300">Volte para a base segura.</span>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      <a
        href="/"
        class="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-lg transition-all shadow-lg hover:brightness-110"
        style="background: var(--color-primary-500); color: #0a0a0f; box-shadow: 0 10px 30px rgba(6,188,249,0.2);"
      >
        <span class="material-symbols-outlined">dashboard</span>
        Voltar ao Dashboard
      </a>
      <a
        href="/chat"
        class="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-700 text-slate-200 font-semibold rounded-lg transition-all hover:bg-white/10"
        style="background: rgba(255,255,255,0.05);"
      >
        <span class="material-symbols-outlined">history</span>
        Ver Logs Recentes
      </a>
    </div>

  </main>

  <!-- Footer -->
  <footer class="absolute bottom-10 w-full flex items-center justify-center text-slate-500 text-xs">
    <p>© 2024 Oute Architecture Framework. Mantenha seus diagramas limpos.</p>
  </footer>

</div>
