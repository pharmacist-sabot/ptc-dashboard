<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useSmartPtcStore } from '@/stores/useSmartPtcStore';

const store = useSmartPtcStore();
const route = useRoute();
const router = useRouter();
const { meetings, agendas } = storeToRefs(store);

const meetingId = route.params.id as string;

onMounted(async () => {
  if (meetings.value.length === 0) {
    await store.loadData();
  }
});

const meeting = computed(() => meetings.value.find(m => m.id === meetingId));
const meetingAgendas = computed(() => store.getAgendasForMeeting(meetingId));

async function saveAgendaResolution(agendaId: string, resolution: string) {
  const agenda = agendas.value.find(a => a.id === agendaId);
  if (agenda) {
    const updated = { ...agenda, resolution };
    try {
      await store.saveAgenda(updated);
      // Show mini toast or just let it be since it's saved.
    }
    catch (e: any) {
      // eslint-disable-next-line no-alert
      alert(`Fail to save: ${e.message}`);
    }
  }
}

async function markAsCompleted() {
  if (meeting.value) {
    // eslint-disable-next-line no-alert
    if (confirm('ยืนยันจบการประชุมนี้หรือไม่? (สถานะจะเป็น Completed)')) {
      const updated = { ...meeting.value, status: 'completed' as const };
      await store.saveMeeting(updated);
      router.push('/smart-ptc');
    }
  }
}

function openPrintView() {
  window.open(`/smart-ptc/meeting/${meetingId}/print`, '_blank');
}

function openAgendaExport() {
  window.open(`/smart-ptc/meeting/${meetingId}/agenda-print`, '_blank');
}

function formatThaiDate(dateStr: string) {
  if (!dateStr)
    return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 md:p-8">
    <div class="flex items-center gap-4 mb-6">
      <button class="btn-ghost px-3 py-1 text-sm bg-white" @click="router.push('/smart-ptc')">
        &larr; กลับ
      </button>
      <div v-if="meeting">
        <h1 class="text-3xl font-bold text-glow-signal">
          {{ meeting.title }}
        </h1>
        <p class="text-sm mt-1" style="color: var(--color-dim)">
          วันที่: {{ formatThaiDate(meeting.date) }} | สถานะ: <span class="capitalize">{{ meeting.status }}</span>
        </p>
      </div>
      <div v-else class="text-[var(--color-muted)]">
        กำลังโหลด...
      </div>
    </div>

    <!-- Actions -->
    <div v-if="meeting" class="flex flex-wrap gap-3 mb-8">
      <button v-if="meeting.status !== 'completed'" class="btn-primary flex items-center justify-center gap-2" style="background: var(--color-ok)" @click="markAsCompleted">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        จบการประชุม
      </button>
      <button class="btn-ghost bg-white border-[var(--color-border)] flex items-center justify-center gap-2" @click="openAgendaExport">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
        พิมพ์ระเบียบวาระ (ก่อนประชุม)
      </button>
      <button class="btn-ghost bg-white border-[var(--color-border)] flex items-center justify-center gap-2" @click="openPrintView">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
        พิมพ์รายงานการประชุม (หลังประชุม)
      </button>
    </div>

    <!-- Agendas -->
    <div v-if="meeting">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        วาระการประชุม ({{ meetingAgendas.length }} วาระ)
      </h2>

      <div v-if="meetingAgendas.length === 0" class="card p-6 text-center text-[var(--color-muted)]">
        ยังไม่มีวาระที่ถูกนำเข้าในการประชุมนี้
      </div>

      <div class="space-y-6">
        <div v-for="(agenda, index) in meetingAgendas" :key="agenda.id" class="card p-6">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Left: Agenda Info -->
            <div class="flex-1">
              <div class="flex items-start gap-3 mb-3">
                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-signal)] text-white font-bold shrink-0">
                  {{ index + 1 }}
                </span>
                <div>
                  <h3 class="font-bold text-lg leading-tight">
                    {{ agenda.title }}
                  </h3>
                  <p class="text-sm mt-1 text-[var(--color-muted)]">
                    นำเสนอโดย: {{ agenda.proposer }}
                  </p>
                </div>
              </div>
              <div class="p-4 bg-[var(--color-surface)] rounded-lg text-[var(--color-text-sub)] text-sm whitespace-pre-wrap">
                {{ agenda.description || 'ไม่มีรายละเอียดเพิ่มเติม' }}
              </div>
            </div>

            <!-- Right: Secretary Resolution Input -->
            <div class="flex-1 flex flex-col">
              <label class="block text-sm font-bold mb-2 flex justify-between items-center text-[var(--color-signal)]">
                <span>บันทึกมติที่ประชุม (Resolution)</span>
              </label>
              <textarea
                v-model="agenda.resolution"
                class="field flex-1 min-h-[150px] resize-y"
                :disabled="meeting.status === 'completed'"
                placeholder="เลขาพิมพ์มติที่ประชุมที่นี่..."
                @blur="saveAgendaResolution(agenda.id, agenda.resolution)"
              />
              <p class="text-xs text-[var(--color-muted)] mt-2 text-right">
                บันทึกอัตโนมัติเมื่อพิม์เสร็จ (Click outside)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
