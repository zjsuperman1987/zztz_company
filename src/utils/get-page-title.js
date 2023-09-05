import i18n from '@/lang'

const site = localStorage.getItem('site')
let title = '电报商城'

if (site !== undefined && site !== 'undefined' && site !== '' && site !== 'null' && site !== null) {
  title = JSON.parse(localStorage.getItem('site')).site_name_chars
}else {
  localStorage.setItem('site', '')
}

export default function getPageTitle(pageTitle) {
  const hasKey = i18n.te(`route.${pageTitle}`)
  if (hasKey) {
    const pageName = i18n.t(`route.${pageTitle}`)
    return `${pageName} - ${title}`
  }
  return `${pageTitle} - ${title}`
}
