// 蓝牙配网配置（简化版 - 只需SSID和密码）
export const BLUETOOTH_CONFIG = {
    // 服务UUID
    SERVICE_UUID: '0000FF00-0000-1000-8000-00805F9B34FB',
    
    // 特征值UUID（简化：只保留SSID和密码）
    CHAR_SSID: '0000FF05-0000-1000-8000-00805F9B34FB',      // WiFi SSID（Write）
    CHAR_PASS: '0000FF06-0000-1000-8000-00805F9B34FB',      // WiFi密码（Write）
    
    // 超时配置（毫秒）
    SCAN_TIMEOUT: 30000,        // 蓝牙扫描超时30秒
    CONNECT_TIMEOUT: 15000,     // BLE连接超时15秒
    CONFIG_TIMEOUT: 30000,      // 配网超时30秒（设备验证WiFi）
    REBOOT_WAIT: 15000,         // 等待设备重启15秒
    ONLINE_CHECK_TIMEOUT: 40000 // 上线检查40秒
}
