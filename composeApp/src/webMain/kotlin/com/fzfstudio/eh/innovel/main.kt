package com.fzfstudio.eh.innovel

import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.ComposeViewport

@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    //  初始化主页
    ComposeViewport {
        App()
    }
}