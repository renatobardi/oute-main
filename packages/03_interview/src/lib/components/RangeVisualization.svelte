<script lang="ts">
  export let label: string = '';
  export let minValue: string | number = '';
  export let maxValue: string | number = '';
  export let tshirtSize: string | undefined = undefined;
  export let barColor: string = '#3B82F6'; // Azul padrão

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString();
    }
    return val.toString();
  };
</script>

<div class="w-full">
  {#if label}
    <p class="text-xs text-neutral-500 mb-2">{label}</p>
  {/if}

  <!-- Range Bar -->
  <div class="flex items-center gap-3 mb-3">
    <span class="text-xs text-neutral-400 font-medium w-16 text-right">
      {formatValue(minValue)}
    </span>

    <!-- Bar Container -->
    <div class="flex-1 h-6 bg-[#0f1e23] border border-[#21404a] rounded-lg relative overflow-hidden">
      <!-- Colored Bar -->
      <div
        class="h-full flex items-center justify-center"
        style="width: 100%; background: linear-gradient(90deg, {barColor}, {barColor}aa);"
      >
        <div
          class="w-2 h-2 bg-white rounded-full shadow-lg"
          style="position: absolute; left: 50%; transform: translateX(-50%);"
        />
      </div>
    </div>

    <span class="text-xs text-neutral-400 font-medium w-16">
      {formatValue(maxValue)}
    </span>
  </div>

  <!-- T-Shirt Size Label (if provided) -->
  {#if tshirtSize}
    <p class="text-xs text-neutral-500 text-center mb-2">
      <span class="font-semibold text-primary-400">T-shirt: {tshirtSize}</span>
    </p>
  {/if}
</div>
