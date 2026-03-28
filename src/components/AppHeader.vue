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
  <header
    class="sticky top-0 z-40"
    style="
      background: linear-gradient(
        135deg,
        var(--color-header) 0%,
        var(--color-header2) 100%
      );
      border-bottom: 1px solid rgba(180, 200, 80, 0.18);
      box-shadow: 0 2px 16px rgba(10, 18, 4, 0.22);
    "
  >
    <div class="max-w-screen-2xl mx-auto px-6 h-16 flex items-center gap-6">
      <!-- Logo / Brand -->
      <router-link to="/" class="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
        <div class="relative w-10 h-10">
          <div
            class="absolute inset-0 rounded-xl"
            style="
              background: linear-gradient(
                135deg,
                var(--color-signal),
                var(--color-pulse)
              );
              opacity: 0.22;
            "
          />
          <div
            class="absolute inset-0 rounded-xl flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-pulse)"
              stroke-width="2.2"
            >
              <path d="M12 2a10 10 0 1 0 10 10" stroke-opacity="0.5" />
              <path d="M22 12A10 10 0 0 0 12 2" />
              <circle
                cx="12"
                cy="12"
                r="3"
                fill="var(--color-pulse)"
                stroke="none"
              />
            </svg>
          </div>
        </div>
        <div>
          <div
            class="font-bold text-base leading-tight"
            style="color: #c8e060; letter-spacing: 0.01em"
          >
            PTC Monitor
          </div>
          <div
            class="text-xs leading-tight"
            style="color: rgba(180, 210, 100, 0.55)"
          >
            รพ.สระโบสถ์
          </div>
        </div>
      </router-link>

      <!-- Navigation Links -->
      <div class="flex items-center gap-4">
        <router-link
          to="/"
          class="text-sm font-medium transition-colors"
          active-class="text-white"
          style="color: rgba(200, 230, 120, 0.65)"
        >
          Dashboard
        </router-link>
        <router-link
          to="/smart-ptc"
          class="text-sm font-medium transition-colors"
          active-class="text-white"
          style="color: rgba(200, 230, 120, 0.65)"
        >
          Smart PTC
        </router-link>
      </div>

      <!-- Separator -->
      <div
        class="h-8 w-px shrink-0 hidden md:block"
        style="background: rgba(180, 210, 80, 0.15)"
      />

      <!-- Center flex spacer -->
      <div class="flex-1 min-w-0 hidden md:block"></div>

      <!-- Right section -->
      <div class="flex items-center gap-3 shrink-0">
        <!-- Overall progress pill -->
        <div
          class="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full"
          style="
            background: rgba(92, 112, 32, 0.25);
            border: 1px solid rgba(155, 180, 48, 0.3);
          "
        >
          <div
            class="w-2 h-2 rounded-full"
            style="background: var(--color-pulse)"
          />
          <span class="text-sm" style="color: rgba(200, 230, 100, 0.7)">ภาพรวม</span>
          <span class="num font-bold text-base" style="color: #c8e060">{{ summary.overallPct }}%</span>
        </div>

        <!-- Sync button -->
        <button
          class="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all"
          :style="
            loading
              ? 'color: #c8e060; background: rgba(92,112,32,0.25); border: 1px solid rgba(155,180,48,0.35);'
              : 'color: rgba(180,210,80,0.6); background: rgba(255,255,255,0.05); border: 1px solid rgba(180,210,80,0.12);'
          "
          :disabled="loading"
          @click="store.syncFromSheet()"
        >
          <svg
            class="w-4 h-4"
            :class="{ 'animate-spin': loading }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path
              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"
            />
          </svg>
          <span class="hidden sm:inline">{{ formatSync(lastSync) }}</span>
        </button>

        <!-- Error indicator -->
        <div
          v-if="error"
          class="w-3 h-3 rounded-full animate-ping"
          style="background: var(--color-danger)"
          :title="error"
        />

        <!-- Clock -->
        <div class="text-right hidden sm:block">
          <div
            class="num text-base font-semibold leading-tight"
            style="color: #c8e060"
          >
            {{ formatTime(now) }}
          </div>
          <div
            class="text-xs leading-tight"
            style="color: rgba(180, 210, 80, 0.5)"
          >
            {{ formatDate(now) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom progress bar -->
    <div style="height: 3px; background: rgba(92, 112, 32, 0.2)">
      <div
        class="h-full"
        style="
          background: linear-gradient(
            90deg,
            var(--color-signal),
            var(--color-pulse)
          );
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        "
        :style="`width: ${summary.overallPct}%;`"
      />
    </div>
  </header>
</template>
