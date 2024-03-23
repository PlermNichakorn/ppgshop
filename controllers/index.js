document.addEventListener("DOMContentLoaded", function() {
  const mobileBankingOption = document.getElementById("mobileBankingOption");
  const mobileInfoBox = document.getElementById("mobileInfoBox");
  const cashOnDeliveryOption = document.getElementById("cashOnDeliveryOption");
  const cashInfoBox = document.getElementById("cashInfoBox");

  function toggleMobileInfoBox() {
    if (mobileBankingOption.checked) {
      mobileInfoBox.style.display = "block";
      cashInfoBox.style.display = "none";
    } else {
      mobileInfoBox.style.display = "none";
    }
  }

  function toggleCashInfoBox() {
    if (cashOnDeliveryOption.checked) {
      cashInfoBox.style.display = "block";
      mobileInfoBox.style.display = "none";
    } else {
      cashInfoBox.style.display = "none";
    }
  }

  function resetRadioButtons() {
    // ตั้งค่าให้ปุ่ม Mobile Banking และ Cash on Delivery ไม่ถูกเลือก
    mobileBankingOption.checked = false;
    cashOnDeliveryOption.checked = false;
    // ซ่อนกล่อง option ทั้งสอง
    mobileInfoBox.style.display = "none";
    cashInfoBox.style.display = "none";
  }

  toggleMobileInfoBox(); // เรียกใช้ฟังก์ชันเมื่อโหลดหน้าเพจ
  toggleCashInfoBox(); // เรียกใช้ฟังก์ชันเมื่อโหลดหน้าเพจ
  resetRadioButtons(); // เรียกใช้ฟังก์ชันเพื่อรีเซ็ตปุ่มเมื่อโหลดหน้าเพจใหม่

  mobileBankingOption.addEventListener("change", toggleMobileInfoBox); // เมื่อมีการเปลี่ยนแปลงในการเลือกปุ่ม
  cashOnDeliveryOption.addEventListener("change", toggleCashInfoBox); // เมื่อมีการเปลี่ยนแปลงในการเลือกปุ่ม
});
