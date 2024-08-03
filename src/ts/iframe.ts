/**
 * --------------------------------------------
 * AdminLTE IFrame.ts
 * License MIT
 * --------------------------------------------
 */
import { slideToggle } from './util/index'

const DATA_PREFIX = 'data-lte-' // The data attribute prefix for the plugin
const DATA_WIDGET = `${DATA_PREFIX}widget` // The data attribute for the plugin
const CLOSE_ICON = 'bi bi-x-circle-fill'

const SELECTOR_DATA_TOGGLE = `[${DATA_PREFIX}toggle="iframe"]` // Any element with this attribute will trigger the plugin. The value is the target element's selector.
const SELECTOR_DATA_DISABLED = `[${DATA_PREFIX}disable="iframe"]` // Any element with this attribute will be ignored by the plugin. Ideal for the menu items that should not trigger the plugin.
const SELECTOR_DATA_CLOSE = `[${DATA_WIDGET}="iframe-close"]` // Any element with this attribute will close the tab. The value is the type of close action. Possible values are 'all', 'all-other', 'only-this'.
const SELECTOR_DATA_SCROLL_LEFT = `[${DATA_WIDGET}="iframe-scrollleft"]` // Any element with this attribute will scroll the tab menu to the left.
const SELECTOR_DATA_SCROLL_RIGHT = `[${DATA_WIDGET}="iframe-scrollright"]` // Any element with this attribute will scroll the tab menu to the right.
const SELECTOR_DATA_FULLSCREEN = `[${DATA_WIDGET}="iframe-fullscreen"]` // Any element with this attribute will toggle the fullscreen mode.
const SELECTOR_DATA_PAGE_CONTENT = `[${DATA_WIDGET}="iframe-page-content"]` // Any element with this attribute will toggle the fullscreen mode.

const CLASS_NAME_IFRAME_MODE = 'iframe-mode'
const SELECTOR_CONTENT_WRAPPER = '.app-main' // The wrapper for the content
const SELECTOR_SIDEBAR = '.app-sidebar' // The wrapper for the content
const SELECTOR_HEADER = '.app-header' // The wrapper for the content
const SELECTOR_TAB_NAVBAR_NAV = `.${CLASS_NAME_IFRAME_MODE} > .navbar .navbar-nav` // The tab menu wrapper for the plugins menu
const SELECTOR_TAB_NAVBAR_NAV_LINK = `${SELECTOR_TAB_NAVBAR_NAV} > .nav-link` // The tab menu link for the plugins menu
const SELECTOR_TAB_CONTENT = `.${CLASS_NAME_IFRAME_MODE} > .tab-content` // The wrapper the tabs are displayed in
const SELECTOR_TAB_EMPTY = `${SELECTOR_TAB_CONTENT} > .tab-empty` // The tab where the "No Selected Tabs" message is displayed
const SELECTOR_TAB_LOADING = `${SELECTOR_TAB_CONTENT} > .tab-loading` // The loading tab for the plugin if the loading screen is enabled
const SELECTOR_TAB_PANE = `${SELECTOR_TAB_CONTENT} > .tab-pane` // The tab panes for the plugin iframe

const SELECTOR_SIDEBAR_MENU_ITEM = `${SELECTOR_SIDEBAR} .nav-item > a.nav-link:not([href="#"]):not([href^="javascript:"]):not([${DATA_PREFIX}toggle="iframe-close"]):not([${DATA_PREFIX}toggle="iframe-fullscreen"]):not([${DATA_PREFIX}toggle="iframe-scrollleft"]):not([${DATA_PREFIX}toggle="iframe-scrollright"]):not([${DATA_PREFIX}disable="iframe"])`
const SELECTOR_HEADER_MENU_ITEM = `${SELECTOR_HEADER} .nav-item a.nav-link:not([href="#"]):not([href^="javascript:"]):not([${DATA_PREFIX}toggle="iframe-close"]):not([${DATA_PREFIX}toggle="iframe-fullscreen"]):not([${DATA_PREFIX}toggle="iframe-scrollleft"]):not([${DATA_PREFIX}toggle="iframe-scrollright"]):not([${DATA_PREFIX}disable="iframe"])`

const CLASS_NAME_FULLSCREEN_MODE = `${CLASS_NAME_IFRAME_MODE}-fullscreen`

type IFrameConfig = {
  onTabClick: (item: HTMLElement) => HTMLElement;
  onTabChanged: (item: HTMLElement) => HTMLElement;
  onTabCreated: (item: HTMLElement) => HTMLElement;
  autoIframeMode: boolean;
  autoItemActive: boolean;
  autoShowNewTab: boolean;
  autoDarkMode: boolean;
  allowDuplicates: boolean;
  allowReload: boolean;
  loadingScreen: boolean | number | undefined;
  useNavbarItems: boolean;
  scrollOffset: number;
  scrollBehaviorSwap: boolean;
  iconMaximize: string;
  iconMinimize: string;
  headerActiveClass: string;
}

const Default: IFrameConfig = {
  onTabClick: (item: HTMLElement) => item,
  onTabChanged: (item: HTMLElement) => item,
  onTabCreated: (item: HTMLElement) => item,
  autoIframeMode: true,
  autoItemActive: true,
  autoShowNewTab: true,
  autoDarkMode: false,
  allowDuplicates: false,
  allowReload: true,
  loadingScreen: true,
  useNavbarItems: true,
  scrollOffset: 40,
  scrollBehaviorSwap: false,
  iconMaximize: 'bi bi-fullscreen',
  iconMinimize: 'bi bi-fullscreen-exit',
  headerActiveClass: 'bg-secondary bg-gradient text-white'
}

class IFrameEngine {
  readonly _config: IFrameConfig

  constructor(config: Partial<IFrameConfig>) {
    this._config = { ...Default, ...config }
  }

  onTabClick(item: HTMLElement) {
    this._config.onTabClick(item)
  }

  onTabChanged(item: HTMLElement) {
    this._config.onTabChanged(item)
  }

  onTabCreated(item: HTMLElement) {
    this._config.onTabCreated(item)
  }

  createTab(title: string, link: string, uniqueName: string, switchTab = true) {
    let tabId = `panel-${uniqueName}`
    let navId = `tab-${uniqueName}`

    if (this._config.allowDuplicates) {
      tabId += `-${Math.floor(Math.random() * 1000)}`
      navId += `-${Math.floor(Math.random() * 1000)}`
    }

    this._createTab(title, tabId, navId)

    const newTabItem: HTMLElement = document.createElement('div')
    newTabItem.classList.add('tab-pane', 'fade')
    newTabItem.id = tabId
    newTabItem.setAttribute('role', 'tabpanel')
    newTabItem.setAttribute('aria-labelledby', navId)

    document.querySelector(SELECTOR_TAB_CONTENT)!.append(newTabItem)

    const newIframe: HTMLIFrameElement = document.createElement('iframe')
    newIframe.addEventListener('load', () => {
      newIframe.setAttribute('aria-loaded', 'true')
      newIframe.contentWindow!.document.querySelector('body')!.classList.add(CLASS_NAME_IFRAME_MODE)
    })
    newTabItem.append(newIframe)

    if (switchTab) {
      this.switchTab(`#${navId}`)
    }

    newIframe.src = link
    this.onTabCreated(document.querySelector(`#${navId}`)!)
  }

  openTabSidebar(item: HTMLElement) {
    let element = item.cloneNode(true) as HTMLElement
    if (!element.getAttribute('href')) {
      element = item.parentElement!.cloneNode(true) as HTMLElement
    }

    element.querySelectorAll('.right, .search-path').forEach(el => {
      el.remove()
    })
    const title = element.querySelector('p') ? element.querySelector('p')!.textContent : element.textContent
    const link = element.getAttribute('href')
    if (link === '#' || !link) {
      return
    }

    const uniqueName = link.replace('./', '').replace(/["#&'./:=?[\]]/gi, '-').replace(/(--)/gi, '')
    const navId = `tab-${uniqueName}`

    if (!this._config.allowDuplicates && document.querySelector(`#${navId}`)) {
      this.switchTab(`#${navId}`, this._config.allowReload)
      return
    }

    if ((!this._config.allowDuplicates && !document.querySelector(`#${navId}`)) || this._config.allowDuplicates) {
      this.createTab(title ?? 'New Tab', link, uniqueName)
    }
  }

  switchTab(item: string | HTMLElement, reload = false) {
    const navLink: HTMLElement = typeof item === 'string' ? document.querySelector(item)! : item
    const tabId = navLink.getAttribute('aria-controls')!.replace('#', '')
    const tabPane = document.querySelector<HTMLElement>(`#${tabId}`)!

    if (!tabPane) {
      return
    }

    const iframe = tabPane.querySelector<HTMLIFrameElement>('iframe')!

    // Hide the empty tab if not hidden
    if (!document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.contains('d-none')) {
      document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.remove('active')
      document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.add('d-none')
    }

    // Hide all tabs
    document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.remove('active')
    document.querySelectorAll(SELECTOR_TAB_PANE).forEach(el => {
      el.classList.remove('active')
    })

    // Unselect all nav items
    document.querySelectorAll(SELECTOR_TAB_NAVBAR_NAV_LINK).forEach(el => {
      el.classList.remove('active')
      this._config.headerActiveClass.split(' ').forEach(className => {
        el.classList.remove(className)
      })
    })

    // Show the selected tab
    tabPane.classList.add('active', 'show')
    navLink.setAttribute('aria-selected', 'true')
    navLink.classList.add('active')
    this._config.headerActiveClass.split(' ').forEach(className => {
      navLink.classList.add(className)
    })

    // purge all SELECTOR_DATA_TOGGLE_CLOSE of being active and get the current one to be active
    document.querySelectorAll(SELECTOR_DATA_CLOSE).forEach(el => {
      el.classList.remove('active')
    })
    // we might not have a close button, so we need to check if it exists
    if (navLink.querySelector(SELECTOR_DATA_CLOSE)) {
      navLink.querySelector(SELECTOR_DATA_CLOSE)!.classList.add('active')
    }

    // ok lets check if the iframe is loading or not. If it is loading, we will show the loading screen. If it is already loaded, we will check to see if the reloading or not
    if (iframe.getAttribute('aria-loaded') === 'true') {
      if (reload) {
        iframe.setAttribute('aria-loaded', 'false')
        this._showLoadingScreen(iframe)
        iframe.contentWindow!.location.reload()
      }
    } else {
      this._showLoadingScreen(iframe)
    }

    this.onTabChanged(navLink)
  }

  removeActiveTab(type: string, element?: HTMLElement) {
    switch (type) {
      case 'all': {
        document.querySelectorAll(SELECTOR_TAB_NAVBAR_NAV_LINK).forEach(el => () => {
          if (el.getAttribute(DATA_WIDGET)! !== 'iframe-page-content') {
            el.remove()

            const tabId = el.getAttribute('aria-controls')!.replace('#', '')
            const tabPane = document.querySelector<HTMLElement>(`#${tabId}`)!
            tabPane.remove()
          }
        })

        document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.remove('d-none')
        document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.add('show')

        break
      }

      case 'all-other': {
        document.querySelectorAll(`${SELECTOR_TAB_NAVBAR_NAV_LINK}:not(.active)`).forEach(el => () => {
          if (el.getAttribute('data-bs-target') !== element!.getAttribute('data-bs-target') &&
            el.getAttribute(DATA_WIDGET)! !== 'iframe-page-content') {
            el.remove()

            const tabId = el.getAttribute('aria-controls')!.replace('#', '')
            const tabPane = document.querySelector<HTMLElement>(`#${tabId}`)!
            tabPane.remove()
          }
        })

        if (!document.querySelectorAll(SELECTOR_TAB_NAVBAR_NAV_LINK).length) {
          document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.remove('d-none')
          document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.add('show')
        }

        break
      }

      case 'only-this': {
        const tabId = element!.getAttribute('aria-controls')!.replace('#', '')
        const tabPane = document.querySelector<HTMLElement>(`#${tabId}`)!
        element!.remove()
        tabPane.remove()

        if (document.querySelectorAll(SELECTOR_TAB_NAVBAR_NAV_LINK).length === 0) {
          this._switchToDefaultTab()
        } else {
          const activeTab: HTMLElement = document.querySelector(SELECTOR_TAB_NAVBAR_NAV_LINK)!
          this.switchTab(activeTab)
        }

        break
      }

      default: {
        break
      }
    }
  }

  toggleFullscreen() {
    document.body.classList.toggle(CLASS_NAME_FULLSCREEN_MODE)
    const iconElement = document.querySelector(SELECTOR_DATA_FULLSCREEN)!.querySelector('i')!
    this._config.iconMaximize.split(' ').forEach(className => {
      iconElement.classList.toggle(className)
    })
    this._config.iconMinimize.split(' ').forEach(className => {
      iconElement.classList.toggle(className)
    })
  }

  init() {
    if (document.body.classList.contains(CLASS_NAME_IFRAME_MODE)) {
      return
    }

    if (document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)! && document.querySelector<HTMLElement>(SELECTOR_TAB_LOADING)!) {
      document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.style.display = 'block'
      document.querySelector<HTMLElement>(SELECTOR_TAB_LOADING)!.style.display = 'none'
    }

    if (!document.querySelector(SELECTOR_CONTENT_WRAPPER)!.classList.contains(CLASS_NAME_IFRAME_MODE)) {
      return
    }

    document.querySelectorAll(SELECTOR_TAB_NAVBAR_NAV_LINK).forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault()
        this.onTabClick(e.currentTarget as HTMLElement)
        this.switchTab(e.currentTarget as HTMLElement)
      })
    })

    document.querySelectorAll(SELECTOR_DATA_CLOSE).forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault()
        this.removeActiveTab((e.currentTarget as HTMLElement).getAttribute('data-type')!, e.currentTarget as HTMLElement)
      })
    })

    document.querySelector(SELECTOR_DATA_FULLSCREEN)?.addEventListener('click', e => {
      e.preventDefault()
      this.toggleFullscreen()
    })

    document.querySelector(SELECTOR_DATA_SCROLL_LEFT)?.addEventListener('click', e => {
      e.preventDefault()
      const scrollValue = document.querySelector(SELECTOR_TAB_NAVBAR_NAV)!.scrollLeft
      document.querySelector(SELECTOR_TAB_NAVBAR_NAV)!.scrollLeft = this._config.scrollBehaviorSwap ? scrollValue + this._config.scrollOffset : scrollValue - this._config.scrollOffset
    })

    document.querySelector(SELECTOR_DATA_SCROLL_RIGHT)?.addEventListener('click', e => {
      e.preventDefault()
      const scrollValue = document.querySelector(SELECTOR_TAB_NAVBAR_NAV)!.scrollLeft
      document.querySelector(SELECTOR_TAB_NAVBAR_NAV)!.scrollLeft = this._config.scrollBehaviorSwap ? scrollValue - this._config.scrollOffset : scrollValue + this._config.scrollOffset
    })

    document.querySelectorAll<HTMLAnchorElement>(`${SELECTOR_SIDEBAR_MENU_ITEM}, ${SELECTOR_HEADER_MENU_ITEM}`).forEach(item => {
      console.log(item)
      this._buildClickEvent(item)
    })

    if (this._config.autoDarkMode) {
      const windowMatch = window.matchMedia('(prefers-color-scheme: dark)')
      this._toggleDarkMode(windowMatch)
      windowMatch.addEventListener('change', this._toggleDarkMode)
    }

    const handleMutations = (mutations: MutationRecord[]) => {
      mutations.forEach(mutation => {
        // Optional: Handle added or removed nodes
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLAnchorElement && node.hasAttribute(SELECTOR_DATA_TOGGLE)) {
              this._buildClickEvent(node)
            } else if (node instanceof HTMLElement) {
              if (node.hasAttribute(SELECTOR_DATA_TOGGLE)) {
                this._buildClickEvent(node as HTMLAnchorElement)
              }

              node.querySelectorAll(SELECTOR_DATA_TOGGLE).forEach(item => {
                this._buildClickEvent(item as HTMLAnchorElement)
              })
            }
          })
        }
      })
    }

    const mutationConfig: MutationObserverInit = {
      childList: true,
      subtree: true
    }

    new MutationObserver(handleMutations).observe(document.body, mutationConfig)
  }

  _buildClickEvent(item: HTMLAnchorElement) {
    if (item.hasAttribute(SELECTOR_DATA_DISABLED) || item.hasAttribute(SELECTOR_DATA_CLOSE) ||
      item.hasAttribute(SELECTOR_DATA_FULLSCREEN) || item.hasAttribute(SELECTOR_DATA_SCROLL_LEFT) ||
      // eslint-disable-next-line no-script-url
      item.hasAttribute(SELECTOR_DATA_SCROLL_RIGHT) || item.href === '#' || item.href.startsWith('javascript:')) {
      // eslint-enable-next-line no-script-url
      return
    }

    item.addEventListener('click', e => {
      e.preventDefault()
      const anchor = e.currentTarget as HTMLAnchorElement
      if (anchor.hasAttribute(SELECTOR_DATA_DISABLED) || anchor.hasAttribute(SELECTOR_DATA_CLOSE) ||
      anchor.hasAttribute(SELECTOR_DATA_FULLSCREEN) || anchor.hasAttribute(SELECTOR_DATA_SCROLL_LEFT) ||
        // eslint-disable-next-line no-script-url
        anchor.hasAttribute(SELECTOR_DATA_SCROLL_RIGHT) || anchor.href === '#' || anchor.href.startsWith('javascript:')) {
        // eslint-enable-next-line no-script-url
        return
      }

      this.openTabSidebar(anchor)
    })
  }

  _toggleDarkMode(e: MediaQueryListEvent | MediaQueryList) {
    document.querySelectorAll(SELECTOR_TAB_CONTENT).forEach(item => {
      item.querySelectorAll('iframe').forEach(iframe => {
        iframe.contentWindow!.postMessage({ autoDarkMode: e.matches }, '*')
      })
    })
  }

  _switchToDefaultTab() {
    // If we have page content, we will switch to that tab, otherwise we show the empty tab
    if (document.querySelector(SELECTOR_DATA_PAGE_CONTENT)) {
      this.switchTab(document.querySelector<HTMLElement>(SELECTOR_DATA_PAGE_CONTENT)!)
    } else {
      document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.add('active')
      document.querySelector<HTMLElement>(SELECTOR_TAB_EMPTY)!.classList.remove('d-none')
    }
  }

  _showLoadingScreen(iframe: HTMLIFrameElement) {
    if (!this._config.loadingScreen) {
      return
    }

    const loadingScreen = document.querySelector<HTMLElement>(SELECTOR_TAB_LOADING)!
    slideToggle(loadingScreen, 500)
    iframe.addEventListener('load', () => {
      iframe.setAttribute('aria-loaded', 'true')
      slideToggle(loadingScreen, 500)
      iframe.contentWindow!.document.querySelector('body')!.classList.add(CLASS_NAME_IFRAME_MODE)
    })
  }

  _createTab(title: string, tabId: string, navId: string) {
    const closeLink: HTMLElement = document.createElement('i')
    const navLink: HTMLElement = document.createElement('button')

    navLink.classList.add('nav-link')
    navLink.setAttribute('data-bs-toogle', 'tab')
    navLink.setAttribute('data-bs-target', `#${tabId}`)
    navLink.id = navId
    navLink.setAttribute('role', 'tab')
    navLink.setAttribute('aria-controls', tabId)
    navLink.setAttribute('aria-selected', 'false')
    navLink.addEventListener('click', e => {
      e.preventDefault()
      this.onTabClick(e.currentTarget as HTMLElement)
      this.switchTab(e.currentTarget as HTMLElement)
    })
    navLink.textContent = title

    closeLink.classList.add('btn-iframe-close')
    CLOSE_ICON.split(' ').forEach(className => {
      closeLink.classList.add(className)
    })
    closeLink.setAttribute(DATA_WIDGET, 'iframe-close')
    closeLink.addEventListener('click', e => {
      e.preventDefault()
      this.removeActiveTab('only-this', navLink)
    })
    navLink.append(closeLink)

    document.querySelector(SELECTOR_TAB_NAVBAR_NAV)!.append(navLink)
  }
}

// check if
export { IFrameEngine, Default as iFrameDefaultConfig }
