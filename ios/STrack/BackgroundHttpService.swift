import Foundation
import React
import BackgroundTasks

@objc(BackgroundHttpService)
class BackgroundHttpService: RCTEventEmitter {
    private var timer: Timer?
    private var backgroundTaskId: UIBackgroundTaskIdentifier = .invalid
    private var isRunning = false
    private let taskIdentifier = "com.strack.backgroundHttp"
    
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func supportedEvents() -> [String]! {
        return []
    }
    
    @objc
    func start(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            
            if self.isRunning {
                resolve(nil)
                return
            }
            
            self.isRunning = true
            
            // Запускаем таймер для работы когда приложение активно
            self.timer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
                print("BackgroundHttpService: Timer fired - sending HTTP request")
                self?.sendHttpRequest()
            }
            
            // Добавляем таймер в RunLoop для работы в фоне (ограниченное время)
            if let timer = self.timer {
                RunLoop.current.add(timer, forMode: .common)
            }
            
            // Регистрируем фоновую задачу
            self.registerBackgroundTask()
            
            print("BackgroundHttpService: Service started")
            resolve(nil)
        }
    }
    
    @objc
    func stop(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "Module deallocated", nil)
                return
            }
            
            self.timer?.invalidate()
            self.timer = nil
            self.isRunning = false
            
            if self.backgroundTaskId != .invalid {
                UIApplication.shared.endBackgroundTask(self.backgroundTaskId)
                self.backgroundTaskId = .invalid
            }
            
            print("BackgroundHttpService: Service stopped")
            resolve(nil)
        }
    }
    
    @objc
    func isRunning(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(self.isRunning)
    }
    
    private func registerBackgroundTask() {
        // Регистрируем фоновую задачу для работы в фоне
        backgroundTaskId = UIApplication.shared.beginBackgroundTask { [weak self] in
            // Задача завершается, нужно завершить фоновую задачу
            if let taskId = self?.backgroundTaskId, taskId != .invalid {
                UIApplication.shared.endBackgroundTask(taskId)
                self?.backgroundTaskId = .invalid
            }
        }
        
        // Планируем следующую фоновую задачу
        scheduleBackgroundTask()
    }
    
    private func scheduleBackgroundTask() {
        let request = BGProcessingTaskRequest(identifier: taskIdentifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 5) // Через 5 секунд
        request.requiresNetworkConnectivity = true
        
        do {
            try BGTaskScheduler.shared.submit(request)
            print("BackgroundHttpService: Background task scheduled")
        } catch {
            print("BackgroundHttpService: Could not schedule background task: \(error)")
        }
    }
    
    private func sendHttpRequest() {
        guard let url = URL(string: "http://10.0.2.2:8000/?message=123") else {
            print("BackgroundHttpService: Invalid URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.timeoutInterval = 5.0
        
        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            if let error = error {
                print("BackgroundHttpService: Error sending request - \(error.localizedDescription)")
            } else if let httpResponse = response as? HTTPURLResponse {
                print("BackgroundHttpService: HTTP request sent, status code: \(httpResponse.statusCode)")
            }
            
            // Планируем следующую задачу
            if let self = self, self.isRunning {
                self.scheduleBackgroundTask()
            }
        }
        
        task.resume()
    }
}

