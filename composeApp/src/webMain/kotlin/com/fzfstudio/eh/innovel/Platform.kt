package com.fzfstudio.eh.innovel

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform

/**
 * 获取当前时间戳（毫秒），用于性能追踪
 */
expect fun currentTimeMs(): Double