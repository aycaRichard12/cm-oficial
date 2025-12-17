export const codigos = {
  codigoPrincipal: Array.from({ length: 5 }, () => rand()).join('') + 'codigoPrincipal',
  codigocanvas: Array.from({ length: 5 }, () => rand()).join('') + 'codigocanvas',
}

function rand() {
  const indice = Math.floor(Math.random() * 26)
  const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100
  return String.fromCharCode(65 + indice) + codigo
}
