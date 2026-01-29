@file:OptIn(ExperimentalWasmJsInterop::class)

package com.fzfstudio.eh.innovel

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.fzfstudio.eh.innovel.models.AppState
import com.fzfstudio.eh.innovel.theme.InNovelTheme
import com.fzfstudio.eh.innovel.views.AppScreen
import kotlin.js.ExperimentalWasmJsInterop

@Composable
fun App() {
    InNovelTheme {
        // 应用状态
        val appState = remember { AppState() }
        // UI 状态
        val uiState = appState.uiState
        // 协程作用域，用于调用 suspend 函数
        val coroutineScope = rememberCoroutineScope()
        // 初始化桥接并获取数据
        // 注意：设备状态监听和 EvenHubEvent 监听已在 AppState.initialize() 中设置
        LaunchedEffect(Unit) {
            appState.initialize()
        }
        //
        Column(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.background)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            if (!uiState.isBridgeReady) {
                Text(
                    text = "Initializing bridge...",
                    style = MaterialTheme.typography.bodyMedium
                )
            } else {
                AppScreen(
                    uiState = uiState,
                    onStartReading = { book ->
                        // 在协程作用域中调用 suspend 函数
                        coroutineScope.launch {
                            appState.startReadingBook(book)
                        }
                    },
                    onExitReading = {
                        // 在协程作用域中调用 suspend 函数
                        coroutineScope.launch {
                            appState.exitReading()
                        }
                    }
                )
            }
        }
    }
}

expect fun formatJsObject(obj: Any?): String