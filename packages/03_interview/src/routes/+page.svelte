<script lang="ts">
  import { page } from '$app/stores';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ChatWindow from '$lib/components/ChatWindow.svelte';
  import NotesPanel from '$lib/components/NotesPanel.svelte';
  import { currentInterview, messages, notes, initialInputValue } from '$lib/stores/conversation';

  // React to URL parameter changes
  $: if ($page && $page.url) {
    const initialMessageParam = $page.url.searchParams.get('initial');

    // Store the initial input value if provided from landing page
    if (initialMessageParam) {
      initialInputValue.set(initialMessageParam);
    }

    // Initialize if not yet loaded
    if (!$currentInterview) {
      currentInterview.set({
        id: 'INT-2024-WHAT',
        title: 'Web Platform Architecture',
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Add sample conversation messages (no initial message added here)
      const initialMessages = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 3600000),
          sender: 'user',
          content: 'Olá, gostaria de estimar um projeto de plataforma web.',
          type: 'text',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3500000),
          sender: 'ai',
          content:
            'Claro! Para ajudar melhor, poderia informar mais detalhes sobre o escopo do projeto?',
          type: 'text',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 3400000),
          sender: 'user',
          content: 'Sim, é um app mobile com backend, temos 3 meses de prazo.',
          type: 'text',
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 3300000),
          sender: 'ai',
          content:
            'Entendido. Com base nas informações, posso estimar entre 180k-240k horas de trabalho.',
          type: 'text',
        },
      ];

      messages.set(initialMessages);

      notes.set({
        summary: 'Web platform with mobile and backend components',
        metrics: {
          progress: 34,
          estimatedHours: '180k - 240k',
          budget: '$134k',
        },
        tags: ['Greenfield', 'Mobile', 'Backend'],
        content: 'Análise em progresso...',
      });
    }
  }
</script>

<div class="flex h-full w-full">
  <!-- Left Sidebar -->
  <div class="hidden lg:flex lg:w-64 flex-col h-full border-r border-[#21404a]">
    <Sidebar />
  </div>

  <!-- Center Chat Window -->
  <div class="flex-1 flex flex-col h-full">
    <ChatWindow />
  </div>

  <!-- Right Notes Panel -->
  <div class="hidden lg:flex lg:w-80 flex-col h-full border-l border-[#21404a]">
    <NotesPanel />
  </div>
</div>
