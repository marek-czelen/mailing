<template>
  <v-table>
    <thead>
      <tr>
        <th>{{ t('dashboard.name') }}</th>
        <th>{{ t('dashboard.value') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ t('dashboard.position1') }}</td>
        <td>123</td>
      </tr>
      <tr>
        <td>{{ t('dashboard.position2') }}</td>
        <td>456</td>
      </tr>
      <tr>
        <td>{{ t('dashboard.position3') }}</td>
        <td>789</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
