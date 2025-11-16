package com.strack

import android.app.*
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.neovisionaries.ws.client.WebSocket
import com.neovisionaries.ws.client.WebSocketAdapter
import com.neovisionaries.ws.client.WebSocketFactory
import java.util.concurrent.Executors
import org.json.JSONObject

class LocationTaskService : Service() {
    private val executor = Executors.newSingleThreadExecutor()
    private var isRunning = false
    private var shouldReconnect = true
    private val TAG = "LocationTaskService"
    private val CHANNEL_ID = "LocationTaskServiceChannel"
    private val NOTIFICATION_ID = 2
    private var locationManager: LocationManager? = null
    private var locationListener: LocationListener? = null
    private var ws: WebSocket? = null
    private var wsBaseUrl: String? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        // Запускаем foreground service с правильным типом для Android 14+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                    NOTIFICATION_ID,
                    createNotification(),
                    android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            )
        } else {
            startForeground(NOTIFICATION_ID, createNotification())
        }

        Log.d(TAG, "Foreground service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Service started")

        // Получаем токен из Intent (если передан)
        val tokenFromIntent = intent?.getStringExtra("JWT_TOKEN")
        if (tokenFromIntent != null) {
            Log.d(TAG, "Token received from Intent")
        }

        // Получаем WebSocket URL из Intent (если передан)
        val wsUrlFromIntent = intent?.getStringExtra("WS_URL")
        if (wsUrlFromIntent != null) {
            Log.d(TAG, "WebSocket URL received from Intent: $wsUrlFromIntent")
        }

        if (!isRunning) {
            isRunning = true
            shouldReconnect = true
            startTask(tokenFromIntent, wsUrlFromIntent)
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        shouldReconnect = false // Запрещаем переподключение при остановке сервиса

        // Закрываем WebSocket соединение
        try {
            ws?.disconnect()
            ws = null
            Log.d(TAG, "WebSocket disconnected")
        } catch (e: Exception) {
            Log.e(TAG, "Error disconnecting WebSocket", e)
        }

        // Отменяем подписку на обновления геолокации
        try {
            locationListener?.let { listener -> locationManager?.removeUpdates(listener) }
            locationListener = null
            locationManager = null
            Log.d(TAG, "Location updates removed")
        } catch (e: Exception) {
            Log.e(TAG, "Error removing location updates", e)
        }

        // Останавливаем foreground service и удаляем уведомление
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                stopForeground(STOP_FOREGROUND_REMOVE)
            } else {
                @Suppress("DEPRECATION") stopForeground(true)
            }
            Log.d(TAG, "Foreground service stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping foreground service", e)
        }

        // Закрываем executor
        try {
            executor.shutdown()
            Log.d(TAG, "Executor shutdown")
        } catch (e: Exception) {
            Log.e(TAG, "Error shutting down executor", e)
        }

        Log.d(TAG, "Service destroyed")
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel =
                    NotificationChannel(
                                    CHANNEL_ID,
                                    "Location Task Service",
                                    NotificationManager.IMPORTANCE_LOW
                            )
                            .apply { description = "Сервис для выполнения фоновых задач" }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent =
                PendingIntent.getActivity(
                        this,
                        0,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

        return NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Отслеживание геолокации")
                .setContentText("Сервис активен")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build()
    }

    private fun createWebSocketListener(): WebSocketAdapter {
        return object : WebSocketAdapter() {
            override fun onConnected(ws: WebSocket, headers: Map<String, List<String>>) {
                Log.d(TAG, "WebSocket connected")
            }

            override fun onDisconnected(
                    ws: WebSocket,
                    serverCloseFrame: com.neovisionaries.ws.client.WebSocketFrame?,
                    clientCloseFrame: com.neovisionaries.ws.client.WebSocketFrame?,
                    closedByServer: Boolean
            ) {
                Log.w(TAG, "WebSocket disconnected. Closed by server: $closedByServer")
                this@LocationTaskService.ws = null
            }

            override fun onError(
                    ws: WebSocket,
                    cause: com.neovisionaries.ws.client.WebSocketException
            ) {
                Log.e(TAG, "WebSocket error", cause)
            }
        }
    }

    private fun connectWebSocket(token: String?): Boolean {
        if (token == null) {
            Log.w(TAG, "Token is null, cannot connect WebSocket")
            return false
        }

        if (wsBaseUrl == null) {
            Log.w(TAG, "WebSocket base URL is null, cannot connect WebSocket")
            return false
        }

        return try {
            val wsFactory = WebSocketFactory()
            val wsUrl = "$wsBaseUrl/send?jwt=$token"
            ws = wsFactory.createSocket(wsUrl)
            ws?.addListener(createWebSocketListener())
            ws?.connectAsynchronously()
            Log.d(TAG, "Connecting to WebSocket with token: $token, URL: $wsUrl")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error connecting WebSocket", e)
            ws = null
            false
        }
    }

    private fun startTask(tokenFromIntent: String? = null, wsUrlFromIntent: String? = null) {
        executor.execute {
            try {
                // Сохраняем WebSocket URL
                wsBaseUrl = wsUrlFromIntent
                if (wsBaseUrl == null) {
                    Log.e(TAG, "WebSocket URL is null, cannot start task")
                    return@execute
                }

                val token = tokenFromIntent
                connectWebSocket(token)

                locationManager =
                        applicationContext.getSystemService(Context.LOCATION_SERVICE) as
                                LocationManager

                // Создаем LocationListener для обработки обновлений геолокации
                locationListener =
                        object : LocationListener {
                            override fun onLocationChanged(location: Location) {
                                // Вызывается при получении нового местоположения
                                val timestamp = System.currentTimeMillis()

                                // Создаем JSON объект
                                val locationData =
                                        JSONObject().apply {
                                            put("latitude", location.latitude)
                                            put("longitude", location.longitude)
                                            put("timestamp", timestamp)
                                        }

                                // Отправляем через WebSocket с обработкой ошибок
                                try {
                                    val currentWs = ws
                                    if (currentWs != null && currentWs.isOpen) {
                                        currentWs.sendText(locationData.toString())
                                        Log.d(
                                                TAG,
                                                "Геолокация обновлена: " +
                                                        "широта=${location.latitude}, " +
                                                        "долгота=${location.longitude}, " +
                                                        "точность=${location.accuracy}м, " +
                                                        "высота=${location.altitude}м, " +
                                                        "скорость=${location.speed}м/с, " +
                                                        "время=$timestamp"
                                        )
                                    } else {
                                        Log.w(
                                                TAG,
                                                "WebSocket не подключен, пропускаем отправку локации"
                                        )
                                    }
                                } catch (e: Exception) {
                                    Log.e(TAG, "Ошибка при отправке локации через WebSocket", e)
                                    // Сбрасываем WebSocket при ошибке для переподключения
                                    ws = null
                                }
                            }

                            override fun onProviderEnabled(provider: String) {
                                Log.d(TAG, "Location provider enabled: $provider")
                            }

                            override fun onProviderDisabled(provider: String) {
                                Log.d(TAG, "Location provider disabled: $provider")
                            }

                            @Deprecated("Deprecated in Java")
                            override fun onStatusChanged(
                                    provider: String?,
                                    status: Int,
                                    extras: android.os.Bundle?
                            ) {
                                Log.d(
                                        TAG,
                                        "Location status changed: provider=$provider, status=$status"
                                )
                            }
                        }

                // Запрашиваем обновления геолокации
                locationListener?.let { listener ->
                    val looper = Looper.getMainLooper()

                    // Используем только GPS_PROVIDER для избежания дубликатов
                    // Если GPS недоступен, используем NETWORK_PROVIDER как fallback
                    val provider =
                            if (locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) ==
                                            true
                            ) {
                                LocationManager.GPS_PROVIDER
                            } else if (locationManager?.isProviderEnabled(
                                            LocationManager.NETWORK_PROVIDER
                                    ) == true
                            ) {
                                LocationManager.NETWORK_PROVIDER
                            } else {
                                null
                            }

                    provider?.let { selectedProvider ->
                        locationManager?.requestLocationUpdates(
                                selectedProvider,
                                30000L,
                                1f,
                                listener,
                                looper
                        )
                    }
                            ?: Log.w(TAG, "Нет доступных провайдеров геолокации")
                }

                // Сервис будет работать до тех пор, пока не будет остановлен
                while (isRunning) {
                    Thread.sleep(5000) // Проверяем флаг каждые 5 секунд

                    // Проверяем состояние WebSocket и переподключаемся при необходимости
                    if (shouldReconnect) {
                        val currentWs = ws
                        if (currentWs == null || !currentWs.isOpen) {
                            Log.w(TAG, "WebSocket не подключен, пытаемся переподключиться...")
                            connectWebSocket(token)
                        }
                    }
                }

                Log.d(TAG, "Task completed")
            } catch (e: Exception) {
                Log.e(TAG, "Error in background task", e)
                stopSelf()
            }
        }
    }
}
