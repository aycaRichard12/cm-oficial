// // src/boot/error-handler.js
// import { Notify } from 'quasar'

// export default ({ app }) => {
//   app.config.errorHandler = (err, vm, info) => {
//     console.error('Error global:', err, info)
//     Notify.create({
//       type: 'negative',
//       message: 'Ocurrió un error inesperado',
//       caption: err.message,
//       timeout: 5000,
//     })
//   }
// }
