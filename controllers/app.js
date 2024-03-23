// // Comfirm box for editCategory Page
// document.querySelectorAll('.deletebutton').forEach(button => {
//     button.addEventListener('click', function() {
//         document.querySelector('.confirmbox').style.display = 'block';
//     });
// });

// document.querySelector('.canclebutton').addEventListener('click', function() {
//     document.querySelector('.confirmbox').style.opacity = '0';
// });

// document.getElementById('deletebeverages').addEventListener('click', function() {
//     document.querySelector('.confirmbox').style.opacity = '1';
// });

// document.getElementById('deletefruits').addEventListener('click', function() {
//     document.querySelector('.confirmbox').style.opacity = '1';
// });

// document.getElementById('deletehousehold').addEventListener('click', function() {
//     document.querySelector('.confirmbox').style.opacity = '1';
// });

// document.getElementById('deletemeat').addEventListener('click', function() {
//     // แสดง .confirmbox
//     document.querySelector('.confirmbox').style.opacity = '1';
// });

// document.addEventListener('DOMContentLoaded', function() {
//     // เมื่อหน้า categoryBusiness.html โหลดเสร็จสมบูรณ์

//     // ตรวจสอบว่า URL มี parameter ชื่อ updatedCategoryName หรือไม่
//     var urlParams = new URLSearchParams(window.location.search);
//     var updatedCategoryName = urlParams.get('updatedCategoryName');

//     if (updatedCategoryName) {
//         // แสดงชื่อหมวดหมู่ที่ถูกแก้ไขในหน้า categoryBusiness.html
//         var categoryElement = document.querySelector('.beverages p');
//         categoryElement.textContent = updatedCategoryName;
//     }
// });

// // Comfirm box for productInCategory Page
// // เลือกทุกปุ่มที่มีคลาส deletebutton และเพิ่มเหตุการณ์ click
// document.querySelectorAll('.deletebutton').forEach(button => {
//     button.addEventListener('click', function(event) {
//         event.preventDefault(); // หยุดการทำงานปกติของลิงก์

//         // แสดงกล่อง confirmbox
//         document.querySelector('.confirmbox').style.display = 'block';
//     });
// });

// // เลือกปุ่ม cancelbutton และเพิ่มเหตุการณ์ click
// document.querySelector('.canclebutton').addEventListener('click', function() {
//     // ซ่อนกล่อง confirmbox เมื่อผู้ใช้กดปุ่ม cancel
//     document.querySelector('.confirmbox').style.display = 'none';
// });









