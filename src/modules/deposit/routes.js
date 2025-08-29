import RecommendDeposit from '@/modules/deposit/mydata/pages/RecommendDeposit.vue'
import DepositDetailPage from '@/modules/deposit/detail/pages/DepositDetailPage.vue'
import PersonaDepositAllList from '@/modules/deposit/persona/pages/PersonaDepositAllListPage.vue'

export const depositRoutes = [
  {
    path: '/deposits/recommendations/history',
    name: 'RecommendDeposit',
    component: RecommendDeposit
  },
  {
    path: '/detail/deposit/:depositId',
    name: 'DepositDetail',
    component: DepositDetailPage,
    props: true
  },
  {
    path: '/persona/deposits',
    name: 'PersonaDeposits',
    component: PersonaDepositAllList
  }
]