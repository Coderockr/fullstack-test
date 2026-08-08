<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { AlertTriangle, CalendarDays, Inbox, Search } from 'lucide-vue-next'
import { useInvestmentsQuery } from '@/queries/useInvestmentsQuery'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/composables/useDate'
import type { Investment } from '@/types/investment'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppPaginator from '@/components/common/AppPaginator.vue'
import InvestmentCard from '@/components/investments/InvestmentCard.vue'
import WithdrawDialog from '@/components/investments/WithdrawDialog.vue'

const route = useRoute()
const router = useRouter()
const { formatBRL } = useCurrency()
const { formatDate } = useDate()

const page = computed(() => Math.max(1, Number(route.query.page ?? 1)))
const { data, isPending, isError, isPlaceholderData, refetch } = useInvestmentsQuery(page, 6)

const initialDate = ref('')
const endDate = ref('')
const owner = ref('')
const selectedInvestment = ref<Investment | null>(null)

const visibleInvestments = computed(() => {
  const investments = data.value?.data ?? []
  const ownerQuery = owner.value.trim().toLocaleLowerCase()

  return investments.filter((investment) => {
    const matchesInitial = !initialDate.value || investment.invested_at >= initialDate.value
    const matchesEnd = !endDate.value || investment.invested_at <= endDate.value
    const matchesOwner =
      !ownerQuery || (investment.owner.name ?? '').toLocaleLowerCase().includes(ownerQuery)
    return matchesInitial && matchesEnd && matchesOwner
  })
})

const activeBalance = computed(() =>
  (data.value?.data ?? [])
    .filter((investment) => investment.status === 'active')
    .reduce((total, investment) => total + Number(investment.expected_balance), 0),
)

function currentBalance(investment: Investment): string {
  return formatBRL(investment.expected_balance)
}

function changePage(next: number) {
  router.push({ query: { ...route.query, page: next } })
}
</script>

<template>
  <section class="space-y-[31px]">
    <article class="card flex h-[139px] max-w-[429px] flex-col gap-2">
      <h1 class="section-title">Balance</h1>
      <div class="figma-divider" />
      <div class="flex flex-1 items-end justify-end">
        <p class="text-right text-4xl leading-[1.5] font-semibold text-[#057a55] tabular-nums">
          {{ formatBRL(activeBalance) }}
        </p>
      </div>
    </article>

    <article class="card overflow-hidden">
      <div class="flex flex-col gap-4 pb-4 xl:flex-row xl:items-center">
        <h2 class="section-title min-w-0 xl:flex-1">Investments</h2>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:flex xl:gap-4">
          <label class="filter-field">
            <CalendarDays class="h-[18px] w-[18px] shrink-0" />
            <span class="sr-only">Initial date</span>
            <input v-model="initialDate" type="date" aria-label="Initial date" />
          </label>
          <label class="filter-field">
            <CalendarDays class="h-[18px] w-[18px] shrink-0" />
            <span class="sr-only">End date</span>
            <input v-model="endDate" type="date" aria-label="End date" />
          </label>
          <label class="filter-field">
            <Search class="h-5 w-5 shrink-0" />
            <span class="sr-only">Owner</span>
            <input v-model="owner" type="search" placeholder="Owner" aria-label="Owner" />
          </label>
          <RouterLink :to="{ name: 'investments.new' }" class="btn-primary">New</RouterLink>
        </div>
      </div>

      <div v-if="isPending" class="space-y-px overflow-hidden rounded-xl">
        <div class="h-[51px] animate-pulse bg-[#f9fafb]" />
        <div
          v-for="n in 6"
          :key="n"
          class="h-[54px] animate-pulse odd:bg-white even:bg-[#f9fafb]"
        />
      </div>

      <div v-else-if="isError" class="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle class="h-10 w-10 text-amber-500" />
        <p class="text-[#6b7280]">We couldn't load your investments.</p>
        <button class="btn-ghost" @click="refetch()">Try again</button>
      </div>

      <div
        v-else-if="data && data.data.length === 0"
        class="flex flex-col items-center gap-3 py-12 text-center"
      >
        <Inbox class="h-10 w-10 text-[#9ca3af]" />
        <p class="text-[#6b7280]">No investments yet.</p>
        <RouterLink :to="{ name: 'investments.new' }" class="btn-primary">
          Create your first
        </RouterLink>
      </div>

      <template v-else-if="data">
        <div
          class="hidden overflow-x-auto transition-opacity lg:block"
          :class="{ 'opacity-60': isPlaceholderData }"
        >
          <table class="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr
                class="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs font-semibold text-[#6b7280]"
              >
                <th class="table-cell">OWNER</th>
                <th class="table-cell">DATE</th>
                <th class="table-cell">AMOUNT</th>
                <th class="table-cell">CURRENT BALANCE</th>
                <th class="table-cell">STATUS</th>
                <th class="table-cell text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(investment, index) in visibleInvestments"
                :key="investment.id"
                class="text-[#111827]"
                :class="index % 2 === 1 ? 'bg-[#f9fafb]' : 'bg-white'"
              >
                <td class="table-cell font-medium">
                  {{ investment.owner.name }}
                </td>
                <td class="table-cell text-sm text-[#6b7280]">
                  {{ formatDate(investment.invested_at) }}
                </td>
                <td class="table-cell font-medium tabular-nums">
                  {{ formatBRL(investment.amount) }}
                </td>
                <td class="table-cell font-medium tabular-nums">
                  {{ currentBalance(investment) }}
                </td>
                <td class="table-cell"><StatusBadge :status="investment.status" /></td>
                <td class="table-cell">
                  <div class="flex items-center justify-center gap-2">
                    <RouterLink
                      :to="{ name: 'investments.show', params: { id: investment.id } }"
                      class="btn-table"
                    >
                      View
                    </RouterLink>
                    <button
                      v-if="investment.status === 'active'"
                      class="btn-danger hover:bg-[#c81e1e]"
                      @click="selectedInvestment = investment"
                    >
                      Withdraw
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-if="visibleInvestments.length === 0"
            class="py-10 text-center text-sm text-[#6b7280]"
          >
            No investments match these filters.
          </div>
        </div>

        <div class="grid gap-3 lg:hidden">
          <InvestmentCard
            v-for="investment in visibleInvestments"
            :key="investment.id"
            :investment="investment"
            @withdraw="selectedInvestment = investment"
          />
          <p v-if="visibleInvestments.length === 0" class="py-8 text-center text-sm text-[#6b7280]">
            No investments match these filters.
          </p>
        </div>

        <div v-if="data.meta.last_page > 1" class="mt-4 border-t border-[#e5e7eb] pt-4">
          <AppPaginator :meta="data.meta" @change="changePage" />
        </div>
      </template>
    </article>

    <WithdrawDialog
      v-if="selectedInvestment"
      :investment="selectedInvestment"
      @close="selectedInvestment = null"
      @withdrawn="selectedInvestment = null"
    />
  </section>
</template>

<style scoped>
@reference "../assets/styles/main.css";

.filter-field {
  @apply flex h-[45px] min-w-0 items-center gap-2.5 rounded-2xl border border-[#e5e7eb] bg-white px-[15px] text-[#6b7280] xl:w-[236px];
}

.filter-field input {
  @apply min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#6b7280];
}

.table-cell {
  @apply h-[54px] px-4 py-3;
}

thead .table-cell {
  @apply h-[51px] py-4;
}
</style>
