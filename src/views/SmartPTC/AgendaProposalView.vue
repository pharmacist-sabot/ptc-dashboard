<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useSmartPtcStore } from '@/stores/useSmartPtcStore';

const store = useSmartPtcStore();
const router = useRouter();
const { meetings, loading } = storeToRefs(store);

const form = ref({
  title: '',
  proposer: '',
  description: '',
  meetingId: '',
});

onMounted(() => {
  if (meetings.value.length === 0) {
    store.loadData();
  }
});

const availableMeetings = computed(() => {
  return meetings.value.filter(m => m.status === 'scheduled' || m.status === 'active');
});

async function submitAgenda() {
  if (!form.value.title || !form.value.proposer || !form.value.meetingId) {
    // eslint-disable-next-line no-alert
    alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    return;
  }

  const agenda = {
    id: `A${Date.now()}`,
    meetingId: form.value.meetingId,
    title: form.value.title,
    proposer: form.value.proposer,
    description: form.value.description,
    resolution: '', // Starts empty, to be filled during meeting
  };

  try {
    await store.saveAgenda(agenda);
    router.push('/smart-ptc');
  }
  catch (e: any) {
    // eslint-disable-next-line no-alert
    alert(`การบันทึกล้มเหลว: ${e.message}`);
  }
}

function formatThaiDate(dateStr: string) {
  if (!dateStr)
    return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 md:p-8">
    <div class="flex items-center gap-4 mb-8">
      <button class="btn-ghost px-3 py-1 text-sm bg-white" @click="router.back()">
        &larr; กลับ
      </button>
      <div>
        <h1 class="text-3xl font-bold text-glow-signal">
          เสนอวาระการประชุม
        </h1>
        <p class="text-sm mt-1" style="color: var(--color-dim)">
          Propose a new agenda item
        </p>
      </div>
    </div>

    <div class="card p-6 md:p-8 space-y-6">
      <div>
        <label class="block text-sm font-bold mb-2">หัวข้อวาระ <span class="text-red-500">*</span></label>
        <input v-model="form.title" type="text" class="field text-lg font-medium" placeholder="เช่น การเพิ่มยารายการใหม่เข้าบัญชียาโรงพยาบาล">
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-bold mb-2">ผู้เสนอ <span class="text-red-500">*</span></label>
          <input v-model="form.proposer" type="text" class="field" placeholder="ชื่อ / ตำแหน่ง">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">เข้าการประชุม <span class="text-red-500">*</span></label>
          <select v-model="form.meetingId" class="field bg-white">
            <option value="" disabled>
              -- เลือกการประชุม --
            </option>
            <option v-for="m in availableMeetings" :key="m.id" :value="m.id">
              {{ m.title }} ({{ formatThaiDate(m.date) }})
            </option>
          </select>
          <p v-if="availableMeetings.length === 0 && !loading" class="text-xs text-[var(--color-warn)] mt-2">
            ยังไม่มีการประชุมที่ถูกสร้างไว้ กรุณาสร้างการประชุมก่อน
          </p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold mb-2">รายละเอียด / เหตุผล</label>
        <textarea v-model="form.description" class="field min-h-[150px] resize-y" placeholder="อธิบายรายละเอียดวาระ หรือเหตุผลที่ต้องนำเข้าที่ประชุม..." />
      </div>

      <div class="pt-4 flex justify-end">
        <button class="btn-primary" :disabled="loading || availableMeetings.length === 0" @click="submitAgenda">
          {{ loading ? 'กำลังบันทึก...' : 'ยื่นเสนอวาระการประชุม' }}
        </button>
      </div>
    </div>
  </div>
</template>
