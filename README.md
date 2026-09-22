# 💖 Matrix Love Code (4 Months Anniversary)

โปรเจกต์เว็บแอนิเมชัน **Matrix Love Code** ที่ถอดแบบมาจากวิดีโอตัวอย่างอย่างสมบูรณ์แบบ พร้อมระบบเสียงและเอฟเฟกต์ที่ซิงค์ตามจังหวะเพลง 100%

---

## ✨ สิ่งที่ทำในโปรเจกต์นี้ (Features)

1. **Pink Matrix Digital Rain Layer**
   - สายฝนโค้ดดิจิทัลสีชมพู/นีออนมาเจนต้า สไตล์ Matrix พร้อมตัวอักษรโรแมนติก (`LOVE`, `♥`, `YOU`, ตัวเลขดิจิทัล)
   - หัวตัวอักษรสว่างวาบ พร้อมเอฟเฟกต์เรืองแสง (Glow trail)

2. **Transition & Countdown (3, 2, 1)**
   - จุดเรืองแสงกระพริบกลางจอช่วงเสียงพูด *"udah siap belum? yuk"*
   - ตัวเลขนับถอยหลัง `3` ➔ `2` ➔ `1` สร้างจากกลุ่มละอองอนุภาคเรืองแสง (Fluffy Particle Cloud)
   - เอฟเฟกต์การระเบิดสลายตัว (Dissolve & Scatter) อย่างนุ่มนวล

3. **LED / Dot Matrix Text ("You", "Are", "My", "Love")**
   - ตัวอักษรแสดงผลสไตล์หลอดไฟ LED Grid / Dot Matrix ตามจังหวะบีตเพลง
   - มีแสงเรืองแสงนีออน (Neon Bloom & Shadow Blur) สมจริงเหมือนในคลิป

4. **Big Particle Cloud Heart & Heartbeat ("I Love ❤️ You Sayang")**
   - รูปหัวใจสร้างด้วยสมการคณิตศาสตร์พารามิเตอร์ (Parametric Heart Equation)
   - ขอบหัวใจหนานุ่มด้วยละอองอนุภาคฟุ้งเปล่งประกายกว่า 1,600+ ดวง
   - เต้นตามจังหวะบีตเพลง (Lub-Dub Heartbeat Rhythm)
   - มีละอองประกายดาว (Floating Sparks) ลอยละล่องออกจากหัวใจ
   - ข้อความตรงกลาง `- I Love ❤️ You Sayang -` เรืองแสงเปล่งประกาย

5. **Audio Synchronization & Controls**
   - ซิงค์ทุกเฟรมและทุกไทม์ไลน์ตามเวลาของไฟล์เสียงจริง (`audio.mp4`)
   - ปุ่ม Start Screen สวยงาม (แก้ปัญหา Autoplay policy ของเบราว์เซอร์)
   - เมนูลัดลอยตัว (Auto-hide): เล่น/หยุดชั่วคราว (`Space`), เล่นซ้ำ (`R`), เต็มจอ (`F`)
   - **ระบบแก้ไขข้อความ (Customize Modal ✏️):** สามารถเปลี่ยนคำในหัวใจ หรือคำ 4 คำได้ตามต้องการ บันทึกอัตโนมัติลงในเบราว์เซอร์

---

## 🚀 วิธีเปิดใช้งาน (How to Run)

### วิธีที่ 1: ผ่าน Node.js Server (แนะนำ)
เปิด Terminal ในโฟลเดอร์นี้ แล้วรัน:
```bash
npm start
# หรือ
node server.js
```
จากนั้นเปิดเบราว์เซอร์ไปที่:
👉 **[http://localhost:3000](http://localhost:3000)**

### วิธีที่ 2: เปิดด้วย VS Code Live Server
คลิกขวาที่ไฟล์ [`index.html`](file:///T:/my-projects/4m-anniv/index.html) แล้วเลือก **"Open with Live Server"**

---

## ⚙️ การปรับแต่งข้อความ (Customization)

- **ผ่านหน้าเว็บ:** คลิกปุ่มรูปดินสอ ✏️ ที่แถบควบคุมด้านล่าง เพื่อเปิดหน้าต่างตั้งค่าข้อความ
- **ผ่านไฟล์โค้ด:** สามารถแก้ไขค่าเริ่มต้นได้ในไฟล์ [`script.js`](file:///T:/my-projects/4m-anniv/script.js) ในส่วน `CONFIG`