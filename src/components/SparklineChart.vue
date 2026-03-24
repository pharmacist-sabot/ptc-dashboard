<script setup lang="ts">
// Draws a simple SVG polyline sparkline from an array of 0-100 values
const props = defineProps<{
  values: number[]; // e.g. [0, 20, 40, 40, 75, 90]
  color?: string;
  width?: number;
  height?: number;
}>();

const W = props.width ?? 80;
const H = props.height ?? 28;
const color = props.color ?? '#00d4aa';

function points(): string {
  if (!props.values.length)
    return '';
  const xs = props.values.map(
    (_, i) => (i / Math.max(props.values.length - 1, 1)) * W,
  );
  const ys = props.values.map(v => H - (v / 100) * H);
  return xs.map((x, i) => `${x},${ys[i]}`).join(' ');
}

// Area fill path
function area(): string {
  if (!props.values.length)
    return '';
  const xs = props.values.map(
    (_, i) => (i / Math.max(props.values.length - 1, 1)) * W,
  );
  const ys = props.values.map(v => H - (v / 100) * H);
  const line = xs.map((x, i) => `${x},${ys[i]}`).join(' L ');
  return `M 0,${H} L ${line} L ${W},${H} Z`;
}

const last = props.values.at(-1) ?? 0;
</script>

<template>
  <svg
    :width="W"
    :height="H"
    :viewBox="`0 0 ${W} ${H}`"
    class="overflow-visible"
  >
    <defs>
      <linearGradient
        :id="`sg-${color.replace('#', '')}`"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <!-- Area -->
    <path :d="area()" :fill="`url(#sg-${color.replace('#', '')})`" />
    <!-- Line -->
    <polyline
      :points="points()"
      fill="none"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Last point dot -->
    <circle
      v-if="values.length"
      :cx="W"
      :cy="H - (last / 100) * H"
      r="2.5"
      :fill="color"
    />
  </svg>
</template>
