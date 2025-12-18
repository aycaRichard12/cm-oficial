// import { defineRouter } from '#q-app/wrappers'

// import { createRouter, createMemoryHistory } from 'vue-router'
// import routes from './routes'

// export default defineRouter(function () {
//   const createHistory = createMemoryHistory

//   const Router = createRouter({
//     scrollBehavior: () => ({ left: 0, top: 0 }),
//     routes,
//     history: createHistory(),
//   })

//   return Router
// })

import { useRouter } from 'vue-router'

setup () {
  const router = useRouter()

  console.log(router.getRoutes())

  return {}
}

