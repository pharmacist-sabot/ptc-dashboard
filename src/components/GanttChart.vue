<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { FISCAL_MONTHS, STATUS_CONFIG } from '@/data/plan-data';
import { useDashboardStore } from '@/stores/dashboard';

const { byRecommendation } = storeToRefs(useDashboardStore());

// Current fiscal month (Oct=1 … Sep=12)
const currentFiscalMonth = computed(() => {
  const m = new Date().getMonth() + 1;
  return m >= 10 ? m - 9 : m + 3;
});

// Left position of the current-month indicator line,
// accounting for the 200 px label column.
// Formula: calc(p*100% + (1-p)*200px)  where p = (month - 0.5) / 12
const monthLineLeft = computed(() => {
  const p = (currentFiscalMonth.value - 0.5) / 12;
  const pct = (p * 100).toFixed(3);
  const px = ((1 - p) * 200).toFixed(1);
  return `calc(${pct}% + ${px}px)`;
});

function recColor(no: number): string {
  return (['#963020', '#2e7028', '#8c6010'] as const)[no - 1] ?? '#5c7020';
}

function barLeft(start: number): string {
  return `${((start - 1) / 12) * 100}%`;
}
function barWidth(start: number, end: number): string {
  return `${((end - start + 1) / 12) * 100}%`;
}
function barOpacity(status: string): number {
  if (status === 'completed')
    return 1;
  if (status === 'in_progress')
    return 0.88;
  if (status === 'not_started')
    return 0.3;
  return 0.65;
}
</script>

<template>
  <div class="card p-5">
    <!-- ── Header ─────────────────────────────────────────── -->
    <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
      <h2 class="text-base font-bold" style="color: var(--color-text)">
        แผนเวลาดำเนินงาน (ปีงบประมาณ 2568)
      </h2>
      <span
        class="num text-sm font-semibold px-3 py-1.5 rounded-full"
        style="
          background: rgba(92, 112, 32, 0.1);
          color: var(--color-signal);
          border: 1px solid rgba(92, 112, 32, 0.22);
        "
      >
        เดือน {{ FISCAL_MONTHS[currentFiscalMonth - 1] }}
      </span>
    </div>

    <!-- ── Month header row ───────────────────────────────── -->
    <div class="grid mb-1" style="grid-template-columns: 200px 1fr">
      <div />
      <div class="flex">
        <div
          v-for="(m, i) in FISCAL_MONTHS"
          :key="i"
          class="flex-1 text-center pb-2"
          :style="`
            font-size: 13px;
            color: ${i + 1 === currentFiscalMonth ? 'var(--color-signal)' : 'var(--color-muted)'};
            font-weight: ${i + 1 === currentFiscalMonth ? '700' : '400'};
          `"
        >
          {{ m }}
        </div>
      </div>
    </div>

    <!-- ── Gantt rows + full-height month line ────────────── -->
    <div class="relative">
      <!-- Current-month vertical indicator (spans all rows) -->
      <div
        class="absolute top-0 bottom-0 pointer-events-none z-10"
        style="width: 2px; border-radius: 1px"
        :style="`left: ${monthLineLeft}; background: var(--color-signal); opacity: 0.38;`"
      />

      <div class="space-y-0.5">
        <template v-for="rec in byRecommendation" :key="rec.no">
          <!-- Rec group header row -->
          <div
            class="grid items-center py-1.5 rounded-lg"
            style="
              grid-template-columns: 200px 1fr;
              background: var(--color-surface);
            "
          >
            <div class="flex items-center gap-2 px-3">
              <div
                class="w-2 h-2 rounded-full shrink-0"
                :style="`background: ${recColor(rec.no)}`"
              />
              <span
                class="text-sm font-bold"
                :style="`color: ${recColor(rec.no)}`"
              >
                ข้อที่ {{ rec.no }}
              </span>
              <span
                class="num text-xs font-bold ml-auto"
                :style="`color: ${recColor(rec.no)}`"
              >
                {{ rec.pct }}%
              </span>
            </div>
            <div
              class="relative h-2 mx-2 rounded-full overflow-hidden"
              style="background: var(--color-border)"
            >
              <div
                class="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                :style="`width: ${rec.pct}%; background: ${recColor(rec.no)}; opacity: 0.45;`"
              />
            </div>
          </div>

          <!-- Action rows -->
          <div
            v-for="action in rec.actions"
            :key="action.id"
            class="grid hover:bg-black/2 rounded transition-colors"
            style="grid-template-columns: 200px 1fr"
          >
            <!-- Label column -->
            <div class="flex items-center gap-2 px-3 py-1.5 min-w-0">
              <span
                class="num text-xs font-semibold shrink-0"
                :style="`
                  color: ${recColor(rec.no)};
                  background: ${recColor(rec.no)}18;
                  padding: 2px 5px;
                  border-radius: 4px;
                `"
              >
                {{ action.id }}
              </span>
              <span
                class="text-sm truncate"
                style="color: var(--color-text-sub)"
                :title="action.plan"
              >
                {{ action.plan }}
              </span>
            </div>

            <!-- Bar column -->
            <div class="relative flex items-center" style="height: 34px">
              <!-- Track line -->
              <div
                class="absolute inset-x-0"
                style="height: 1px; background: var(--color-border)"
              />

              <!-- Gantt bar -->
              <div
                class="gantt-bar"
                :title="`${action.id} · ${action.progressPct}% · ${action.timeline}`"
                :style="`
                  left: ${barLeft(action.startMonth)};
                  width: ${barWidth(action.startMonth, action.endMonth)};
                  background: ${recColor(rec.no)};
                  opacity: ${barOpacity(action.status)};
                  box-shadow: 0 1px 5px ${recColor(rec.no)}30;
                `"
              >
                <!-- Progress fill -->
                <div
                  class="absolute inset-y-0 left-0 rounded-l-md"
                  :style="`width: ${action.progressPct}%; background: rgba(255,255,255,0.28);`"
                />

                <!-- Status dot -->
                <div
                  class="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  :style="`background: ${
                    action.status === 'blocked'
                      ? 'var(--color-danger)'
                      : action.status === 'delayed'
                        ? 'var(--color-warn)'
                        : action.status === 'completed'
                          ? 'white'
                          : 'rgba(255,255,255,0.7)'
                  };`"
                />

                <!-- Percentage label on wider bars -->
                <div
                  v-if="action.endMonth - action.startMonth >= 2"
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <span
                    class="num font-bold"
                    style="font-size: 11px; color: rgba(255, 255, 255, 0.92)"
                  >
                    {{ action.progressPct }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ── Legend ─────────────────────────────────────────── -->
    <div
      class="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-4"
      style="border-top: 1px solid var(--color-border)"
    >
      <div
        v-for="(sc, key) in STATUS_CONFIG"
        :key="key"
        class="flex items-center gap-2"
      >
        <div
          class="w-3.5 h-3.5 rounded"
          :style="`background: ${sc.hex};`"
        />
        <span class="text-sm" style="color: var(--color-dim)">{{
          sc.label
        }}</span>
      </div>
    </div>
  </div>
</template>
