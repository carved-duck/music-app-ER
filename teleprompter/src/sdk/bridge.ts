import {
  EvenAppBridge,
  waitForEvenAppBridge,
  type EvenHubEvent,
  type DeviceStatus,
} from '@evenrealities/even_hub_sdk'

/** Thin singleton wrapper — ensures one bridge instance across the app */
class Bridge {
  private static inst: Bridge | null = null
  private bridge: EvenAppBridge | null = null

  private constructor() {}

  static getInstance(): Bridge {
    if (!Bridge.inst) Bridge.inst = new Bridge()
    return Bridge.inst
  }

  async init(): Promise<EvenAppBridge> {
    if (this.bridge) return this.bridge
    this.bridge = await waitForEvenAppBridge()
    console.log('[SDK] Bridge initialized')
    return this.bridge
  }

  get sdk(): EvenAppBridge {
    if (!this.bridge) throw new Error('Bridge not initialized — call init() first')
    return this.bridge
  }

  get ready(): boolean {
    return this.bridge !== null
  }

  onEvent(cb: (e: EvenHubEvent) => void): () => void {
    return this.sdk.onEvenHubEvent(cb)
  }

  onDeviceStatus(cb: (s: DeviceStatus) => void): () => void {
    return this.sdk.onDeviceStatusChanged(cb)
  }
}

export const bridge = Bridge.getInstance()
