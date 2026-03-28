<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useSmartPtcStore } from '@/stores/useSmartPtcStore';

const store = useSmartPtcStore();
const route = useRoute();
const { meetings } = storeToRefs(store);

const meetingId = route.params.id as string;
const readyToPrint = ref(false);

onMounted(async () => {
  if (meetings.value.length === 0) {
    await store.loadData();
  }
  setTimeout(() => {
    readyToPrint.value = true;
    window.print();
  }, 500);
});

const meeting = computed(() => meetings.value.find(m => m.id === meetingId));
const meetingAgendas = computed(() => store.getAgendasForMeeting(meetingId));

const thaiDate = computed(() => {
  if (!meeting.value?.date)
    return '';
  const d = new Date(meeting.value.date);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
});
</script>

<template>
  <div v-if="meeting && readyToPrint" class="p-8 bg-white text-black min-h-screen max-w-4xl mx-auto report-container">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold leading-relaxed">
        ระเบียบวาระการประชุมคณะกรรมการเภสัชกรรมและการบำบัด (PTC)
      </h1>
      <h2 class="text-xl font-bold leading-relaxed">
        โรงพยาบาลสระโบสถ์
      </h2>
      <h3 class="text-lg leading-relaxed mt-2">
        {{ meeting.title }}
      </h3>
      <p class="text-md leading-relaxed">
        กำหนดการประชุมวันที่: {{ thaiDate }}
      </p>
    </div>

    <!-- Body / Agendas -->
    <div class="space-y-8 text-base">
      <div v-for="(agenda, index) in meetingAgendas" :key="agenda.id" class="mb-6 page-break-inside-avoid">
        <h4 class="font-bold text-lg mb-2">
          วาระที่ {{ index + 1 }} : {{ agenda.title }}
        </h4>

        <div class="pl-4 mb-2">
          <p class="font-bold mb-1">
            เรื่องแจ้งเพื่อทราบ / พิจารณา:
          </p>
          <p class="whitespace-pre-wrap text-gray-800">
            {{ agenda.description || '-' }}
          </p>
          <p class="text-sm text-gray-600 mt-2">
            (ผู้เสนอวาระ: {{ agenda.proposer }})
          </p>
        </div>
      </div>
      <div v-if="meetingAgendas.length === 0" class="text-center italic text-gray-500 py-10">
        ไม่มีวาระการประชุมสำหรับรอบนี้
      </div>
    </div>

    <!-- Signatures -->
    <div class="mt-24 text-right pb-12 print-avoid-break">
      <div class="inline-block text-center mr-8">
        <p class="mb-16">
          ลงชื่อ ....................................................... ผู้จัดทำระเบียบวาระ
        </p>
        <p>(หัวหน้ากลุ่มงานเภสัชกรรมกรรม)</p>
        <p>เลขาคณะกรรมการ PTC</p>
      </div>
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-screen bg-white text-black font-bold text-xl">
    กำลังเตรียมเอกสารสำหรับการพิมพ์...
  </div>
</template>

<style scoped>
.report-container {
  font-family: 'Sarabun', 'Prompt', sans-serif;
}
.page-break-inside-avoid {
  break-inside: avoid;
}
.print-avoid-break {
  break-inside: avoid;
}

@media print {
  @page {
    margin: 20mm;
    size: A4 portrait;
  }
  body {
    background: white;
    color: black;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
