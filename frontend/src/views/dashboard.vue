<template>
  <div class="dashboard-container">
    <header class="page-header">
      <div class="header-copy">
        <div class="eyebrow"><span class="live-dot"></span> Workspace / Growth</div>
        <h1>Wysyłka ma tempo.</h1>
        <p>Dobry poranek, zespole. Oto najważniejsze sygnały z ostatnich 30 dni.</p>
      </div>

      <div class="header-actions">
        <button class="button button-quiet" type="button" title="Odśwież dane" @click="refreshDashboard">
          <v-icon icon="mdi-refresh" size="18" :class="{ 'spin': isLoading }" />
          <span>Odśwież</span>
        </button>

        <v-menu location="bottom end">
          <template #activator="{ props }">
            <button class="button button-quiet" type="button" v-bind="props">
              <v-icon icon="mdi-tune-variant" size="18" />
              <span>Stan widoku</span>
              <v-icon icon="mdi-chevron-down" size="16" />
            </button>
          </template>
          <v-list class="state-menu" density="compact">
            <v-list-subheader>Podgląd stanów</v-list-subheader>
            <v-list-item
              v-for="option in stateOptions"
              :key="option.value"
              :active="dashboardState === option.value"
              @click="setState(option.value)"
            >
              <template #prepend><v-icon :icon="option.icon" size="18" /></template>
              <v-list-item-title>{{ option.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <button class="button button-primary" type="button" @click="goTo('/campaigns')">
          <v-icon icon="mdi-plus" size="18" />
          <span>Nowa kampania</span>
        </button>
      </div>
    </header>

    <main class="dashboard-content">
      <section v-if="isLoading" class="loading-grid" aria-label="Ładowanie dashboardu">
        <div v-for="item in 4" :key="item" class="skeleton metric-skeleton"></div>
        <div class="skeleton large-skeleton"></div>
        <div class="skeleton side-skeleton"></div>
      </section>

      <section v-else-if="isBlockingState" class="state-card" :class="`state-${dashboardState}`">
        <div class="state-icon"><v-icon :icon="stateCopy.icon" size="30" /></div>
        <div class="state-copy">
          <div class="eyebrow">{{ stateCopy.eyebrow }}</div>
          <h2>{{ stateCopy.title }}</h2>
          <p>{{ stateCopy.description }}</p>
          <div class="state-actions">
            <button v-if="dashboardState === 'error'" class="button button-primary" type="button" @click="retryDashboard">
              <v-icon icon="mdi-refresh" size="18" /> Spróbuj ponownie
            </button>
            <button v-else-if="dashboardState === 'forbidden'" class="button button-primary" type="button" @click="goTo('/dashboard')">
              <v-icon icon="mdi-arrow-left" size="18" /> Wróć do dashboardu
            </button>
            <button v-else class="button button-primary" type="button" @click="goTo('/campaigns')">
              <v-icon icon="mdi-plus" size="18" /> Utwórz kampanię
            </button>
            <button class="button button-quiet" type="button" @click="setState('ready')">Pokaż dane demo</button>
          </div>
        </div>
      </section>

      <template v-else>
        <div v-if="dashboardState === 'success'" class="success-banner" role="status">
          <v-icon icon="mdi-check-circle" size="20" /> Dane zostały odświeżone przed chwilą.
        </div>

        <section class="metric-grid" aria-label="Najważniejsze metryki">
          <article v-for="metric in metrics" :key="metric.label" class="metric-card">
            <div class="metric-topline">
              <span>{{ metric.label }}</span>
              <span class="metric-icon" :class="`tone-${metric.tone}`"><v-icon :icon="metric.icon" size="18" /></span>
            </div>
            <strong>{{ metric.value }}</strong>
            <div class="metric-footer">
              <span class="trend" :class="metric.trend >= 0 ? 'trend-up' : 'trend-down'">
                <v-icon :icon="metric.trend >= 0 ? 'mdi-arrow-top-right' : 'mdi-arrow-bottom-right'" size="15" />
                {{ Math.abs(metric.trend) }}%
              </span>
              <span>vs. poprzedni okres</span>
            </div>
          </article>
        </section>

        <section class="dashboard-grid">
          <article class="panel performance-panel">
            <div class="panel-heading">
              <div>
                <div class="eyebrow">Aktywność</div>
                <h2>Wysyłki i zaangażowanie</h2>
              </div>
              <button class="icon-button" type="button" title="Więcej opcji"><v-icon icon="mdi-dots-horizontal" size="21" /></button>
            </div>

            <div class="chart-legend">
              <span><i class="legend-mark legend-sent"></i> Wysłane</span>
              <span><i class="legend-mark legend-opened"></i> Otwarte</span>
              <strong>48 290 <small>wiadomości</small></strong>
            </div>

            <div class="activity-chart" aria-label="Wykres aktywności wysyłek">
              <div class="chart-axis"><span>5k</span><span>4k</span><span>3k</span><span>2k</span><span>1k</span><span>0</span></div>
              <div class="chart-body">
                <div class="chart-guides"><i v-for="line in 6" :key="line"></i></div>
                <div class="chart-columns">
                  <div v-for="day in chartDays" :key="day.label" class="chart-column">
                    <div class="bar-pair"><span class="bar bar-sent" :style="{ height: `${day.sent}%` }"></span><span class="bar bar-opened" :style="{ height: `${day.opened}%` }"></span></div>
                    <small>{{ day.label }}</small>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article class="panel health-panel">
            <div class="panel-heading">
              <div><div class="eyebrow">Dostarczalność</div><h2>Kondycja kanału</h2></div>
              <span class="health-badge"><i></i> Stabilna</span>
            </div>
            <div class="health-score"><strong>98,7<span>%</span></strong><span>reputacja wysyłki</span></div>
            <div class="progress-list">
              <div v-for="item in healthMetrics" :key="item.label" class="progress-row">
                <div><span>{{ item.label }}</span><strong>{{ item.value }}%</strong></div>
                <div class="progress-track"><span :style="{ width: `${item.value}%` }" :class="`progress-${item.tone}`"></span></div>
              </div>
            </div>
            <div class="health-note"><v-icon icon="mdi-shield-check-outline" size="18" /> Wszystkie systemy działają poprawnie.</div>
          </article>
        </section>

        <section class="panel campaigns-panel">
          <div class="panel-heading">
            <div><div class="eyebrow">Ostatnie działania</div><h2>Ostatnie kampanie</h2></div>
            <button class="button button-quiet" type="button" @click="goTo('/campaigns')">Zobacz wszystkie <v-icon icon="mdi-arrow-right" size="17" /></button>
          </div>

          <div class="campaign-table-wrap">
            <table class="campaign-table">
              <thead><tr><th>Kampania</th><th>Odbiorcy</th><th>Otwarcia</th><th>Data</th><th>Status</th><th></th></tr></thead>
              <tbody>
                <tr v-for="campaign in campaigns" :key="campaign.name">
                  <td><div class="campaign-name"><span class="campaign-mark" :class="`mark-${campaign.tone}`"></span><div><strong>{{ campaign.name }}</strong><small>{{ campaign.type }}</small></div></div></td>
                  <td>{{ campaign.recipients }}</td><td><strong>{{ campaign.openRate }}</strong></td><td>{{ campaign.date }}</td>
                  <td><span class="status-pill" :class="`status-${campaign.statusTone}`"><i></i>{{ campaign.status }}</span></td>
                  <td><button class="icon-button" type="button" title="Otwórz kampanię" @click="goTo('/campaigns')"><v-icon icon="mdi-arrow-top-right" size="18" /></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bottom-grid">
          <article class="panel activity-panel">
            <div class="panel-heading"><div><div class="eyebrow">Dziennik</div><h2>Ostatnia aktywność</h2></div><button class="icon-button" type="button" title="Więcej opcji"><v-icon icon="mdi-dots-horizontal" size="21" /></button></div>
            <div class="activity-list">
              <div v-for="entry in activity" :key="entry.title" class="activity-item"><span class="activity-icon" :class="`activity-${entry.tone}`"><v-icon :icon="entry.icon" size="17" /></span><div><strong>{{ entry.title }}</strong><small>{{ entry.time }}</small></div><v-icon icon="mdi-chevron-right" size="18" class="activity-arrow" /></div>
            </div>
          </article>

          <article class="panel shortcuts-panel">
            <div class="panel-heading"><div><div class="eyebrow">Skróty</div><h2>Przejdź do pracy</h2></div></div>
            <button class="shortcut" type="button" @click="goTo('/campaigns')"><span class="shortcut-icon tone-coral"><v-icon icon="mdi-email-edit-outline" size="19" /></span><span><strong>Utwórz kampanię</strong><small>Zacznij od gotowego szablonu</small></span><v-icon icon="mdi-arrow-right" size="18" /></button>
            <button class="shortcut" type="button" @click="goTo('/databases')"><span class="shortcut-icon tone-blue"><v-icon icon="mdi-account-multiple-outline" size="19" /></span><span><strong>Zarządzaj kontaktami</strong><small>Segmenty i import odbiorców</small></span><v-icon icon="mdi-arrow-right" size="18" /></button>
            <button class="shortcut" type="button" @click="goTo('/email-editor')"><span class="shortcut-icon tone-green"><v-icon icon="mdi-text-box-edit-outline" size="19" /></span><span><strong>Otwórz edytor</strong><small>Przygotuj treść wiadomości</small></span><v-icon icon="mdi-arrow-right" size="18" /></button>
          </article>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const dashboardState = ref('ready')

const stateOptions = [
  { value: 'ready', label: 'Dane gotowe', icon: 'mdi-check-circle-outline' }, { value: 'loading', label: 'Ładowanie', icon: 'mdi-loading' },
  { value: 'empty', label: 'Pusty stan', icon: 'mdi-inbox-outline' }, { value: 'error', label: 'Błąd połączenia', icon: 'mdi-alert-circle-outline' },
  { value: 'forbidden', label: 'Brak uprawnień', icon: 'mdi-lock-outline' }, { value: 'success', label: 'Sukces', icon: 'mdi-check-decagram-outline' }
]

const metrics = [
  { label: 'Wysłane wiadomości', value: '48 290', trend: 12.4, icon: 'mdi-send-outline', tone: 'coral' }, { label: 'Średni open rate', value: '42,8%', trend: 5.8, icon: 'mdi-email-open-outline', tone: 'blue' },
  { label: 'Średni click rate', value: '8,4%', trend: -1.2, icon: 'mdi-cursor-default-click-outline', tone: 'amber' }, { label: 'Aktywne kontakty', value: '12 640', trend: 18.1, icon: 'mdi-account-multiple-outline', tone: 'green' }
]
const chartDays = [
  { label: 'Pon', sent: 56, opened: 35 }, { label: 'Wt', sent: 72, opened: 48 }, { label: 'Śr', sent: 61, opened: 42 }, { label: 'Czw', sent: 88, opened: 57 },
  { label: 'Pt', sent: 69, opened: 47 }, { label: 'Sob', sent: 38, opened: 24 }, { label: 'Nd', sent: 48, opened: 31 }
]
const healthMetrics = [
  { label: 'Dostarczalność', value: 99.2, tone: 'green' }, { label: 'Otwarcia', value: 86, tone: 'blue' }, { label: 'Brak odbić', value: 97.8, tone: 'coral' }
]
const campaigns = [
  { name: 'Letnia premiera / segment VIP', type: 'Newsletter', recipients: '4 820', openRate: '51,2%', date: 'Dzisiaj, 09:42', status: 'Wysłana', statusTone: 'success', tone: 'coral' }, { name: 'Raport trendów Q2', type: 'Automatyzacja', recipients: '2 190', openRate: '44,8%', date: 'Wczoraj, 16:10', status: 'Wysłana', statusTone: 'success', tone: 'blue' },
  { name: 'Onboarding nowych klientów', type: 'Seria powitalna', recipients: '—', openRate: '—', date: 'Jutro, 08:00', status: 'Zaplanowana', statusTone: 'scheduled', tone: 'amber' }, { name: 'Weekendowy wybór redakcji', type: 'Newsletter', recipients: '3 640', openRate: '—', date: 'Szkic zapisany', status: 'Szkic', statusTone: 'draft', tone: 'green' }
]
const activity = [
  { title: 'Kampania została wysłana', time: 'Letnia premiera · 8 min temu', icon: 'mdi-send-check-outline', tone: 'coral' }, { title: 'Zaimportowano kontakty', time: 'Baza „Newsletter PL” · 42 min temu', icon: 'mdi-account-plus-outline', tone: 'blue' }, { title: 'Zaktualizowano szablon', time: 'Onboarding 2026 · 2 godz. temu', icon: 'mdi-file-edit-outline', tone: 'green' }
]

const isLoading = computed(() => dashboardState.value === 'loading')
const isBlockingState = computed(() => ['empty', 'error', 'forbidden'].includes(dashboardState.value))
const stateCopy = computed(() => ({
  empty: { eyebrow: 'Brak danych', title: 'Jeszcze nic tu nie ma.', description: 'Utwórz pierwszą kampanię, aby zobaczyć wyniki i aktywność zespołu.', icon: 'mdi-inbox-outline' },
  error: { eyebrow: 'Nie udało się pobrać danych', title: 'Połączenie wymaga uwagi.', description: 'Serwer nie odpowiedział poprawnie. Dane demonstracyjne pozostają dostępne po ponowieniu próby.', icon: 'mdi-cloud-alert-outline' },
  forbidden: { eyebrow: 'Dostęp ograniczony', title: 'Nie masz dostępu do tego widoku.', description: 'Poproś administratora workspace o rolę analityka lub menedżera kampanii.', icon: 'mdi-lock-outline' }
}[dashboardState.value] || { eyebrow: '', title: '', description: '', icon: 'mdi-information-outline' }))

function goTo(path) { router.push(path) }
function setState(nextState) { dashboardState.value = nextState }
function refreshDashboard() { dashboardState.value = 'loading'; window.setTimeout(() => { dashboardState.value = 'success' }, 900) }
function retryDashboard() { refreshDashboard() }
</script>

<style scoped>
.dashboard-container { --ink: #18212f; --muted: #718096; --line: #e7e9ee; --surface: #fff; --canvas: #f6f7f9; --coral: #ef6b5c; --blue: #4f7de8; --green: #43a985; --amber: #e3a43b; min-height: 100%; color: var(--ink); background: var(--canvas); }
.page-header { display: flex; justify-content: space-between; gap: 32px; padding: 40px clamp(20px, 5vw, 72px) 32px; background: #fff; border-bottom: 1px solid var(--line); }
.header-copy h1 { margin: 7px 0 9px; color: var(--ink); font-size: clamp(2.05rem, 3.3vw, 3.3rem); line-height: 1.04; letter-spacing: -0.04em; font-weight: 800; }.header-copy p { max-width: 530px; margin: 0; color: var(--muted); font-size: 0.98rem; }
.eyebrow { color: #9aa1ad; font-size: 0.68rem; line-height: 1; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 800; }.live-dot { display: inline-block; width: 7px; height: 7px; margin-right: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 4px rgba(67, 169, 133, 0.14); vertical-align: middle; }
.header-actions { display: flex; align-items: center; align-self: end; flex-wrap: wrap; justify-content: flex-end; gap: 9px; }.button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 0 14px; border: 1px solid transparent; border-radius: 6px; color: var(--ink); background: transparent; cursor: pointer; font: inherit; font-size: 0.82rem; font-weight: 750; transition: 160ms ease; }.button:hover { transform: translateY(-1px); }.button:focus-visible, .icon-button:focus-visible, .shortcut:focus-visible { outline: 3px solid rgba(79, 125, 232, 0.28); outline-offset: 2px; }.button-primary { color: #fff; background: var(--coral); box-shadow: 0 7px 15px rgba(239, 107, 92, 0.18); }.button-primary:hover { background: #dd5d4f; }.button-quiet { border-color: var(--line); background: #fff; }.button-quiet:hover { border-color: #cdd2db; background: #fbfbfc; }.state-menu { min-width: 210px; padding: 6px; border: 1px solid var(--line); box-shadow: 0 16px 35px rgba(24, 33, 47, 0.12); }.state-menu :deep(.v-list-subheader) { color: #9aa1ad; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.dashboard-content { max-width: 1480px; margin: 0 auto; padding: 28px clamp(20px, 5vw, 72px) 56px; }.metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }.metric-card, .panel, .state-card { border: 1px solid var(--line); background: var(--surface); box-shadow: 0 8px 24px rgba(24, 33, 47, 0.035); }.metric-card { min-width: 0; padding: 19px 20px 17px; border-radius: 7px; }.metric-topline, .metric-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }.metric-topline > span:first-child { color: var(--muted); font-size: 0.74rem; font-weight: 700; }.metric-card strong { display: block; margin: 15px 0 12px; font-size: 1.75rem; line-height: 1; letter-spacing: -0.04em; }.metric-icon, .shortcut-icon, .activity-icon { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; border-radius: 6px; }.metric-icon { width: 34px; height: 34px; }.tone-coral { color: var(--coral); background: rgba(239, 107, 92, 0.12); }.tone-blue { color: var(--blue); background: rgba(79, 125, 232, 0.12); }.tone-green { color: var(--green); background: rgba(67, 169, 133, 0.12); }.tone-amber { color: var(--amber); background: rgba(227, 164, 59, 0.14); }.metric-footer { color: #a0a7b3; font-size: 0.7rem; }.trend { display: inline-flex; align-items: center; gap: 2px; font-weight: 800; }.trend-up { color: var(--green); }.trend-down { color: var(--coral); }
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.85fr); gap: 14px; margin-top: 14px; }.panel { min-width: 0; padding: 22px; border-radius: 7px; }.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 23px; }.panel h2 { margin: 7px 0 0; color: var(--ink); font-size: 1.05rem; letter-spacing: -0.02em; }.icon-button { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 5px; color: #9aa1ad; background: transparent; cursor: pointer; }.icon-button:hover { color: var(--ink); background: #f1f3f6; }.chart-legend { display: flex; align-items: center; gap: 18px; color: var(--muted); font-size: 0.72rem; }.chart-legend span { display: inline-flex; align-items: center; gap: 6px; }.chart-legend strong { margin-left: auto; color: var(--ink); font-size: 1.05rem; }.chart-legend small { color: var(--muted); font-size: 0.68rem; font-weight: 500; }.legend-mark { width: 8px; height: 8px; border-radius: 2px; }.legend-sent { background: var(--coral); }.legend-opened { background: #f7c2b9; }
.activity-chart { display: flex; height: 225px; margin-top: 22px; }.chart-axis { display: flex; flex-direction: column; justify-content: space-between; padding: 0 12px 24px 0; color: #aeb4bd; font-size: 0.64rem; text-align: right; }.chart-body { position: relative; flex: 1; min-width: 0; }.chart-guides { position: absolute; inset: 0 0 25px; display: flex; flex-direction: column; justify-content: space-between; }.chart-guides i { display: block; border-top: 1px dashed #eceef2; }.chart-columns { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(7, 1fr); height: 100%; gap: 10px; }.chart-column { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 9px; min-width: 0; }.bar-pair { display: flex; align-items: flex-end; justify-content: center; gap: 4px; width: 100%; height: calc(100% - 25px); }.bar { display: block; width: min(18px, 35%); min-height: 5px; border-radius: 4px 4px 2px 2px; transition: height 300ms ease; }.bar-sent { background: var(--coral); }.bar-opened { background: #f7c2b9; }.chart-column small { color: #9aa1ad; font-size: 0.65rem; }
.health-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 9px; border-radius: 4px; color: #278565; background: #eaf7f2; font-size: 0.68rem; font-weight: 800; }.health-badge i, .status-pill i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }.health-score { padding: 2px 0 23px; border-bottom: 1px solid var(--line); }.health-score strong { display: block; color: var(--ink); font-size: 2.3rem; letter-spacing: -0.05em; }.health-score strong span { color: var(--green); font-size: 1rem; }.health-score > span { color: var(--muted); font-size: 0.72rem; }.progress-list { padding-top: 19px; }.progress-row { margin-bottom: 16px; }.progress-row > div:first-child { display: flex; justify-content: space-between; margin-bottom: 7px; color: var(--muted); font-size: 0.72rem; }.progress-row strong { color: var(--ink); }.progress-track { height: 6px; overflow: hidden; border-radius: 6px; background: #eef0f3; }.progress-track span { display: block; height: 100%; border-radius: inherit; }.progress-green { background: var(--green); }.progress-blue { background: var(--blue); }.progress-coral { background: var(--coral); }.health-note { display: flex; align-items: center; gap: 8px; margin-top: 5px; padding: 10px; color: #348e71; background: #f1faf7; font-size: 0.7rem; }
.campaigns-panel { margin-top: 14px; }.campaigns-panel .panel-heading { align-items: center; margin-bottom: 12px; }.campaign-table-wrap { overflow-x: auto; }.campaign-table { width: 100%; border-collapse: collapse; min-width: 720px; }.campaign-table th { padding: 10px 12px; color: #a0a7b3; border-bottom: 1px solid var(--line); font-size: 0.64rem; letter-spacing: 0.09em; text-align: left; text-transform: uppercase; }.campaign-table td { padding: 13px 12px; border-bottom: 1px solid #f0f1f4; color: var(--muted); font-size: 0.75rem; }.campaign-table tr:last-child td { border-bottom: 0; }.campaign-table td strong { color: var(--ink); }.campaign-name { display: flex; align-items: center; gap: 10px; }.campaign-name strong, .campaign-name small { display: block; }.campaign-name strong { color: var(--ink); font-size: 0.78rem; }.campaign-name small { margin-top: 3px; color: #a0a7b3; font-size: 0.66rem; }.campaign-mark { width: 8px; height: 30px; border-radius: 4px; }.mark-coral { background: var(--coral); }.mark-blue { background: var(--blue); }.mark-amber { background: var(--amber); }.mark-green { background: var(--green); }.status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 4px; font-size: 0.64rem; font-weight: 800; white-space: nowrap; }.status-success { color: #278565; background: #eaf7f2; }.status-scheduled { color: #a1701d; background: #fff6df; }.status-draft { color: #697383; background: #f0f2f5; }
.bottom-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr); gap: 14px; margin-top: 14px; }.activity-panel .panel-heading, .shortcuts-panel .panel-heading { margin-bottom: 9px; }.activity-item { display: flex; align-items: center; gap: 11px; padding: 11px 0; border-top: 1px solid #f0f1f4; }.activity-item > div { min-width: 0; }.activity-icon { width: 32px; height: 32px; }.activity-coral { color: var(--coral); background: rgba(239, 107, 92, 0.12); }.activity-blue { color: var(--blue); background: rgba(79, 125, 232, 0.12); }.activity-green { color: var(--green); background: rgba(67, 169, 133, 0.12); }.activity-item strong, .activity-item small { display: block; }.activity-item strong { color: var(--ink); font-size: 0.74rem; }.activity-item small { margin-top: 3px; color: #a0a7b3; font-size: 0.66rem; }.activity-arrow { margin-left: auto; color: #b1b6bf; }.shortcut { display: flex; align-items: center; width: 100%; gap: 11px; padding: 11px 0; border: 0; border-top: 1px solid #f0f1f4; color: var(--ink); background: transparent; cursor: pointer; text-align: left; }.shortcut > span:nth-child(2) { flex: 1; }.shortcut:hover strong { color: var(--coral); }.shortcut-icon { width: 32px; height: 32px; }.shortcut strong, .shortcut small { display: block; }.shortcut strong { font-size: 0.74rem; }.shortcut small { margin-top: 3px; color: #a0a7b3; font-size: 0.66rem; }.shortcut > .v-icon { color: #b1b6bf; }
.success-banner { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding: 11px 14px; border: 1px solid #cbeadd; border-radius: 6px; color: #278565; background: #f1faf7; font-size: 0.76rem; font-weight: 700; }.state-card { display: flex; align-items: flex-start; gap: 20px; max-width: 780px; margin: 42px auto; padding: 32px; border-radius: 8px; }.state-icon { display: flex; align-items: center; justify-content: center; width: 58px; height: 58px; flex: 0 0 auto; border-radius: 8px; color: var(--coral); background: rgba(239, 107, 92, 0.12); }.state-empty .state-icon { color: var(--blue); background: rgba(79, 125, 232, 0.12); }.state-forbidden .state-icon { color: var(--amber); background: rgba(227, 164, 59, 0.14); }.state-copy h2 { margin: 8px 0 7px; font-size: 1.4rem; letter-spacing: -0.03em; }.state-copy p { max-width: 530px; margin: 0; color: var(--muted); font-size: 0.84rem; line-height: 1.6; }.state-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 22px; }.loading-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }.skeleton { position: relative; overflow: hidden; border-radius: 7px; background: #e9ebef; }.skeleton::after { position: absolute; inset: 0; content: ''; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent); animation: shimmer 1.3s infinite; }.metric-skeleton { height: 128px; }.large-skeleton { grid-column: span 3; height: 390px; }.side-skeleton { height: 390px; }.spin { animation: spin 900ms linear infinite; }
@keyframes shimmer { to { transform: translateX(100%); } } @keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1080px) { .page-header { padding-inline: 28px; }.dashboard-content { padding-inline: 28px; }.metric-grid { grid-template-columns: repeat(2, 1fr); }.dashboard-grid, .bottom-grid { grid-template-columns: 1fr; }.loading-grid { grid-template-columns: repeat(2, 1fr); }.large-skeleton { grid-column: span 2; } }
@media (max-width: 700px) { .page-header { display: block; padding: 28px 18px 24px; }.header-copy h1 { font-size: 2.15rem; }.header-actions { justify-content: flex-start; margin-top: 22px; }.header-actions .button-quiet:first-child span { display: none; }.dashboard-content { padding: 18px 14px 38px; }.metric-grid { gap: 9px; }.metric-card { padding: 15px; }.metric-card strong { font-size: 1.4rem; }.metric-footer { display: block; }.metric-footer > span:last-child { display: block; margin-top: 5px; }.panel { padding: 17px; }.chart-legend strong { font-size: 0.92rem; }.campaigns-panel .panel-heading { align-items: flex-start; }.campaigns-panel .button span { display: none; }.state-card { display: block; margin: 18px 0; padding: 24px; }.state-copy { margin-top: 19px; }.loading-grid { grid-template-columns: 1fr 1fr; gap: 9px; }.large-skeleton { grid-column: span 2; height: 300px; }.side-skeleton { grid-column: span 2; height: 260px; } }
@media (max-width: 430px) { .metric-grid { grid-template-columns: 1fr; }.metric-card { display: grid; grid-template-columns: 1fr auto; align-items: center; }.metric-card strong { grid-row: 2; margin: 11px 0 0; }.metric-footer { grid-column: 1 / -1; margin-top: 9px; }.metric-topline { grid-column: 1 / -1; }.header-actions .button { padding-inline: 10px; }.header-actions .button-primary span { display: none; }.chart-legend { flex-wrap: wrap; }.chart-legend strong { width: 100%; margin: 3px 0 0; }.activity-chart { height: 190px; } }
</style>