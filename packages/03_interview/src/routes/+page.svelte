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
          userName: 'João Silva',
          avatarColor: 'bg-blue-500',
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
          userName: 'Maria Santos',
          avatarColor: 'bg-pink-500',
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
          userName: 'João Silva',
          avatarColor: 'bg-blue-500',
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
          userName: 'Carlos Mendes',
          avatarColor: 'bg-green-500',
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
          userName: 'Maria Santos',
          avatarColor: 'bg-pink-500',
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
          userName: 'João Silva',
          avatarColor: 'bg-blue-500',
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
          userName: 'Carlos Mendes',
          avatarColor: 'bg-green-500',
        },
        {
          id: '14',
          timestamp: new Date(Date.now() - 2300000),
          sender: 'ai',
          content:
            'Perfeito! Vou preparar um documento técnico com a arquitetura proposta e cronograma detalhado. Você quer que comecemos pelos testes de conceito?',
          type: 'text',
        },
        {
          id: '15',
          timestamp: new Date(Date.now() - 2200000),
          sender: 'user',
          content: 'Sim, vamos começar com os testes de conceito na próxima semana.',
          type: 'text',
          userName: 'João Silva',
          avatarColor: 'bg-blue-500',
        },
        {
          id: '16',
          timestamp: new Date(Date.now() - 2100000),
          sender: 'ai',
          content: 'Excelente! Vou agendar uma reunião para discutir os detalhes técnicos e os requisitos de integração com sistemas existentes.',
          type: 'text',
        },
        {
          id: '17',
          timestamp: new Date(Date.now() - 2000000),
          sender: 'user',
          content: 'Qual seria a melhor abordagem para integração com nosso CRM existente?',
          type: 'text',
          userName: 'Maria Santos',
          avatarColor: 'bg-pink-500',
        },
        {
          id: '18',
          timestamp: new Date(Date.now() - 1900000),
          sender: 'ai',
          content: 'Recomendo usar APIs REST com autenticação OAuth 2.0. Isso permitiria uma integração limpa e segura com seu CRM atual.',
          type: 'text',
        },
        {
          id: '19',
          timestamp: new Date(Date.now() - 1800000),
          sender: 'user',
          content: 'E quanto à migração de dados históricos? Temos muitos dados para migrar.',
          type: 'text',
          userName: 'Carlos Mendes',
          avatarColor: 'bg-green-500',
        },
        {
          id: '20',
          timestamp: new Date(Date.now() - 1700000),
          sender: 'ai',
          content: 'Para migração de dados históricos, sugiro um processo em etapas: validação de dados, mapeamento de campos, teste em staging e finalmente migração em produção com rollback preparado.',
          type: 'text',
        },
        {
          id: '21',
          timestamp: new Date(Date.now() - 1600000),
          sender: 'user',
          content: 'Quanto tempo levaria essa migração?',
          type: 'text',
          userName: 'João Silva',
          avatarColor: 'bg-blue-500',
        },
        {
          id: '22',
          timestamp: new Date(Date.now() - 1500000),
          sender: 'ai',
          content: 'Depende do volume de dados, mas estimamos 2-4 semanas para uma migração completa e validada. Podemos executar em paralelo com o desenvolvimento das novas funcionalidades.',
          type: 'text',
        },
        {
          id: '23',
          timestamp: new Date(Date.now() - 1400000),
          sender: 'user',
          content: 'Perfeito! Qual é o próximo passo?',
          type: 'text',
          userName: 'Maria Santos',
          avatarColor: 'bg-pink-500',
        },
        {
          id: '24',
          timestamp: new Date(Date.now() - 1300000),
          sender: 'ai',
          content: 'O próximo passo seria formalizar o contrato e definir a equipe do projeto. Recomendo uma reunião inicial com todos os stakeholders para alinhamento final.',
          type: 'text',
        },
        {
          id: '25',
          timestamp: new Date(Date.now() - 1200000),
          sender: 'user',
          content: 'Ótimo! Pode agendar essa reunião para a próxima terça-feira?',
          type: 'text',
          userName: 'Carlos Mendes',
          avatarColor: 'bg-green-500',
        },
        {
          id: '26',
          timestamp: new Date(Date.now() - 1100000),
          sender: 'ai',
          content: 'Perfeito! Vou enviar convites para todos. Sugerimos 14h como horário da reunião. Você tem alguma preferência?',
          type: 'text',
        },
        {
          id: '27',
          timestamp: new Date(Date.now() - 1000000),
          sender: 'user',
          content: '14h está ótimo para todos.',
          type: 'text',
          userName: 'João Silva',
          avatarColor: 'bg-blue-500',
        },
        {
          id: '28',
          timestamp: new Date(Date.now() - 900000),
          sender: 'ai',
          content: 'Excelente! Estou entusiasmado com este projeto. Vamos criar uma plataforma inovadora que trará valor significativo ao seu negócio. Até terça-feira!',
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
    <div class="flex-1">
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
