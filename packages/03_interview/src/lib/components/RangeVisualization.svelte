<script lang="ts">
  export const label: string = '';
  export const minValue: string | number = '';
  export const maxValue: string | number = '';
  export const tshirtSize: string | undefined = undefined;
  export let barColor: string = '#0ea5e9'; // Cyan padrão
</script>

<div class="w-full space-y-2">
  <!-- Range Bar with Slider visualization -->
  <div class="relative h-2 w-full bg-slate-800 rounded-lg overflow-hidden">
    <!-- Gradient Background -->
    <div
      class="absolute h-full left-[10%] right-[30%]"
      style="background: {barColor}40;"
    ></div>

    <!-- Left Dot (Min) -->
    <div
      class="absolute w-4 h-4 top-1/2 -translate-y-1/2 left-[10%] rounded-full border-2 transition-all"
      style="background: {barColor}; border-color: #0f1e23; box-shadow: 0 0 10px {barColor}66;"
    ></div>

    <!-- Right Dot (Max) -->
    <div
      class="absolute w-4 h-4 top-1/2 -translate-y-1/2 right-[30%] rounded-full border-2 transition-all"
      style="background: {barColor}; border-color: #0f1e23; box-shadow: 0 0 10px {barColor}66;"
    ></div>
  </div>

  <!-- Min/Max Labels -->
  <div class="flex justify-between text-[10px] text-slate-500 font-medium px-1">
    <span>100k</span>
    <span>300k</span>
  </div>
</div>
