/* eslint-disable unicorn/filename-case */
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { fetchTable, updateTableRow } from '@/services/gas-api';

export type Meeting = {
  id: string;
  date: string;
  title: string;
  status: 'scheduled' | 'active' | 'completed';
  reportUrl: string;
  lastUpdated?: string;
};

export type Agenda = {
  id: string;
  meetingId: string;
  title: string;
  proposer: string;
  description: string;
  resolution: string;
  lastUpdated?: string;
};

export const useSmartPtcStore = defineStore('smartPtc', () => {
  const meetings = ref<Meeting[]>([]);
  const agendas = ref<Agenda[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function loadData() {
    loading.value = true;
    error.value = '';
    try {
      const [m, a] = await Promise.all([
        fetchTable('Meetings'),
        fetchTable('Agendas'),
      ]);
      meetings.value = (m || []) as Meeting[];
      agendas.value = (a || []) as Agenda[];
    }
    catch (err: any) {
      error.value = err.message || 'Failed to load Smart PTC data';
      console.error(err);
    }
    finally {
      loading.value = false;
    }
  }

  async function saveMeeting(meeting: Meeting) {
    loading.value = true;
    try {
      await updateTableRow('Meetings', meeting);
      const index = meetings.value.findIndex(m => m.id === meeting.id);
      if (index > -1) {
        meetings.value[index] = meeting;
      }
      else {
        meetings.value.push(meeting);
      }
    }
    catch (err: any) {
      error.value = err.message;
      throw err;
    }
    finally {
      loading.value = false;
    }
  }

  async function saveAgenda(agenda: Agenda) {
    loading.value = true;
    try {
      await updateTableRow('Agendas', agenda);
      const index = agendas.value.findIndex(a => a.id === agenda.id);
      if (index > -1) {
        agendas.value[index] = agenda;
      }
      else {
        agendas.value.push(agenda);
      }
    }
    catch (err: any) {
      error.value = err.message;
      throw err;
    }
    finally {
      loading.value = false;
    }
  }

  function getAgendasForMeeting(meetingId: string) {
    return agendas.value.filter(a => a.meetingId === meetingId);
  }

  return {
    meetings,
    agendas,
    loading,
    error,
    loadData,
    saveMeeting,
    saveAgenda,
    getAgendasForMeeting,
  };
});
