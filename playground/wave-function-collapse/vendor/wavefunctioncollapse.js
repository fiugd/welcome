function randomIndice(array, r) {
  let sum = 0;
  let x = 0;
  let i = 0;
  for (; i < array.length; i++) {
    sum += array[i];
  }
  i = 0;
  r *= sum;
  while (r && i < array.length) {
    x += array[i];
    if (r <= x) {
      return i;
    }
    i++;
  }
  return 0;
}
var randomIndice_1 = randomIndice;
const Model = function Model2() {
};
Model.prototype.FMX = 0;
Model.prototype.FMY = 0;
Model.prototype.FMXxFMY = 0;
Model.prototype.T = 0;
Model.prototype.N = 0;
Model.prototype.initiliazedField = false;
Model.prototype.generationComplete = false;
Model.prototype.wave = null;
Model.prototype.compatible = null;
Model.prototype.weightLogWeights = null;
Model.prototype.sumOfWeights = 0;
Model.prototype.sumOfWeightLogWeights = 0;
Model.prototype.startingEntropy = 0;
Model.prototype.sumsOfOnes = null;
Model.prototype.sumsOfWeights = null;
Model.prototype.sumsOfWeightLogWeights = null;
Model.prototype.entropies = null;
Model.prototype.propagator = null;
Model.prototype.observed = null;
Model.prototype.distribution = null;
Model.prototype.stack = null;
Model.prototype.stackSize = 0;
Model.prototype.DX = [-1, 0, 1, 0];
Model.prototype.DY = [0, 1, 0, -1];
Model.prototype.opposite = [2, 3, 0, 1];
Model.prototype.initialize = function() {
  this.distribution = new Array(this.T);
  this.wave = new Array(this.FMXxFMY);
  this.compatible = new Array(this.FMXxFMY);
  for (let i = 0; i < this.FMXxFMY; i++) {
    this.wave[i] = new Array(this.T);
    this.compatible[i] = new Array(this.T);
    for (let t = 0; t < this.T; t++) {
      this.compatible[i][t] = [0, 0, 0, 0];
    }
  }
  this.weightLogWeights = new Array(this.T);
  this.sumOfWeights = 0;
  this.sumOfWeightLogWeights = 0;
  for (let t = 0; t < this.T; t++) {
    this.weightLogWeights[t] = this.weights[t] * Math.log(this.weights[t]);
    this.sumOfWeights += this.weights[t];
    this.sumOfWeightLogWeights += this.weightLogWeights[t];
  }
  this.startingEntropy = Math.log(this.sumOfWeights) - this.sumOfWeightLogWeights / this.sumOfWeights;
  this.sumsOfOnes = new Array(this.FMXxFMY);
  this.sumsOfWeights = new Array(this.FMXxFMY);
  this.sumsOfWeightLogWeights = new Array(this.FMXxFMY);
  this.entropies = new Array(this.FMXxFMY);
  this.stack = new Array(this.FMXxFMY * this.T);
  this.stackSize = 0;
};
Model.prototype.observe = function(rng) {
  let min = 1e3;
  let argmin = -1;
  for (let i = 0; i < this.FMXxFMY; i++) {
    if (this.onBoundary(i % this.FMX, i / this.FMX | 0))
      continue;
    const amount = this.sumsOfOnes[i];
    if (amount === 0)
      return false;
    const entropy = this.entropies[i];
    if (amount > 1 && entropy <= min) {
      const noise = 1e-6 * rng();
      if (entropy + noise < min) {
        min = entropy + noise;
        argmin = i;
      }
    }
  }
  if (argmin === -1) {
    this.observed = new Array(this.FMXxFMY);
    for (let i = 0; i < this.FMXxFMY; i++) {
      for (let t = 0; t < this.T; t++) {
        if (this.wave[i][t]) {
          this.observed[i] = t;
          break;
        }
      }
    }
    return true;
  }
  for (let t = 0; t < this.T; t++) {
    this.distribution[t] = this.wave[argmin][t] ? this.weights[t] : 0;
  }
  const r = randomIndice_1(this.distribution, rng());
  const w = this.wave[argmin];
  for (let t = 0; t < this.T; t++) {
    if (w[t] !== (t === r))
      this.ban(argmin, t);
  }
  return null;
};
Model.prototype.propagate = function() {
  while (this.stackSize > 0) {
    const e1 = this.stack[this.stackSize - 1];
    this.stackSize--;
    const i1 = e1[0];
    const x1 = i1 % this.FMX;
    const y1 = i1 / this.FMX | 0;
    for (let d = 0; d < 4; d++) {
      const dx = this.DX[d];
      const dy = this.DY[d];
      let x2 = x1 + dx;
      let y2 = y1 + dy;
      if (this.onBoundary(x2, y2))
        continue;
      if (x2 < 0)
        x2 += this.FMX;
      else if (x2 >= this.FMX)
        x2 -= this.FMX;
      if (y2 < 0)
        y2 += this.FMY;
      else if (y2 >= this.FMY)
        y2 -= this.FMY;
      const i2 = x2 + y2 * this.FMX;
      const p = this.propagator[d][e1[1]];
      const compat = this.compatible[i2];
      for (let l = 0; l < p.length; l++) {
        const t2 = p[l];
        const comp = compat[t2];
        comp[d]--;
        if (comp[d] == 0)
          this.ban(i2, t2);
      }
    }
  }
};
Model.prototype.singleIteration = function(rng) {
  const result = this.observe(rng);
  if (result !== null) {
    this.generationComplete = result;
    return !!result;
  }
  this.propagate();
  return null;
};
Model.prototype.iterate = function(iterations, rng) {
  if (!this.wave)
    this.initialize();
  if (!this.initiliazedField) {
    this.clear();
  }
  iterations = iterations || 0;
  rng = rng || Math.random;
  for (let i = 0; i < iterations || iterations === 0; i++) {
    const result = this.singleIteration(rng);
    if (result !== null) {
      return !!result;
    }
  }
  return true;
};
Model.prototype.generate = function(rng) {
  rng = rng || Math.random;
  if (!this.wave)
    this.initialize();
  this.clear();
  while (true) {
    const result = this.singleIteration(rng);
    if (result !== null) {
      return !!result;
    }
  }
};
Model.prototype.isGenerationComplete = function() {
  return this.generationComplete;
};
Model.prototype.ban = function(i, t) {
  const comp = this.compatible[i][t];
  for (let d = 0; d < 4; d++) {
    comp[d] = 0;
  }
  this.wave[i][t] = false;
  this.stack[this.stackSize] = [i, t];
  this.stackSize++;
  this.sumsOfOnes[i] -= 1;
  this.sumsOfWeights[i] -= this.weights[t];
  this.sumsOfWeightLogWeights[i] -= this.weightLogWeights[t];
  const sum = this.sumsOfWeights[i];
  this.entropies[i] = Math.log(sum) - this.sumsOfWeightLogWeights[i] / sum;
};
Model.prototype.clear = function() {
  for (let i = 0; i < this.FMXxFMY; i++) {
    for (let t = 0; t < this.T; t++) {
      this.wave[i][t] = true;
      for (let d = 0; d < 4; d++) {
        this.compatible[i][t][d] = this.propagator[this.opposite[d]][t].length;
      }
    }
    this.sumsOfOnes[i] = this.weights.length;
    this.sumsOfWeights[i] = this.sumOfWeights;
    this.sumsOfWeightLogWeights[i] = this.sumOfWeightLogWeights;
    this.entropies[i] = this.startingEntropy;
  }
  this.initiliazedField = true;
  this.generationComplete = false;
};
var model = Model;
const OverlappingModel = function OverlappingModel2(data, dataWidth, dataHeight, N, width, height, periodicInput, periodicOutput, symmetry, ground) {
  ground = ground || 0;
  this.N = N;
  this.FMX = width;
  this.FMY = height;
  this.FMXxFMY = width * height;
  this.periodic = periodicOutput;
  const SMX = dataWidth;
  const sample = new Array(SMX);
  for (let i = 0; i < SMX; i++) {
    sample[i] = new Array(dataHeight);
  }
  this.colors = [];
  const colorMap = {};
  for (let y = 0; y < dataHeight; y++) {
    for (let x = 0; x < dataWidth; x++) {
      const indexPixel = (y * dataWidth + x) * 4;
      const color = [data[indexPixel], data[indexPixel + 1], data[indexPixel + 2], data[indexPixel + 3]];
      const colorMapIndex = color.join("-");
      if (!colorMap.hasOwnProperty(colorMapIndex)) {
        colorMap[colorMapIndex] = this.colors.length;
        this.colors.push(color);
      }
      sample[x][y] = colorMap[colorMapIndex];
    }
  }
  const C = this.colors.length;
  const W = Math.pow(C, N * N);
  const pattern = function pattern2(f) {
    let result = new Array(N * N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        result[x + y * N] = f(x, y);
      }
    }
    return result;
  };
  const patternFromSample = function patternFromSample2(x, y) {
    return pattern(function(dx, dy) {
      return sample[(x + dx) % dataWidth][(y + dy) % dataHeight];
    });
  };
  const rotate = function rotate2(p) {
    return pattern(function(x, y) {
      return p[N - 1 - y + x * N];
    });
  };
  const reflect = function reflect2(p) {
    return pattern(function(x, y) {
      return p[N - 1 - x + y * N];
    });
  };
  const index = function index2(p) {
    let result = 0;
    let power = 1;
    for (let i = 0; i < p.length; i++) {
      result += p[p.length - 1 - i] * power;
      power *= C;
    }
    return result;
  };
  const patternFromIndex = function patternFromIndex2(ind) {
    let residue = ind;
    let power = W;
    const result = new Array(N * N);
    for (let i = 0; i < result.length; i++) {
      power /= C;
      let count = 0;
      while (residue >= power) {
        residue -= power;
        count++;
      }
      result[i] = count;
    }
    return result;
  };
  const weights = {};
  const weightsKeys = [];
  for (let y = 0; y < (periodicInput ? dataHeight : dataHeight - N + 1); y++) {
    for (let x = 0; x < (periodicInput ? dataWidth : dataWidth - N + 1); x++) {
      const ps = new Array(8);
      ps[0] = patternFromSample(x, y);
      ps[1] = reflect(ps[0]);
      ps[2] = rotate(ps[0]);
      ps[3] = reflect(ps[2]);
      ps[4] = rotate(ps[2]);
      ps[5] = reflect(ps[4]);
      ps[6] = rotate(ps[4]);
      ps[7] = reflect(ps[6]);
      for (let k = 0; k < symmetry; k++) {
        const ind = index(ps[k]);
        if (!!weights[ind]) {
          weights[ind]++;
        } else {
          weightsKeys.push(ind);
          weights[ind] = 1;
        }
      }
    }
  }
  this.T = weightsKeys.length;
  this.ground = (ground + this.T) % this.T;
  this.patterns = new Array(this.T);
  this.weights = new Array(this.T);
  for (let i = 0; i < this.T; i++) {
    const w = parseInt(weightsKeys[i], 10);
    this.patterns[i] = patternFromIndex(w);
    this.weights[i] = weights[w];
  }
  const agrees = function agrees2(p1, p2, dx, dy) {
    const xmin = dx < 0 ? 0 : dx;
    const xmax = dx < 0 ? dx + N : N;
    const ymin = dy < 0 ? 0 : dy;
    const ymax = dy < 0 ? dy + N : N;
    for (let y = ymin; y < ymax; y++) {
      for (let x = xmin; x < xmax; x++) {
        if (p1[x + N * y] != p2[x - dx + N * (y - dy)]) {
          return false;
        }
      }
    }
    return true;
  };
  this.propagator = new Array(4);
  for (let d = 0; d < 4; d++) {
    this.propagator[d] = new Array(this.T);
    for (let t = 0; t < this.T; t++) {
      const list = [];
      for (let t2 = 0; t2 < this.T; t2++) {
        if (agrees(this.patterns[t], this.patterns[t2], this.DX[d], this.DY[d])) {
          list.push(t2);
        }
      }
      this.propagator[d][t] = list;
    }
  }
};
OverlappingModel.prototype = Object.create(model.prototype);
OverlappingModel.prototype.constructor = OverlappingModel;
OverlappingModel.prototype.onBoundary = function(x, y) {
  return !this.periodic && (x + this.N > this.FMX || y + this.N > this.FMY || x < 0 || y < 0);
};
OverlappingModel.prototype.clear = function() {
  model.prototype.clear.call(this);
  if (this.ground !== 0) {
    for (let x = 0; x < this.FMX; x++) {
      for (let t = 0; t < this.T; t++) {
        if (t !== this.ground) {
          this.ban(x + (this.FMY - 1) * this.FMX, t);
        }
      }
      for (let y = 0; y < this.FMY - 1; y++) {
        this.ban(x + y * this.FMX, this.ground);
      }
    }
    this.propagate();
  }
};
OverlappingModel.prototype.graphics = function(array) {
  array = array || new Uint8Array(this.FMXxFMY * 4);
  if (this.isGenerationComplete()) {
    this.graphicsComplete(array);
  } else {
    this.graphicsIncomplete(array);
  }
  return array;
};
OverlappingModel.prototype.graphicsComplete = function(array) {
  for (let y = 0; y < this.FMY; y++) {
    const dy = y < this.FMY - this.N + 1 ? 0 : this.N - 1;
    for (let x = 0; x < this.FMX; x++) {
      const dx = x < this.FMX - this.N + 1 ? 0 : this.N - 1;
      const pixelIndex = (y * this.FMX + x) * 4;
      const color = this.colors[this.patterns[this.observed[x - dx + (y - dy) * this.FMX]][dx + dy * this.N]];
      array[pixelIndex] = color[0];
      array[pixelIndex + 1] = color[1];
      array[pixelIndex + 2] = color[2];
      array[pixelIndex + 3] = color[3];
    }
  }
};
OverlappingModel.prototype.graphicsIncomplete = function(array) {
  for (let i = 0; i < this.FMXxFMY; i++) {
    const x = i % this.FMX;
    const y = i / this.FMX | 0;
    let contributors = 0;
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    for (let dy = 0; dy < this.N; dy++) {
      for (let dx = 0; dx < this.N; dx++) {
        let sx = x - dx;
        if (sx < 0)
          sx += this.FMX;
        let sy = y - dy;
        if (sy < 0)
          sy += this.FMY;
        if (this.onBoundary(sx, sy))
          continue;
        const s = sx + sy * this.FMX;
        for (let t = 0; t < this.T; t++) {
          if (this.wave[s][t]) {
            contributors++;
            const color = this.colors[this.patterns[t][dx + dy * this.N]];
            r += color[0];
            g += color[1];
            b += color[2];
            a += color[3];
          }
        }
      }
    }
    const pixelIndex = i * 4;
    array[pixelIndex] = r / contributors;
    array[pixelIndex + 1] = g / contributors;
    array[pixelIndex + 2] = b / contributors;
    array[pixelIndex + 3] = a / contributors;
  }
};
var overlappingModel = OverlappingModel;
const SimpleTiledModel = function SimpleTiledModel2(data, subsetName, width, height, periodic) {
  const tilesize = data.tilesize || 16;
  this.FMX = width;
  this.FMY = height;
  this.FMXxFMY = width * height;
  this.periodic = periodic;
  this.tilesize = tilesize;
  const unique = !!data.unique;
  let subset = null;
  if (subsetName && data.subsets && !!data.subsets[subsetName]) {
    subset = data.subsets[subsetName];
  }
  const tile = function tile2(f) {
    const result = new Array(tilesize * tilesize);
    for (let y = 0; y < tilesize; y++) {
      for (let x = 0; x < tilesize; x++) {
        result[x + y * tilesize] = f(x, y);
      }
    }
    return result;
  };
  const rotate = function rotate2(array) {
    return tile(function(x, y) {
      return array[tilesize - 1 - y + x * tilesize];
    });
  };
  const reflect = function reflect2(array) {
    return tile(function(x, y) {
      return array[tilesize - 1 - x + y * tilesize];
    });
  };
  this.tiles = [];
  const tempStationary = [];
  const action = [];
  const firstOccurrence = {};
  let funcA;
  let funcB;
  let cardinality;
  for (let i = 0; i < data.tiles.length; i++) {
    const currentTile = data.tiles[i];
    if (subset !== null && subset.indexOf(currentTile.name) === -1) {
      continue;
    }
    switch (currentTile.symmetry) {
      case "L":
        cardinality = 4;
        funcA = function(i2) {
          return (i2 + 1) % 4;
        };
        funcB = function(i2) {
          return i2 % 2 === 0 ? i2 + 1 : i2 - 1;
        };
        break;
      case "T":
        cardinality = 4;
        funcA = function(i2) {
          return (i2 + 1) % 4;
        };
        funcB = function(i2) {
          return i2 % 2 === 0 ? i2 : 4 - i2;
        };
        break;
      case "I":
        cardinality = 2;
        funcA = function(i2) {
          return 1 - i2;
        };
        funcB = function(i2) {
          return i2;
        };
        break;
      case "\\":
        cardinality = 2;
        funcA = function(i2) {
          return 1 - i2;
        };
        funcB = function(i2) {
          return 1 - i2;
        };
        break;
      case "F":
        cardinality = 8;
        funcA = function(i2) {
          return i2 < 4 ? (i2 + 1) % 4 : 4 + (i2 - 1) % 4;
        };
        funcB = function(i2) {
          return i2 < 4 ? i2 + 4 : i2 - 4;
        };
        break;
      default:
        cardinality = 1;
        funcA = function(i2) {
          return i2;
        };
        funcB = function(i2) {
          return i2;
        };
        break;
    }
    this.T = action.length;
    firstOccurrence[currentTile.name] = this.T;
    for (let t = 0; t < cardinality; t++) {
      action.push([
        this.T + t,
        this.T + funcA(t),
        this.T + funcA(funcA(t)),
        this.T + funcA(funcA(funcA(t))),
        this.T + funcB(t),
        this.T + funcB(funcA(t)),
        this.T + funcB(funcA(funcA(t))),
        this.T + funcB(funcA(funcA(funcA(t))))
      ]);
    }
    let bitmap;
    if (unique) {
      for (let t = 0; t < cardinality; t++) {
        bitmap = currentTile.bitmap[t];
        this.tiles.push(tile(function(x, y) {
          return [
            bitmap[(tilesize * y + x) * 4],
            bitmap[(tilesize * y + x) * 4 + 1],
            bitmap[(tilesize * y + x) * 4 + 2],
            bitmap[(tilesize * y + x) * 4 + 3]
          ];
        }));
      }
    } else {
      bitmap = currentTile.bitmap;
      this.tiles.push(tile(function(x, y) {
        return [
          bitmap[(tilesize * y + x) * 4],
          bitmap[(tilesize * y + x) * 4 + 1],
          bitmap[(tilesize * y + x) * 4 + 2],
          bitmap[(tilesize * y + x) * 4 + 3]
        ];
      }));
      for (let t = 1; t < cardinality; t++) {
        this.tiles.push(t < 4 ? rotate(this.tiles[this.T + t - 1]) : reflect(this.tiles[this.T + t - 4]));
      }
    }
    for (let t = 0; t < cardinality; t++) {
      tempStationary.push(currentTile.weight || 1);
    }
  }
  this.T = action.length;
  this.weights = tempStationary;
  this.propagator = new Array(4);
  const tempPropagator = new Array(4);
  for (let i = 0; i < 4; i++) {
    this.propagator[i] = new Array(this.T);
    tempPropagator[i] = new Array(this.T);
    for (let t = 0; t < this.T; t++) {
      tempPropagator[i][t] = new Array(this.T);
      for (let t2 = 0; t2 < this.T; t2++) {
        tempPropagator[i][t][t2] = false;
      }
    }
  }
  for (let i = 0; i < data.neighbors.length; i++) {
    const neighbor = data.neighbors[i];
    const left = neighbor.left.split(" ").filter(function(v) {
      return v.length;
    });
    const right = neighbor.right.split(" ").filter(function(v) {
      return v.length;
    });
    if (subset !== null && (subset.indexOf(left[0]) === -1 || subset.indexOf(right[0]) === -1)) {
      continue;
    }
    const L = action[firstOccurrence[left[0]]][left.length == 1 ? 0 : parseInt(left[1], 10)];
    const D = action[L][1];
    const R = action[firstOccurrence[right[0]]][right.length == 1 ? 0 : parseInt(right[1], 10)];
    const U = action[R][1];
    tempPropagator[0][R][L] = true;
    tempPropagator[0][action[R][6]][action[L][6]] = true;
    tempPropagator[0][action[L][4]][action[R][4]] = true;
    tempPropagator[0][action[L][2]][action[R][2]] = true;
    tempPropagator[1][U][D] = true;
    tempPropagator[1][action[D][6]][action[U][6]] = true;
    tempPropagator[1][action[U][4]][action[D][4]] = true;
    tempPropagator[1][action[D][2]][action[U][2]] = true;
  }
  for (let t = 0; t < this.T; t++) {
    for (let t2 = 0; t2 < this.T; t2++) {
      tempPropagator[2][t][t2] = tempPropagator[0][t2][t];
      tempPropagator[3][t][t2] = tempPropagator[1][t2][t];
    }
  }
  for (let d = 0; d < 4; d++) {
    for (let t1 = 0; t1 < this.T; t1++) {
      const sp = [];
      const tp = tempPropagator[d][t1];
      for (let t2 = 0; t2 < this.T; t2++) {
        if (tp[t2]) {
          sp.push(t2);
        }
      }
      this.propagator[d][t1] = sp;
    }
  }
};
SimpleTiledModel.prototype = Object.create(model.prototype);
SimpleTiledModel.prototype.constructor = SimpleTiledModel;
SimpleTiledModel.prototype.onBoundary = function(x, y) {
  return !this.periodic && (x < 0 || y < 0 || x >= this.FMX || y >= this.FMY);
};
SimpleTiledModel.prototype.graphics = function(array, defaultColor) {
  array = array || new Uint8Array(this.FMXxFMY * this.tilesize * this.tilesize * 4);
  if (this.isGenerationComplete()) {
    this.graphicsComplete(array);
  } else {
    this.graphicsIncomplete(array, defaultColor);
  }
  return array;
};
SimpleTiledModel.prototype.graphicsComplete = function(array) {
  for (let x = 0; x < this.FMX; x++) {
    for (let y = 0; y < this.FMY; y++) {
      const tile = this.tiles[this.observed[x + y * this.FMX]];
      for (let yt = 0; yt < this.tilesize; yt++) {
        for (let xt = 0; xt < this.tilesize; xt++) {
          const pixelIndex = (x * this.tilesize + xt + (y * this.tilesize + yt) * this.FMX * this.tilesize) * 4;
          const color = tile[xt + yt * this.tilesize];
          array[pixelIndex] = color[0];
          array[pixelIndex + 1] = color[1];
          array[pixelIndex + 2] = color[2];
          array[pixelIndex + 3] = color[3];
        }
      }
    }
  }
};
SimpleTiledModel.prototype.graphicsIncomplete = function(array, defaultColor) {
  if (!defaultColor || defaultColor.length !== 4) {
    defaultColor = false;
  }
  for (let x = 0; x < this.FMX; x++) {
    for (let y = 0; y < this.FMY; y++) {
      const w = this.wave[x + y * this.FMX];
      let amount = 0;
      let sumWeights = 0;
      for (let t = 0; t < this.T; t++) {
        if (w[t]) {
          amount++;
          sumWeights += this.weights[t];
        }
      }
      const lambda = 1 / sumWeights;
      for (let yt = 0; yt < this.tilesize; yt++) {
        for (let xt = 0; xt < this.tilesize; xt++) {
          const pixelIndex = (x * this.tilesize + xt + (y * this.tilesize + yt) * this.FMX * this.tilesize) * 4;
          if (defaultColor && amount === this.T) {
            array[pixelIndex] = defaultColor[0];
            array[pixelIndex + 1] = defaultColor[1];
            array[pixelIndex + 2] = defaultColor[2];
            array[pixelIndex + 3] = defaultColor[3];
          } else {
            let r = 0;
            let g = 0;
            let b = 0;
            let a = 0;
            for (let t = 0; t < this.T; t++) {
              if (w[t]) {
                const c = this.tiles[t][xt + yt * this.tilesize];
                const weight = this.weights[t] * lambda;
                r += c[0] * weight;
                g += c[1] * weight;
                b += c[2] * weight;
                a += c[3] * weight;
              }
            }
            array[pixelIndex] = r;
            array[pixelIndex + 1] = g;
            array[pixelIndex + 2] = b;
            array[pixelIndex + 3] = a;
          }
        }
      }
    }
  }
};
var simpleTiledModel = SimpleTiledModel;
var wavefunctioncollapse = {
  OverlappingModel: overlappingModel,
  SimpleTiledModel: simpleTiledModel
};
var OverlappingModel$1 = wavefunctioncollapse.OverlappingModel;
export default wavefunctioncollapse;
export {OverlappingModel$1 as OverlappingModel, wavefunctioncollapse as __moduleExports};
