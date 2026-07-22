const len = 10000000;
const data = new Float32Array(len);
for(let i=0; i<len; i++) data[i] = Math.sin(i * 0.01) * 0.8;

const start = Date.now();
let peak = 0;
for (let i = 0; i < data.length; i++) {
  if (Math.abs(data[i]) > peak) peak = Math.abs(data[i]);
}
console.log('Peak:', peak, 'Time:', Date.now() - start, 'ms');
