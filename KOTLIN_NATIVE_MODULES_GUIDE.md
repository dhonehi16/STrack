# Руководство по созданию нативных модулей на Kotlin для React Native

## Обзор

Нативные модули позволяют использовать функциональность Android (Kotlin/Java) в React Native приложении. В этом руководстве показано, как создать нативный модуль на Kotlin.

## Структура нативного модуля

Нативный модуль состоит из трех основных компонентов:

1. **Модуль (Module)** - класс, который наследуется от `ReactContextBaseJavaModule` и содержит методы, доступные из JavaScript
2. **Пакет (Package)** - класс, который реализует `ReactPackage` и регистрирует модуль
3. **Регистрация** - добавление пакета в `MainApplication`

## Шаг 1: Создание модуля

Создайте файл `YourModule.kt` в `android/app/src/main/java/com/strack/`:

```kotlin
package com.strack

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.util.Log

class YourModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val TAG = "YourModule"

    // Имя модуля, которое будет использоваться в JavaScript
    override fun getName(): String {
        return "YourModule"
    }

    // Синхронный метод (не рекомендуется для долгих операций)
    @ReactMethod
    fun simpleMethod(message: String) {
        Log.d(TAG, "Received message: $message")
    }

    // Асинхронный метод с Promise
    @ReactMethod
    fun asyncMethod(input: String, promise: Promise) {
        try {
            // Выполняем какую-то работу
            val result = "Processed: $input"
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error in asyncMethod", e)
            promise.reject("ERROR", "Failed to process: ${e.message}", e)
        }
    }

    // Метод с параметрами разных типов
    @ReactMethod
    fun methodWithParams(
        stringParam: String,
        numberParam: Double,
        boolParam: Boolean,
        promise: Promise
    ) {
        try {
            val result = mapOf(
                "string" to stringParam,
                "number" to numberParam,
                "bool" to boolParam
            )
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
}
```

### Типы данных

React Native поддерживает следующие типы данных между JavaScript и Kotlin:

- **Примитивы**: String, Int, Double, Boolean
- **Массивы**: WritableArray (для отправки в JS), ReadableArray (для получения из JS)
- **Объекты**: WritableMap (для отправки в JS), ReadableMap (для получения из JS)
- **Promise**: для асинхронных операций
- **Callbacks**: для обратных вызовов

### Пример с массивами и объектами:

```kotlin
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

@ReactMethod
fun processArray(array: ReadableArray, promise: Promise) {
    try {
        val result = Arguments.createArray()
        for (i in 0 until array.size()) {
            val item = array.getString(i)
            result.pushString("Processed: $item")
        }
        promise.resolve(result)
    } catch (e: Exception) {
        promise.reject("ERROR", e.message, e)
    }
}

@ReactMethod
fun processObject(map: ReadableMap, promise: Promise) {
    try {
        val result = Arguments.createMap()
        result.putString("name", map.getString("name"))
        result.putDouble("age", map.getDouble("age"))
        promise.resolve(result)
    } catch (e: Exception) {
        promise.reject("ERROR", e.message, e)
    }
}
```

## Шаг 2: Создание пакета

Создайте файл `YourModulePackage.kt`:

```kotlin
package com.strack

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class YourModulePackage : ReactPackage {
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return listOf(YourModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList() // Если не создаете нативные view компоненты
    }
}
```

## Шаг 3: Регистрация пакета

Добавьте ваш пакет в `MainApplication.kt`:

```kotlin
package com.strack

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Добавьте ваш пакет здесь
          add(YourModulePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
```

## Шаг 4: Использование в JavaScript/TypeScript

Создайте TypeScript обертку для вашего модуля:

```typescript
// src/utils/YourModule.ts
import { NativeModules, Platform } from 'react-native';

const { YourModule } = NativeModules;

interface YourModuleInterface {
  simpleMethod(message: string): void;
  asyncMethod(input: string): Promise<string>;
  methodWithParams(
    stringParam: string,
    numberParam: number,
    boolParam: boolean,
  ): Promise<{
    string: string;
    number: number;
    bool: boolean;
  }>;
}

class YourModuleWrapper implements YourModuleInterface {
  private module: any;

  constructor() {
    this.module = YourModule;
  }

  simpleMethod(message: string): void {
    if (!this.module) {
      if (Platform.OS === 'android') {
        throw new Error('YourModule native module is not available');
      }
      return; // iOS может не иметь этого модуля
    }
    this.module.simpleMethod(message);
  }

  async asyncMethod(input: string): Promise<string> {
    if (!this.module) {
      throw new Error('YourModule native module is not available');
    }
    return this.module.asyncMethod(input);
  }

  async methodWithParams(
    stringParam: string,
    numberParam: number,
    boolParam: boolean,
  ): Promise<{ string: string; number: number; bool: boolean }> {
    if (!this.module) {
      throw new Error('YourModule native module is not available');
    }
    return this.module.methodWithParams(stringParam, numberParam, boolParam);
  }
}

export default new YourModuleWrapper();
```

Использование в компоненте:

```typescript
import YourModule from './utils/YourModule';

// Синхронный вызов
YourModule.simpleMethod('Hello from React Native!');

// Асинхронный вызов
try {
  const result = await YourModule.asyncMethod('input data');
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}
```

## Примеры из вашего проекта

В вашем проекте уже есть рабочие примеры:

### BackgroundHttpServiceModule

```10:51:android/app/src/main/java/com/strack/BackgroundHttpServiceModule.kt
class BackgroundHttpServiceModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val TAG = "BackgroundHttpService"

    override fun getName(): String {
        return "BackgroundHttpService"
    }

    @ReactMethod
    fun start(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, BackgroundHttpService::class.java)
            reactApplicationContext.startForegroundService(intent)
            Log.d(TAG, "Foreground service started")
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting service", e)
            promise.reject("ERROR", "Failed to start service: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, BackgroundHttpService::class.java)
            reactApplicationContext.stopService(intent)
            Log.d(TAG, "Foreground service stopped")
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping service", e)
            promise.reject("ERROR", "Failed to stop service: ${e.message}", e)
        }
    }

    @ReactMethod
    fun isRunning(promise: Promise) {
        // Проверяем, запущен ли сервис (упрощенная проверка)
        // В реальном приложении можно использовать ActivityManager для точной проверки
        promise.resolve(true)
    }
}
```

### BackgroundHttpServicePackage

```8:16:android/app/src/main/java/com/strack/BackgroundHttpServicePackage.kt
class BackgroundHttpServicePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(BackgroundHttpServiceModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

## Полезные советы

1. **Именование**: Имя модуля (метод `getName()`) должно совпадать с именем, используемым в `NativeModules` в JavaScript

2. **Обработка ошибок**: Всегда используйте try-catch в методах с Promise и вызывайте `promise.reject()` при ошибках

3. **Логирование**: Используйте `Log.d()`, `Log.e()` для отладки. Логи видны в `adb logcat`

4. **Асинхронность**: Для долгих операций всегда используйте Promise или Callback

5. **Типы данных**: React Native автоматически конвертирует типы между JS и Kotlin, но убедитесь, что используете правильные типы

6. **Проверка платформы**: В TypeScript обертке проверяйте доступность модуля и платформу

## Отладка

Для просмотра логов нативного модуля:

```bash
adb logcat | grep YourModule
```

Или для всех React Native логов:

```bash
adb logcat | grep ReactNativeJS
```

## Дополнительные ресурсы

- [Официальная документация React Native - Native Modules](https://reactnative.dev/docs/native-modules-android)
- [React Native Bridge API](https://github.com/facebook/react-native/blob/main/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/bridge/README.md)
