import { writable } from 'svelte/store';

// Helper para criar store com localStorage persistence
function createCollapsedStore(key: string) {
	// Valor inicial padrão é false (não colapsado)
	const initialValue =
		typeof window !== 'undefined'
			? JSON.parse(localStorage.getItem(key) ?? 'false')
			: false;

	const { subscribe, set, update } = writable<boolean>(initialValue);

	// Subscribe para salvar em localStorage sempre que mudar
	subscribe((value) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(key, JSON.stringify(value));
		}
	});

	return {
		subscribe,
		set,
		update,
		toggle: () => update((v) => !v),
	};
}

export const sidebarCollapsed = createCollapsedStore('sidebarCollapsed');
export const notePanelCollapsed = createCollapsedStore('notePanelCollapsed');
