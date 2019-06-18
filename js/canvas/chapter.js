const canv1 = document.getElementById('canv1');
const context1 = canv1.getContext('2d');
context1.fillStyle = 'red';
// creates a rectangle with the top-left edge on the (10px, 10px) coordinates
// and with a width of 100px and height of 100px
context1.fillRect(10, 10, 100, 50);

const cx2 = document.getElementById('canv2').getContext('2d');
cx2.strokeStyle = 'blue';
cx2.strokeRect(5, 5, 50, 50);
cx2.lineWidth = 5;
cx2.strokeRect(80, 5, 50, 50);

const cx3 = document.getElementById('canv3').getContext('2d');
cx3.beginPath();
for (let y = 10; y <= 100; y += 10) {
    cx3.moveTo(10, y);
    cx3.lineTo(90, y);
}
cx3.stroke();

const cx4 = document.getElementById('canv4').getContext('2d');
cx4.beginPath();
cx4.moveTo(50, 10);
cx4.lineTo(10, 70);
cx4.lineTo(90, 70);
cx4.stroke();

// to fill a triangle, 2 sides of it are enough
const cx5 = document.getElementById('canv5').getContext('2d');
cx5.beginPath();
cx5.moveTo(50, 10);
cx5.lineTo(10, 70);
cx5.lineTo(90, 70);
cx5.fill();

// Curves
