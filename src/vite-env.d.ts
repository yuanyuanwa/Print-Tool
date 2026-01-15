/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'print-js' {
  interface PrintJSOptions {
    printable: any
    type?: 'pdf' | 'html' | 'image' | 'json' | 'raw-html'
    header?: string
    headerStyle?: string
    maxWidth?: number
    font?: string
    font_size?: string
    properties?: { field: string; displayName: string }[]
    gridStyle?: string
    gridHeaderStyle?: string
    documentTitle?: string
    targetStyles?: string[]
    ignoreElements?: string[]
    scanStyles?: boolean
    css?: string | string[]
    style?: string
    onLoadingStart?: () => void
    onLoadingEnd?: () => void
    onPrintDialogClose?: () => void
    onError?: (error: Error) => void
    base64?: boolean
    modalMessage?: string
    showModal?: boolean
  }
  
  function printJS(options: PrintJSOptions): void
  function printJS(printable: string, type?: 'pdf' | 'html' | 'image' | 'json'): void
  
  export default printJS
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
