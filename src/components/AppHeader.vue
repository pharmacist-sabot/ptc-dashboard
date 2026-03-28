<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, ref } from 'vue';

import { useDashboardStore } from '@/stores/dashboard';

const store = useDashboardStore();
const { loading, lastSync, error, summary } = storeToRefs(store);

const now = ref(new Date());
let timer: ReturnType<typeof setInterval>;
onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000);
});
onUnmounted(() => clearInterval(timer));

function formatTime(d: Date) {
  return d.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
function formatDate(d: Date) {
  return d.toLocaleDateString('th-TH', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
function formatSync(d: Date | null) {
  if (!d)
    return 'ยังไม่ได้ sync';
  return `sync ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm">
    <div class="max-w-screen-2xl mx-auto px-6 h-16 flex items-center gap-6">
      
      <!-- Brand -->
      <router-link to="/" class="flex flex-col shrink-0 hover:opacity-80 transition-opacity">
        <div class="font-black text-xl leading-none tracking-tight text-[var(--color-signal)]">
          PTC Monitor
        </div>
        <div class="text-[0.65rem] font-bold tracking-wide uppercase mt-1 text-[var(--color-dim)]">
          รพ.สระโบสถ์
        </div>
      </router-link>

      <!-- Navigation Links -->
      <nav class="flex items-center gap-2 ml-4">
        <router-link
          to="/"
          class="text-sm font-semibold transition-colors px-3 py-1.5 rounded-md text-[var(--color-dim)] hover:bg-[var(--color-surface)]"
          active-class="text-[var(--color-signal)] bg-[var(--color-void)] border border-[var(--color-border)] shadow-sm"
        >
          Dashboard
        </router-link>
        <router-link
          to="/smart-ptc"
          class="text-sm font-semibold transition-colors px-3 py-1.5 rounded-md text-[var(--color-dim)] hover:bg-[var(--color-surface)]"
          active-class="text-[var(--color-signal)] bg-[var(--color-void)] border border-[var(--color-border)] shadow-sm"
        >
          Smart PTC
        </router-link>
      </nav>

      <!-- Separator -->
      <div class="h-6 w-px bg-[var(--color-border)] hidden md:block ml-2" />

      <!-- Center flex spacer -->
      <div class="flex-1 min-w-0 hidden md:block"></div>

      <!-- Right section -->
      <div class="flex items-center gap-4 shrink-0">
        
        <!-- Overall progress pill -->
        <div class="hidden lg:flex items-center gap-2 px-3 py-1 bg-[var(--color-void)] border border-[var(--color-border)] rounded-full shadow-inner">
          <div class="w-2 h-2 rounded-full animate-pulse bg-[var(--color-pulse)]" />
          <span class="text-xs font-semibold text-[var(--color-muted)]">ภาพรวม</span>
          <span class="num font-bold text-sm text-[var(--color-signal)]">{{ summary.overallPct }}%</span>
        </div>

        <!-- Sync button -->
        <button
          class="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all border shadow-sm"
          :class="loading 
            ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-dim)] cursor-wait' 
            : 'bg-white border-[var(--color-border)] text-[var(--color-text-sub)] hover:bg-[var(--color-void)] hover:border-[var(--color-dim)]'"
          :disabled="loading"
          @click="store.syncFromSheet()"
        >
          <svg
            class="w-3.5 h-3.5"
            :class="{ 'animate-spin text-[var(--color-pulse)]': loading }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21v-5h5" />
          </svg>
          <span class="hidden sm:inline">{{ formatSync(lastSync) }}</span>
        </button>

        <!-- Error indicator -->
        <div
          v-if="error"
          class="w-2.5 h-2.5 rounded-full animate-ping bg-[var(--color-danger)]"
          :title="error"
        />

        <!-- Clock -->
        <div class="text-right hidden sm:block pl-3 border-l border-[var(--color-border)]">
          <div class="num text-sm font-bold leading-tight text-[var(--color-signal)]">
            {{ formatTime(now) }}
          </div>
          <div class="text-[0.65rem] font-bold leading-tight text-[var(--color-muted)] uppercase mt-0.5">
            {{ formatDate(now) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom progress bar -->
    <div class="h-[3px] w-full bg-[var(--color-surface)]">
      <div
        class="h-full bg-[var(--color-signal)]"
        style="transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);"
        :style="`width: ${summary.overallPct}%;`"
      />
    </div>
  </header>
</template>
