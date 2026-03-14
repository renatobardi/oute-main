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

<div class="w-full space-y-2">
  <!-- Range Bar with Slider visualization -->
  <div class="relative h-2 w-full bg-slate-800 rounded-lg overflow-hidden">
    <!-- Gradient Background -->
    <div
      class="absolute h-full left-[10%] right-[30%]"
      style="background: {barColor}40;"
    />

    <!-- Left Dot (Min) -->
    <div
      class="absolute w-4 h-4 top-1/2 -translate-y-1/2 left-[10%] rounded-full border-2 transition-all"
      style="background: {barColor}; border-color: #0f1e23; box-shadow: 0 0 10px {barColor}66;"
    />

    <!-- Right Dot (Max) -->
    <div
      class="absolute w-4 h-4 top-1/2 -translate-y-1/2 right-[30%] rounded-full border-2 transition-all"
      style="background: {barColor}; border-color: #0f1e23; box-shadow: 0 0 10px {barColor}66;"
    />
  </div>

  <!-- Min/Max Labels -->
  <div class="flex justify-between text-[10px] text-slate-500 font-medium px-1">
    <span>100k</span>
    <span>300k</span>
  </div>
</div>
