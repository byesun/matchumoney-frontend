import EducationBoardPage from '@/modules/education/pages/EducationBoardPage.vue'
import WebtoonPage from '@/modules/education/pages/WebtoonPage.vue'
import VideoPage from '@/modules/education/pages/EducationVideoBoardPage.vue'

export const educationRoutes = [
  {
    path: '/education',
    children: [
      { path: 'contents', name: 'contents', component: EducationBoardPage },
      { path: 'video', name: 'video', component: VideoPage },
      {
        path: 'video/full/:videoId',
        name: 'VideoDetail',
        component: () => import('@/modules/education/pages/VideoDetailPage.vue'),
        props: true
      },
      { path: 'webtoon', name: 'webtoon', component: WebtoonPage }
    ]
  }
]