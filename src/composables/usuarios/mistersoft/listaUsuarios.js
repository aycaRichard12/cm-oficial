import { menus } from './menus/index_m'
import { usuarios } from './usuarios/index_u'

export let USES = []

usuarios.forEach((userObj) => {
  const userName = Object.keys(userObj)[0] // 'richard50'
  const menuObj = menus.find((m) => m[userName]) // busca el menú que coincide
  USES.push({
    usuario: userObj[userName],
    menu: menuObj ? menuObj[userName] : null,
  })
})

console.log(USES)
