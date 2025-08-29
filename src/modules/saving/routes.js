import RecommendSavings from '@/modules/saving/mydata/pages/RecommendSavings.vue'
import SavingDetailPage from '@/modules/saving/detail/pages/SavingDetailPage.vue'
import PersonaSavingAllList from '@/modules/saving/persona/pages/PersonaSavingAllListPage.vue'

export const savingRoutes = [
  {
    path: '/savings/recommendations/history',
    name: 'RecommendSavings',
    component: RecommendSavings
  },
  {
    path: '/detail/saving/:savingId',
    name: 'SavingDetail',
    component: SavingDetailPage,
    props: true
  },
  {
    path: '/persona/savings',
    name: 'PersonaSavings',
    component: PersonaSavingAllList
  }
]