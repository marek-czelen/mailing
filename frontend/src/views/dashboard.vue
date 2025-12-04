<template>
  <div class="dashboard-container">
    <!-- Hero Header -->
    <div class="hero-header">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('dashboard.title') }}</h1>
        <p class="hero-subtitle">{{ $t('dashboard.subtitle') }}</p>
      </div>
      <div class="hero-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-circle"></div>
        <div class="decoration-circle"></div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Quick Access Cards -->
      <div class="section-header">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"/>
          </svg>
          {{ $t('dashboard.quickAccess') }}
        </h2>
        <p class="section-subtitle">{{ $t('dashboard.sectionSubtitle') }}</p>
      </div>

      <div class="quick-access-grid">
        <div class="access-card primary-gradient disabled" @click="$router.push('/block-email-editor')">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z"/>
            </svg>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ $t('dashboard.blockEditorTitle') }}</h3>
            <p class="card-description">{{ $t('dashboard.blockEditorDesc') }}</p>
          </div>
          <div class="card-arrow">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
            </svg>
          </div>
        </div>

        <div class="access-card success-gradient" @click="$router.push('/campaigns')">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M22,6C22,4.89 21.1,4 20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6M20,6L12,11L4,6H20M20,18H4V8L12,13L20,8V18Z"/>
            </svg>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ $t('dashboard.campaignsTitle') }}</h3>
            <p class="card-description">{{ $t('dashboard.campaignsDesc') }}</p>
          </div>
          <div class="card-arrow">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
            </svg>
          </div>
        </div>

        <div class="access-card info-gradient disabled" @click="$router.push('/email-editor')">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z"/>
            </svg>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ $t('dashboard.htmlEditorTitle') }}</h3>
            <p class="card-description">{{ $t('dashboard.htmlEditorDesc') }}</p>
          </div>
          <div class="card-arrow">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
            </svg>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import PieChart from '../components/dashboard/PieChart.vue';
import BarChart from '../components/dashboard/BarChart.vue';
import SampleTable from '../components/dashboard/SampleTable.vue';

</script>

<style scoped>
.disabled{
  pointer-events: none;
  opacity: 0.5; 
}

.dashboard-container {
  width: 100vw;
  min-width: 100vw;
  height: 100%;
  background: linear-gradient(135deg, #eadcf6 0%, #9395fa 100%);
  position: relative;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #202950 0%, #515bad 100%);
  padding: 60px 0;
  position: relative;
  overflow: hidden;
  width: 100%;
  margin: 0;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite;
}

.decoration-circle:nth-child(1) {
  width: 200px;
  height: 200px;
  top: -50px;
  right: 10%;
  animation-delay: 0s;
}

.decoration-circle:nth-child(2) {
  width: 150px;
  height: 150px;
  bottom: -30px;
  left: 15%;
  animation-delay: 3s;
}

.decoration-circle:nth-child(3) {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 5%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
  50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
}

/* Dashboard Content */
.dashboard-content {
  width: 100%;
  min-width: 100%;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
}

/* Section Headers */
.section-header {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.section-title svg {
  color: #667eea;
}

.section-subtitle {
  color: #718096;
  font-size: 1rem;
}

/* Quick Access Grid */
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
  width: 100%;
  box-sizing: border-box;
}

.access-card {
  user-select: none;
  background: white;
  border-radius: 20px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.access-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.access-card:hover::before {
  left: 100%;
}

.access-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.access-card.primary-gradient .card-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.access-card.success-gradient .card-icon {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.access-card.info-gradient .card-icon {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.card-icon.small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.card-description {
  color: #718096;
  font-size: 0.95rem;
  line-height: 1.5;
}

.card-arrow {
  color: #a0aec0;
  transition: all 0.3s ease;
}

.access-card:hover .card-arrow {
  color: #667eea;
  transform: translateX(4px);
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
}

.analytics-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.analytics-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.analytics-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-header .card-title {
  margin-bottom: 0;
  font-size: 1.1rem;
}

.card-header .card-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .dashboard-content {
    padding: 24px 16px;
  }
  
  .quick-access-grid,
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .access-card {
    padding: 24px;
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-header {
    padding: 40px 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .access-card {
    padding: 20px;
  }
  
  .analytics-card {
    padding: 20px;
  }
}
</style>

