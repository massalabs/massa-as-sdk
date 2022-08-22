/**
 * Draw a log histogram.
 *
 * Stdout the histogram of the log of the data using stars `*` char.
 *
 * @param {Uint32Array} a - array containing histogram data
 * @param {i32} w - width of the histogram
 */
export function drawLogHistogram(a: Uint32Array, w: i32): void {
  let max: f64 = 0;
  for (let i = 0; i < a.length; i++) {
    if (Math.log(a[i]) > max) {
      max = Math.log(a[i]);
    }
  }

  for (let i = 0; i < a.length; i++) {
    let bin = i.toString() + (i < 10 ? ' : ' : ': ');
    for (let j = 0; j < Math.round((Math.log(a[i]) / max) * w); j++) {
      bin += '*';
    }
    log<string>(bin);
  }
}

/**
 * Draw a histogram.
 *
 * Stdout the histogram of the data using stars `*` char.
 *
 * @param {Uint32Array} a - array containing histogram data
 * @param {i32} w - width of the histogram
 *
 */
export function drawHistogram(a: Uint32Array, w: i32): void {
  let max: f64 = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > max) {
      max = a[i];
    }
  }

  for (let i = 0; i < a.length; i++) {
    let bin = i.toString() + (i < 10 ? ' : ' : ': ');
    for (let j = 0; j < Math.round((a[i] / max) * w); j++) {
      bin += '*';
    }
    log<string>(bin);
  }
}
