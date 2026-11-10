# Elsewhere — Immersive wireframe v2

ชุด wireframe responsive แบบ interactive สำหรับแนวคิดเว็บไซต์ 3D Immersive (ภาพในชุดนี้เป็นการจำลอง 2D ด้วย CSS ไม่ใช่ 3D จริง และไม่มี backend)

## หน้าในชุด

- `index.html` — หน้า Home เต็ม viewport มีฉากโลกหมุนเวียน crossfade ทุกประมาณ 4 วินาที, pause เมื่อ hover/focus, ปุ่ม pause/manual next/previous, indicators และหยุด autoplay เมื่อระบบตั้ง reduced motion
- `explore.html` — รายการโลกทั้งหมดพร้อมค้นหา กรองหมวด กรอง favorites และเรียงรายการ
- `world-detail.html?id=aurora` — รายละเอียดเฉพาะแต่ละโลก เปลี่ยนรหัสท้าย URL เป็น `solstice`, `velvet`, `moss`, `cloud` หรือ `lumen`
- `settings.html` — ตั้งค่าตัวอย่าง
- `about-updates.html` — แนวคิดและบันทึกอัปเดต

## เปิดใช้งาน

แตก ZIP แล้วเปิด `index.html` หรือไฟล์ HTML หน้าใดก็ได้โดยตรง แต่ละ HTML ฝัง CSS และ JavaScript ภายในตัวเอง ลิงก์เชื่อมกันด้วยชื่อไฟล์ relative path. ใช้เบราว์เซอร์สมัยใหม่ที่เปิดใช้งาน JavaScript.

## การทำงาน

- favorite เก็บใน `localStorage` key `elsewhere.favorites.v2` และ sync ระหว่าง Home, Explore และ World detail ใน origin/เบราว์เซอร์เดียวกัน
- Home ใช้ข้อมูลโลกชุดเดียวกับ Explore และ Detail; `world-detail.html?id=...` แสดงชื่อ คำบรรยาย หมวด อารมณ์ และ artwork ที่ตรงกับ id. รหัสที่ไม่รู้จักแสดงสถานะไม่พบโลก
- autoplay เริ่มเองทุก 4 วินาที เว้นแต่ `prefers-reduced-motion` เปิดอยู่ และหยุดระหว่าง pointer hover หรือ keyboard focus ภายใน carousel

## ปรับต่อ

ตัวแปรโลกและข้อความอยู่ใน `WORLDS` ภายใน `<script>` ของแต่ละหน้า ส่วน theme อยู่ใน `<style>` ที่ฝังอยู่ใน HTML. เพื่อคงข้อมูลให้ตรงกัน หากเพิ่มโลกให้เพิ่มข้อมูลเดียวกันใน `WORLDS` ของทั้งห้าไฟล์ และเพิ่ม indicator ใน Home.
