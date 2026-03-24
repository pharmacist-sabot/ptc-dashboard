<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { useCountUp } from '@/composables/use-count-up';
import { useDashboardStore } from '@/stores/dashboard';

const { summary } = storeToRefs(useDashboardStore());

// Animated counters
const animCompleted = useCountUp(() => summary.value.completed);
const animInProgress = useCountUp(() => summary.value.inProgress);
const animDelayed = useCountUp(() => summary.value.delayed);
const animBlocked = useCountUp(() => summary.value.blocked);
const animOverall = useCountUp(() => summary.value.overallPct);

// Segmented bar percentages (relative to total actions)
const segCompleted = computed(() =>
  summary.value.totalActions > 0
    ? (summary.value.completed / summary.value.totalActions) * 100
    : 0,
);
const segInProgress = computed(() =>
  summary.value.totalActions > 0
    ? (summary.value.inProgress / summary.value.totalActions) * 100
    : 0,
);
const segDelayed = computed(() =>
  summary.value.totalActions > 0
    ? (summary.value.delayed / summary.value.totalActions) * 100
    : 0,
);
const segBlocked = computed(() =>
  summary.value.totalActions > 0
    ? (summary.value.blocked / summary.value.totalActions) * 100
    : 0,
);

// KPI ring gauge constants
// r=28, viewBox 80×80, center(40,40)
// circumference = 2π×28 ≈ 175.929
// 270° arc = 131.947, rotate(135,40,40) → gap at bottom
const CIRC = 175.929;
const ARC = 131.947; // 0.75 × CIRC

function ringFill(raw: number, total: number): string {
  if (total <= 0)
    return `0 ${CIRC}`;
  return `${(raw / total) * ARC} ${CIRC}`;
}

// Hero gauge constants
// r=50, viewBox 120×120, center(60,60)
// circumference = 2π×50 ≈ 314.159
// 270° arc = 235.619, rotate(135,60,60)
const HERO_CIRC = 314.159;
const heroFill = computed(() => {
  const v = summary.value.overallPct;
  return `${(v / 100) * 235.619} ${HERO_CIRC}`;
});

const kpiCards = computed(() => [
  {
    label: 'เสร็จสิ้น',
    value: animCompleted,
    raw: summary.value.completed,
    color: 'var(--color-ok)',
    colorHex: '#2e7028',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>`,
  },
  {
    label: 'กำลังดำเนินการ',
    value: animInProgress,
    raw: summary.value.inProgress,
    color: 'var(--color-info)',
    colorHex: '#3a5a8c',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653z"/>`,
  },
  {
    label: 'ล่าช้า',
    value: animDelayed,
    raw: summary.value.delayed,
    color: 'var(--color-warn)',
    colorHex: '#8c6010',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>`,
  },
  {
    label: 'ติดขัด',
    value: animBlocked,
    raw: summary.value.blocked,
    color: 'var(--color-danger)',
    colorHex: '#963020',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>`,
  },
]);
</script>

<template>
  <div class="space-y-5">
    <!-- ── Hero Progress Card ─────────────────────────────────── -->
    <div
      class="card p-6 overflow-hidden"
      style="
        background: linear-gradient(
          135deg,
          var(--color-header) 0%,
          var(--color-header2) 100%
        );
        border-color: rgba(155, 180, 48, 0.2);
      "
    >
      <div class="sweep-line" />

      <div class="flex items-start justify-between gap-6 flex-wrap">
        <!-- Left content -->
        <div class="flex-1 min-w-0">
          <!-- Badge row -->
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style="
                background: rgba(92, 112, 32, 0.3);
                color: #c8e060;
                border: 1px solid rgba(155, 180, 48, 0.35);
              "
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
              HA II-6
            </span>
            <span class="text-sm" style="color: rgba(200, 230, 100, 0.55)">ปีงบประมาณ 2568</span>
            <span class="text-sm" style="color: rgba(200, 230, 100, 0.35)">·</span>
            <span class="text-sm" style="color: rgba(200, 230, 100, 0.55)">รพ.สระโบสถ์</span>
          </div>

          <!-- Heading -->
          <h1
            class="text-xl font-bold mb-1 leading-snug"
            style="color: #d4e880"
          >
            ระบบติดตามแผนพัฒนาคุณภาพยา
          </h1>
          <p class="text-base mb-5" style="color: rgba(200, 230, 100, 0.5)">
            Medication Safety · PTC Committee
          </p>

          <!-- Big percentage -->
          <div class="flex items-end gap-3 mb-4">
            <span
              class="num font-bold leading-none"
              style="font-size: clamp(52px, 8vw, 72px); color: #c8e060"
            >
              {{ animOverall }}
            </span>
            <div class="mb-2">
              <span
                class="text-3xl font-bold"
                style="color: rgba(200, 230, 100, 0.7)"
              >%</span>
              <p
                class="text-sm mt-0.5"
                style="color: rgba(200, 230, 100, 0.45)"
              >
                ความคืบหน้า
              </p>
            </div>
          </div>

          <!-- Fraction -->
          <p
            class="text-base font-medium mb-5"
            style="color: rgba(200, 230, 100, 0.55)"
          >
            <span class="num font-bold" style="color: #c8e060">{{
              summary.completed
            }}</span>
            <span> / {{ summary.totalActions }} แผนดำเนินการเสร็จสิ้น</span>
          </p>

          <!-- Segmented progress bar -->
          <div
            class="h-3 rounded-full overflow-hidden flex"
            style="background: rgba(255, 255, 255, 0.08)"
          >
            <div
              class="progress-segment rounded-l-full"
              :style="`width: ${segCompleted}%; background: var(--color-ok);`"
            />
            <div
              class="progress-segment"
              :style="`width: ${segInProgress}%; background: var(--color-info);`"
            />
            <div
              class="progress-segment"
              :style="`width: ${segDelayed}%; background: var(--color-warn);`"
            />
            <div
              class="progress-segment rounded-r-full"
              :style="`width: ${segBlocked}%; background: var(--color-danger);`"
            />
          </div>

          <!-- Bar legend -->
          <div class="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
            <div
              class="flex items-center gap-1.5 text-sm"
              style="color: rgba(200, 230, 100, 0.5)"
            >
              <div
                class="w-3 h-2.5 rounded-sm"
                style="background: var(--color-ok)"
              />
              เสร็จสิ้น
            </div>
            <div
              class="flex items-center gap-1.5 text-sm"
              style="color: rgba(200, 230, 100, 0.5)"
            >
              <div
                class="w-3 h-2.5 rounded-sm"
                style="background: var(--color-info)"
              />
              ดำเนินการ
            </div>
            <div
              class="flex items-center gap-1.5 text-sm"
              style="color: rgba(200, 230, 100, 0.5)"
            >
              <div
                class="w-3 h-2.5 rounded-sm"
                style="background: var(--color-warn)"
              />
              ล่าช้า
            </div>
            <div
              class="flex items-center gap-1.5 text-sm"
              style="color: rgba(200, 230, 100, 0.5)"
            >
              <div
                class="w-3 h-2.5 rounded-sm"
                style="background: var(--color-danger)"
              />
              ติดขัด
            </div>
          </div>
        </div>

        <!-- Right: Hero ring gauge -->
        <div
          class="relative shrink-0 hidden sm:block"
          style="width: 140px; height: 140px"
        >
          <svg viewBox="0 0 120 120" class="w-full h-full">
            <!-- Track arc (270°) -->
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              stroke-width="9"
              stroke-linecap="round"
              stroke-dasharray="235.619 314.159"
              transform="rotate(135, 60, 60)"
            />
            <!-- Fill arc -->
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#c8e060"
              stroke-width="9"
              stroke-linecap="round"
              :stroke-dasharray="heroFill"
              transform="rotate(135, 60, 60)"
              style="
                transition: stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1);
                filter: drop-shadow(0 0 6px rgba(200, 224, 96, 0.5));
              "
            />
          </svg>
          <!-- Center text -->
          <div
            class="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span
              class="num font-bold text-3xl leading-none"
              style="color: #c8e060"
            >{{ summary.overallPct }}%</span>
            <span class="text-xs mt-1" style="color: rgba(200, 230, 100, 0.45)">ภาพรวม</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 4 KPI Cards ────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in kpiCards" :key="card.label" class="kpi-card">
        <!-- Left accent bar -->
        <div class="kpi-accent" :style="`background: ${card.color};`" />

        <div class="flex items-center gap-3 p-5 pl-6">
          <!-- Text section -->
          <div class="flex-1 min-w-0">
            <!-- Icon + label -->
            <div class="flex items-center gap-2 mb-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                :stroke="card.colorHex"
                stroke-width="1.8"
                v-html="card.icon"
              />
              <p class="text-sm font-medium" style="color: var(--color-dim)">
                {{ card.label }}
              </p>
            </div>

            <!-- Big number -->
            <p
              class="num font-bold leading-none mb-1"
              :style="`font-size: 44px; color: ${card.color};`"
            >
              {{ card.value }}
            </p>

            <!-- Fraction text -->
            <p class="text-sm" style="color: var(--color-muted)">
              จาก
              <span class="num font-semibold" style="color: var(--color-dim)">{{
                summary.totalActions
              }}</span>
              แผน
            </p>
          </div>

          <!-- Ring gauge -->
          <div class="relative shrink-0" style="width: 72px; height: 72px">
            <svg viewBox="0 0 80 80" class="w-full h-full">
              <!-- Track arc (270°) -->
              <circle
                cx="40"
                cy="40"
                r="28"
                fill="none"
                stroke="var(--color-border)"
                stroke-width="6"
                stroke-linecap="round"
                stroke-dasharray="131.947 175.929"
                transform="rotate(135, 40, 40)"
              />
              <!-- Fill arc -->
              <circle
                cx="40"
                cy="40"
                r="28"
                fill="none"
                :stroke="card.colorHex"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="ringFill(card.raw, summary.totalActions)"
                transform="rotate(135, 40, 40)"
                style="
                  transition: stroke-dasharray 0.9s cubic-bezier(0.4, 0, 0.2, 1);
                "
              />
            </svg>
            <!-- Center percentage -->
            <div class="absolute inset-0 flex items-center justify-center">
              <span
                class="num font-bold text-sm leading-none"
                :style="`color: ${card.colorHex};`"
              >
                {{
                  summary.totalActions > 0
                    ? Math.round((card.raw / summary.totalActions) * 100)
                    : 0
                }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Bottom progress strip -->
        <div class="mx-5 mb-4 progress-track" style="height: 4px">
          <div
            class="progress-fill"
            :style="`
              width: ${summary.totalActions > 0 ? Math.round((card.raw / summary.totalActions) * 100) : 0}%;
              background: ${card.color};
            `"
          />
        </div>
      </div>
    </div>
  </div>
</template>
