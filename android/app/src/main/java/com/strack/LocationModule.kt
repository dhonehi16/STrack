package com.strack

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LocationModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "LocationModule"
        private const val MODULE_NAME = "LocationModule"
    }

    // Имя модуля, которое будет использоваться в JavaScript
    override fun getName(): String {
        return MODULE_NAME
    }

    // Асинхронный метод с Foreground Service (работает в фоне)
    @ReactMethod
    fun startSendingLocation(token: String?, wsUrl: String?, promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, LocationTaskService::class.java)

            // Передаем токен через Intent
            if (token != null) {
                intent.putExtra("JWT_TOKEN", token)
                Log.d(TAG, "Token passed to service via Intent")
            } else {
                Log.w(TAG, "No token provided to service")
            }

            // Передаем WebSocket URL через Intent
            if (wsUrl != null) {
                intent.putExtra("WS_URL", wsUrl)
                Log.d(TAG, "WebSocket URL passed to service via Intent: $wsUrl")
            } else {
                Log.w(TAG, "No WebSocket URL provided to service")
            }

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }

            Log.d(TAG, "Foreground service started for sendLocation")
            promise.resolve("Location module service started")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting location task service", e)
            promise.reject("ERROR", "Failed to start service: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stopSendingLocation(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, LocationTaskService::class.java)
            val stopped = reactApplicationContext.stopService(intent)

            if (stopped) {
                Log.d(TAG, "LocationTaskService stopped successfully")
                promise.resolve(true)
            } else {
                Log.w(TAG, "LocationTaskService was not running or could not be stopped")
                promise.resolve(false)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping location task service", e)
            promise.reject("ERROR", "Failed to stop service: ${e.message}", e)
        }
    }

    @ReactMethod
    fun checkIsStartedLocationTaskService(promise: Promise) {
        try {
            val activityManager =
                    reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as
                            ActivityManager
            val runningServices = activityManager.getRunningServices(Integer.MAX_VALUE)

            val isRunning =
                    runningServices.any { serviceInfo ->
                        serviceInfo.service.className == LocationTaskService::class.java.name
                    }

            promise.resolve(isRunning)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking service status", e)
            promise.reject("ERROR", "Failed to check service status: ${e.message}", e)
        }
    }
}
