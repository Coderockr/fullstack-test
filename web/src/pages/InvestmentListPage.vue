<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Plus, Inbox, AlertTriangle } from 'lucide-vue-next'
import { useInvestmentsQuery } from '@/queries/useInvestmentsQuery'
import InvestmentCard from '@/components/investments/InvestmentCard.vue'
import AppPaginator from '@/components/common/AppPaginator.vue'

const route = useRoute()
const router = useRouter()

const page = computed(() => Math.max(1, Number(route.query.page ?? 1)))
const { data, isPending, isError, isPlaceholderData, refetch } = useInvestmentsQuery(page)

function changePage(next: number) {
  router.push({ query: { ...route.query, page: next } })
}
</script>

<template>
  <section>
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Your investments</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Balances grow 0.52% every month, compounded.
        </p>
      </div>
      <RouterLink :to="{ name: 'investments.new' }" class="btn-primary">
        <Plus class="h-4 w-4" />
        <span class="hidden sm:inline">New investment</span>
      </RouterLink>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isPending" class="grid gap-4 sm:grid-cols-2">
      <div
        v-for="n in 4"
        :key="n"
        class="h-36 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50"
      />
    </div>

    <!-- Error -->
    <div v-else-if="isError" class="card flex flex-col items-center gap-3 py-12 text-center">
      <AlertTriangle class="h-10 w-10 text-amber-500" />
      <p class="text-slate-600 dark:text-slate-300">We couldn't load your investments.</p>
      <button class="btn-ghost" @click="refetch()">Try again</button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="data && data.data.length === 0"
      class="card flex flex-col items-center gap-3 py-12 text-center"
    >
      <Inbox class="h-10 w-10 text-slate-400" />
      <p class="text-slate-600 dark:text-slate-300">No investments yet.</p>
      <RouterLink :to="{ name: 'investments.new' }" class="btn-primary">
        <Plus class="h-4 w-4" /> Create your first
      </RouterLink>
    </div>

    <!-- List -->
    <template v-else-if="data">
      <div
        class="grid gap-4 transition-opacity sm:grid-cols-2"
        :class="{ 'opacity-60': isPlaceholderData }"
      >
        <InvestmentCard
          v-for="investment in data.data"
          :key="investment.id"
          :investment="investment"
        />
      </div>
      <div v-if="data.meta.last_page > 1" class="mt-6">
        <AppPaginator :meta="data.meta" @change="changePage" />
      </div>
    </template>
  </section>
</template>
