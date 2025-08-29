import PersonaSurveyPage from '@/modules/persona/pages/PersonaSurveyPage.vue'
import PersonaSurveyStart from '@/modules/persona/pages/PersonaSurveyStartPage.vue'

const ResultPage = () => import('@/modules/persona/pages/PersonaResultPage.vue')

const personaCodes = [
  'turtle',
  'squirrel',
  'ant',
  'owl',
  'rabbit',
  'cat',
  'tiger',
  'penguin'
]

export const personaRoutes = [
  {
    path: '/persona',
    children: [
      { path: 'start', name: 'PersonaTest', component: PersonaSurveyStart },
      { path: 'survey', name: 'PersonaSurvey', component: PersonaSurveyPage },
      {
        path: 'result/:code',
        name: 'PersonaResult',
        component: ResultPage,
        props: true,
        beforeEnter: (to, _, next) => {
          if (personaCodes.includes(to.params.code)) next()
          else next('/')
        }
      }
    ]
  },
  // 레거시 리다이렉트
  { path: '/survey', redirect: '/persona/survey' },
  { path: '/personatest', redirect: '/persona/test' },
  { path: '/personaCardList', redirect: '/persona/cards' },
  ...personaCodes.map((c) => ({
    path: `/${c}`,
    redirect: `/persona/result/${c}`
  }))
]