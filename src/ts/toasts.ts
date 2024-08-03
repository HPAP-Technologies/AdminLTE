// Import the necessary Bootstrap types
import { Toast as BootstrapToast } from 'bootstrap'
import {
  onDOMContentLoaded
} from './util/index'

// Constants
const TOASTS_CONTAINER_SELECTOR = 'body'

// Enum definitions for containers and class names
enum ToastContainer {
  TopLeft = '#toastsContainerTopLeft',
  TopMiddle = '#toastsContainerTopMiddle',
  TopRight = '#toastsContainerTopRight',
  BottomLeft = '#toastsContainerBottomLeft',
  BottomMiddle = '#toastsContainerBottomMiddle',
  BottomRight = '#toastsContainerBottomRight'
}

enum ToastClassName {
  TopRight = 'toasts-top-right',
  TopMiddle = 'toasts-top-middle',
  TopLeft = 'toasts-top-left',
  BottomRight = 'toasts-bottom-right',
  BottomMiddle = 'toasts-bottom-middle',
  BottomLeft = 'toasts-bottom-left'
}

enum ToastPosition {
  TopRight = 'topRight',
  TopMiddle = 'topMiddle',
  TopLeft = 'topLeft',
  Center = 'center',
  BottomRight = 'bottomRight',
  BottomMiddle = 'bottomMiddle',
  BottomLeft = 'bottomLeft',
  Absolute = 'absolute'
}

type ToastConfig = {
  message: string;
  title?: string | undefined;
  smallTitle?: string | undefined;
  icon?: string | undefined;
  iconColor?: string | undefined;
  showCloseButton?: boolean | undefined;
  autohide?: boolean | undefined;
  autoRemove?: boolean | undefined;
  delay?: number | undefined;
  position: ToastPosition | HTMLElement;
  top?: string | undefined;
  right?: string | undefined;
  bottom?: string | undefined;
  left?: string | undefined;
  transform?: string | undefined;
  width?: string | undefined;
  height?: string | undefined;
  className: string;
  onHide?: () => void;
  onHidden?: () => void;
  onShow?: () => void;
  onShown?: () => void;
}

// Default configuration for the Toast
const defaultConfig: ToastConfig = {
  message: '',
  showCloseButton: true,
  icon: 'bi bi-info-circle',
  autohide: false,
  autoRemove: true,
  delay: 5000,
  position: ToastPosition.TopRight,
  className: ''
}

let toastsInitialized = false

class Toasts {
  public static init() {
    if (toastsInitialized) {
      return
    }

    this.createToastContainers()
    // Now lets initialize the page's toasts
    const toastElements = document.querySelectorAll<HTMLElement>('.toast')
    toastElements.forEach(toastElement => {
      BootstrapToast.getOrCreateInstance(toastElement)
    })

    toastsInitialized = true
  }

  public static createToast(message: string, title?: string): void
  public static createToast(config: ToastConfig): void
  public static createToast(param1: string | ToastConfig, param2?: string): void {
    const config: ToastConfig = typeof param1 === 'string' ?
      { ...defaultConfig, message: param1, title: param2 } :
      { ...defaultConfig, ...param1 }

    console.log(config)

    const toastElement = document.createElement('div')
    toastElement.classList.add('toast', 'fade', 'm-2')

    if (config.className) {
      config.className.split(' ').forEach(className => {
        toastElement.classList.add(className)
      })
    }

    toastElement.setAttribute('role', 'alert')
    toastElement.setAttribute('aria-live', 'assertive')
    toastElement.setAttribute('aria-atomic', 'true')

    if (config.width) {
      toastElement.style.width = config.width
    }

    if (config.height) {
      toastElement.style.height = config.height
    }

    const toastHeader = document.createElement('div')
    toastHeader.classList.add('toast-header')
    if (config.icon) {
      const iconElement = document.createElement('i')
      iconElement.classList.add('me-2')
      config.icon.split(' ').forEach(iconClass => {
        iconElement.classList.add(iconClass)
      })
      if (config.iconColor) {
        // if the iconColor is a valid color or rgb, set it to the style. if not add it as a class. Prefer `RegExp#test(...)` over `String#match(...)`
        if (/^#([\dA-Fa-f]{6}|[\dA-Fa-f]{3})$/.test(config.iconColor) || /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/.test(config.iconColor)) {
          iconElement.style.color = config.iconColor
        } else {
          config.iconColor.split(' ').forEach(colorClass => {
            iconElement.classList.add(colorClass)
          })
        }
      }

      toastHeader.append(iconElement)
    }

    if (config.title) {
      const strongElement = document.createElement('strong')
      strongElement.classList.add('me-auto')
      strongElement.textContent = config.title
      toastHeader.append(strongElement)
    }

    if (config.smallTitle) {
      const smallElement = document.createElement('small')
      smallElement.textContent = config.smallTitle

      if (!config.title) {
        const blankTitle = document.createElement('strong')
        blankTitle.classList.add('me-auto')
        toastHeader.append(blankTitle)
      }

      toastHeader.append(smallElement)
    }

    if (config.showCloseButton) {
      const buttonElement = document.createElement('button')
      buttonElement.setAttribute('type', 'button')
      buttonElement.classList.add('btn-close')
      buttonElement.setAttribute('data-bs-dismiss', 'toast')
      buttonElement.setAttribute('aria-label', 'Close')

      if (!config.title && !config.smallTitle) {
        const blankTitle = document.createElement('strong')
        blankTitle.classList.add('me-auto')
        toastHeader.append(blankTitle)
      }

      toastHeader.append(buttonElement)
    }

    toastElement.append(toastHeader)

    const toastBody = document.createElement('div')
    toastBody.classList.add('toast-body')
    toastBody.textContent = config.message
    toastElement.append(toastBody)

    let toastContainer: HTMLElement | undefined
    if (config.position instanceof HTMLElement) {
      toastContainer = config.position
    } else {
      switch (config.position) {
        case ToastPosition.TopLeft: {
          toastContainer = document.querySelector<HTMLElement>(ToastContainer.TopLeft) ?? undefined
          break
        }

        case ToastPosition.TopMiddle: {
          toastContainer = document.querySelector<HTMLElement>(ToastContainer.TopMiddle) ?? undefined
          break
        }

        case ToastPosition.TopRight: {
          toastContainer = document.querySelector<HTMLElement>(ToastContainer.TopRight) ?? undefined
          break
        }

        case ToastPosition.BottomLeft: {
          toastContainer = document.querySelector<HTMLElement>(ToastContainer.BottomLeft) ?? undefined
          break
        }

        case ToastPosition.BottomMiddle: {
          toastContainer = document.querySelector<HTMLElement>(ToastContainer.BottomMiddle) ?? undefined
          break
        }

        case ToastPosition.BottomRight: {
          toastContainer = document.querySelector<HTMLElement>(ToastContainer.BottomRight) ?? undefined
          break
        }

        case ToastPosition.Absolute: {
          toastElement.style.position = 'absolute'

          if (config.top) {
            toastElement.style.top = config.top
          }

          if (config.right) {
            toastElement.style.right = config.right
          }

          if (config.bottom) {
            toastElement.style.bottom = config.bottom
          }

          if (config.left) {
            toastElement.style.left = config.left
          }

          if (config.transform) {
            toastElement.style.transform = config.transform
          }

          toastContainer = document.querySelector<HTMLElement>(TOASTS_CONTAINER_SELECTOR) ?? undefined
          break
        }

        case ToastPosition.Center: {
          toastElement.classList.add('position-fixed', 'top-50', 'start-50', 'translate-middle')
          toastContainer = document.querySelector<HTMLElement>(TOASTS_CONTAINER_SELECTOR) ?? undefined
          break
        }
      }
    }

    if (config.onHide) {
      toastElement.addEventListener('hide.bs.toast', config.onHide)
    }

    if (config.onHidden) {
      toastElement.addEventListener('hidden.bs.toast', config.onHidden)
    }

    if (config.onShow) {
      toastElement.addEventListener('show.bs.toast', config.onShow)
    }

    if (config.onShown) {
      toastElement.addEventListener('shown.bs.toast', config.onShown)
    }

    toastContainer?.append(toastElement)

    const toast = new BootstrapToast(toastElement, {
      autohide: config.autohide,
      delay: config.delay
    })

    if (config.autoRemove) {
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove()
      })
    }

    toast.show()
  }

  private static createToastContainers() {
    Object.values(ToastContainer).forEach(id => {
      if (!document.querySelector(id)) {
        const container = document.createElement('div')
        container.id = id.slice(1)
        switch (id) {
          case ToastContainer.TopLeft: {
            container.classList.add(ToastClassName.TopLeft)
            break
          }

          case ToastContainer.TopMiddle: {
            container.classList.add(ToastClassName.TopMiddle)
            break
          }

          case ToastContainer.TopRight: {
            container.classList.add(ToastClassName.TopRight)
            break
          }

          case ToastContainer.BottomLeft: {
            container.classList.add(ToastClassName.BottomLeft)
            break
          }

          case ToastContainer.BottomMiddle: {
            container.classList.add(ToastClassName.BottomMiddle)
            break
          }

          case ToastContainer.BottomRight: {
            container.classList.add(ToastClassName.BottomRight)
            break
          }
        }

        document.querySelector(TOASTS_CONTAINER_SELECTOR)?.append(container)
      }
    })
  }

  public _init = false
}

onDOMContentLoaded(() => {
  Toasts.init()
})

export default Toasts
