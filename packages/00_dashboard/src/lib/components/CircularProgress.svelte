<script lang="ts">
  export let percentage: number = 0;
  export let size: number = 48;

  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  function getColor(pct: number): string {
    if (pct >= 80) return '#10b981';
    if (pct >= 50) return '#06bcf9';
    if (pct >= 30) return '#f59e0b';
    return '#ef4444';
  }
</script>

<div class="circular-progress" style="width: {size}px; height: {size}px;">
  <svg width={size} height={size} viewBox="0 0 {size} {size}">
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke="#21404a"
      stroke-width={strokeWidth}
    />
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke={getColor(percentage)}
      stroke-width={strokeWidth}
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      stroke-linecap="round"
      transform="rotate(-90 {size / 2} {size / 2})"
    />
  </svg>
  <span class="absolute-center text-xs font-semibold" style="color: {getColor(percentage)}">
    {percentage}%
  </span>
</div>

<style>
  .circular-progress {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .absolute-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 11px;
  }
</style>
