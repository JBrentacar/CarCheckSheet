// script.js

let selectedDevice = null;
let currentCanvas = null;
let damageList = [];
let signaturePad = null;

// デバイス選択
function selectDevice(device) {
  selectedDevice = device;
  document.getElementById('device-selector').classList.add('hidden');
  document.getElementById('form-section').classList.remove('hidden');
}

// フォーム入力後
document.addEventListener('DOMContentLoaded', () => {
  // フォームの入力を監視
  const carNumberInput = document.getElementById('car-number');
  const managementNumberInput = document.getElementById('management-number');

  carNumberInput.addEventListener('input', checkForm);
  managementNumberInput.addEventListener('input', checkForm);
});

function checkForm() {
  const carNumber = document.getElementById('car-number').value;
  const managementNumber = document.getElementById('management-number').value;

  if (carNumber.length === 4 && /^\d{4}$/.test(carNumber) && managementNumber.trim() !== '') {
    document.getElementById('form-section').classList.add('hidden');
    document.getElementById('canvas-section').classList.remove('hidden');
    setupCanvas();
  }
}

// キャンバスのセットアップ
function setupCanvas() {
  const canvasContainer = document.getElementById('canvas-container');
  canvasContainer.innerHTML = ''; // 既存のキャンバスをクリア
  damageList = []; // 傷のリストをリセット

  if (selectedDevice === 'mobile') {
    document.getElementById('image-buttons').classList.remove('hidden');
    loadImage('front.png'); // デフォルトでフロントを表示
  } else if (selectedDevice === 'tablet') {
    document.getElementById('image-buttons').classList.add('hidden');
    const images = ['front.png', 'left.png', 'rear.png', 'right.png'];
    images.forEach(img => {
      const div = document.createElement('div');
      div.className = 'canvas-item';
      const canvas = document.createElement('canvas');
      canvas.id = `canvas-${img}`;
      canvas.width = 300;
      canvas.height = 400;
      div.appendChild(canvas);
      canvasContainer.appendChild(div);
      setupFabricCanvas(canvas.id, img);
    });
    document.getElementById('canvas-section').classList.remove('hidden');
    document.getElementById('signature-section').classList.remove('hidden');
    document.getElementById('complete-section').classList.remove('hidden');
  }
}

// 画像の読み込みとキャンバスのセットアップ（スマホ用）
function loadImage(imageName) {
  const canvasContainer = document.getElementById('canvas-container');
  canvasContainer.innerHTML = ''; // 既存のキャンバスをクリア

  const div = document.createElement('div');
  div.className = 'canvas-item';
  const canvas = document.createElement('canvas');
  canvas.id = 'main-canvas';
  canvas.width = 300;
  canvas.height = 400;
  div.appendChild(canvas);
  canvasContainer.appendChild(div);

  setupFabricCanvas(canvas.id, imageName);
}

// Fabric.js を使ったキャンバスのセットアップ
function setupFabricCanvas(canvasId, imageName) {
  const canvas = new fabric.Canvas(canvasId);
  fabric.Image.fromURL(`images/${imageName}`, function(img) {
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
      scaleX: canvas.width / img.width,
      scaleY: canvas.height / img.height
    });
  });

  // 描画モードを有効にする
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = "red";
  canvas.freeDrawingBrush.width = 5;

  // パスが描かれたときのイベント
  canvas.on('path:created', function(e) {
    const path = e.path;
    damageList.push(path);
  });
}

// サインパッドのセットアップ
window.onload = function() {
  const canvas = document.getElementById('signature-pad');
  signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    penColor: 'black'
  });
}

// サインのクリア
function clearSignature() {
  signaturePad.clear();
}

// PDF生成とダウンロード
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('レンタカー カーチェックシート', 105, 20, null, null, 'center');

  doc.setFontSize(12);
  const carNumber = document.getElementById('car-number').value;
  const managementNumber = document.getElementById('management-number').value;
  doc.text(`車両ナンバー: ${carNumber}`, 20, 40);
  doc.text(`管理番号: ${managementNumber}`, 20, 50);

  doc.setFontSize(16);
  doc.text('傷の詳細:', 20, 70);
  doc.setTextColor(255, 0, 0);
  let y = 80;
  damageList.forEach((path, index) => {
    doc.setFontSize(12);
    doc.text(`${index + 1}. 傷 ${index + 1}`, 25, y);
    y += 10;
  });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text('サイン:', 20, y + 10);

  if (!signaturePad.isEmpty()) {
    const dataURL = signaturePad.toDataURL();
    doc.addImage(dataURL, 'PNG', 20, y + 20, 50, 30);
  }

  doc.save('car_checksheet.pdf');
}
