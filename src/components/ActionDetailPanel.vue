<script setup lang="ts">
import { ref, watch } from 'vue';

import type { ActionItem, ActionStatus } from '@/types';

import { STATUS_CONFIG } from '@/data/plan-data';
import { useDashboardStore } from '@/stores/dashboard';

const props = defineProps<{ action: ActionItem | null; recColor: string }>();
const emit = defineEmits<{ (_e: 'close'): void }>();
const store = useDashboardStore();

const localStatus = ref<ActionStatus>('not_started');
const localPct = ref(0);
const localActual = ref('');
const localNotes = ref('');
const localBlockers = ref('');

watch(
  () => props.action,
  (a) => {
    if (!a)
      return;
    localStatus.value = a.status;
    localPct.value = a.progressPct;
    localActual.value = a.actualValue;
    localNotes.value = a.notes;
    localBlockers.value = a.blockers;
  },
  { immediate: true },
);

async function save() {
  if (!props.action)
    return;
  await store.saveAction(props.action.id, {
    status: localStatus.value,
    progressPct: localPct.value,
    actualValue: localActual.value,
    notes: localNotes.value,
    blockers: localBlockers.value,
  });
  emit('close');
}

function cfg(s: ActionStatus) {
  return STATUS_CONFIG[s];
}

const statusOptions: ActionStatus[] = [
  'not_started',
  'in_progress',
  'completed',
  'delayed',
  'blocked',
];

const statusColors: Record<
  ActionStatus,
  { bg: string; text: string; border: string }
> = {
  not_started: {
    bg: 'rgba(168,174,128,0.14)',
    text: '#6a7040',
    border: 'rgba(168,174,128,0.32)',
  },
  in_progress: {
    bg: 'rgba(58,90,140,0.12)',
    text: '#3a5a8c',
    border: 'rgba(58,90,140,0.26)',
  },
  completed: {
    bg: 'rgba(46,112,40,0.12)',
    text: '#2e7028',
    border: 'rgba(46,112,40,0.26)',
  },
  delayed: {
    bg: 'rgba(140,96,16,0.12)',
    text: '#8c6010',
    border: 'rgba(140,96,16,0.26)',
  },
  blocked: {
    bg: 'rgba(150,48,32,0.12)',
    text: '#963020',
    border: 'rgba(150,48,32,0.26)',
  },
};
</script>

<template>
  <Transition name="modal-slide">
    <div
      v-if="action"
      class="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
      style="
        width: min(520px, 100vw);
        background: var(--color-panel);
        border-left: 1px solid var(--color-border);
        box-shadow: -24px 0 60px rgba(30, 41, 16, 0.14);
      "
    >
      <!-- Header -->
      <div
        class="shrink-0"
        style="border-bottom: 1px solid var(--color-border)"
      >
        <!-- Color accent bar -->
        <div class="h-1" :style="`background: ${recColor};`" />

        <div class="p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5 flex-wrap">
              <!-- ID badge -->
              <span
                class="num text-sm font-bold px-3 py-1.5 rounded-lg"
                :style="`background: ${recColor}14; color: ${recColor};`"
              >
                {{ action.id }}
              </span>
              <!-- HA ref -->
              <span
                class="text-sm px-2.5 py-1.5 rounded-lg"
                style="
                  background: var(--color-surface);
                  color: var(--color-dim);
                  border: 1px solid var(--color-border);
                "
              >
                {{ action.haRef }}
              </span>
              <!-- Status badge -->
              <span
                class="text-sm font-semibold px-3 py-1.5 rounded-full"
                :style="`
                  background: ${statusColors[action.status].bg};
                  color: ${statusColors[action.status].text};
                  border: 1px solid ${statusColors[action.status].border};
                `"
              >
                {{ cfg(action.status).label }}
              </span>
            </div>
            <button
              class="btn-ghost"
              style="padding: 8px 12px; font-size: 16px"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Title -->
          <h2
            class="text-base font-semibold leading-snug"
            style="color: var(--color-text)"
          >
            {{ action.plan }}
          </h2>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="flex-1 overflow-y-auto p-5 space-y-5">
        <!-- Sub-items -->
        <div class="info-box">
          <p
            class="text-sm font-semibold mb-3 flex items-center gap-2"
            style="color: var(--color-text-sub)"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              :stroke="recColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z"
              />
            </svg>
            กิจกรรมย่อย
          </p>
          <ul class="space-y-2">
            <li
              v-for="sub in action.subItems"
              :key="sub"
              class="flex items-start gap-2.5 text-sm"
              style="color: var(--color-text-sub)"
            >
              <span
                class="shrink-0 mt-0.5 font-bold text-base leading-none"
                :style="`color: ${recColor};`"
              >–</span>
              <span class="leading-snug">{{ sub }}</span>
            </li>
          </ul>
        </div>

        <!-- Timeline & Report cycle -->
        <div class="grid grid-cols-2 gap-3">
          <div class="info-box">
            <p
              class="text-xs font-semibold mb-1.5 uppercase tracking-wide"
              style="color: var(--color-muted)"
            >
              ระยะเวลา
            </p>
            <p class="text-base font-semibold" style="color: var(--color-text)">
              {{ action.timeline }}
            </p>
          </div>
          <div class="info-box">
            <p
              class="text-xs font-semibold mb-1.5 uppercase tracking-wide"
              style="color: var(--color-muted)"
            >
              รอบรายงาน
            </p>
            <p
              class="text-sm leading-snug"
              style="color: var(--color-text-sub)"
            >
              {{ action.reportCycle }}
            </p>
          </div>
        </div>

        <!-- Owners -->
        <div>
          <p
            class="text-sm font-semibold mb-2.5 flex items-center gap-2"
            style="color: var(--color-text-sub)"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              :stroke="recColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z"
              />
            </svg>
            ผู้รับผิดชอบ
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="owner in action.owners"
              :key="owner"
              class="text-sm px-3 py-1.5 rounded-full font-medium"
              :style="`
                background: ${recColor}10;
                color: ${recColor};
                border: 1px solid ${recColor}28;
              `"
            >
              {{ owner }}
            </span>
          </div>
        </div>

        <!-- KPIs -->
        <div class="info-box">
          <p
            class="text-sm font-semibold mb-3 flex items-center gap-2"
            style="color: var(--color-text-sub)"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              :stroke="recColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z"
              />
            </svg>
            ตัวชี้วัด (KPI)
          </p>
          <ul class="space-y-2 mb-3">
            <li
              v-for="kpi in action.kpis"
              :key="kpi"
              class="flex items-start gap-2 text-sm"
              style="color: var(--color-text-sub)"
            >
              <span class="shrink-0 font-bold" :style="`color: ${recColor};`">◆</span>
              <span class="leading-snug">{{ kpi }}</span>
            </li>
          </ul>
          <div
            class="flex items-center gap-2 pt-3"
            style="border-top: 1px solid var(--color-border)"
          >
            <span class="text-sm" style="color: var(--color-dim)">เป้าหมาย:</span>
            <span
              class="text-sm font-bold px-2.5 py-1 rounded-lg"
              :style="`background: ${recColor}12; color: ${recColor};`"
            >
              {{ action.target }}
            </span>
          </div>
        </div>

        <hr style="border-color: var(--color-border)">

        <!-- Edit section -->
        <div>
          <p
            class="text-base font-bold mb-4 flex items-center gap-2"
            style="color: var(--color-signal)"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125"
              />
            </svg>
            อัปเดตความคืบหน้า
          </p>

          <div class="space-y-4">
            <!-- Status -->
            <div>
              <label
                class="text-sm font-semibold block mb-2"
                style="color: var(--color-text-sub)"
              >
                สถานะ
              </label>
              <select v-model="localStatus" class="field">
                <option v-for="s in statusOptions" :key="s" :value="s">
                  {{ cfg(s).label }}
                </option>
              </select>
            </div>

            <!-- Progress -->
            <div>
              <label
                class="text-sm font-semibold flex items-center justify-between mb-2"
                style="color: var(--color-text-sub)"
              >
                <span>ความคืบหน้า</span>
                <span
                  class="num font-bold text-lg"
                  :style="`color: ${recColor};`"
                >
                  {{ localPct }}%
                </span>
              </label>

              <!-- Custom progress bar with slider -->
              <div class="relative" style="height: 28px">
                <div
                  class="absolute left-0 right-0 rounded-full overflow-hidden"
                  style="
                    top: 50%;
                    transform: translateY(-50%);
                    height: 12px;
                    background: var(--color-border);
                  "
                >
                  <div
                    class="h-full rounded-full"
                    :style="`
                      width: ${localPct}%;
                      background: linear-gradient(90deg, ${recColor}cc, ${recColor});
                      transition: width 0.3s ease;
                    `"
                  />
                </div>
                <input
                  v-model.number="localPct"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  class="absolute inset-0 w-full cursor-pointer opacity-0"
                >
              </div>

              <!-- Step markers -->
              <div class="flex justify-between mt-1">
                <span
                  v-for="v in [0, 25, 50, 75, 100]"
                  :key="v"
                  class="num text-xs"
                  style="color: var(--color-muted)"
                >{{ v }}%</span>
              </div>
            </div>

            <!-- Actual value -->
            <div>
              <label
                class="text-sm font-semibold block mb-2"
                style="color: var(--color-text-sub)"
              >
                ค่าจริงที่วัดได้
                <span
                  class="font-normal text-sm"
                  style="color: var(--color-muted)"
                >
                  (Actual KPI Value)</span>
              </label>
              <input
                v-model="localActual"
                type="text"
                class="field"
                placeholder="เช่น 87%, 3 ครั้ง, ไม่มีข้อบกพร่อง"
              >
            </div>

            <!-- Notes -->
            <div>
              <label
                class="text-sm font-semibold block mb-2"
                style="color: var(--color-text-sub)"
              >
                บันทึก / ความก้าวหน้า
              </label>
              <textarea
                v-model="localNotes"
                class="field"
                rows="3"
                placeholder="สรุปสิ่งที่ดำเนินการแล้ว..."
                style="resize: vertical; min-height: 80px"
              />
            </div>

            <!-- Blockers -->
            <div>
              <label
                class="text-sm font-semibold block mb-2"
                style="color: var(--color-danger)"
              >
                อุปสรรค / ติดขัด
                <span
                  class="font-normal text-sm"
                  style="color: var(--color-muted)"
                >(ถ้ามี)</span>
              </label>
              <textarea
                v-model="localBlockers"
                class="field"
                rows="2"
                placeholder="ระบุปัญหาและผู้ที่ต้องช่วยแก้ไข..."
                style="
                  resize: vertical;
                  border-color: rgba(150, 48, 32, 0.3);
                  min-height: 60px;
                "
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="p-5 shrink-0 flex gap-3"
        style="border-top: 1px solid var(--color-border)"
      >
        <button class="btn-ghost flex-1" @click="emit('close')">
          ยกเลิก
        </button>
        <button
          class="btn-primary flex-1"
          :disabled="store.saving === action.id"
          @click="save"
        >
          <span
            v-if="store.saving === action.id"
            class="flex items-center justify-center gap-2"
          >
            <svg
              class="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" stroke-opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            กำลังบันทึก...
          </span>
          <span v-else>บันทึก → Google Sheets</span>
        </button>
      </div>
    </div>
  </Transition>
</template>
