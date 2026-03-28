<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useSmartPtcStore } from '@/stores/useSmartPtcStore';

const store = useSmartPtcStore();
const { meetings, loading, error } = storeToRefs(store);
const router = useRouter();

onMounted(() => {
  store.loadData();
});

const upcomingMeetings = computed(() => {
  return meetings.value.filter(m => m.status === 'scheduled');
});
const activeMeetings = computed(() => {
  return meetings.value.filter(m => m.status === 'active');
});
const pastMeetings = computed(() => {
  return meetings.value.filter(m => m.status === 'completed');
});

// Create new meeting dialog placeholder (could also just navigate to a compose page)
const isCreating = ref(false);
const newMeeting = ref({ date: '', title: '' });

async function handleCreateMeeting() {
  if (!newMeeting.value.date || !newMeeting.value.title)
    return;
  const id = `M${Date.now()}`;
  await store.saveMeeting({
    id,
    date: newMeeting.value.date,
    title: newMeeting.value.title,
    status: 'scheduled',
    reportUrl: '',
  });
  isCreating.value = false;
  newMeeting.value = { date: '', title: '' };
}

function formatThaiDate(dateStr: string) {
  if (!dateStr)
    return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 md:p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-glow-signal">
          ระบบจัดวาระการประชุม PTC
        </h1>
        <p class="text-sm mt-1" style="color: var(--color-dim)">
          Smart PTC Team Meeting Management
        </p>
      </div>
      <div class="flex gap-3">
        <button class="btn-ghost" @click="router.push('/smart-ptc/propose')">
          + เสนอวาระใหม่ (Propose Agenda)
        </button>
        <button class="btn-primary" @click="isCreating = true">
          + สร้างการประชุม (New Meeting)
        </button>
      </div>
    </div>

    <div v-if="loading && meetings.length === 0" class="py-12 text-center text-sm" style="color: var(--color-muted)">
      กำลังโหลดข้อมูล...
    </div>

    <div v-else-if="error" class="blocker-box mb-6">
      เกิดข้อผิดพลาด: {{ error }}
    </div>

    <div v-else class="space-y-12">
      <!-- Create Meeting Modal Basic -->
      <div v-if="isCreating" class="card p-6 mb-8 animate-fade-in border border-[var(--color-pulse)]">
        <h2 class="text-xl font-bold mb-4">
          สร้างการประชุมใหม่
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">หัวข้อการประชุม</label>
            <input v-model="newMeeting.title" type="text" class="field" placeholder="เช่น ประจำเดือนมกราคม 2568">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">วันที่จัดการประชุม</label>
            <input v-model="newMeeting.date" type="date" class="field">
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary" :disabled="loading" @click="handleCreateMeeting">
            บันทึก
          </button>
          <button class="btn-ghost" :disabled="loading" @click="isCreating = false">
            ยกเลิก
          </button>
        </div>
      </div>

      <!-- Active Meetings -->
      <section v-if="activeMeetings.length > 0">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full animate-pulse bg-[var(--color-pulse)]" />
          การประชุมที่กำลังดำเนินการ (Active)
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="m in activeMeetings" :key="m.id" class="card p-5 cursor-pointer hover:border-[var(--color-signal)]" @click="router.push(`/smart-ptc/meeting/${m.id}`)">
            <h3 class="font-bold text-lg text-[var(--color-signal)]">
              {{ m.title }}
            </h3>
            <p class="text-sm mt-1 font-mono text-[var(--color-dim)]">
              {{ formatThaiDate(m.date) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Scheduled Meetings -->
      <section>
        <h2 class="text-xl font-bold mb-4" style="color: var(--color-dim)">
          การประชุมที่กำลังจะมาถึง (Scheduled)
        </h2>
        <div v-if="upcomingMeetings.length === 0" class="text-sm text-[var(--color-muted)]">
          ไม่มีกำหนดการประชุม
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="m in upcomingMeetings" :key="m.id" class="card p-5 cursor-pointer" @click="router.push(`/smart-ptc/meeting/${m.id}`)">
            <h3 class="font-bold">
              {{ m.title }}
            </h3>
            <p class="text-sm mt-1 font-mono text-[var(--color-dim)]">
              {{ formatThaiDate(m.date) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Past Meetings -->
      <section>
        <h2 class="text-xl font-bold mb-4" style="color: var(--color-muted)">
          ประวัติการประชุม (Past Meetings)
        </h2>
        <div v-if="pastMeetings.length === 0" class="text-sm text-[var(--color-muted)]">
          ไม่มีประวัติการประชุม
        </div>
        <div class="flex flex-col gap-3">
          <div v-for="m in pastMeetings" :key="m.id" class="card p-4 flex justify-between items-center">
            <div>
              <h3 class="font-bold text-[var(--color-text-sub)]">
                {{ m.title }}
              </h3>
              <p class="text-sm font-mono text-[var(--color-muted)]">
                {{ formatThaiDate(m.date) }}
              </p>
            </div>
            <button class="btn-ghost text-sm" @click="router.push(`/smart-ptc/meeting/${m.id}`)">
              ดูรายงาน
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
