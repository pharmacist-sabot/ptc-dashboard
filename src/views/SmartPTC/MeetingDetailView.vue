<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSmartPtcStore } from '@/stores/useSmartPtcStore';
import { storeToRefs } from 'pinia';

const store = useSmartPtcStore();
const route = useRoute();
const router = useRouter();
const { meetings, agendas, loading } = storeToRefs(store);

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
    } catch (e: any) {
      alert('Fail to save: ' + e.message);
    }
  }
}

async function markAsCompleted() {
  if (meeting.value) {
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
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 md:p-8">
    <div class="flex items-center gap-4 mb-6">
      <button @click="router.push('/smart-ptc')" class="btn-ghost px-3 py-1 text-sm bg-white">&larr; กลับ</button>
      <div v-if="meeting">
        <h1 class="text-3xl font-bold text-glow-signal">{{ meeting.title }}</h1>
        <p class="text-sm mt-1" style="color: var(--color-dim)">
          วันที่: {{ meeting.date }} | สถานะ: <span class="capitalize">{{ meeting.status }}</span>
        </p>
      </div>
      <div v-else class="text-[var(--color-muted)]">กำลังโหลด...</div>
    </div>

    <!-- Actions -->
    <div v-if="meeting" class="flex gap-3 mb-8">
      <button v-if="meeting.status !== 'completed'" @click="markAsCompleted" class="btn-primary" style="background: var(--color-ok)">
        &#10003; จบการประชุม
      </button>
      <button @click="openPrintView" class="btn-ghost bg-white border-[var(--color-border)]">
        &#128438; พิมพ์รายงานการประชุม (PDF)
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
                  <h3 class="font-bold text-lg leading-tight">{{ agenda.title }}</h3>
                  <p class="text-sm mt-1 text-[var(--color-muted)]">นำเสนอโดย: {{ agenda.proposer }}</p>
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
              ></textarea>
              <p class="text-xs text-[var(--color-muted)] mt-2 text-right">บันทึกอัตโนมัติเมื่อพิม์เสร็จ (Click outside)</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
