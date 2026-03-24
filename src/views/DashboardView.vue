<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

import type { ActionItem } from '@/types';

import ActionCard from '@/components/ActionCard.vue';
import ActionDetailPanel from '@/components/ActionDetailPanel.vue';
import GanttChart from '@/components/GanttChart.vue';
import SummaryCards from '@/components/SummaryCards.vue';
import { useDashboardStore } from '@/stores/dashboard';

const store = useDashboardStore();
const { byRecommendation, blockedActions, delayedActions } = storeToRefs(store);

// Tab navigation
const activeTab = ref<'all' | 'rec1' | 'rec2' | 'rec3' | 'alerts'>('all');

// Detail panel state
const selectedAction = ref<ActionItem | null>(null);
const selectedRecColor = ref('#5c7020');

function selectAction(action: ActionItem) {
  selectedRecColor.value = recColor(action.recNo);
  selectedAction.value = action;
}

function recColor(no: number): string {
  return (['#963020', '#2e7028', '#8c6010'] as const)[no - 1] ?? '#5c7020';
}

// Filtered rec list based on active tab
const visibleRecs = computed(() => {
  if (activeTab.value === 'all')
    return byRecommendation.value;
  const no = Number.parseInt(activeTab.value.replace('rec', ''));
  return byRecommendation.value.filter(r => r.no === no);
});

const alertsCount = computed(
  () => blockedActions.value.length + delayedActions.value.length,
);

function setRecTab(no: number) {
  activeTab.value = `rec${no}` as 'rec1' | 'rec2' | 'rec3';
}

onMounted(() => store.syncFromSheet());
</script>

<template>
  <div class="max-w-screen-2xl mx-auto px-4 md:px-6 py-7 space-y-7">
    <!-- Summary cards (hero + KPI) -->
    <SummaryCards />

    <!-- Gantt chart -->
    <GanttChart />

    <!-- Tab navigation -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      <!-- All tab -->
      <button
        class="tab-pill"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        ทั้งหมด
      </button>

      <!-- Per-rec tabs -->
      <button
        v-for="rec in byRecommendation"
        :key="rec.no"
        class="tab-pill flex items-center gap-2"
        :class="{ active: activeTab === `rec${rec.no}` }"
        @click="setRecTab(rec.no)"
      >
        <span
          class="w-2.5 h-2.5 rounded-full shrink-0"
          :style="`background: ${recColor(rec.no)};`"
        />
        ข้อที่ {{ rec.no }}
        <span class="num text-xs opacity-60 font-bold">{{ rec.pct }}%</span>
      </button>

      <!-- Alerts tab -->
      <button
        class="tab-pill flex items-center gap-2"
        :class="{ active: activeTab === 'alerts' }"
        @click="activeTab = 'alerts'"
      >
        <span
          v-if="alertsCount > 0"
          class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs num font-bold"
          style="background: var(--color-danger); color: white"
        >
          {{ alertsCount }}
        </span>
        <svg
          v-else
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        แจ้งเตือน
      </button>
    </div>

    <!-- ── Alert view ──────────────────────────────────────── -->
    <div v-if="activeTab === 'alerts'" class="space-y-6">
      <!-- Blocked section -->
      <div v-if="blockedActions.length">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-1 h-8 rounded-full shrink-0"
            style="background: var(--color-danger)"
          />
          <div>
            <h3
              class="text-base font-bold flex items-center gap-2"
              style="color: var(--color-danger)"
            >
              <span
                class="pulse-dot active"
                style="background: var(--color-danger); color: var(--color-danger);"
              />
              ติดขัด
            </h3>
            <p class="text-sm" style="color: var(--color-dim)">
              {{ blockedActions.length }} รายการที่ต้องการความช่วยเหลือเร่งด่วน
            </p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <ActionCard
            v-for="action in blockedActions"
            :key="action.id"
            :action="action"
            :rec-color="recColor(action.recNo)"
            @select="selectAction"
          />
        </div>
      </div>

      <!-- Delayed section -->
      <div v-if="delayedActions.length">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-1 h-8 rounded-full shrink-0"
            style="background: var(--color-warn)"
          />
          <div>
            <h3
              class="text-base font-bold flex items-center gap-2"
              style="color: var(--color-warn)"
            >
              <span
                class="pulse-dot active"
                style="background: var(--color-warn); color: var(--color-warn);"
              />
              ล่าช้า
            </h3>
            <p class="text-sm" style="color: var(--color-dim)">
              {{ delayedActions.length }} รายการที่ดำเนินการล่าช้ากว่ากำหนด
            </p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <ActionCard
            v-for="action in delayedActions"
            :key="action.id"
            :action="action"
            :rec-color="recColor(action.recNo)"
            @select="selectAction"
          />
        </div>
      </div>

      <!-- No alerts state -->
      <div v-if="!alertsCount" class="card p-14 text-center">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style="background: rgba(46, 112, 40, 0.1)"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-ok)"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
            />
          </svg>
        </div>
        <p class="text-lg font-semibold mb-1" style="color: var(--color-ok)">
          ไม่มีรายการที่ติดขัดหรือล่าช้า
        </p>
        <p class="text-base" style="color: var(--color-dim)">
          ระบบดำเนินงานเป็นไปตามแผนทุกรายการ
        </p>
      </div>
    </div>

    <!-- ── Main action grid ────────────────────────────────── -->
    <div v-else class="space-y-10">
      <div v-for="rec in visibleRecs" :key="rec.no">
        <!-- Rec section header -->
        <div class="flex items-start gap-4 mb-5">
          <div
            class="w-1.5 rounded-full shrink-0 mt-1"
            style="min-height: 52px"
            :style="`background: ${recColor(rec.no)};`"
          />
          <div class="flex-1 min-w-0">
            <!-- Rec badge + percentage -->
            <div class="flex items-center gap-3 mb-1.5 flex-wrap">
              <span
                class="inline-flex items-center num text-sm font-bold px-3 py-1.5 rounded-lg"
                :style="`background: ${recColor(rec.no)}12; color: ${recColor(rec.no)};`"
              >
                ข้อเสนอแนะที่ {{ rec.no }}
              </span>
              <span
                class="num font-bold text-base"
                :style="`color: ${recColor(rec.no)};`"
              >
                {{ rec.pct }}%
              </span>
              <!-- Mini progress bar -->
              <div class="flex-1 min-w-16 max-w-32 progress-track">
                <div
                  class="progress-fill"
                  :style="`width: ${rec.pct}%; background: ${recColor(rec.no)};`"
                />
              </div>
            </div>

            <!-- Rec title -->
            <p
              class="text-sm leading-relaxed"
              style="color: var(--color-dim); max-width: 80ch"
            >
              {{ rec.title }}
            </p>
          </div>
        </div>

        <!-- Action cards grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <ActionCard
            v-for="action in rec.actions"
            :key="action.id"
            :action="action"
            :rec-color="recColor(rec.no)"
            @select="selectAction"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Overlay -->
  <Transition name="overlay">
    <div
      v-if="selectedAction"
      class="fixed inset-0 z-40"
      style="background: rgba(10, 15, 4, 0.55); backdrop-filter: blur(5px)"
      @click="selectedAction = null"
    />
  </Transition>

  <!-- Detail slide panel -->
  <ActionDetailPanel
    :action="selectedAction"
    :rec-color="selectedRecColor"
    @close="selectedAction = null"
  />
</template>
