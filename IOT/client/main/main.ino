#include <WiFi.h>
#include <HTTPClient.h>
#include <driver/i2s.h>

// กำหนดค่า WiFi
const char* ssid = "HAZANO.my";
const char* password = "wildan1157";

// URL ของเซิร์ฟเวอร์ปลายทาง
const char* serverUrl = "http://192.168.0.15:3000/uploadAudio";

// กำหนดขาเชื่อมต่อ SPH0645
#define I2S_WS  15  // ขา LRCLK
#define I2S_BCK 14  // ขา BCLK
#define I2S_SD  32  // ขา DOUT

// กำหนดค่าการตั้งค่า I2S
#define I2S_PORT I2S_NUM_0
#define I2S_SAMPLE_RATE 16000
#define I2S_SAMPLE_BITS 16
#define I2S_BUFFER_SIZE 1024

void setup() {
    Serial.begin(115200);

    // เชื่อมต่อ WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");

    // ตั้งค่า I2S
    i2s_config_t i2s_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
        .sample_rate = I2S_SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
        .communication_format = I2S_COMM_FORMAT_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 8,
        .dma_buf_len = I2S_BUFFER_SIZE,
        .use_apll = false
    };

    i2s_pin_config_t pin_config = {
        .bck_io_num = I2S_BCK,
        .ws_io_num = I2S_WS,
        .data_out_num = I2S_PIN_NO_CHANGE,
        .data_in_num = I2S_SD
    };
ีีี
    // ติดตั้ง I2S
    i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
    i2s_set_pin(I2S_PORT, &pin_config);
}

void loop() {
    uint8_t buffer[I2S_BUFFER_SIZE]; // บัฟเฟอร์สำหรับเก็บข้อมูลเสียง
    size_t bytesRead;

    // อ่านข้อมูลเสียงจาก SPH0645
    i2s_read(I2S_PORT, buffer, I2S_BUFFER_SIZE, &bytesRead, portMAX_DELAY);
    
    Serial.println("Recording audio...");

    // ส่งข้อมูลไปยังเซิร์ฟเวอร์
    sendAudioData(buffer, bytesRead);

    delay(5000); // รอ 5 วินาที ก่อนบันทึกใหม่
}

void sendAudioData(uint8_t *data, size_t length) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi Disconnected!");
        return;
    }

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "audio/wav");

    // ส่งข้อมูลเป็น POST request
    int httpResponseCode = http.POST(data, length);
    
    Serial.print("HTTP Response Code: ");
    Serial.println(httpResponseCode);

    http.end();
}
