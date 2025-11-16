# Руководство по логированию нативных модулей Kotlin в React Native

## Использование Log в Kotlin

В вашем модуле уже используется `android.util.Log`. Доступны следующие уровни:

```kotlin
import android.util.Log

private val TAG = "YourModule"

// Debug - для отладочной информации
Log.d(TAG, "Debug message")

// Info - для информационных сообщений
Log.i(TAG, "Info message")

// Warning - для предупреждений
Log.w(TAG, "Warning message")

// Error - для ошибок
Log.e(TAG, "Error message", exception)

// Verbose - для подробной информации
Log.v(TAG, "Verbose message")
```

## Просмотр логов через adb logcat

### 1. Просмотр всех логов модуля по тегу

```bash
adb logcat | grep YourModule
```

Или для вашего модуля:

```bash
adb logcat | grep BackgroudModule
```

### 2. Просмотр с фильтрацией по уровню

```bash
# Только ошибки
adb logcat *:E | grep BackgroudModule

# Только debug и выше
adb logcat *:D | grep BackgroudModule
```

### 3. Просмотр логов React Native и нативного модуля одновременно

```bash
adb logcat | grep -E "ReactNativeJS|BackgroudModule"
```

### 4. Сохранение логов в файл

```bash
adb logcat | grep BackgroudModule > logs.txt
```

### 5. Очистка логов перед просмотром

```bash
adb logcat -c && adb logcat | grep BackgroudModule
```

## Улучшенное логирование в модуле

Вот пример улучшенного логирования для вашего модуля:

```kotlin
package com.strack

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.util.Log

class BackgroudModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "BackgroudModule"
        private const val DEBUG = true // Можно выключить в production
    }

    override fun getName(): String {
        return "BackgroudModule"
    }

    @ReactMethod
    fun simpleMethod(message: String) {
        if (DEBUG) {
            Log.d(TAG, "simpleMethod called with message: $message")
        }
        // Ваш код
    }

    @ReactMethod
    fun asyncMethod(input: String, promise: Promise) {
        try {
            Log.d(TAG, "asyncMethod started with input: $input")

            // Выполняем работу
            val result = "Processed: $input"

            Log.d(TAG, "asyncMethod completed successfully. Result: $result")
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error in asyncMethod: ${e.message}", e)
            Log.e(TAG, "Stack trace: ${e.stackTraceToString()}")
            promise.reject("ERROR", "Failed to process: ${e.message}", e)
        }
    }

    @ReactMethod
    fun methodWithParams(
        stringParam: String,
        numberParam: Double,
        boolParam: Boolean,
        promise: Promise
    ) {
        try {
            Log.d(TAG, "methodWithParams called:")
            Log.d(TAG, "  - stringParam: $stringParam")
            Log.d(TAG, "  - numberParam: $numberParam")
            Log.d(TAG, "  - boolParam: $boolParam")

            val result = mapOf(
                "string" to stringParam,
                "number" to numberParam,
                "bool" to boolParam
            )

            Log.d(TAG, "methodWithParams result: $result")
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error in methodWithParams", e)
            promise.reject("ERROR", e.message, e)
        }
    }
}
```

## Просмотр логов в Android Studio

1. Откройте Android Studio
2. Подключите устройство или запустите эмулятор
3. Откройте вкладку **Logcat** (внизу экрана)
4. В поле фильтра введите ваш тег: `BackgroudModule`
5. Выберите уровень логирования (Verbose, Debug, Info, Warn, Error)

## Просмотр логов в VS Code / WebStorm

### Через встроенный терминал:

1. Откройте терминал в редакторе
2. Убедитесь, что устройство подключено: `adb devices`
3. Запустите фильтр: `adb logcat | grep BackgroudModule`

### Через расширения:

- **VS Code**: Расширение "Android Logcat" или "React Native Tools"
- **WebStorm**: Встроенная поддержка через терминал

## Полезные команды adb logcat

```bash
# Просмотр всех логов с временными метками
adb logcat -v time

# Просмотр логов конкретного процесса
adb logcat --pid=$(adb shell pidof -s com.strack)

# Просмотр только ошибок и предупреждений
adb logcat *:E *:W

# Просмотр логов с фильтром по нескольким тегам
adb logcat | grep -E "BackgroudModule|ReactNativeJS|AndroidRuntime"

# Очистка буфера логов
adb logcat -c

# Просмотр последних N строк
adb logcat -t 100 | grep BackgroudModule
```

## Уровни логирования Android

- **V** - Verbose (самый подробный)
- **D** - Debug (отладочная информация)
- **I** - Info (информационные сообщения)
- **W** - Warning (предупреждения)
- **E** - Error (ошибки)
- **F** - Fatal (критические ошибки)

## Примеры использования в разных ситуациях

### Логирование входа/выхода из метода:

```kotlin
@ReactMethod
fun myMethod(param: String, promise: Promise) {
    Log.d(TAG, ">>> myMethod() called with param: $param")
    try {
        // Ваш код
        Log.d(TAG, "<<< myMethod() completed successfully")
        promise.resolve(result)
    } catch (e: Exception) {
        Log.e(TAG, "<<< myMethod() failed: ${e.message}", e)
        promise.reject("ERROR", e.message, e)
    }
}
```

### Логирование с контекстом:

```kotlin
@ReactMethod
fun complexMethod(data: ReadableMap, promise: Promise) {
    Log.d(TAG, "complexMethod called")
    Log.d(TAG, "  Context: ${reactApplicationContext.packageName}")
    Log.d(TAG, "  Data keys: ${data.keySetIterator().asSequence().toList()}")

    // Ваш код
}
```

### Условное логирование (только в debug):

```kotlin
private fun logDebug(message: String) {
    if (BuildConfig.DEBUG) {
        Log.d(TAG, message)
    }
}

// Использование
logDebug("This will only log in debug builds")
```

## Проверка подключения устройства

Перед просмотром логов убедитесь, что устройство подключено:

```bash
adb devices
```

Должен показать список подключенных устройств:

```
List of devices attached
emulator-5554    device
```

## Быстрый старт

1. Добавьте логи в ваш модуль:

```kotlin
Log.d(TAG, "Your message here")
```

2. Откройте терминал и запустите:

```bash
adb logcat | grep BackgroudModule
```

3. Вызовите метод из React Native - логи появятся в терминале!
