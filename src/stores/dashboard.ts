// src/stores/dashboard.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { ActionItem, ActionStatus, DashboardSummary, UpdatePayload } from '@/types';

import { PLAN_DATA } from '@/data/plan-data';
import { fetchProgress, updateAction } from '@/services/gas-api';

export const useDashboardStore = defineStore('dashboard', () => {
  // ── State ─────────────────────────────────────────────────
  const actions = ref<ActionItem[]>(PLAN_DATA.flatMap(r => r.actions));
  const loading = ref(false);
  const saving = ref<string | null>(null);
  const error = ref<string | null>(null);
  const lastSync = ref<Date | null>(null);
  const currentUser = ref('PTC');

  // ── Computed ──────────────────────────────────────────────
  const summary = computed<DashboardSummary>(() => {
    const all = actions.value;
    const completed = all.filter(a => a.status === 'completed').length;
    const inProgress = all.filter(a => a.status === 'in_progress').length;
    const delayed = all.filter(a => a.status === 'delayed').length;
    const blocked = all.filter(a => a.status === 'blocked').length;
    const notStarted = all.filter(a => a.status === 'not_started').length;
    const overallPct = Math.round(all.reduce((s, a) => s + a.progressPct, 0) / all.length);
    return { totalActions: all.length, completed, inProgress, delayed, blocked, notStarted, overallPct };
  });

  const byRecommendation = computed(() =>
    PLAN_DATA.map(rec => ({
      ...rec,
      actions: actions.value.filter(a => a.recNo === rec.no),
      pct: Math.round(
        actions.value.filter(a => a.recNo === rec.no).reduce((s, a) => s + a.progressPct, 0)
        / actions.value.filter(a => a.recNo === rec.no).length,
      ),
    })),
  );

  const blockedActions = computed(() => actions.value.filter(a => a.status === 'blocked'));
  const delayedActions = computed(() => actions.value.filter(a => a.status === 'delayed'));

  // ── Actions ───────────────────────────────────────────────
  async function syncFromSheet() {
    loading.value = true;
    error.value = null;
    try {
      const rows = await fetchProgress();
      rows.forEach((row) => {
        const action = actions.value.find(a => a.id === row.id);
        if (action) {
          action.status = (row.status as ActionStatus) || 'not_started';
          action.progressPct = Number(row.progressPct) || 0;
          action.actualValue = row.actualValue || '';
          action.notes = row.notes || '';
          action.blockers = row.blockers || '';
          action.lastUpdated = row.lastUpdated || '';
          action.updatedBy = row.updatedBy || '';
        }
      });
      lastSync.value = new Date();
    }
    catch (e: any) {
      error.value = e.message;
    }
    finally {
      loading.value = false;
    }
  }

  async function saveAction(id: string, patch: Partial<Pick<ActionItem, 'status' | 'progressPct' | 'actualValue' | 'notes' | 'blockers'>>) {
    const action = actions.value.find(a => a.id === id);
    if (!action)
      return;
    // Optimistic update
    Object.assign(action, patch);
    saving.value = id;
    error.value = null;
    try {
      const payload: UpdatePayload = {
        id,
        status: action.status,
        progressPct: action.progressPct,
        actualValue: action.actualValue,
        notes: action.notes,
        blockers: action.blockers,
        updatedBy: currentUser.value,
      };
      await updateAction(payload);
      action.lastUpdated = new Date().toISOString();
      action.updatedBy = currentUser.value;
    }
    catch (e: any) {
      error.value = e.message;
    }
    finally {
      saving.value = null;
    }
  }

  return {
    actions,
    loading,
    saving,
    error,
    lastSync,
    currentUser,
    summary,
    byRecommendation,
    blockedActions,
    delayedActions,
    syncFromSheet,
    saveAction,
  };
});
