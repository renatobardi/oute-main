/**
 * Utilitários de stream do pipeline oute-mind.
 * Centralizados aqui para reuso entre ChatInput e recovery de sessão (+page.svelte).
 */
import { messages, estimationStatus, notes, updateNotes } from '$lib/stores/conversation';
import { sendMessage, openEstimationStream, saveNote } from '$lib/api';
import type { EstimationStreamHandlers } from '$lib/api';
import { get } from 'svelte/store';

const PHASE_NAMES: Record<number, string> = {
  1: 'Entrevista de descoberta',
  2: 'Análise técnica com RAG',
  3: 'Design de arquitetura',
  4: 'Modelagem financeira',
  5: 'Revisão e apresentação',
  6: 'Enriquecimento de conhecimento',
};

async function persistMessage(
  interviewId: string,
  sender: 'ai' | 'system',
  content: string
) {
  try {
    const msg = await sendMessage(interviewId, { sender, content, type: 'text' });
    messages.update((msgs) => [...msgs, msg]);
  } catch (err) {
    console.error('[estimation] Failed to persist message', err);
  }
}

function parseResultToNotes(result: string): {
  budget: string;
  estimatedHours: string;
  tags: string[];
} {
  const budgetMatch = result.match(/R\$\s*[\d.,]+[kKmM]?|USD?\s*[\d.,]+[kKmM]?|\$\s*[\d.,]+[kKmM]?/i);
  const budget = budgetMatch ? budgetMatch[0].trim() : '';

  const hoursMatch = result.match(
    /(\d+)\s*[-–]\s*(\d+)\s*h(?:oras?|ours?)?|(\d+)\s*h(?:oras?|ours?)/i
  );
  let estimatedHours = '';
  if (hoursMatch) {
    estimatedHours =
      hoursMatch[1] && hoursMatch[2]
        ? `${hoursMatch[1]}-${hoursMatch[2]}`
        : (hoursMatch[3] ?? '');
  }

  const techMatch = result.match(/(?:tecnologias?|stack|tech)[:\s]+([^\n.]+)/i);
  const tags: string[] = [];
  if (techMatch) {
    tags.push(
      ...techMatch[1]
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 1 && t.length < 30)
        .slice(0, 5)
    );
  }

  return { budget, estimatedHours, tags };
}

/**
 * Cria os handlers do SSE stream para um dado interviewId.
 * Persiste mensagens no PostgreSQL e atualiza stores de estado.
 */
export function buildStreamHandlers(interviewId: string): EstimationStreamHandlers {
  return {
    onPhase: async (phase, phaseName) => {
      estimationStatus.set('running');
      const label = phaseName ?? PHASE_NAMES[phase] ?? `Fase ${phase}`;
      await persistMessage(interviewId, 'system', `🔄 Fase ${phase}: ${label}...`);
    },

    onAwaitingApproval: async (output) => {
      estimationStatus.set('awaiting_approval');
      const content = output
        ? `${output}\n\n---\n✅ Revise o escopo acima e clique em **Aprovar** para continuar, ou envie feedback.`
        : '🔍 Descoberta concluída. Revise e aprove para continuar.';
      await persistMessage(interviewId, 'ai', content);
    },

    onCompleted: async (result) => {
      estimationStatus.set('completed');
      await persistMessage(interviewId, 'ai', `✅ Estimativa concluída!\n\n${result}`);

      const currentNotes = get(notes);
      const { budget, estimatedHours, tags } = parseResultToNotes(result);
      const updatedNote = {
        ...currentNotes,
        metrics: {
          ...currentNotes.metrics,
          progress: 100,
          ...(estimatedHours ? { estimatedHours } : {}),
          ...(budget ? { budget } : {}),
        },
        ...(tags.length > 0 ? { tags } : {}),
        content: result,
      };
      updateNotes(updatedNote);
      try {
        await saveNote(interviewId, updatedNote);
      } catch (err) {
        console.error('[estimation] Failed to save note', err);
      }
    },

    onFailed: async (error) => {
      estimationStatus.set('failed');
      await persistMessage(interviewId, 'system', `❌ Erro na estimativa: ${error}`);
    },
  };
}

/**
 * Abre o SSE stream com handlers pré-configurados para o interviewId.
 * Retorna o EventSource para controle externo.
 */
export function startEstimationStream(estimationId: string, interviewId: string) {
  return openEstimationStream(estimationId, buildStreamHandlers(interviewId));
}
