import Foundation
import UIKit
import React
import BackgroundTasks

@objc(BackgroundWebSocketService)
class BackgroundWebSocketService: RCTEventEmitter {
    private var webSocketTask: URLSessionWebSocketTask?
    private var urlSession: URLSession?
    private var isConnected = false
    private var wsUrl: String?
    private var token: String?
    private var backgroundTaskId: UIBackgroundTaskIdentifier = .invalid
    private var periodicTimer: Timer?
    
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func supportedEvents() -> [String]! {
        return ["websocketStatus", "websocketMessage"]
    }
    
    @objc
    func connect(_ url: String, token: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            
            self.wsUrl = url
            self.token = token
            
            let fullUrl = "\(url)?jwt=\(token)"
            guard let wsUrl = URL(string: fullUrl) else {
                reject("ERROR", "Invalid URL", nil)
                return
            }
            
            let config = URLSessionConfiguration.default
            config.allowsCellularAccess = true
            config.waitsForConnectivity = true
            
            self.urlSession = URLSession(configuration: config, delegate: self, delegateQueue: nil)
            self.webSocketTask = self.urlSession?.webSocketTask(with: wsUrl)
            
            self.webSocketTask?.resume()
            self.receiveMessage()
            
            print("BackgroundWebSocketService: Connecting to \(fullUrl)")
            resolve(nil)
        }
    }
    
    @objc
    func disconnect(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            
            self.stopPeriodicMessagesInternal()
            self.webSocketTask?.cancel(with: .normalClosure, reason: nil)
            self.webSocketTask = nil
            self.urlSession?.invalidateAndCancel()
            self.urlSession = nil
            self.isConnected = false
            
            if self.backgroundTaskId != .invalid {
                UIApplication.shared.endBackgroundTask(self.backgroundTaskId)
                self.backgroundTaskId = .invalid
            }
            
            print("BackgroundWebSocketService: Disconnected")
            resolve(nil)
        }
    }
    
    @objc
    func send(_ data: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let webSocketTask = webSocketTask, isConnected else {
            reject("ERROR", "WebSocket not connected", nil)
            return
        }
        
        let message = URLSessionWebSocketTask.Message.string(data)
        webSocketTask.send(message) { error in
            if let error = error {
                print("BackgroundWebSocketService: Error sending message - \(error.localizedDescription)")
                reject("ERROR", "Failed to send message: \(error.localizedDescription)", error)
            } else {
                print("BackgroundWebSocketService: Message sent: \(data)")
                resolve(nil)
            }
        }
    }
    
    @objc
    func isConnected(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(self.isConnected)
    }
    
    @objc
    func startPeriodicMessages(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            
            self.startPeriodicMessagesInternal()
            resolve(nil)
        }
    }
    
    @objc
    func stopPeriodicMessages(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            
            self.stopPeriodicMessagesInternal()
            resolve(nil)
        }
    }
    
    private func startPeriodicMessagesInternal() {
        stopPeriodicMessagesInternal()
        
        // Захардкоженные данные
        let hardcodedData: [String: Any] = [
            "latitude": 55.7558,
            "longitude": 37.6173,
            "message": "test"
        ]
        
        // Отправляем первое сообщение сразу
        if let jsonData = try? JSONSerialization.data(withJSONObject: hardcodedData),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            sendMessage(jsonString)
        }
        
        // Отправляем сообщение каждые 5 секунд
        periodicTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            guard let self = self, self.isConnected else { return }
            
            var data = hardcodedData
            data["timestamp"] = Int64(Date().timeIntervalSince1970 * 1000)
            
            if let jsonData = try? JSONSerialization.data(withJSONObject: data),
               let jsonString = String(data: jsonData, encoding: .utf8) {
                self.sendMessage(jsonString)
            }
        }
        
        // Добавляем таймер в RunLoop для работы в фоне
        if let timer = periodicTimer {
            RunLoop.current.add(timer, forMode: .common)
        }
        
        print("BackgroundWebSocketService: Periodic messages started")
    }
    
    private func stopPeriodicMessagesInternal() {
        periodicTimer?.invalidate()
        periodicTimer = nil
        print("BackgroundWebSocketService: Periodic messages stopped")
    }
    
    private func sendMessage(_ message: String) {
        guard let webSocketTask = webSocketTask, isConnected else {
            print("BackgroundWebSocketService: Cannot send - WebSocket not connected")
            return
        }
        
        let wsMessage = URLSessionWebSocketTask.Message.string(message)
        webSocketTask.send(wsMessage) { error in
            if let error = error {
                print("BackgroundWebSocketService: Error sending periodic message - \(error.localizedDescription)")
            } else {
                print("BackgroundWebSocketService: Periodic message sent: \(message)")
            }
        }
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    print("BackgroundWebSocketService: Message received: \(text)")
                    self.sendEvent(withName: "websocketMessage", body: ["message": text])
                case .data(let data):
                    print("BackgroundWebSocketService: Data received: \(data.count) bytes")
                @unknown default:
                    break
                }
                
                // Продолжаем получать сообщения
                self.receiveMessage()
                
            case .failure(let error):
                print("BackgroundWebSocketService: Error receiving message - \(error.localizedDescription)")
                self.isConnected = false
                self.sendEvent(withName: "websocketStatus", body: [
                    "status": "error",
                    "error": error.localizedDescription
                ])
            }
        }
    }
    
    private func scheduleReconnect() {
        // Планируем переподключение через 5 секунд
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { [weak self] in
            guard let self = self, !self.isConnected, let url = self.wsUrl, let token = self.token else {
                return
            }
            
            print("BackgroundWebSocketService: Attempting to reconnect...")
            self.connect(url, token: token, resolve: { _ in }, rejecter: { _, _, _ in })
        }
    }
}

extension BackgroundWebSocketService: URLSessionWebSocketDelegate {
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
        isConnected = true
        print("BackgroundWebSocketService: WebSocket connected")
        
        sendEvent(withName: "websocketStatus", body: ["status": "connected"])
        
        // Регистрируем фоновую задачу для поддержания подключения
        backgroundTaskId = UIApplication.shared.beginBackgroundTask { [weak self] in
            if let taskId = self?.backgroundTaskId, taskId != .invalid {
                UIApplication.shared.endBackgroundTask(taskId)
                self?.backgroundTaskId = .invalid
            }
        }
        
        // Автоматически запускаем периодическую отправку при подключении
        startPeriodicMessagesInternal()
    }
    
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didCloseWith closeCode: URLSessionWebSocketTask.CloseCode, reason: Data?) {
        isConnected = false
        let reasonString = reason.flatMap { String(data: $0, encoding: .utf8) } ?? "Unknown"
        print("BackgroundWebSocketService: WebSocket closed with code \(closeCode.rawValue), reason: \(reasonString)")
        
        sendEvent(withName: "websocketStatus", body: [
            "status": "disconnected",
            "code": closeCode.rawValue,
            "reason": reasonString
        ])
        
        if backgroundTaskId != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTaskId)
            backgroundTaskId = .invalid
        }
        
        // Пытаемся переподключиться
        scheduleReconnect()
    }
}

