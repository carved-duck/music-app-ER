package com.fzfstudio.eh.innovel.views

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.fzfstudio.eh.innovel.sdk.DeviceConnectType
import com.fzfstudio.eh.innovel.sdk.DeviceInfo
import com.fzfstudio.eh.innovel.sdk.DeviceStatus

/**
 * 设备信息卡片组件。
 * 用于显示设备的连接状态和基本信息。
 *
 * @param modifier 修饰符
 * @param deviceInfo 设备基本信息
 * @param deviceStatus 设备实时状态
 */
@Composable
fun DeviceInfoCard(
    modifier: Modifier = Modifier,
    deviceInfo: DeviceInfo?,
    deviceStatus: DeviceStatus?,
) {
    val statusColor = statusColor(deviceStatus?.connectType ?: DeviceConnectType.None)
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = statusColor
        )
    ) {
        if (deviceInfo == null) {
            PlaceholderCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(128.dp),
                text = "无设备"
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(78.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "G2",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

/**
 * 根据设备连接类型获取对应的状态颜色。
 *
 * @param connectType 设备连接类型
 * @return 对应的状态颜色
 */
@Composable
private fun statusColor(connectType: DeviceConnectType): Color {
    return when (connectType) {
        DeviceConnectType.Connected -> Color(0xFF34C759)
        DeviceConnectType.Disconnected -> Color(0xFFFF9500)
        DeviceConnectType.Connecting -> Color(0xFFFFCC00)
        DeviceConnectType.ConnectionFailed -> Color(0xFFFF3B30)
        DeviceConnectType.None -> MaterialTheme.colorScheme.outline
    }
}
