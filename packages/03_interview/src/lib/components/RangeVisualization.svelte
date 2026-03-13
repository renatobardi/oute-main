<script lang="ts">
  export let label: string = '';
  export let minValue: string | number = '';
  export let maxValue: string | number = '';
  export let tshirtSize: string | undefined = undefined;
  export let barColor: string = '#0ea5e9'; // Cyan padrão

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString();
    }
    return val.toString();
  };

  const getColorName = (color: string): string => {
    const colorNames: Record<string, string> = {
      '#0ea5e9': 'from-cyan-500 to-cyan-600',
      '#3B82F6': 'from-blue-500 to-blue-600',
      '#8B5CF6': 'from-purple-500 to-purple-600',
      '#EC4899': 'from-pink-500 to-pink-600',
    };
    return colorNames[color] || 'from-cyan-500 to-cyan-600';
  };
</script>

<div class="w-full">
  <!-- Range Bar with Min/Max Labels -->
  <div class="flex items-center gap-2 mb-3">
    <!-- Min Value -->
    <span class="text-xs text-neutral-500 font-semibold min-w-max">
      {formatValue(minValue)}
    </span>

    <!-- Bar Container -->
    <div class="flex-1 relative h-8 rounded-lg bg-slate-800 overflow-hidden group">
      <!-- Gradient Bar -->
      <div
        class="h-full bg-gradient-to-r transition-all duration-300"
        style="width: 100%; background: linear-gradient(90deg, {barColor}, {barColor}cc);"
      >
        <!-- Left Dot (Min) -->
        <div
          class="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md border-2 border-neutral-800 transition-all"
          style="background: {barColor}; box-shadow: 0 0 10px {barColor}, 0 0 20px {barColor}40;"
        />

        <!-- Right Dot (Max) -->
        <div
          class="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md border-2 border-neutral-800 transition-all"
          style="background: {barColor}; box-shadow: 0 0 10px {barColor}, 0 0 20px {barColor}40;"
        />
      </div>
    </div>

    <!-- Max Value -->
    <span class="text-xs text-neutral-500 font-semibold min-w-max">
      {formatValue(maxValue)}
    </span>
  </div>
</div>
