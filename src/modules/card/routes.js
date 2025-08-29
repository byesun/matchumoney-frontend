import MyDataCardPage from '@/modules/card/mydata/pages/MyDataCardPage.vue'
import CardRecommendationPage from '@/modules/card/mydata/pages/CardRecommendationPage.vue'
import CardDetailPage from '@/modules/card/detail/pages/CardDetailPage.vue'
import PersonaCardAllList from '@/modules/card/persona/pages/PersonaCardAllList.vue'

export const cardRoutes = [
  {
    path: '/mydata/cards',
    name: 'MyDataCards',
    component: MyDataCardPage
  },
  {
    path: '/cards/recommendations',
    name: 'CardRecommendations',
    component: CardRecommendationPage
  },
  {
    path: '/cards/recommendations/:cardId',
    name: 'CardRecommendation',
    component: CardRecommendationPage,
    props: true
  },
  {
    path: '/detail/card/:cardId',
    name: 'CardDetail',
    component: CardDetailPage,
    props: true
  },
  {
    path: '/persona/cards',
    name: 'PersonaCards',
    component: PersonaCardAllList
  }
]