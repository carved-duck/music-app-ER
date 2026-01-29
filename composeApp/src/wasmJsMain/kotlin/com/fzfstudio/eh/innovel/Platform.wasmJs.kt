@file:OptIn(ExperimentalWasmJsInterop::class)

package com.fzfstudio.eh.innovel

import kotlin.js.ExperimentalWasmJsInterop

class WasmPlatform : Platform {
    override val name: String = "Web with Kotlin/Wasm"
}

actual fun getPlatform(): Platform = WasmPlatform()

// 使用 JS 互操作获取当前时间
@JsFun("() => Date.now()")
private external fun jsDateNow(): Double

actual fun currentTimeMs(): Double = jsDateNow()