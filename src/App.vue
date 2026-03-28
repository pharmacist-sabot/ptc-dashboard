<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AppHeader from '@/components/AppHeader.vue';

const route = useRoute();
const isPrintView = computed(() => route.name === 'smart-ptc-meeting-print');
</script>

<template>
  <div v-if="isPrintView">
    <!-- Clean layout for print views -->
    <router-view />
  </div>
  <div v-else class="noise-bg min-h-screen" style="background: var(--color-void)">
    <!-- Subtle grid pattern -->
    <div
      class="fixed inset-0 pointer-events-none"
      style="
        background-image:
          linear-gradient(rgba(92, 112, 32, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(92, 112, 32, 0.02) 1px, transparent 1px);
        background-size: 44px 44px;
        z-index: 0;
      "
    />

    <!-- Top-right warm glow -->
    <div
      class="fixed top-0 right-0 w-150 h-150 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse at top right,
          rgba(156, 176, 64, 0.05) 0%,
          transparent 68%
        );
        z-index: 0;
      "
    />

    <!-- Bottom-left olive glow -->
    <div
      class="fixed bottom-0 left-0 w-125 h-125 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse at bottom left,
          rgba(92, 112, 32, 0.04) 0%,
          transparent 65%
        );
        z-index: 0;
      "
    />

    <!-- Center warmth -->
    <div
      class="fixed inset-0 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse at 50% 30%,
          rgba(188, 172, 120, 0.03) 0%,
          transparent 60%
        );
        z-index: 0;
      "
    />

    <!-- Content -->
    <div class="relative z-10">
      <AppHeader />
      <router-view />
    </div>
  </div>
</template>
