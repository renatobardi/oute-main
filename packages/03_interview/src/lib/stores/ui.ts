import { writable } from 'svelte/store';

// Helper para carregar do localStorage (apenas no browser)
function createSidebarCollapsedStore() {
	// Valor inicial padrão é false (não colapsado)
	const initialValue =
		typeof window !== 'undefined'
			? JSON.parse(localStorage.getItem('sidebarCollapsed') ?? 'false')
			: false;

	const { subscribe, set, update } = writable<boolean>(initialValue);

	// Subscribe para salvar em localStorage sempre que mudar
	subscribe((value) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('sidebarCollapsed', JSON.stringify(value));
		}
	});

	return {
		subscribe,
		set,
		update,
		toggle: () => update((v) => !v),
	};
}

export const sidebarCollapsed = createSidebarCollapsedStore();
