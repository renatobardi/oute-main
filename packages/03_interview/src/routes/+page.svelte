<script lang="ts">
  import { page } from '$app/stores';
  import InterviewSidebar from '$lib/components/InterviewSidebar.svelte';
  import ChatWindow from '$lib/components/ChatWindow.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';
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
        {
          id: '5',
          timestamp: new Date(Date.now() - 3200000),
          sender: 'user',
          content: 'Que funcionalidades você acha que são essenciais?',
          type: 'text',
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 3100000),
          sender: 'ai',
          content:
            'As funcionalidades essenciais seriam: autenticação de usuários, dashboard principal, integração com APIs externas e relatórios analíticos.',
          type: 'text',
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 3000000),
          sender: 'user',
          content: 'E quanto à segurança? Precisamos de certificação?',
          type: 'text',
        },
        {
          id: '8',
          timestamp: new Date(Date.now() - 2900000),
          sender: 'ai',
          content:
            'Sim, é fundamental implementar HTTPS, criptografia de dados sensíveis e conformidade com LGPD. Dependendo do setor, pode ser necessário SOC 2 ou ISO 27001.',
          type: 'text',
        },
        {
          id: '9',
          timestamp: new Date(Date.now() - 2800000),
          sender: 'user',
          content: 'Qual seria o custo aproximado dessa implementação?',
          type: 'text',
        },
        {
          id: '10',
          timestamp: new Date(Date.now() - 2700000),
          sender: 'ai',
          content:
            'Considerando o escopo, estimamos entre $150k e $220k para desenvolvimento completo, incluindo testes, deploy e documentação.',
          type: 'text',
        },
        {
          id: '11',
          timestamp: new Date(Date.now() - 2600000),
          sender: 'user',
          content: 'Podemos dividir em fases de entrega?',
          type: 'text',
        },
        {
          id: '12',
          timestamp: new Date(Date.now() - 2500000),
          sender: 'ai',
          content:
            'Absolutamente! Sugerimos: Fase 1 (30 dias) - MVP com autenticação; Fase 2 (60 dias) - Dashboard e integrações; Fase 3 (90 dias) - Relatórios e otimizações.',
          type: 'text',
        },
        {
          id: '13',
          timestamp: new Date(Date.now() - 2400000),
          sender: 'user',
          content: 'Ótimo! Vamos começar com essa abordagem.',
          type: 'text',
        },
        {
          id: '14',
          timestamp: new Date(Date.now() - 2300000),
          sender: 'ai',
          content:
            'Perfeito! Vou preparar um documento técnico com a arquitetura proposta e cronograma detalhado. Você quer que comecemos pelos testes de conceito?',
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
  <div class="hidden lg:flex lg:w-72 flex-col h-full">
    <InterviewSidebar />
  </div>

  <!-- Center Chat Window -->
  <main class="flex-1 flex flex-col h-full">
    <div class="flex-1 overflow-y-auto">
      <ChatWindow />
    </div>
    <div>
      <ChatInput />
    </div>
  </main>

  <!-- Right Notes Panel (Cockpit) -->
  <div class="hidden lg:flex lg:w-80 flex-col h-full">
    <NotesPanel />
  </div>
</div>
