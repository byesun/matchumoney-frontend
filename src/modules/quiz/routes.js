import FortunePage from '@/modules/quiz/pages/FortunePage.vue'
import QuizEntry from '@/modules/quiz/pages/QuizEntry.vue'
import DailyQuiz from '@/modules/quiz/pages/DailyQuiz.vue'

export const quizRoutes = [
  {
    path: '/fortune',
    name: 'Fortune',
    component: FortunePage,
    props: true
  },
  {
    path: '/quiz',
    children: [
      { path: '', name: 'QuizEntry', component: QuizEntry },
      { path: 'daily', name: 'DailyQuiz', component: DailyQuiz }
    ]
  },
  {
    path: '/education/quiz',
    name: 'quiz',
    component: QuizEntry
  }
]