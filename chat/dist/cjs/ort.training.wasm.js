/*!
 * ONNX Runtime Web v1.18.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// common/dist/esm/backend-impl.js
var backends, backendsSortedByPriority, registerBackend, resolveBackend;
var init_backend_impl = __esm({
  "common/dist/esm/backend-impl.js"() {
    "use strict";
    backends = /* @__PURE__ */ new Map();
    backendsSortedByPriority = [];
    registerBackend = (name, backend, priority) => {
      if (backend && typeof backend.init === "function" && typeof backend.createInferenceSessionHandler === "function") {
        const currentBackend = backends.get(name);
        if (currentBackend === void 0) {
          backends.set(name, { backend, priority });
        } else if (currentBackend.priority > priority) {
          return;
        } else if (currentBackend.priority === priority) {
          if (currentBackend.backend !== backend) {
            throw new Error(`cannot register backend "${name}" using priority ${priority}`);
          }
        }
        if (priority >= 0) {
          const i = backendsSortedByPriority.indexOf(name);
          if (i !== -1) {
            backendsSortedByPriority.splice(i, 1);
          }
          for (let i2 = 0; i2 < backendsSortedByPriority.length; i2++) {
            if (backends.get(backendsSortedByPriority[i2]).priority <= priority) {
              backendsSortedByPriority.splice(i2, 0, name);
              return;
            }
          }
          backendsSortedByPriority.push(name);
        }
        return;
      }
      throw new TypeError("not a valid backend");
    };
    resolveBackend = async (backendHints) => {
      const backendNames = backendHints.length === 0 ? backendsSortedByPriority : backendHints;
      const errors = [];
      for (const backendName of backendNames) {
        const backendInfo = backends.get(backendName);
        if (backendInfo) {
          if (backendInfo.initialized) {
            return backendInfo.backend;
          } else if (backendInfo.aborted) {
            continue;
          }
          const isInitializing = !!backendInfo.initPromise;
          try {
            if (!isInitializing) {
              backendInfo.initPromise = backendInfo.backend.init(backendName);
            }
            await backendInfo.initPromise;
            backendInfo.initialized = true;
            return backendInfo.backend;
          } catch (e) {
            if (!isInitializing) {
              errors.push({ name: backendName, err: e });
            }
            backendInfo.aborted = true;
          } finally {
            delete backendInfo.initPromise;
          }
        }
      }
      throw new Error(`no available backend found. ERR: ${errors.map((e) => `[${e.name}] ${e.err}`).join(", ")}`);
    };
  }
});

// common/dist/esm/backend.js
var init_backend = __esm({
  "common/dist/esm/backend.js"() {
    "use strict";
    init_backend_impl();
  }
});

// common/dist/esm/version.js
var version;
var init_version = __esm({
  "common/dist/esm/version.js"() {
    "use strict";
    version = "1.18.0";
  }
});

// common/dist/esm/env-impl.js
var logLevelValue, env;
var init_env_impl = __esm({
  "common/dist/esm/env-impl.js"() {
    "use strict";
    init_version();
    logLevelValue = "warning";
    env = {
      wasm: {},
      webgl: {},
      webgpu: {},
      versions: { common: version },
      set logLevel(value) {
        if (value === void 0) {
          return;
        }
        if (typeof value !== "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(value) === -1) {
          throw new Error(`Unsupported logging level: ${value}`);
        }
        logLevelValue = value;
      },
      get logLevel() {
        return logLevelValue;
      }
    };
    Object.defineProperty(env, "logLevel", { enumerable: true });
  }
});

// common/dist/esm/env.js
var env2;
var init_env = __esm({
  "common/dist/esm/env.js"() {
    "use strict";
    init_env_impl();
    env2 = env;
  }
});

// common/dist/esm/tensor-conversion-impl.js
var tensorToDataURL, tensorToImageData;
var init_tensor_conversion_impl = __esm({
  "common/dist/esm/tensor-conversion-impl.js"() {
    "use strict";
    tensorToDataURL = (tensor, options) => {
      const canvas = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
      canvas.width = tensor.dims[3];
      canvas.height = tensor.dims[2];
      const pixels2DContext = canvas.getContext("2d");
      if (pixels2DContext != null) {
        let width;
        let height;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
        }
        const inputformat = options?.format !== void 0 ? options.format : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 0];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            const R = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
            const G = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
            const B = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
            const A = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
            pixels2DContext.fillStyle = "rgba(" + R + "," + G + "," + B + "," + A + ")";
            pixels2DContext.fillRect(j, i, 1, 1);
          }
        }
        if ("toDataURL" in canvas) {
          return canvas.toDataURL();
        } else {
          throw new Error("toDataURL is not supported");
        }
      } else {
        throw new Error("Can not access image data");
      }
    };
    tensorToImageData = (tensor, options) => {
      const pixels2DContext = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d");
      let image;
      if (pixels2DContext != null) {
        let width;
        let height;
        let channels;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[1];
          channels = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
          channels = tensor.dims[1];
        }
        const inputformat = options !== void 0 ? options.format !== void 0 ? options.format : "RGB" : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 255];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        if (options !== void 0) {
          if (options.format !== void 0 && (channels === 4 && options.format !== "RGBA") || channels === 3 && (options.format !== "RGB" && options.format !== "BGR")) {
            throw new Error("Tensor format doesn't match input tensor dims");
          }
        }
        const step = 4;
        let rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        image = pixels2DContext.createImageData(width, height);
        for (let i = 0; i < height * width; rImagePointer += step, gImagePointer += step, bImagePointer += step, aImagePointer += step, i++) {
          image.data[rImagePointer] = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
          image.data[gImagePointer] = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
          image.data[bImagePointer] = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
          image.data[aImagePointer] = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
        }
      } else {
        throw new Error("Can not access image data");
      }
      return image;
    };
  }
});

// common/dist/esm/tensor-factory-impl.js
var bufferToTensor, tensorFromImage, tensorFromTexture, tensorFromGpuBuffer, tensorFromPinnedBuffer;
var init_tensor_factory_impl = __esm({
  "common/dist/esm/tensor-factory-impl.js"() {
    "use strict";
    init_tensor_impl();
    bufferToTensor = (buffer, options) => {
      if (buffer === void 0) {
        throw new Error("Image buffer must be defined");
      }
      if (options.height === void 0 || options.width === void 0) {
        throw new Error("Image height and width must be defined");
      }
      if (options.tensorLayout === "NHWC") {
        throw new Error("NHWC Tensor layout is not supported yet");
      }
      const { height, width } = options;
      const norm = options.norm ?? { mean: 255, bias: 0 };
      let normMean;
      let normBias;
      if (typeof norm.mean === "number") {
        normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
      } else {
        normMean = [norm.mean[0], norm.mean[1], norm.mean[2], norm.mean[3] ?? 255];
      }
      if (typeof norm.bias === "number") {
        normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
      } else {
        normBias = [norm.bias[0], norm.bias[1], norm.bias[2], norm.bias[3] ?? 0];
      }
      const inputformat = options.format !== void 0 ? options.format : "RGBA";
      const outputformat = options.tensorFormat !== void 0 ? options.tensorFormat !== void 0 ? options.tensorFormat : "RGB" : "RGB";
      const stride = height * width;
      const float32Data = outputformat === "RGBA" ? new Float32Array(stride * 4) : new Float32Array(stride * 3);
      let step = 4, rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
      let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
      if (inputformat === "RGB") {
        step = 3;
        rImagePointer = 0;
        gImagePointer = 1;
        bImagePointer = 2;
        aImagePointer = -1;
      }
      if (outputformat === "RGBA") {
        aTensorPointer = stride * 3;
      } else if (outputformat === "RBG") {
        rTensorPointer = 0;
        bTensorPointer = stride;
        gTensorPointer = stride * 2;
      } else if (outputformat === "BGR") {
        bTensorPointer = 0;
        gTensorPointer = stride;
        rTensorPointer = stride * 2;
      }
      for (let i = 0; i < stride; i++, rImagePointer += step, bImagePointer += step, gImagePointer += step, aImagePointer += step) {
        float32Data[rTensorPointer++] = (buffer[rImagePointer] + normBias[0]) / normMean[0];
        float32Data[gTensorPointer++] = (buffer[gImagePointer] + normBias[1]) / normMean[1];
        float32Data[bTensorPointer++] = (buffer[bImagePointer] + normBias[2]) / normMean[2];
        if (aTensorPointer !== -1 && aImagePointer !== -1) {
          float32Data[aTensorPointer++] = (buffer[aImagePointer] + normBias[3]) / normMean[3];
        }
      }
      const outputTensor = outputformat === "RGBA" ? new Tensor("float32", float32Data, [1, 4, height, width]) : new Tensor("float32", float32Data, [1, 3, height, width]);
      return outputTensor;
    };
    tensorFromImage = async (image, options) => {
      const isHTMLImageEle = typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement;
      const isImageDataEle = typeof ImageData !== "undefined" && image instanceof ImageData;
      const isImageBitmap = typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap;
      const isString = typeof image === "string";
      let data;
      let bufferToTensorOptions = options ?? {};
      const createCanvas = () => {
        if (typeof document !== "undefined") {
          return document.createElement("canvas");
        } else if (typeof OffscreenCanvas !== "undefined") {
          return new OffscreenCanvas(1, 1);
        } else {
          throw new Error("Canvas is not supported");
        }
      };
      const createCanvasContext = (canvas) => {
        if (canvas instanceof HTMLCanvasElement) {
          return canvas.getContext("2d");
        } else if (canvas instanceof OffscreenCanvas) {
          return canvas.getContext("2d");
        } else {
          return null;
        }
      };
      if (isHTMLImageEle) {
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          let height = image.height;
          let width = image.width;
          if (options !== void 0 && options.resizedHeight !== void 0 && options.resizedWidth !== void 0) {
            height = options.resizedHeight;
            width = options.resizedWidth;
          }
          if (options !== void 0) {
            bufferToTensorOptions = options;
            if (options.tensorFormat !== void 0) {
              throw new Error("Image input config format must be RGBA for HTMLImageElement");
            } else {
              bufferToTensorOptions.tensorFormat = "RGBA";
            }
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          } else {
            bufferToTensorOptions.tensorFormat = "RGBA";
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          }
          pixels2DContext.drawImage(image, 0, 0);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isImageDataEle) {
        let height;
        let width;
        if (options !== void 0 && options.resizedWidth !== void 0 && options.resizedHeight !== void 0) {
          height = options.resizedHeight;
          width = options.resizedWidth;
        } else {
          height = image.height;
          width = image.width;
        }
        if (options !== void 0) {
          bufferToTensorOptions = options;
        }
        bufferToTensorOptions.format = "RGBA";
        bufferToTensorOptions.height = height;
        bufferToTensorOptions.width = width;
        if (options !== void 0) {
          const tempCanvas = createCanvas();
          tempCanvas.width = width;
          tempCanvas.height = height;
          const pixels2DContext = createCanvasContext(tempCanvas);
          if (pixels2DContext != null) {
            pixels2DContext.putImageData(image, 0, 0);
            data = pixels2DContext.getImageData(0, 0, width, height).data;
          } else {
            throw new Error("Can not access image data");
          }
        } else {
          data = image.data;
        }
      } else if (isImageBitmap) {
        if (options === void 0) {
          throw new Error("Please provide image config with format for Imagebitmap");
        }
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          const height = image.height;
          const width = image.width;
          pixels2DContext.drawImage(image, 0, 0, width, height);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
          bufferToTensorOptions.height = height;
          bufferToTensorOptions.width = width;
          return bufferToTensor(data, bufferToTensorOptions);
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isString) {
        return new Promise((resolve, reject) => {
          const canvas = createCanvas();
          const context = createCanvasContext(canvas);
          if (!image || !context) {
            return reject();
          }
          const newImage = new Image();
          newImage.crossOrigin = "Anonymous";
          newImage.src = image;
          newImage.onload = () => {
            canvas.width = newImage.width;
            canvas.height = newImage.height;
            context.drawImage(newImage, 0, 0, canvas.width, canvas.height);
            const img = context.getImageData(0, 0, canvas.width, canvas.height);
            bufferToTensorOptions.height = canvas.height;
            bufferToTensorOptions.width = canvas.width;
            resolve(bufferToTensor(img.data, bufferToTensorOptions));
          };
        });
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
      if (data !== void 0) {
        return bufferToTensor(data, bufferToTensorOptions);
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
    };
    tensorFromTexture = (texture, options) => {
      const { width, height, download, dispose } = options;
      const dims = [1, height, width, 4];
      return new Tensor({ location: "texture", type: "float32", texture, dims, download, dispose });
    };
    tensorFromGpuBuffer = (gpuBuffer, options) => {
      const { dataType, dims, download, dispose } = options;
      return new Tensor({ location: "gpu-buffer", type: dataType ?? "float32", gpuBuffer, dims, download, dispose });
    };
    tensorFromPinnedBuffer = (type, buffer, dims) => new Tensor({ location: "cpu-pinned", type, data: buffer, dims: dims ?? [buffer.length] });
  }
});

// common/dist/esm/tensor-impl-type-mapping.js
var NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP, NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, isBigIntChecked, checkBigInt;
var init_tensor_impl_type_mapping = __esm({
  "common/dist/esm/tensor-impl-type-mapping.js"() {
    "use strict";
    NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = /* @__PURE__ */ new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
      ["float16", Uint16Array],
      ["int16", Int16Array],
      ["int32", Int32Array],
      ["bool", Uint8Array],
      ["float64", Float64Array],
      ["uint32", Uint32Array]
    ]);
    NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP = /* @__PURE__ */ new Map([
      [Float32Array, "float32"],
      [Uint8Array, "uint8"],
      [Int8Array, "int8"],
      [Uint16Array, "uint16"],
      [Int16Array, "int16"],
      [Int32Array, "int32"],
      [Float64Array, "float64"],
      [Uint32Array, "uint32"]
    ]);
    isBigIntChecked = false;
    checkBigInt = () => {
      if (!isBigIntChecked) {
        isBigIntChecked = true;
        const isBigInt64ArrayAvailable = typeof BigInt64Array !== "undefined" && typeof BigInt64Array.from === "function";
        const isBigUint64ArrayAvailable = typeof BigUint64Array !== "undefined" && typeof BigUint64Array.from === "function";
        if (isBigInt64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("int64", BigInt64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, "int64");
        }
        if (isBigUint64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("uint64", BigUint64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, "uint64");
        }
      }
    };
  }
});

// common/dist/esm/tensor-utils-impl.js
var calculateSize, tensorReshape;
var init_tensor_utils_impl = __esm({
  "common/dist/esm/tensor-utils-impl.js"() {
    "use strict";
    init_tensor_impl();
    calculateSize = (dims) => {
      let size = 1;
      for (let i = 0; i < dims.length; i++) {
        const dim = dims[i];
        if (typeof dim !== "number" || !Number.isSafeInteger(dim)) {
          throw new TypeError(`dims[${i}] must be an integer, got: ${dim}`);
        }
        if (dim < 0) {
          throw new RangeError(`dims[${i}] must be a non-negative integer, got: ${dim}`);
        }
        size *= dim;
      }
      return size;
    };
    tensorReshape = (tensor, dims) => {
      switch (tensor.location) {
        case "cpu":
          return new Tensor(tensor.type, tensor.data, dims);
        case "cpu-pinned":
          return new Tensor({
            location: "cpu-pinned",
            data: tensor.data,
            type: tensor.type,
            dims
          });
        case "texture":
          return new Tensor({
            location: "texture",
            texture: tensor.texture,
            type: tensor.type,
            dims
          });
        case "gpu-buffer":
          return new Tensor({
            location: "gpu-buffer",
            gpuBuffer: tensor.gpuBuffer,
            type: tensor.type,
            dims
          });
        default:
          throw new Error(`tensorReshape: tensor location ${tensor.location} is not supported`);
      }
    };
  }
});

// common/dist/esm/tensor-impl.js
var Tensor;
var init_tensor_impl = __esm({
  "common/dist/esm/tensor-impl.js"() {
    "use strict";
    init_tensor_conversion_impl();
    init_tensor_factory_impl();
    init_tensor_impl_type_mapping();
    init_tensor_utils_impl();
    Tensor = class {
      /**
       * implementation.
       */
      constructor(arg0, arg1, arg2) {
        checkBigInt();
        let type;
        let dims;
        if (typeof arg0 === "object" && "location" in arg0) {
          this.dataLocation = arg0.location;
          type = arg0.type;
          dims = arg0.dims;
          switch (arg0.location) {
            case "cpu-pinned": {
              const expectedTypedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(type);
              if (!expectedTypedArrayConstructor) {
                throw new TypeError(`unsupported type "${type}" to create tensor from pinned buffer`);
              }
              if (!(arg0.data instanceof expectedTypedArrayConstructor)) {
                throw new TypeError(`buffer should be of type ${expectedTypedArrayConstructor.name}`);
              }
              this.cpuData = arg0.data;
              break;
            }
            case "texture": {
              if (type !== "float32") {
                throw new TypeError(`unsupported type "${type}" to create tensor from texture`);
              }
              this.gpuTextureData = arg0.texture;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            case "gpu-buffer": {
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "bool") {
                throw new TypeError(`unsupported type "${type}" to create tensor from gpu buffer`);
              }
              this.gpuBufferData = arg0.gpuBuffer;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
        } else {
          let data;
          let maybeDims;
          if (typeof arg0 === "string") {
            type = arg0;
            maybeDims = arg2;
            if (arg0 === "string") {
              if (!Array.isArray(arg1)) {
                throw new TypeError("A string tensor's data must be a string array.");
              }
              data = arg1;
            } else {
              const typedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(arg0);
              if (typedArrayConstructor === void 0) {
                throw new TypeError(`Unsupported tensor type: ${arg0}.`);
              }
              if (Array.isArray(arg1)) {
                if (arg0 === "float16") {
                  throw new TypeError("Creating a float16 tensor from number array is not supported. Please use Uint16Array as data.");
                } else if (arg0 === "uint64" || arg0 === "int64") {
                  data = typedArrayConstructor.from(arg1, BigInt);
                } else {
                  data = typedArrayConstructor.from(arg1);
                }
              } else if (arg1 instanceof typedArrayConstructor) {
                data = arg1;
              } else {
                throw new TypeError(`A ${type} tensor's data must be type of ${typedArrayConstructor}`);
              }
            }
          } else {
            maybeDims = arg1;
            if (Array.isArray(arg0)) {
              if (arg0.length === 0) {
                throw new TypeError("Tensor type cannot be inferred from an empty array.");
              }
              const firstElementType = typeof arg0[0];
              if (firstElementType === "string") {
                type = "string";
                data = arg0;
              } else if (firstElementType === "boolean") {
                type = "bool";
                data = Uint8Array.from(arg0);
              } else {
                throw new TypeError(`Invalid element type of data array: ${firstElementType}.`);
              }
            } else {
              const mappedType = NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.get(arg0.constructor);
              if (mappedType === void 0) {
                throw new TypeError(`Unsupported type for tensor data: ${arg0.constructor}.`);
              }
              type = mappedType;
              data = arg0;
            }
          }
          if (maybeDims === void 0) {
            maybeDims = [data.length];
          } else if (!Array.isArray(maybeDims)) {
            throw new TypeError("A tensor's dims must be a number array");
          }
          dims = maybeDims;
          this.cpuData = data;
          this.dataLocation = "cpu";
        }
        const size = calculateSize(dims);
        if (this.cpuData && size !== this.cpuData.length) {
          throw new Error(`Tensor's size(${size}) does not match data length(${this.cpuData.length}).`);
        }
        this.type = type;
        this.dims = dims;
        this.size = size;
      }
      // #endregion
      // #region factory
      static async fromImage(image, options) {
        return tensorFromImage(image, options);
      }
      static fromTexture(texture, options) {
        return tensorFromTexture(texture, options);
      }
      static fromGpuBuffer(gpuBuffer, options) {
        return tensorFromGpuBuffer(gpuBuffer, options);
      }
      static fromPinnedBuffer(type, buffer, dims) {
        return tensorFromPinnedBuffer(type, buffer, dims);
      }
      // #endregion
      // #region conversions
      toDataURL(options) {
        return tensorToDataURL(this, options);
      }
      toImageData(options) {
        return tensorToImageData(this, options);
      }
      // #endregion
      // #region properties
      get data() {
        this.ensureValid();
        if (!this.cpuData) {
          throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
        }
        return this.cpuData;
      }
      get location() {
        return this.dataLocation;
      }
      get texture() {
        this.ensureValid();
        if (!this.gpuTextureData) {
          throw new Error("The data is not stored as a WebGL texture.");
        }
        return this.gpuTextureData;
      }
      get gpuBuffer() {
        this.ensureValid();
        if (!this.gpuBufferData) {
          throw new Error("The data is not stored as a WebGPU buffer.");
        }
        return this.gpuBufferData;
      }
      // #endregion
      // #region methods
      async getData(releaseData) {
        this.ensureValid();
        switch (this.dataLocation) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer": {
            if (!this.downloader) {
              throw new Error("The current tensor is not created with a specified data downloader.");
            }
            if (this.isDownloading) {
              throw new Error("The current tensor is being downloaded.");
            }
            try {
              this.isDownloading = true;
              const data = await this.downloader();
              this.downloader = void 0;
              this.dataLocation = "cpu";
              this.cpuData = data;
              if (releaseData && this.disposer) {
                this.disposer();
                this.disposer = void 0;
              }
              return data;
            } finally {
              this.isDownloading = false;
            }
          }
          default:
            throw new Error(`cannot get data from location: ${this.dataLocation}`);
        }
      }
      dispose() {
        if (this.isDownloading) {
          throw new Error("The current tensor is being downloaded.");
        }
        if (this.disposer) {
          this.disposer();
          this.disposer = void 0;
        }
        this.cpuData = void 0;
        this.gpuTextureData = void 0;
        this.gpuBufferData = void 0;
        this.downloader = void 0;
        this.isDownloading = void 0;
        this.dataLocation = "none";
      }
      // #endregion
      // #region tensor utilities
      ensureValid() {
        if (this.dataLocation === "none") {
          throw new Error("The tensor is disposed.");
        }
      }
      reshape(dims) {
        this.ensureValid();
        if (this.downloader || this.disposer) {
          throw new Error("Cannot reshape a tensor that owns GPU resource.");
        }
        return tensorReshape(this, dims);
      }
    };
  }
});

// common/dist/esm/tensor.js
var Tensor2;
var init_tensor = __esm({
  "common/dist/esm/tensor.js"() {
    "use strict";
    init_tensor_impl();
    Tensor2 = Tensor;
  }
});

// common/dist/esm/trace.js
var TRACE, TRACE_FUNC, TRACE_FUNC_BEGIN, TRACE_FUNC_END;
var init_trace = __esm({
  "common/dist/esm/trace.js"() {
    "use strict";
    init_env_impl();
    TRACE = (deviceType, label) => {
      if (!env.wasm.trace) {
        return;
      }
      console.timeStamp(`${deviceType}::ORT::${label}`);
    };
    TRACE_FUNC = (msg, extraMsg) => {
      const stack = new Error().stack?.split(/\r\n|\r|\n/g) || [];
      let hasTraceFunc = false;
      for (let i = 0; i < stack.length; i++) {
        if (hasTraceFunc && !stack[i].includes("TRACE_FUNC")) {
          let label = `FUNC_${msg}::${stack[i].trim().split(" ")[1]}`;
          if (extraMsg) {
            label += `::${extraMsg}`;
          }
          TRACE("CPU", label);
          return;
        }
        if (stack[i].includes("TRACE_FUNC")) {
          hasTraceFunc = true;
        }
      }
    };
    TRACE_FUNC_BEGIN = (extraMsg) => {
      if (!env.wasm.trace) {
        return;
      }
      TRACE_FUNC("BEGIN", extraMsg);
    };
    TRACE_FUNC_END = (extraMsg) => {
      if (!env.wasm.trace) {
        return;
      }
      TRACE_FUNC("END", extraMsg);
    };
  }
});

// common/dist/esm/inference-session-impl.js
var InferenceSession;
var init_inference_session_impl = __esm({
  "common/dist/esm/inference-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    init_trace();
    InferenceSession = class _InferenceSession {
      constructor(handler) {
        this.handler = handler;
      }
      async run(feeds, arg1, arg2) {
        TRACE_FUNC_BEGIN();
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (this.outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of this.outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of this.inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of this.outputNames) {
            fetches[name] = null;
          }
        }
        const results = await this.handler.run(feeds, fetches, options);
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        TRACE_FUNC_END();
        return returnValue;
      }
      async release() {
        return this.handler.dispose();
      }
      static async create(arg0, arg1, arg2, arg3) {
        TRACE_FUNC_BEGIN();
        let filePathOrUint8Array;
        let options = {};
        if (typeof arg0 === "string") {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof Uint8Array) {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && arg0 instanceof SharedArrayBuffer) {
          const buffer = arg0;
          let byteOffset = 0;
          let byteLength = arg0.byteLength;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 === "number") {
            byteOffset = arg1;
            if (!Number.isSafeInteger(byteOffset)) {
              throw new RangeError("'byteOffset' must be an integer.");
            }
            if (byteOffset < 0 || byteOffset >= buffer.byteLength) {
              throw new RangeError(`'byteOffset' is out of range [0, ${buffer.byteLength}).`);
            }
            byteLength = arg0.byteLength - byteOffset;
            if (typeof arg2 === "number") {
              byteLength = arg2;
              if (!Number.isSafeInteger(byteLength)) {
                throw new RangeError("'byteLength' must be an integer.");
              }
              if (byteLength <= 0 || byteOffset + byteLength > buffer.byteLength) {
                throw new RangeError(`'byteLength' is out of range (0, ${buffer.byteLength - byteOffset}].`);
              }
              if (typeof arg3 === "object" && arg3 !== null) {
                options = arg3;
              } else if (typeof arg3 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'byteLength' must be a number.");
            }
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
          filePathOrUint8Array = new Uint8Array(buffer, byteOffset, byteLength);
        } else {
          throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
        }
        const eps = options.executionProviders || [];
        const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
        const backend = await resolveBackend(backendHints);
        const handler = await backend.createInferenceSessionHandler(filePathOrUint8Array, options);
        TRACE_FUNC_END();
        return new _InferenceSession(handler);
      }
      startProfiling() {
        this.handler.startProfiling();
      }
      endProfiling() {
        this.handler.endProfiling();
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
    };
  }
});

// common/dist/esm/inference-session.js
var InferenceSession2;
var init_inference_session = __esm({
  "common/dist/esm/inference-session.js"() {
    "use strict";
    init_inference_session_impl();
    InferenceSession2 = InferenceSession;
  }
});

// common/dist/esm/onnx-value.js
var init_onnx_value = __esm({
  "common/dist/esm/onnx-value.js"() {
    "use strict";
  }
});

// common/dist/esm/training-session-impl.js
var noBackendErrMsg, TrainingSession;
var init_training_session_impl = __esm({
  "common/dist/esm/training-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    noBackendErrMsg = "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files.";
    TrainingSession = class _TrainingSession {
      constructor(handler, hasOptimizerModel, hasEvalModel) {
        this.handler = handler;
        this.hasOptimizerModel = hasOptimizerModel;
        this.hasEvalModel = hasEvalModel;
      }
      get trainingInputNames() {
        return this.handler.inputNames;
      }
      get trainingOutputNames() {
        return this.handler.outputNames;
      }
      get evalInputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalInputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      get evalOutputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalOutputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      static async create(trainingOptions, sessionOptions) {
        const evalModel = trainingOptions.evalModel || "";
        const optimizerModel = trainingOptions.optimizerModel || "";
        const options = sessionOptions || {};
        const eps = options.executionProviders || [];
        const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
        const backend = await resolveBackend(backendHints);
        if (backend.createTrainingSessionHandler) {
          const handler = await backend.createTrainingSessionHandler(trainingOptions.checkpointState, trainingOptions.trainModel, evalModel, optimizerModel, options);
          return new _TrainingSession(handler, !!trainingOptions.optimizerModel, !!trainingOptions.evalModel);
        } else {
          throw new Error(noBackendErrMsg);
        }
      }
      /**
       * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
       * the given parameters to SessionHandler.FetchesType and RunOptions.
       *
       * @param inputNames the feeds object is checked that they contain all input names in the provided list of input
       * names.
       * @param outputNames the fetches object is checked that their keys match up with valid names in the list of output
       * names.
       * @param feeds the required input
       * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
       * @param arg2 optional RunOptions object.
       * @returns
       */
      typeNarrowingForRunStep(inputNames, outputNames, feeds, arg1, arg2) {
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of outputNames) {
            fetches[name] = null;
          }
        }
        return [fetches, options];
      }
      /**
       * Helper method for runTrainStep and any other runStep methods. Takes the ReturnType result from the SessionHandler
       * and changes it into a map of Tensors.
       *
       * @param results
       * @returns
       */
      convertHandlerReturnTypeToMapOfTensors(results) {
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        return returnValue;
      }
      async lazyResetGrad() {
        await this.handler.lazyResetGrad();
      }
      async runTrainStep(feeds, arg1, arg2) {
        const [fetches, options] = this.typeNarrowingForRunStep(this.trainingInputNames, this.trainingOutputNames, feeds, arg1, arg2);
        const results = await this.handler.runTrainStep(feeds, fetches, options);
        return this.convertHandlerReturnTypeToMapOfTensors(results);
      }
      async runOptimizerStep(options) {
        if (this.hasOptimizerModel) {
          await this.handler.runOptimizerStep(options || {});
        } else {
          throw new Error("This TrainingSession has no OptimizerModel loaded.");
        }
      }
      async runEvalStep(feeds, arg1, arg2) {
        if (this.hasEvalModel) {
          const [fetches, options] = this.typeNarrowingForRunStep(this.evalInputNames, this.evalOutputNames, feeds, arg1, arg2);
          const results = await this.handler.runEvalStep(feeds, fetches, options);
          return this.convertHandlerReturnTypeToMapOfTensors(results);
        } else {
          throw new Error("This TrainingSession has no EvalModel loaded.");
        }
      }
      async getParametersSize(trainableOnly = true) {
        return this.handler.getParametersSize(trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly = true) {
        const paramsSize = await this.getParametersSize(trainableOnly);
        if (array.length !== 4 * paramsSize) {
          throw new Error("Size of the buffer passed into loadParametersBuffer must match the number of parameters in the model. Please use getParametersSize method to check.");
        }
        return this.handler.loadParametersBuffer(array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly = true) {
        return this.handler.getContiguousParameters(trainableOnly);
      }
      async release() {
        return this.handler.dispose();
      }
    };
  }
});

// common/dist/esm/training-session.js
var TrainingSession2;
var init_training_session = __esm({
  "common/dist/esm/training-session.js"() {
    "use strict";
    init_training_session_impl();
    TrainingSession2 = TrainingSession;
  }
});

// common/dist/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  env: () => env2,
  registerBackend: () => registerBackend
});
var init_esm = __esm({
  "common/dist/esm/index.js"() {
    "use strict";
    init_backend();
    init_env();
    init_inference_session();
    init_tensor();
    init_trace();
    init_onnx_value();
    init_training_session();
  }
});

// nodejs-ignore:node:os
var cpus;
var init_node_os = __esm({
  "nodejs-ignore:node:os"() {
    cpus = void 0;
  }
});

// nodejs-ignore:node:path
var join;
var init_node_path = __esm({
  "nodejs-ignore:node:path"() {
    join = void 0;
  }
});

// nodejs-ignore:fs
var fs_exports = {};
__export(fs_exports, {
  createReadStream: () => createReadStream,
  readFile: () => readFile,
  readFileSync: () => readFileSync
});
var readFile, readFileSync, createReadStream;
var init_fs = __esm({
  "nodejs-ignore:fs"() {
    readFile = void 0;
    readFileSync = void 0;
    createReadStream = void 0;
  }
});

// nodejs-ignore:path
var path_exports = {};
__export(path_exports, {
  join: () => join2
});
var join2;
var init_path = __esm({
  "nodejs-ignore:path"() {
    join2 = void 0;
  }
});

// web/lib/wasm/binding/ort-training-wasm-simd.js
var require_ort_training_wasm_simd = __commonJS({
  "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module2) {
    "use strict";
    var ortWasm = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        var d = moduleArg, k, l;
        d.ready = new Promise((a, b) => {
          k = a;
          l = b;
        });
        var r = Object.assign({}, d), v = "./this.program", aa = "object" == typeof window, x = "function" == typeof importScripts, ba = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, y = "", A, B, C;
        if (ba) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), D = (init_path(), __toCommonJS(path_exports));
          y = x ? D.dirname(y) + "/" : __dirname + "/";
          A = (a, b) => {
            a = a.startsWith("file://") ? new URL(a) : D.normalize(a);
            return fs.readFileSync(a, b ? void 0 : "utf8");
          };
          C = (a) => {
            a = A(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          B = (a, b, c, f = true) => {
            a = a.startsWith("file://") ? new URL(a) : D.normalize(a);
            fs.readFile(a, f ? void 0 : "utf8", (g, h) => {
              g ? c(g) : b(f ? h.buffer : h);
            });
          };
          !d.thisProgram && 1 < process.argv.length && (v = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          d.inspect = () => "[Emscripten Module object]";
        } else if (aa || x)
          x ? y = self.location.href : "undefined" != typeof document && document.currentScript && (y = document.currentScript.src), _scriptDir && (y = _scriptDir), 0 !== y.indexOf("blob:") ? y = y.substr(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1) : y = "", A = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, x && (C = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), B = (a, b, c) => {
            var f = new XMLHttpRequest();
            f.open("GET", a, true);
            f.responseType = "arraybuffer";
            f.onload = () => {
              200 == f.status || 0 == f.status && f.response ? b(f.response) : c();
            };
            f.onerror = c;
            f.send(null);
          };
        var ca = d.print || console.log.bind(console), E = d.printErr || console.error.bind(console);
        Object.assign(d, r);
        r = null;
        d.thisProgram && (v = d.thisProgram);
        var F;
        d.wasmBinary && (F = d.wasmBinary);
        var noExitRuntime = d.noExitRuntime || true;
        "object" != typeof WebAssembly && G("no native wasm support detected");
        var H, I, da = false, J, K, L, M;
        function ea() {
          var a = H.buffer;
          d.HEAP8 = J = new Int8Array(a);
          d.HEAP16 = new Int16Array(a);
          d.HEAP32 = L = new Int32Array(a);
          d.HEAPU8 = K = new Uint8Array(a);
          d.HEAPU16 = new Uint16Array(a);
          d.HEAPU32 = M = new Uint32Array(a);
          d.HEAPF32 = new Float32Array(a);
          d.HEAPF64 = new Float64Array(a);
        }
        var fa = [], ha = [], ia = [];
        function ja() {
          var a = d.preRun.shift();
          fa.unshift(a);
        }
        var N = 0, O = null, P = null;
        function G(a) {
          if (d.onAbort)
            d.onAbort(a);
          a = "Aborted(" + a + ")";
          E(a);
          da = true;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          l(a);
          throw a;
        }
        function ka(a) {
          return a.startsWith("data:application/octet-stream;base64,");
        }
        var Q;
        Q = "ort-training-wasm-simd.wasm";
        if (!ka(Q)) {
          var la = Q;
          Q = d.locateFile ? d.locateFile(la, y) : y + la;
        }
        function ma(a) {
          if (a == Q && F)
            return new Uint8Array(F);
          if (C)
            return C(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function na(a) {
          if (!F && (aa || x)) {
            if ("function" == typeof fetch && !a.startsWith("file://"))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => ma(a));
            if (B)
              return new Promise((b, c) => {
                B(a, (f) => b(new Uint8Array(f)), c);
              });
          }
          return Promise.resolve().then(() => ma(a));
        }
        function oa(a, b, c) {
          return na(a).then((f) => WebAssembly.instantiate(f, b)).then((f) => f).then(c, (f) => {
            E("failed to asynchronously prepare wasm: " + f);
            G(f);
          });
        }
        function pa(a, b) {
          var c = Q;
          return F || "function" != typeof WebAssembly.instantiateStreaming || ka(c) || c.startsWith("file://") || ba || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((f) => WebAssembly.instantiateStreaming(f, a).then(b, function(g) {
            E("wasm streaming compile failed: " + g);
            E("falling back to ArrayBuffer instantiation");
            return oa(c, a, b);
          }));
        }
        var R, S = (a) => {
          for (; 0 < a.length; )
            a.shift()(d);
        };
        function qa(a) {
          this.Ha = a - 24;
          this.La = function(b) {
            M[this.Ha + 4 >> 2 >>> 0] = b;
          };
          this.Ka = function(b) {
            M[this.Ha + 8 >> 2 >>> 0] = b;
          };
          this.Ia = function(b, c) {
            this.Ja();
            this.La(b);
            this.Ka(c);
          };
          this.Ja = function() {
            M[this.Ha + 16 >> 2 >>> 0] = 0;
          };
        }
        var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {
          b >>>= 0;
          var f = b + c;
          for (c = b; a[c] && !(c >= f); )
            ++c;
          if (16 < c - b && a.buffer && ta)
            return ta.decode(a.subarray(b, c));
          for (f = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                f += String.fromCharCode((g & 31) << 6 | h);
              else {
                var m = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;
                65536 > g ? f += String.fromCharCode(g) : (g -= 65536, f += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              f += String.fromCharCode(g);
          }
          return f;
        }, T = (a, b) => (a >>>= 0) ? ua(K, a, b) : "", U = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var f = a.charCodeAt(c);
            127 >= f ? b++ : 2047 >= f ? b += 2 : 55296 <= f && 57343 >= f ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, V = (a, b, c, f) => {
          c >>>= 0;
          if (!(0 < f))
            return 0;
          var g = c;
          f = c + f - 1;
          for (var h = 0; h < a.length; ++h) {
            var m = a.charCodeAt(h);
            if (55296 <= m && 57343 >= m) {
              var q = a.charCodeAt(++h);
              m = 65536 + ((m & 1023) << 10) | q & 1023;
            }
            if (127 >= m) {
              if (c >= f)
                break;
              b[c++ >>> 0] = m;
            } else {
              if (2047 >= m) {
                if (c + 1 >= f)
                  break;
                b[c++ >>> 0] = 192 | m >> 6;
              } else {
                if (65535 >= m) {
                  if (c + 2 >= f)
                    break;
                  b[c++ >>> 0] = 224 | m >> 12;
                } else {
                  if (c + 3 >= f)
                    break;
                  b[c++ >>> 0] = 240 | m >> 18;
                  b[c++ >>> 0] = 128 | m >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | m >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | m & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - g;
        }, W = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), va = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], wa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ba = (a) => {
          var b = U(a) + 1, c = Aa(b);
          c && V(a, K, c, b);
          return c;
        }, X = {}, Ca = () => {
          if (!Y) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(
              "-",
              "_"
            ) + ".UTF-8", _: v || "./this.program" }, b;
            for (b in X)
              void 0 === X[b] ? delete a[b] : a[b] = X[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Y = c;
          }
          return Y;
        }, Y, Da = [null, [], []], Ea = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Fa = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Ga(a) {
          var b = Array(U(a) + 1);
          V(a, b, 0, b.length);
          return b;
        }
        function Ha(a, b, c, f) {
          function g(e, n, p) {
            for (e = "number" == typeof e ? e.toString() : e || ""; e.length < n; )
              e = p[0] + e;
            return e;
          }
          function h(e, n) {
            return g(e, n, "0");
          }
          function m(e, n) {
            function p(xa) {
              return 0 > xa ? -1 : 0 < xa ? 1 : 0;
            }
            var z;
            0 === (z = p(e.getFullYear() - n.getFullYear())) && 0 === (z = p(e.getMonth() - n.getMonth())) && (z = p(e.getDate() - n.getDate()));
            return z;
          }
          function q(e) {
            switch (e.getDay()) {
              case 0:
                return new Date(e.getFullYear() - 1, 11, 29);
              case 1:
                return e;
              case 2:
                return new Date(e.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  e.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(e.getFullYear(), 0, 1);
              case 5:
                return new Date(e.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(e.getFullYear() - 1, 11, 30);
            }
          }
          function w(e) {
            var n = e.Ca;
            for (e = new Date(new Date(e.Da + 1900, 0, 1).getTime()); 0 < n; ) {
              var p = e.getMonth(), z = (W(e.getFullYear()) ? Ea : Fa)[p];
              if (n > z - e.getDate())
                n -= z - e.getDate() + 1, e.setDate(1), 11 > p ? e.setMonth(p + 1) : (e.setMonth(0), e.setFullYear(e.getFullYear() + 1));
              else {
                e.setDate(e.getDate() + n);
                break;
              }
            }
            p = new Date(e.getFullYear() + 1, 0, 4);
            n = q(new Date(
              e.getFullYear(),
              0,
              4
            ));
            p = q(p);
            return 0 >= m(n, e) ? 0 >= m(p, e) ? e.getFullYear() + 1 : e.getFullYear() : e.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          f >>>= 0;
          var t = L[f + 40 >> 2 >>> 0];
          f = { Oa: L[f >> 2 >>> 0], Na: L[f + 4 >> 2 >>> 0], Ea: L[f + 8 >> 2 >>> 0], Ga: L[f + 12 >> 2 >>> 0], Fa: L[f + 16 >> 2 >>> 0], Da: L[f + 20 >> 2 >>> 0], xa: L[f + 24 >> 2 >>> 0], Ca: L[f + 28 >> 2 >>> 0], Qa: L[f + 32 >> 2 >>> 0], Ma: L[f + 36 >> 2 >>> 0], Pa: t ? T(t) : "" };
          c = T(c);
          t = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var u in t)
            c = c.replace(new RegExp(u, "g"), t[u]);
          var ya = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), za = "January February March April May June July August September October November December".split(" ");
          t = { "%a": (e) => ya[e.xa].substring(0, 3), "%A": (e) => ya[e.xa], "%b": (e) => za[e.Fa].substring(0, 3), "%B": (e) => za[e.Fa], "%C": (e) => h((e.Da + 1900) / 100 | 0, 2), "%d": (e) => h(e.Ga, 2), "%e": (e) => g(e.Ga, 2, " "), "%g": (e) => w(e).toString().substring(2), "%G": (e) => w(e), "%H": (e) => h(e.Ea, 2), "%I": (e) => {
            e = e.Ea;
            0 == e ? e = 12 : 12 < e && (e -= 12);
            return h(e, 2);
          }, "%j": (e) => {
            for (var n = 0, p = 0; p <= e.Fa - 1; n += (W(e.Da + 1900) ? Ea : Fa)[p++])
              ;
            return h(e.Ga + n, 3);
          }, "%m": (e) => h(e.Fa + 1, 2), "%M": (e) => h(e.Na, 2), "%n": () => "\n", "%p": (e) => 0 <= e.Ea && 12 > e.Ea ? "AM" : "PM", "%S": (e) => h(e.Oa, 2), "%t": () => "	", "%u": (e) => e.xa || 7, "%U": (e) => h(Math.floor((e.Ca + 7 - e.xa) / 7), 2), "%V": (e) => {
            var n = Math.floor((e.Ca + 7 - (e.xa + 6) % 7) / 7);
            2 >= (e.xa + 371 - e.Ca - 2) % 7 && n++;
            if (n)
              53 == n && (p = (e.xa + 371 - e.Ca) % 7, 4 == p || 3 == p && W(e.Da) || (n = 1));
            else {
              n = 52;
              var p = (e.xa + 7 - e.Ca - 1) % 7;
              (4 == p || 5 == p && W(e.Da % 400 - 1)) && n++;
            }
            return h(n, 2);
          }, "%w": (e) => e.xa, "%W": (e) => h(Math.floor((e.Ca + 7 - (e.xa + 6) % 7) / 7), 2), "%y": (e) => (e.Da + 1900).toString().substring(2), "%Y": (e) => e.Da + 1900, "%z": (e) => {
            e = e.Ma;
            var n = 0 <= e;
            e = Math.abs(e) / 60;
            return (n ? "+" : "-") + String("0000" + (e / 60 * 100 + e % 60)).slice(-4);
          }, "%Z": (e) => e.Pa, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (u in t)
            c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](f)));
          c = c.replace(/\0\0/g, "%");
          u = Ga(c);
          if (u.length > b)
            return 0;
          J.set(u, a >>> 0);
          return u.length - 1;
        }
        var Ja = {
          a: function(a, b, c) {
            a >>>= 0;
            new qa(a).Ia(b >>> 0, c >>> 0);
            ra = a;
            sa++;
            throw ra;
          },
          e: function() {
            return 0;
          },
          H: function() {
          },
          x: function() {
          },
          z: function() {
          },
          k: function() {
            return 0;
          },
          F: function() {
          },
          B: function() {
          },
          E: function() {
          },
          g: function() {
          },
          y: function() {
          },
          v: function() {
          },
          G: function() {
          },
          w: function() {
          },
          l: () => true,
          o: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            L[c >> 2 >>> 0] = a.getUTCSeconds();
            L[c + 4 >> 2 >>> 0] = a.getUTCMinutes();
            L[c + 8 >> 2 >>> 0] = a.getUTCHours();
            L[c + 12 >> 2 >>> 0] = a.getUTCDate();
            L[c + 16 >> 2 >>> 0] = a.getUTCMonth();
            L[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;
            L[c + 24 >> 2 >>> 0] = a.getUTCDay();
            L[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
          },
          p: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            L[c >> 2 >>> 0] = a.getSeconds();
            L[c + 4 >> 2 >>> 0] = a.getMinutes();
            L[c + 8 >> 2 >>> 0] = a.getHours();
            L[c + 12 >> 2 >>> 0] = a.getDate();
            L[c + 16 >> 2 >>> 0] = a.getMonth();
            L[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;
            L[c + 24 >> 2 >>> 0] = a.getDay();
            L[c + 28 >> 2 >>> 0] = (W(a.getFullYear()) ? va : wa)[a.getMonth()] + a.getDate() - 1 | 0;
            L[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var f = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            L[c + 32 >> 2 >>> 0] = (b != f && a.getTimezoneOffset() == Math.min(f, b)) | 0;
          },
          q: function(a) {
            a >>>= 0;
            var b = new Date(L[a + 20 >> 2 >>> 0] + 1900, L[a + 16 >> 2 >>> 0], L[a + 12 >> 2 >>> 0], L[a + 8 >> 2 >>> 0], L[a + 4 >> 2 >>> 0], L[a >> 2 >>> 0], 0), c = L[a + 32 >> 2 >>> 0], f = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);
            0 > c ? L[a + 32 >> 2 >>> 0] = Number(g != h && m == f) : 0 < c != (m == f) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - f)));
            L[a + 24 >> 2 >>> 0] = b.getDay();
            L[a + 28 >> 2 >>> 0] = (W(b.getFullYear()) ? va : wa)[b.getMonth()] + b.getDate() - 1 | 0;
            L[a >> 2 >>> 0] = b.getSeconds();
            L[a + 4 >> 2 >>> 0] = b.getMinutes();
            L[a + 8 >> 2 >>> 0] = b.getHours();
            L[a + 12 >> 2 >>> 0] = b.getDate();
            L[a + 16 >> 2 >>> 0] = b.getMonth();
            L[a + 20 >> 2 >>> 0] = b.getYear();
            a = b.getTime() / 1e3;
            return Ia((R = a, 1 <= +Math.abs(R) ? 0 < R ? +Math.floor(R / 4294967296) >>> 0 : ~~+Math.ceil((R - +(~~R >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
          },
          m: function() {
            return -52;
          },
          n: function() {
          },
          t: function(a, b, c) {
            function f(w) {
              return (w = w.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? w[1] : "GMT";
            }
            c >>>= 0;
            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);
            g = h.getTimezoneOffset();
            var q = m.getTimezoneOffset();
            M[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, q);
            L[b >>> 0 >> 2 >>> 0] = Number(g != q);
            a = f(h);
            b = f(m);
            a = Ba(a);
            b = Ba(b);
            q < g ? (M[c >> 2 >>> 0] = a, M[c + 4 >> 2 >>> 0] = b) : (M[c >> 2 >>> 0] = b, M[c + 4 >> 2 >>> 0] = a);
          },
          d: () => {
            G("");
          },
          h: function() {
            return Date.now();
          },
          u: function() {
            return 4294901760;
          },
          b: () => performance.now(),
          I: function(a, b, c) {
            b >>>= 0;
            return K.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);
          },
          s: function(a) {
            a >>>= 0;
            var b = K.length;
            if (4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var f = b * (1 + 0.2 / c);
              f = Math.min(f, a + 100663296);
              var g = Math;
              f = Math.max(a, f);
              a: {
                g = g.min.call(g, 4294901760, f + (65536 - f % 65536) % 65536) - H.buffer.byteLength + 65535 >>> 16;
                try {
                  H.grow(g);
                  ea();
                  var h = 1;
                  break a;
                } catch (m) {
                }
                h = void 0;
              }
              if (h)
                return true;
            }
            return false;
          },
          C: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = 0;
            Ca().forEach(function(f, g) {
              var h = b + c;
              g = M[a + 4 * g >> 2 >>> 0] = h;
              for (h = 0; h < f.length; ++h)
                J[g++ >> 0 >>> 0] = f.charCodeAt(h);
              J[g >> 0 >>> 0] = 0;
              c += f.length + 1;
            });
            return 0;
          },
          D: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = Ca();
            M[a >> 2 >>> 0] = c.length;
            var f = 0;
            c.forEach(function(g) {
              f += g.length + 1;
            });
            M[b >> 2 >>> 0] = f;
            return 0;
          },
          f: () => 52,
          j: function() {
            return 52;
          },
          r: function() {
            return 70;
          },
          i: function(a, b, c, f) {
            b >>>= 0;
            c >>>= 0;
            f >>>= 0;
            for (var g = 0, h = 0; h < c; h++) {
              var m = M[b >> 2 >>> 0], q = M[b + 4 >> 2 >>> 0];
              b += 8;
              for (var w = 0; w < q; w++) {
                var t = K[m + w >>> 0], u = Da[a];
                0 === t || 10 === t ? ((1 === a ? ca : E)(ua(u, 0)), u.length = 0) : u.push(t);
              }
              g += q;
            }
            M[f >> 2 >>> 0] = g;
            return 0;
          },
          A: Ha,
          c: function(a, b, c, f) {
            return Ha(a >>> 0, b >>> 0, c >>> 0, f >>> 0);
          }
        };
        (function() {
          function a(c) {
            c = c.exports;
            I = c = Ka(c);
            H = I.J;
            ea();
            ha.unshift(I.K);
            N--;
            d.monitorRunDependencies && d.monitorRunDependencies(N);
            if (0 == N && (null !== O && (clearInterval(O), O = null), P)) {
              var f = P;
              P = null;
              f();
            }
            return c;
          }
          var b = { a: Ja };
          N++;
          d.monitorRunDependencies && d.monitorRunDependencies(N);
          if (d.instantiateWasm)
            try {
              return d.instantiateWasm(b, a);
            } catch (c) {
              E("Module.instantiateWasm callback failed with error: " + c), l(c);
            }
          pa(b, function(c) {
            a(c.instance);
          }).catch(l);
          return {};
        })();
        d._OrtInit = (a, b) => (d._OrtInit = I.L)(a, b);
        d._OrtGetLastError = (a, b) => (d._OrtGetLastError = I.M)(a, b);
        d._OrtCreateSessionOptions = (a, b, c, f, g, h, m, q, w, t) => (d._OrtCreateSessionOptions = I.N)(a, b, c, f, g, h, m, q, w, t);
        d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = I.O)(a, b);
        d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = I.P)(a, b, c);
        d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = I.Q)(a, b, c);
        d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = I.R)(a);
        d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = I.S)(a, b, c);
        d._OrtReleaseSession = (a) => (d._OrtReleaseSession = I.T)(a);
        d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = I.U)(a, b, c);
        d._OrtGetInputName = (a, b) => (d._OrtGetInputName = I.V)(a, b);
        d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = I.W)(a, b);
        d._OrtFree = (a) => (d._OrtFree = I.X)(a);
        d._OrtCreateTensor = (a, b, c, f, g, h) => (d._OrtCreateTensor = I.Y)(a, b, c, f, g, h);
        d._OrtGetTensorData = (a, b, c, f, g) => (d._OrtGetTensorData = I.Z)(a, b, c, f, g);
        d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = I._)(a);
        d._OrtCreateRunOptions = (a, b, c, f) => (d._OrtCreateRunOptions = I.$)(a, b, c, f);
        d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = I.aa)(a, b, c);
        d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = I.ba)(a);
        d._OrtCreateBinding = (a) => (d._OrtCreateBinding = I.ca)(a);
        d._OrtBindInput = (a, b, c) => (d._OrtBindInput = I.da)(a, b, c);
        d._OrtBindOutput = (a, b, c, f) => (d._OrtBindOutput = I.ea)(a, b, c, f);
        d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = I.fa)(a);
        d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = I.ga)(a);
        d._OrtRunWithBinding = (a, b, c, f, g) => (d._OrtRunWithBinding = I.ha)(a, b, c, f, g);
        d._OrtRun = (a, b, c, f, g, h, m, q) => (d._OrtRun = I.ia)(a, b, c, f, g, h, m, q);
        d._OrtEndProfiling = (a) => (d._OrtEndProfiling = I.ja)(a);
        d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = I.ka)(a, b);
        d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = I.la)(a);
        d._OrtTrainingCreateSession = (a, b, c, f, g, h, m, q) => (d._OrtTrainingCreateSession = I.ma)(a, b, c, f, g, h, m, q);
        d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = I.na)(a);
        d._OrtTrainingRunTrainStep = (a, b, c, f, g, h) => (d._OrtTrainingRunTrainStep = I.oa)(a, b, c, f, g, h);
        d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = I.pa)(a, b);
        d._OrtTrainingEvalStep = (a, b, c, f, g, h) => (d._OrtTrainingEvalStep = I.qa)(a, b, c, f, g, h);
        d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = I.ra)(a, b, c);
        d._OrtTrainingCopyParametersToBuffer = (a, b, c, f) => (d._OrtTrainingCopyParametersToBuffer = I.sa)(a, b, c, f);
        d._OrtTrainingCopyParametersFromBuffer = (a, b, c, f) => (d._OrtTrainingCopyParametersFromBuffer = I.ta)(a, b, c, f);
        d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = I.ua)(a);
        var Aa = d._malloc = (a) => (Aa = d._malloc = I.va)(a);
        d._free = (a) => (d._free = I.wa)(a);
        var Ia = (a) => (Ia = I.ya)(a), La = () => (La = I.za)(), Ma = (a) => (Ma = I.Aa)(a), Na = (a) => (Na = I.Ba)(a);
        function Ka(a) {
          a = Object.assign({}, a);
          var b = (f) => () => f() >>> 0, c = (f) => (g) => f(g) >>> 0;
          a.__errno_location = b(a.__errno_location);
          a.malloc = c(a.malloc);
          a.stackSave = b(a.stackSave);
          a.stackAlloc = c(a.stackAlloc);
          return a;
        }
        d.stackAlloc = Na;
        d.stackSave = La;
        d.stackRestore = Ma;
        d.UTF8ToString = T;
        d.stringToUTF8 = (a, b, c) => V(a, K, b, c);
        d.lengthBytesUTF8 = U;
        var Z;
        P = function Oa() {
          Z || Pa();
          Z || (P = Oa);
        };
        function Pa() {
          function a() {
            if (!Z && (Z = true, d.calledRun = true, !da)) {
              S(ha);
              k(d);
              if (d.onRuntimeInitialized)
                d.onRuntimeInitialized();
              if (d.postRun)
                for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {
                  var b = d.postRun.shift();
                  ia.unshift(b);
                }
              S(ia);
            }
          }
          if (!(0 < N)) {
            if (d.preRun)
              for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )
                ja();
            S(fa);
            0 < N || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {
              setTimeout(function() {
                d.setStatus("");
              }, 1);
              a();
            }, 1)) : a());
          }
        }
        if (d.preInit)
          for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )
            d.preInit.pop()();
        Pa();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasm;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasm);
  }
});

// nodejs-ignore:worker_threads
var require_worker_threads = __commonJS({
  "nodejs-ignore:worker_threads"() {
  }
});

// nodejs-ignore:perf_hooks
var require_perf_hooks = __commonJS({
  "nodejs-ignore:perf_hooks"() {
  }
});

// nodejs-ignore:os
var os_exports = {};
__export(os_exports, {
  cpus: () => cpus2
});
var cpus2;
var init_os = __esm({
  "nodejs-ignore:os"() {
    cpus2 = void 0;
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.js
var require_ort_wasm_threaded = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module2) {
    "use strict";
    var ortWasmThreaded = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        function aa() {
          d.buffer != l.buffer && m();
          return l;
        }
        function n() {
          d.buffer != l.buffer && m();
          return ba;
        }
        function p() {
          d.buffer != l.buffer && m();
          return ca;
        }
        function r() {
          d.buffer != l.buffer && m();
          return da;
        }
        function ea() {
          d.buffer != l.buffer && m();
          return fa;
        }
        var w = moduleArg, ha, x;
        w.ready = new Promise((a, b) => {
          ha = a;
          x = b;
        });
        var ia = Object.assign({}, w), ja = "./this.program", z = (a, b) => {
          throw b;
        }, ka = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = w.ENVIRONMENT_IS_PTHREAD || false, E = "";
        function la(a) {
          return w.locateFile ? w.locateFile(a, E) : E + a;
        }
        var ma, F, H;
        if (B) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));
          E = A ? na.dirname(E) + "/" : __dirname + "/";
          ma = (b, c) => {
            b = b.startsWith("file://") ? new URL(b) : na.normalize(b);
            return fs.readFileSync(b, c ? void 0 : "utf8");
          };
          H = (b) => {
            b = ma(b, true);
            b.buffer || (b = new Uint8Array(b));
            return b;
          };
          F = (b, c, e, h = true) => {
            b = b.startsWith("file://") ? new URL(b) : na.normalize(b);
            fs.readFile(b, h ? void 0 : "utf8", (g, k) => {
              g ? e(g) : c(h ? k.buffer : k);
            });
          };
          !w.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          z = (b, c) => {
            process.exitCode = b;
            throw c;
          };
          w.inspect = () => "[Emscripten Module object]";
          let a;
          try {
            a = require_worker_threads();
          } catch (b) {
            throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'), b;
          }
          global.Worker = a.Worker;
        } else if (ka || A)
          A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ma = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, A && (H = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), F = (a, b, c) => {
            var e = new XMLHttpRequest();
            e.open("GET", a, true);
            e.responseType = "arraybuffer";
            e.onload = () => {
              200 == e.status || 0 == e.status && e.response ? b(e.response) : c();
            };
            e.onerror = c;
            e.send(null);
          });
        B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
        var oa = console.log.bind(console), pa = console.error.bind(console);
        B && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
        var qa = w.print || oa, I = w.printErr || pa;
        Object.assign(w, ia);
        ia = null;
        w.thisProgram && (ja = w.thisProgram);
        w.quit && (z = w.quit);
        var J;
        w.wasmBinary && (J = w.wasmBinary);
        var noExitRuntime = w.noExitRuntime || true;
        "object" != typeof WebAssembly && K("no native wasm support detected");
        var d, L, ra, M = false, N, l, ba, ca, da, fa;
        function m() {
          var a = d.buffer;
          w.HEAP8 = l = new Int8Array(a);
          w.HEAP16 = new Int16Array(a);
          w.HEAP32 = ca = new Int32Array(a);
          w.HEAPU8 = ba = new Uint8Array(a);
          w.HEAPU16 = new Uint16Array(a);
          w.HEAPU32 = da = new Uint32Array(a);
          w.HEAPF32 = new Float32Array(a);
          w.HEAPF64 = fa = new Float64Array(a);
        }
        var O = w.INITIAL_MEMORY || 16777216;
        5242880 <= O || K("INITIAL_MEMORY should be larger than STACK_SIZE, was " + O + "! (STACK_SIZE=5242880)");
        if (D)
          d = w.wasmMemory;
        else if (w.wasmMemory)
          d = w.wasmMemory;
        else if (d = new WebAssembly.Memory({ initial: O / 65536, maximum: 65536, shared: true }), !(d.buffer instanceof SharedArrayBuffer))
          throw I("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && I("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
        m();
        O = d.buffer.byteLength;
        var sa, ta = [], ua = [], va = [], wa = 0;
        function P() {
          return noExitRuntime || 0 < wa;
        }
        var Q = 0, xa = null, R = null;
        function ya() {
          Q++;
          w.monitorRunDependencies && w.monitorRunDependencies(Q);
        }
        function za() {
          Q--;
          w.monitorRunDependencies && w.monitorRunDependencies(Q);
          if (0 == Q && (null !== xa && (clearInterval(xa), xa = null), R)) {
            var a = R;
            R = null;
            a();
          }
        }
        function K(a) {
          if (w.onAbort)
            w.onAbort(a);
          a = "Aborted(" + a + ")";
          I(a);
          M = true;
          N = 1;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          x(a);
          throw a;
        }
        function Aa(a) {
          return a.startsWith("data:application/octet-stream;base64,");
        }
        var S;
        S = "ort-wasm-threaded.wasm";
        Aa(S) || (S = la(S));
        function Ba(a) {
          if (a == S && J)
            return new Uint8Array(J);
          if (H)
            return H(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function Ca(a) {
          if (!J && (ka || A)) {
            if ("function" == typeof fetch && !a.startsWith("file://"))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => Ba(a));
            if (F)
              return new Promise((b, c) => {
                F(a, (e) => b(new Uint8Array(e)), c);
              });
          }
          return Promise.resolve().then(() => Ba(a));
        }
        function Da(a, b, c) {
          return Ca(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {
            I("failed to asynchronously prepare wasm: " + e);
            K(e);
          });
        }
        function Ea(a, b) {
          var c = S;
          return J || "function" != typeof WebAssembly.instantiateStreaming || Aa(c) || c.startsWith("file://") || B || "function" != typeof fetch ? Da(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(h) {
            I("wasm streaming compile failed: " + h);
            I("falling back to ArrayBuffer instantiation");
            return Da(c, a, b);
          }));
        }
        var T;
        function U(a) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${a})`;
          this.status = a;
        }
        function Fa(a) {
          a.terminate();
          a.onmessage = () => {
          };
        }
        function Ga(a) {
          (a = V.La[a]) || K();
          V.lb(a);
        }
        function Ha(a) {
          var b = V.fb();
          if (!b)
            return 6;
          V.Oa.push(b);
          V.La[a.Na] = b;
          b.Na = a.Na;
          var c = { cmd: "run", start_routine: a.mb, arg: a.eb, pthread_ptr: a.Na };
          B && b.unref();
          b.postMessage(c, a.sb);
          return 0;
        }
        var Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {
          b >>>= 0;
          var e = b + c;
          for (c = b; a[c] && !(c >= e); )
            ++c;
          if (16 < c - b && a.buffer && Ia)
            return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
          for (e = ""; b < c; ) {
            var h = a[b++];
            if (h & 128) {
              var g = a[b++] & 63;
              if (192 == (h & 224))
                e += String.fromCharCode((h & 31) << 6 | g);
              else {
                var k = a[b++] & 63;
                h = 224 == (h & 240) ? (h & 15) << 12 | g << 6 | k : (h & 7) << 18 | g << 12 | k << 6 | a[b++] & 63;
                65536 > h ? e += String.fromCharCode(h) : (h -= 65536, e += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));
              }
            } else
              e += String.fromCharCode(h);
          }
          return e;
        }, Ka = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "";
        function La(a) {
          if (D)
            return W(1, 1, a);
          N = a;
          if (!P()) {
            V.nb();
            if (w.onExit)
              w.onExit(a);
            M = true;
          }
          z(a, new U(a));
        }
        var Na = (a) => {
          N = a;
          if (D)
            throw Ma(a), "unwind";
          La(a);
        }, V = {
          Ra: [],
          Oa: [],
          Za: [],
          La: {},
          Va: function() {
            D ? V.hb() : V.gb();
          },
          gb: function() {
            ta.unshift(() => {
              ya();
              V.ib(() => za());
            });
          },
          hb: function() {
            V.receiveObjectTransfer = V.kb;
            V.threadInitTLS = V.Ya;
            V.setExitStatus = V.Xa;
            noExitRuntime = false;
          },
          Xa: function(a) {
            N = a;
          },
          xb: ["$terminateWorker"],
          nb: function() {
            for (var a of V.Oa)
              Fa(a);
            for (a of V.Ra)
              Fa(a);
            V.Ra = [];
            V.Oa = [];
            V.La = [];
          },
          lb: function(a) {
            var b = a.Na;
            delete V.La[b];
            V.Ra.push(a);
            V.Oa.splice(V.Oa.indexOf(a), 1);
            a.Na = 0;
            Oa(b);
          },
          kb: function() {
          },
          Ya: function() {
            V.Za.forEach((a) => a());
          },
          jb: (a) => new Promise((b) => {
            a.onmessage = (g) => {
              g = g.data;
              var k = g.cmd;
              if (g.targetThread && g.targetThread != X()) {
                var t = V.La[g.wb];
                t ? t.postMessage(g, g.transferList) : I('Internal error! Worker sent a message "' + k + '" to target pthread ' + g.targetThread + ", but that thread no longer exists!");
              } else if ("checkMailbox" === k)
                Y();
              else if ("spawnThread" === k)
                Ha(g);
              else if ("cleanupThread" === k)
                Ga(g.thread);
              else if ("killThread" === k)
                g = g.thread, k = V.La[g], delete V.La[g], Fa(k), Oa(g), V.Oa.splice(
                  V.Oa.indexOf(k),
                  1
                ), k.Na = 0;
              else if ("cancelThread" === k)
                V.La[g.thread].postMessage({ cmd: "cancel" });
              else if ("loaded" === k)
                a.loaded = true, b(a);
              else if ("alert" === k)
                alert("Thread " + g.threadId + ": " + g.text);
              else if ("setimmediate" === g.target)
                a.postMessage(g);
              else if ("callHandler" === k)
                w[g.handler](...g.args);
              else
                k && I("worker sent an unknown command " + k);
            };
            a.onerror = (g) => {
              I("worker sent an error! " + g.filename + ":" + g.lineno + ": " + g.message);
              throw g;
            };
            B && (a.on("message", function(g) {
              a.onmessage({ data: g });
            }), a.on("error", function(g) {
              a.onerror(g);
            }));
            var c = [], e = ["onExit", "onAbort", "print", "printErr"], h;
            for (h of e)
              w.hasOwnProperty(h) && c.push(h);
            a.postMessage({ cmd: "load", handlers: c, urlOrBlob: w.mainScriptUrlOrBlob || _scriptDir, wasmMemory: d, wasmModule: ra });
          }),
          ib: function(a) {
            a();
          },
          cb: function() {
            var a = la("ort-wasm-threaded.worker.js");
            a = new Worker(a);
            V.Ra.push(a);
          },
          fb: function() {
            0 == V.Ra.length && (V.cb(), V.jb(V.Ra[0]));
            return V.Ra.pop();
          }
        };
        w.PThread = V;
        var Pa = (a) => {
          for (; 0 < a.length; )
            a.shift()(w);
        };
        w.establishStackSpace = function() {
          var a = X(), b = p()[a + 52 >> 2 >>> 0];
          a = p()[a + 56 >> 2 >>> 0];
          Qa(b, b - a);
          Ra(b);
        };
        function Ma(a) {
          if (D)
            return W(2, 0, a);
          Na(a);
        }
        var Sa = [];
        w.invokeEntryPoint = function(a, b) {
          var c = Sa[a];
          c || (a >= Sa.length && (Sa.length = a + 1), Sa[a] = c = sa.get(a));
          a = c(b);
          P() ? V.Xa(a) : Ta(a);
        };
        function Ua(a) {
          this.Ua = a - 24;
          this.bb = function(b) {
            r()[this.Ua + 4 >> 2 >>> 0] = b;
          };
          this.ab = function(b) {
            r()[this.Ua + 8 >> 2 >>> 0] = b;
          };
          this.Va = function(b, c) {
            this.$a();
            this.bb(b);
            this.ab(c);
          };
          this.$a = function() {
            r()[this.Ua + 16 >> 2 >>> 0] = 0;
          };
        }
        var Va = 0, Wa = 0;
        function Xa(a, b, c, e) {
          return D ? W(3, 1, a, b, c, e) : Ya(a, b, c, e);
        }
        function Ya(a, b, c, e) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          if ("undefined" == typeof SharedArrayBuffer)
            return I("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
          var h = [];
          if (D && 0 === h.length)
            return Xa(a, b, c, e);
          a = { mb: c, Na: a, eb: e, sb: h };
          return D ? (a.ub = "spawnThread", postMessage(a, h), 0) : Ha(a);
        }
        function Za(a, b, c) {
          return D ? W(4, 1, a, b, c) : 0;
        }
        function $a(a, b) {
          if (D)
            return W(5, 1, a, b);
        }
        var ab = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var e = a.charCodeAt(c);
            127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, bb = (a, b, c, e) => {
          c >>>= 0;
          if (!(0 < e))
            return 0;
          var h = c;
          e = c + e - 1;
          for (var g = 0; g < a.length; ++g) {
            var k = a.charCodeAt(g);
            if (55296 <= k && 57343 >= k) {
              var t = a.charCodeAt(++g);
              k = 65536 + ((k & 1023) << 10) | t & 1023;
            }
            if (127 >= k) {
              if (c >= e)
                break;
              b[c++ >>> 0] = k;
            } else {
              if (2047 >= k) {
                if (c + 1 >= e)
                  break;
                b[c++ >>> 0] = 192 | k >> 6;
              } else {
                if (65535 >= k) {
                  if (c + 2 >= e)
                    break;
                  b[c++ >>> 0] = 224 | k >> 12;
                } else {
                  if (c + 3 >= e)
                    break;
                  b[c++ >>> 0] = 240 | k >> 18;
                  b[c++ >>> 0] = 128 | k >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | k >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | k & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - h;
        }, cb = (a, b, c) => bb(a, n(), b, c);
        function db(a, b) {
          if (D)
            return W(6, 1, a, b);
        }
        function eb(a, b, c) {
          if (D)
            return W(7, 1, a, b, c);
        }
        function fb(a, b, c) {
          return D ? W(8, 1, a, b, c) : 0;
        }
        function gb(a, b) {
          if (D)
            return W(9, 1, a, b);
        }
        function hb(a, b, c) {
          if (D)
            return W(10, 1, a, b, c);
        }
        function ib(a, b, c, e) {
          if (D)
            return W(11, 1, a, b, c, e);
        }
        function jb(a, b, c, e) {
          if (D)
            return W(12, 1, a, b, c, e);
        }
        function kb(a, b, c, e) {
          if (D)
            return W(13, 1, a, b, c, e);
        }
        function lb(a) {
          if (D)
            return W(14, 1, a);
        }
        function mb(a, b) {
          if (D)
            return W(15, 1, a, b);
        }
        function nb(a, b, c) {
          if (D)
            return W(16, 1, a, b, c);
        }
        var ob = (a) => {
          if (!M)
            try {
              if (a(), !P())
                try {
                  D ? Ta(N) : Na(N);
                } catch (b) {
                  b instanceof U || "unwind" == b || z(1, b);
                }
            } catch (b) {
              b instanceof U || "unwind" == b || z(1, b);
            }
        };
        function pb(a) {
          a >>>= 0;
          "function" === typeof Atomics.tb && (Atomics.tb(p(), a >> 2, a).value.then(Y), a += 128, Atomics.store(p(), a >> 2, 1));
        }
        w.__emscripten_thread_mailbox_await = pb;
        function Y() {
          var a = X();
          a && (pb(a), ob(() => qb()));
        }
        w.checkMailbox = Y;
        var Z = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), rb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], sb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        function tb(a, b, c, e, h, g, k, t) {
          return D ? W(17, 1, a, b, c, e, h, g, k, t) : -52;
        }
        function ub(a, b, c, e, h, g, k) {
          if (D)
            return W(18, 1, a, b, c, e, h, g, k);
        }
        var wb = (a) => {
          var b = ab(a) + 1, c = vb(b);
          c && cb(a, c, b);
          return c;
        }, yb = (a) => {
          var b = xb();
          a = a();
          Ra(b);
          return a;
        };
        function W(a, b) {
          var c = arguments.length - 2, e = arguments;
          return yb(() => {
            for (var h = zb(8 * c), g = h >> 3, k = 0; k < c; k++) {
              var t = e[2 + k];
              ea()[g + k >>> 0] = t;
            }
            return Ab(a, c, h, b);
          });
        }
        var Bb = [], Cb = {}, Eb = () => {
          if (!Db) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;
            for (b in Cb)
              void 0 === Cb[b] ? delete a[b] : a[b] = Cb[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Db = c;
          }
          return Db;
        }, Db;
        function Fb(a, b) {
          if (D)
            return W(19, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          Eb().forEach(function(e, h) {
            var g = b + c;
            h = r()[a + 4 * h >> 2 >>> 0] = g;
            for (g = 0; g < e.length; ++g)
              aa()[h++ >> 0 >>> 0] = e.charCodeAt(g);
            aa()[h >> 0 >>> 0] = 0;
            c += e.length + 1;
          });
          return 0;
        }
        function Gb(a, b) {
          if (D)
            return W(20, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = Eb();
          r()[a >> 2 >>> 0] = c.length;
          var e = 0;
          c.forEach(function(h) {
            e += h.length + 1;
          });
          r()[b >> 2 >>> 0] = e;
          return 0;
        }
        function Hb(a) {
          return D ? W(21, 1, a) : 52;
        }
        function Lb(a, b, c, e) {
          return D ? W(22, 1, a, b, c, e) : 52;
        }
        function Mb(a, b, c, e, h) {
          return D ? W(23, 1, a, b, c, e, h) : 70;
        }
        var Nb = [null, [], []];
        function Ob(a, b, c, e) {
          if (D)
            return W(24, 1, a, b, c, e);
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          for (var h = 0, g = 0; g < c; g++) {
            var k = r()[b >> 2 >>> 0], t = r()[b + 4 >> 2 >>> 0];
            b += 8;
            for (var C = 0; C < t; C++) {
              var v = n()[k + C >>> 0], y = Nb[a];
              0 === v || 10 === v ? ((1 === a ? qa : I)(Ja(y, 0)), y.length = 0) : y.push(v);
            }
            h += t;
          }
          r()[e >> 2 >>> 0] = h;
          return 0;
        }
        var Pb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Qb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Rb(a) {
          var b = Array(ab(a) + 1);
          bb(a, b, 0, b.length);
          return b;
        }
        var Sb = (a, b) => {
          aa().set(a, b >>> 0);
        };
        function Tb(a, b, c, e) {
          function h(f, q, u) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < q; )
              f = u[0] + f;
            return f;
          }
          function g(f, q) {
            return h(f, q, "0");
          }
          function k(f, q) {
            function u(Ib) {
              return 0 > Ib ? -1 : 0 < Ib ? 1 : 0;
            }
            var G;
            0 === (G = u(f.getFullYear() - q.getFullYear())) && 0 === (G = u(f.getMonth() - q.getMonth())) && (G = u(f.getDate() - q.getDate()));
            return G;
          }
          function t(f) {
            switch (f.getDay()) {
              case 0:
                return new Date(f.getFullYear() - 1, 11, 29);
              case 1:
                return f;
              case 2:
                return new Date(f.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  f.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(f.getFullYear(), 0, 1);
              case 5:
                return new Date(f.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f.getFullYear() - 1, 11, 30);
            }
          }
          function C(f) {
            var q = f.Pa;
            for (f = new Date(new Date(f.Qa + 1900, 0, 1).getTime()); 0 < q; ) {
              var u = f.getMonth(), G = (Z(f.getFullYear()) ? Pb : Qb)[u];
              if (q > G - f.getDate())
                q -= G - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + q);
                break;
              }
            }
            u = new Date(f.getFullYear() + 1, 0, 4);
            q = t(new Date(
              f.getFullYear(),
              0,
              4
            ));
            u = t(u);
            return 0 >= k(q, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          var v = p()[e + 40 >> 2 >>> 0];
          e = { qb: p()[e >> 2 >>> 0], pb: p()[e + 4 >> 2 >>> 0], Sa: p()[e + 8 >> 2 >>> 0], Wa: p()[e + 12 >> 2 >>> 0], Ta: p()[e + 16 >> 2 >>> 0], Qa: p()[e + 20 >> 2 >>> 0], Ma: p()[e + 24 >> 2 >>> 0], Pa: p()[e + 28 >> 2 >>> 0], yb: p()[e + 32 >> 2 >>> 0], ob: p()[e + 36 >> 2 >>> 0], rb: v ? Ka(v) : "" };
          c = Ka(c);
          v = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var y in v)
            c = c.replace(new RegExp(y, "g"), v[y]);
          var Jb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Kb = "January February March April May June July August September October November December".split(" ");
          v = {
            "%a": (f) => Jb[f.Ma].substring(0, 3),
            "%A": (f) => Jb[f.Ma],
            "%b": (f) => Kb[f.Ta].substring(0, 3),
            "%B": (f) => Kb[f.Ta],
            "%C": (f) => g((f.Qa + 1900) / 100 | 0, 2),
            "%d": (f) => g(f.Wa, 2),
            "%e": (f) => h(f.Wa, 2, " "),
            "%g": (f) => C(f).toString().substring(2),
            "%G": (f) => C(f),
            "%H": (f) => g(f.Sa, 2),
            "%I": (f) => {
              f = f.Sa;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return g(f, 2);
            },
            "%j": (f) => {
              for (var q = 0, u = 0; u <= f.Ta - 1; q += (Z(f.Qa + 1900) ? Pb : Qb)[u++])
                ;
              return g(f.Wa + q, 3);
            },
            "%m": (f) => g(f.Ta + 1, 2),
            "%M": (f) => g(f.pb, 2),
            "%n": () => "\n",
            "%p": (f) => 0 <= f.Sa && 12 > f.Sa ? "AM" : "PM",
            "%S": (f) => g(f.qb, 2),
            "%t": () => "	",
            "%u": (f) => f.Ma || 7,
            "%U": (f) => g(Math.floor((f.Pa + 7 - f.Ma) / 7), 2),
            "%V": (f) => {
              var q = Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7);
              2 >= (f.Ma + 371 - f.Pa - 2) % 7 && q++;
              if (q)
                53 == q && (u = (f.Ma + 371 - f.Pa) % 7, 4 == u || 3 == u && Z(f.Qa) || (q = 1));
              else {
                q = 52;
                var u = (f.Ma + 7 - f.Pa - 1) % 7;
                (4 == u || 5 == u && Z(f.Qa % 400 - 1)) && q++;
              }
              return g(q, 2);
            },
            "%w": (f) => f.Ma,
            "%W": (f) => g(Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7), 2),
            "%y": (f) => (f.Qa + 1900).toString().substring(2),
            "%Y": (f) => f.Qa + 1900,
            "%z": (f) => {
              f = f.ob;
              var q = 0 <= f;
              f = Math.abs(f) / 60;
              return (q ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            },
            "%Z": (f) => f.rb,
            "%%": () => "%"
          };
          c = c.replace(
            /%%/g,
            "\0\0"
          );
          for (y in v)
            c.includes(y) && (c = c.replace(new RegExp(y, "g"), v[y](e)));
          c = c.replace(/\0\0/g, "%");
          y = Rb(c);
          if (y.length > b)
            return 0;
          Sb(y, a);
          return y.length - 1;
        }
        V.Va();
        var Ub = [null, La, Ma, Xa, Za, $a, db, eb, fb, gb, hb, ib, jb, kb, lb, mb, nb, tb, ub, Fb, Gb, Hb, Lb, Mb, Ob], Xb = {
          b: function(a, b, c) {
            a >>>= 0;
            new Ua(a).Va(b >>> 0, c >>> 0);
            Va = a;
            Wa++;
            throw Va;
          },
          N: function(a) {
            Vb(a >>> 0, !A, 1, !ka, 131072, false);
            V.Ya();
          },
          j: function(a) {
            a >>>= 0;
            D ? postMessage({ cmd: "cleanupThread", thread: a }) : Ga(a);
          },
          I: Ya,
          h: Za,
          T: $a,
          D: db,
          F: eb,
          U: fb,
          R: gb,
          J: hb,
          Q: ib,
          n: jb,
          E: kb,
          B: lb,
          S: mb,
          C: nb,
          q: () => true,
          z: function(a, b) {
            a >>>= 0;
            a == b >>> 0 ? setTimeout(() => Y()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = V.La[a]) && a.postMessage({ cmd: "checkMailbox" });
          },
          L: function() {
            return -1;
          },
          M: pb,
          p: function(a) {
            B && V.La[a >>> 0].ref();
          },
          t: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            p()[c >> 2 >>> 0] = a.getUTCSeconds();
            p()[c + 4 >> 2 >>> 0] = a.getUTCMinutes();
            p()[c + 8 >> 2 >>> 0] = a.getUTCHours();
            p()[c + 12 >> 2 >>> 0] = a.getUTCDate();
            p()[c + 16 >> 2 >>> 0] = a.getUTCMonth();
            p()[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;
            p()[c + 24 >> 2 >>> 0] = a.getUTCDay();
            a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
            p()[c + 28 >> 2 >>> 0] = a;
          },
          u: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            p()[c >> 2 >>> 0] = a.getSeconds();
            p()[c + 4 >> 2 >>> 0] = a.getMinutes();
            p()[c + 8 >> 2 >>> 0] = a.getHours();
            p()[c + 12 >> 2 >>> 0] = a.getDate();
            p()[c + 16 >> 2 >>> 0] = a.getMonth();
            p()[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;
            p()[c + 24 >> 2 >>> 0] = a.getDay();
            b = (Z(a.getFullYear()) ? rb : sb)[a.getMonth()] + a.getDate() - 1 | 0;
            p()[c + 28 >> 2 >>> 0] = b;
            p()[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            a = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;
            p()[c + 32 >> 2 >>> 0] = a;
          },
          v: function(a) {
            a >>>= 0;
            var b = new Date(p()[a + 20 >> 2 >>> 0] + 1900, p()[a + 16 >> 2 >>> 0], p()[a + 12 >> 2 >>> 0], p()[a + 8 >> 2 >>> 0], p()[a + 4 >> 2 >>> 0], p()[a >> 2 >>> 0], 0), c = p()[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), h = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), g = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(g, h);
            0 > c ? p()[a + 32 >> 2 >>> 0] = Number(h != g && k == e) : 0 < c != (k == e) && (h = Math.max(g, h), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : h) - e)));
            p()[a + 24 >> 2 >>> 0] = b.getDay();
            c = (Z(b.getFullYear()) ? rb : sb)[b.getMonth()] + b.getDate() - 1 | 0;
            p()[a + 28 >> 2 >>> 0] = c;
            p()[a >> 2 >>> 0] = b.getSeconds();
            p()[a + 4 >> 2 >>> 0] = b.getMinutes();
            p()[a + 8 >> 2 >>> 0] = b.getHours();
            p()[a + 12 >> 2 >>> 0] = b.getDate();
            p()[a + 16 >> 2 >>> 0] = b.getMonth();
            p()[a + 20 >> 2 >>> 0] = b.getYear();
            a = b.getTime() / 1e3;
            return Wb((T = a, 1 <= +Math.abs(T) ? 0 < T ? +Math.floor(T / 4294967296) >>> 0 : ~~+Math.ceil((T - +(~~T >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
          },
          r: tb,
          s: ub,
          y: function(a, b, c) {
            function e(v) {
              return (v = v.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? v[1] : "GMT";
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            var h = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(h, 0, 1), k = new Date(h, 6, 1);
            h = g.getTimezoneOffset();
            var t = k.getTimezoneOffset(), C = Math.max(h, t);
            r()[a >> 2 >>> 0] = 60 * C;
            p()[b >> 2 >>> 0] = Number(h != t);
            a = e(g);
            b = e(k);
            a = wb(a);
            b = wb(b);
            t < h ? (r()[c >> 2 >>> 0] = a, r()[c + 4 >> 2 >>> 0] = b) : (r()[c >> 2 >>> 0] = b, r()[c + 4 >> 2 >>> 0] = a);
          },
          c: () => {
            K("");
          },
          k: function() {
          },
          i: function() {
            return Date.now();
          },
          o: () => {
            wa += 1;
            throw "unwind";
          },
          A: function() {
            return 4294901760;
          },
          e: () => performance.timeOrigin + performance.now(),
          f: function() {
            return B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency;
          },
          K: function(a, b, c, e) {
            V.vb = b >>> 0;
            Bb.length = c;
            b = e >>> 0 >> 3;
            for (e = 0; e < c; e++)
              Bb[e] = ea()[b + e >>> 0];
            return Ub[a].apply(null, Bb);
          },
          x: function(a) {
            a >>>= 0;
            var b = n().length;
            if (a <= b || 4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var e = b * (1 + 0.2 / c);
              e = Math.min(e, a + 100663296);
              var h = Math;
              e = Math.max(a, e);
              a: {
                h = h.min.call(h, 4294901760, e + (65536 - e % 65536) % 65536) - d.buffer.byteLength + 65535 >>> 16;
                try {
                  d.grow(h);
                  m();
                  var g = 1;
                  break a;
                } catch (k) {
                }
                g = void 0;
              }
              if (g)
                return true;
            }
            return false;
          },
          O: Fb,
          P: Gb,
          H: Na,
          g: Hb,
          m: Lb,
          w: Mb,
          l: Ob,
          a: d || w.wasmMemory,
          G: Tb,
          d: function(a, b, c, e) {
            return Tb(a >>> 0, b >>> 0, c >>> 0, e >>> 0);
          }
        };
        (function() {
          function a(c, e) {
            c = c.exports;
            L = c = Yb(c);
            V.Za.push(L.ya);
            sa = L.za;
            ua.unshift(L.V);
            ra = e;
            za();
            return c;
          }
          var b = { a: Xb };
          ya();
          if (w.instantiateWasm)
            try {
              return w.instantiateWasm(b, a);
            } catch (c) {
              I("Module.instantiateWasm callback failed with error: " + c), x(c);
            }
          Ea(b, function(c) {
            a(c.instance, c.module);
          }).catch(x);
          return {};
        })();
        w._OrtInit = (a, b) => (w._OrtInit = L.W)(a, b);
        w._OrtGetLastError = (a, b) => (w._OrtGetLastError = L.X)(a, b);
        w._OrtCreateSessionOptions = (a, b, c, e, h, g, k, t, C, v) => (w._OrtCreateSessionOptions = L.Y)(a, b, c, e, h, g, k, t, C, v);
        w._OrtAppendExecutionProvider = (a, b) => (w._OrtAppendExecutionProvider = L.Z)(a, b);
        w._OrtAddFreeDimensionOverride = (a, b, c) => (w._OrtAddFreeDimensionOverride = L._)(a, b, c);
        w._OrtAddSessionConfigEntry = (a, b, c) => (w._OrtAddSessionConfigEntry = L.$)(a, b, c);
        w._OrtReleaseSessionOptions = (a) => (w._OrtReleaseSessionOptions = L.aa)(a);
        w._OrtCreateSession = (a, b, c) => (w._OrtCreateSession = L.ba)(a, b, c);
        w._OrtReleaseSession = (a) => (w._OrtReleaseSession = L.ca)(a);
        w._OrtGetInputOutputCount = (a, b, c) => (w._OrtGetInputOutputCount = L.da)(a, b, c);
        w._OrtGetInputName = (a, b) => (w._OrtGetInputName = L.ea)(a, b);
        w._OrtGetOutputName = (a, b) => (w._OrtGetOutputName = L.fa)(a, b);
        w._OrtFree = (a) => (w._OrtFree = L.ga)(a);
        w._OrtCreateTensor = (a, b, c, e, h, g) => (w._OrtCreateTensor = L.ha)(a, b, c, e, h, g);
        w._OrtGetTensorData = (a, b, c, e, h) => (w._OrtGetTensorData = L.ia)(a, b, c, e, h);
        w._OrtReleaseTensor = (a) => (w._OrtReleaseTensor = L.ja)(a);
        w._OrtCreateRunOptions = (a, b, c, e) => (w._OrtCreateRunOptions = L.ka)(a, b, c, e);
        w._OrtAddRunConfigEntry = (a, b, c) => (w._OrtAddRunConfigEntry = L.la)(a, b, c);
        w._OrtReleaseRunOptions = (a) => (w._OrtReleaseRunOptions = L.ma)(a);
        w._OrtCreateBinding = (a) => (w._OrtCreateBinding = L.na)(a);
        w._OrtBindInput = (a, b, c) => (w._OrtBindInput = L.oa)(a, b, c);
        w._OrtBindOutput = (a, b, c, e) => (w._OrtBindOutput = L.pa)(a, b, c, e);
        w._OrtClearBoundOutputs = (a) => (w._OrtClearBoundOutputs = L.qa)(a);
        w._OrtReleaseBinding = (a) => (w._OrtReleaseBinding = L.ra)(a);
        w._OrtRunWithBinding = (a, b, c, e, h) => (w._OrtRunWithBinding = L.sa)(a, b, c, e, h);
        w._OrtRun = (a, b, c, e, h, g, k, t) => (w._OrtRun = L.ta)(a, b, c, e, h, g, k, t);
        w._OrtEndProfiling = (a) => (w._OrtEndProfiling = L.ua)(a);
        var X = w._pthread_self = () => (X = w._pthread_self = L.va)(), vb = w._malloc = (a) => (vb = w._malloc = L.wa)(a);
        w._free = (a) => (w._free = L.xa)(a);
        w.__emscripten_tls_init = () => (w.__emscripten_tls_init = L.ya)();
        var Vb = w.__emscripten_thread_init = (a, b, c, e, h, g) => (Vb = w.__emscripten_thread_init = L.Aa)(a, b, c, e, h, g);
        w.__emscripten_thread_crashed = () => (w.__emscripten_thread_crashed = L.Ba)();
        var Ab = (a, b, c, e) => (Ab = L.Ca)(a, b, c, e), Oa = (a) => (Oa = L.Da)(a), Ta = w.__emscripten_thread_exit = (a) => (Ta = w.__emscripten_thread_exit = L.Ea)(a), qb = w.__emscripten_check_mailbox = () => (qb = w.__emscripten_check_mailbox = L.Fa)(), Wb = (a) => (Wb = L.Ga)(a), Qa = (a, b) => (Qa = L.Ha)(a, b), xb = () => (xb = L.Ia)(), Ra = (a) => (Ra = L.Ja)(a), zb = (a) => (zb = L.Ka)(a);
        function Yb(a) {
          a = Object.assign({}, a);
          var b = (e) => () => e() >>> 0, c = (e) => (h) => e(h) >>> 0;
          a.__errno_location = b(a.__errno_location);
          a.pthread_self = b(a.pthread_self);
          a.malloc = c(a.malloc);
          a.stackSave = b(a.stackSave);
          a.stackAlloc = c(a.stackAlloc);
          return a;
        }
        w.keepRuntimeAlive = P;
        w.wasmMemory = d;
        w.stackAlloc = zb;
        w.stackSave = xb;
        w.stackRestore = Ra;
        w.UTF8ToString = Ka;
        w.stringToUTF8 = cb;
        w.lengthBytesUTF8 = ab;
        w.ExitStatus = U;
        w.PThread = V;
        var Zb;
        R = function $b() {
          Zb || ac();
          Zb || (R = $b);
        };
        function ac() {
          function a() {
            if (!Zb && (Zb = true, w.calledRun = true, !M)) {
              D || Pa(ua);
              ha(w);
              if (w.onRuntimeInitialized)
                w.onRuntimeInitialized();
              if (!D) {
                if (w.postRun)
                  for ("function" == typeof w.postRun && (w.postRun = [w.postRun]); w.postRun.length; ) {
                    var b = w.postRun.shift();
                    va.unshift(b);
                  }
                Pa(va);
              }
            }
          }
          if (!(0 < Q))
            if (D)
              ha(w), D || Pa(ua), startWorker(w);
            else {
              if (w.preRun)
                for ("function" == typeof w.preRun && (w.preRun = [w.preRun]); w.preRun.length; )
                  ta.unshift(w.preRun.shift());
              Pa(ta);
              0 < Q || (w.setStatus ? (w.setStatus("Running..."), setTimeout(function() {
                setTimeout(
                  function() {
                    w.setStatus("");
                  },
                  1
                );
                a();
              }, 1)) : a());
            }
        }
        if (w.preInit)
          for ("function" == typeof w.preInit && (w.preInit = [w.preInit]); 0 < w.preInit.length; )
            w.preInit.pop()();
        ac();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasmThreaded;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasmThreaded);
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.worker.js
var require_ort_wasm_threaded_worker = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module2) {
    module2.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason??e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\n';
  }
});

// web/lib/wasm/wasm-factory.ts
var ortWasmFactory, ortWasmFactoryThreaded, wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, getWasmFileName, initializeWebAssembly, getInstance;
var init_wasm_factory = __esm({
  "web/lib/wasm/wasm-factory.ts"() {
    "use strict";
    init_node_path();
    if (true) {
      ortWasmFactory = require_ort_training_wasm_simd();
    } else {
      ortWasmFactory = true ? null : null;
    }
    ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;
    initialized = false;
    initializing = false;
    aborted = false;
    isMultiThreadSupported = (numThreads) => {
      if (numThreads === 1) {
        return false;
      }
      if (typeof SharedArrayBuffer === "undefined") {
        if (typeof self !== "undefined" && !self.crossOriginIsolated) {
          console.warn(
            "env.wasm.numThreads is set to " + numThreads + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."
          );
        }
        return false;
      }
      if (typeof process !== "undefined" && process.versions && process.versions.node) {
        console.warn(
          "env.wasm.numThreads is set to " + numThreads + ", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios."
        );
      }
      try {
        if (typeof MessageChannel !== "undefined") {
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
        }
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          5,
          4,
          1,
          3,
          1,
          1,
          10,
          11,
          1,
          9,
          0,
          65,
          0,
          254,
          16,
          2,
          0,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    isSimdSupported = () => {
      try {
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          10,
          30,
          1,
          28,
          0,
          65,
          0,
          253,
          15,
          253,
          12,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          253,
          186,
          1,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    getWasmFileName = (useSimd, useThreads) => {
      if (useSimd) {
        if (true) {
          return "ort-training-wasm-simd.wasm";
        }
        return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";
      } else {
        return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";
      }
    };
    initializeWebAssembly = async (flags) => {
      if (initialized) {
        return Promise.resolve();
      }
      if (initializing) {
        throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
      }
      if (aborted) {
        throw new Error("previous call to 'initializeWebAssembly()' failed.");
      }
      initializing = true;
      const timeout = flags.initTimeout;
      const numThreads = flags.numThreads;
      const simd = flags.simd;
      const useThreads = isMultiThreadSupported(numThreads);
      const useSimd = simd && isSimdSupported();
      const wasmPaths = flags.wasmPaths;
      const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;
      const wasmFileName = getWasmFileName(useSimd, useThreads);
      const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;
      let isTimeout = false;
      const tasks = [];
      if (timeout > 0) {
        tasks.push(new Promise((resolve) => {
          setTimeout(() => {
            isTimeout = true;
            resolve();
          }, timeout);
        }));
      }
      tasks.push(new Promise((resolve, reject) => {
        const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;
        const config = {
          locateFile: (fileName, scriptDirectory) => {
            if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {
              return URL.createObjectURL(new Blob(
                [
                  // This require() function is handled by esbuild plugin to load file content as string.
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  require_ort_wasm_threaded_worker()
                ],
                { type: "text/javascript" }
              ));
            }
            if (fileName.endsWith(".wasm")) {
              if (wasmPathOverride) {
                return wasmPathOverride;
              }
              const prefix = wasmPrefixOverride ?? scriptDirectory;
              if (false) {
                if (wasmFileName === "ort-wasm-simd.wasm") {
                  return prefix + "ort-wasm-simd.jsep.wasm";
                } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {
                  return prefix + "ort-wasm-simd-threaded.jsep.wasm";
                }
              }
              return prefix + wasmFileName;
            }
            return scriptDirectory + fileName;
          }
        };
        if (useThreads) {
          config.numThreads = numThreads;
          if (typeof Blob === "undefined") {
            config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");
          } else {
            const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;
            config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });
          }
        }
        factory(config).then(
          // wasm module initialized successfully
          (module2) => {
            initializing = false;
            initialized = true;
            wasm = module2;
            resolve();
          },
          // wasm module failed to initialize
          (what) => {
            initializing = false;
            aborted = true;
            reject(what);
          }
        );
      }));
      await Promise.race(tasks);
      if (isTimeout) {
        throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);
      }
    };
    getInstance = () => {
      if (initialized && wasm) {
        return wasm;
      }
      throw new Error("WebAssembly is not initialized yet.");
    };
  }
});

// web/lib/wasm/wasm-utils.ts
var allocWasmString, iterateExtraOptions, checkLastError;
var init_wasm_utils = __esm({
  "web/lib/wasm/wasm-utils.ts"() {
    "use strict";
    init_wasm_factory();
    allocWasmString = (data, allocs) => {
      const wasm2 = getInstance();
      const dataLength = wasm2.lengthBytesUTF8(data) + 1;
      const dataOffset = wasm2._malloc(dataLength);
      wasm2.stringToUTF8(data, dataOffset, dataLength);
      allocs.push(dataOffset);
      return dataOffset;
    };
    iterateExtraOptions = (options, prefix, seen, handler) => {
      if (typeof options == "object" && options !== null) {
        if (seen.has(options)) {
          throw new Error("Circular reference in options");
        } else {
          seen.add(options);
        }
      }
      Object.entries(options).forEach(([key, value]) => {
        const name = prefix ? prefix + key : key;
        if (typeof value === "object") {
          iterateExtraOptions(value, name + ".", seen, handler);
        } else if (typeof value === "string" || typeof value === "number") {
          handler(name, value.toString());
        } else if (typeof value === "boolean") {
          handler(name, value ? "1" : "0");
        } else {
          throw new Error(`Can't handle extra config type: ${typeof value}`);
        }
      });
    };
    checkLastError = (message) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const paramsOffset = wasm2.stackAlloc(8);
        wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);
        const errorCode = wasm2.HEAP32[paramsOffset / 4];
        const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];
        const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";
        throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
  }
});

// web/lib/wasm/run-options.ts
var setRunOptions;
var init_run_options = __esm({
  "web/lib/wasm/run-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    setRunOptions = (options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      const allocs = [];
      const runOptions = options || {};
      try {
        if (options?.logSeverityLevel === void 0) {
          runOptions.logSeverityLevel = 2;
        } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);
        }
        if (options?.logVerbosityLevel === void 0) {
          runOptions.logVerbosityLevel = 0;
        } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {
          throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);
        }
        if (options?.terminate === void 0) {
          runOptions.terminate = false;
        }
        let tagDataOffset = 0;
        if (options?.tag !== void 0) {
          tagDataOffset = allocWasmString(options.tag, allocs);
        }
        runOptionsHandle = wasm2._OrtCreateRunOptions(
          runOptions.logSeverityLevel,
          runOptions.logVerbosityLevel,
          !!runOptions.terminate,
          tagDataOffset
        );
        if (runOptionsHandle === 0) {
          checkLastError("Can't create run options.");
        }
        if (options?.extra !== void 0) {
          iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a run config entry: ${key} - ${value}.`);
            }
          });
        }
        return [runOptionsHandle, allocs];
      } catch (e) {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/session-options.ts
var getGraphOptimzationLevel, getExecutionMode, appendDefaultOptions, setExecutionProviders, setSessionOptions;
var init_session_options = __esm({
  "web/lib/wasm/session-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    getGraphOptimzationLevel = (graphOptimizationLevel) => {
      switch (graphOptimizationLevel) {
        case "disabled":
          return 0;
        case "basic":
          return 1;
        case "extended":
          return 2;
        case "all":
          return 99;
        default:
          throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);
      }
    };
    getExecutionMode = (executionMode) => {
      switch (executionMode) {
        case "sequential":
          return 0;
        case "parallel":
          return 1;
        default:
          throw new Error(`unsupported execution mode: ${executionMode}`);
      }
    };
    appendDefaultOptions = (options) => {
      if (!options.extra) {
        options.extra = {};
      }
      if (!options.extra.session) {
        options.extra.session = {};
      }
      const session = options.extra.session;
      if (!session.use_ort_model_bytes_directly) {
        session.use_ort_model_bytes_directly = "1";
      }
      if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {
        options.enableMemPattern = false;
      }
    };
    setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {
      for (const ep of executionProviders) {
        let epName = typeof ep === "string" ? ep : ep.name;
        switch (epName) {
          case "webnn":
            epName = "WEBNN";
            if (typeof ep !== "string") {
              const webnnOptions = ep;
              if (webnnOptions?.deviceType) {
                const keyDataOffset = allocWasmString("deviceType", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'deviceType' - ${webnnOptions.deviceType}.`);
                }
              }
              if (webnnOptions?.numThreads) {
                let numThreads = webnnOptions.numThreads;
                if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {
                  numThreads = 0;
                }
                const keyDataOffset = allocWasmString("numThreads", allocs);
                const valueDataOffset = allocWasmString(numThreads.toString(), allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'numThreads' - ${webnnOptions.numThreads}.`);
                }
              }
              if (webnnOptions?.powerPreference) {
                const keyDataOffset = allocWasmString("powerPreference", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'powerPreference' - ${webnnOptions.powerPreference}.`
                  );
                }
              }
            }
            break;
          case "webgpu":
            epName = "JS";
            if (typeof ep !== "string") {
              const webgpuOptions = ep;
              if (webgpuOptions?.preferredLayout) {
                if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {
                  throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${webgpuOptions.preferredLayout}`);
                }
                const keyDataOffset = allocWasmString("preferredLayout", allocs);
                const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'preferredLayout' - ${webgpuOptions.preferredLayout}.`
                  );
                }
              }
            }
            break;
          case "wasm":
          case "cpu":
            continue;
          default:
            throw new Error(`not supported execution provider: ${epName}`);
        }
        const epNameDataOffset = allocWasmString(epName, allocs);
        if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {
          checkLastError(`Can't append execution provider: ${epName}.`);
        }
      }
    };
    setSessionOptions = (options) => {
      const wasm2 = getInstance();
      let sessionOptionsHandle = 0;
      const allocs = [];
      const sessionOptions = options || {};
      appendDefaultOptions(sessionOptions);
      try {
        const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");
        const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");
        const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;
        const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;
        if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);
        }
        const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;
        if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {
          throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);
        }
        const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;
        sessionOptionsHandle = wasm2._OrtCreateSessionOptions(
          graphOptimizationLevel,
          !!sessionOptions.enableCpuMemArena,
          !!sessionOptions.enableMemPattern,
          executionMode,
          !!sessionOptions.enableProfiling,
          0,
          logIdDataOffset,
          logSeverityLevel,
          logVerbosityLevel,
          optimizedModelFilePathOffset
        );
        if (sessionOptionsHandle === 0) {
          checkLastError("Can't create session options.");
        }
        if (sessionOptions.executionProviders) {
          setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);
        }
        if (sessionOptions.enableGraphCapture !== void 0) {
          if (typeof sessionOptions.enableGraphCapture !== "boolean") {
            throw new Error(`enableGraphCapture must be a boolean value: ${sessionOptions.enableGraphCapture}`);
          }
          const keyDataOffset = allocWasmString("enableGraphCapture", allocs);
          const valueDataOffset = allocWasmString(sessionOptions.enableGraphCapture.toString(), allocs);
          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
            checkLastError(
              `Can't set a session config entry: 'enableGraphCapture' - ${sessionOptions.enableGraphCapture}.`
            );
          }
        }
        if (sessionOptions.freeDimensionOverrides) {
          for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {
            if (typeof name !== "string") {
              throw new Error(`free dimension override name must be a string: ${name}`);
            }
            if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
              throw new Error(`free dimension override value must be a non-negative integer: ${value}`);
            }
            const nameOffset = allocWasmString(name, allocs);
            if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {
              checkLastError(`Can't set a free dimension override: ${name} - ${value}.`);
            }
          }
        }
        if (sessionOptions.extra !== void 0) {
          iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a session config entry: ${key} - ${value}.`);
            }
          });
        }
        return [sessionOptionsHandle, allocs];
      } catch (e) {
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/wasm-common.ts
var tensorDataTypeStringToEnum, tensorDataTypeEnumToString, getTensorElementSize, tensorTypeToTypedArrayConstructor, logLevelStringToEnum, isGpuBufferSupportedType, dataLocationStringToEnum;
var init_wasm_common = __esm({
  "web/lib/wasm/wasm-common.ts"() {
    "use strict";
    tensorDataTypeStringToEnum = (type) => {
      switch (type) {
        case "int8":
          return 3 /* int8 */;
        case "uint8":
          return 2 /* uint8 */;
        case "bool":
          return 9 /* bool */;
        case "int16":
          return 5 /* int16 */;
        case "uint16":
          return 4 /* uint16 */;
        case "int32":
          return 6 /* int32 */;
        case "uint32":
          return 12 /* uint32 */;
        case "float16":
          return 10 /* float16 */;
        case "float32":
          return 1 /* float */;
        case "float64":
          return 11 /* double */;
        case "string":
          return 8 /* string */;
        case "int64":
          return 7 /* int64 */;
        case "uint64":
          return 13 /* uint64 */;
        default:
          throw new Error(`unsupported data type: ${type}`);
      }
    };
    tensorDataTypeEnumToString = (typeProto) => {
      switch (typeProto) {
        case 3 /* int8 */:
          return "int8";
        case 2 /* uint8 */:
          return "uint8";
        case 9 /* bool */:
          return "bool";
        case 5 /* int16 */:
          return "int16";
        case 4 /* uint16 */:
          return "uint16";
        case 6 /* int32 */:
          return "int32";
        case 12 /* uint32 */:
          return "uint32";
        case 10 /* float16 */:
          return "float16";
        case 1 /* float */:
          return "float32";
        case 11 /* double */:
          return "float64";
        case 8 /* string */:
          return "string";
        case 7 /* int64 */:
          return "int64";
        case 13 /* uint64 */:
          return "uint64";
        default:
          throw new Error(`unsupported data type: ${typeProto}`);
      }
    };
    getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];
    tensorTypeToTypedArrayConstructor = (type) => {
      switch (type) {
        case "float16":
          return Uint16Array;
        case "float32":
          return Float32Array;
        case "uint8":
          return Uint8Array;
        case "int8":
          return Int8Array;
        case "uint16":
          return Uint16Array;
        case "int16":
          return Int16Array;
        case "int32":
          return Int32Array;
        case "bool":
          return Uint8Array;
        case "float64":
          return Float64Array;
        case "uint32":
          return Uint32Array;
        case "int64":
          return BigInt64Array;
        case "uint64":
          return BigUint64Array;
        default:
          throw new Error(`unsupported type: ${type}`);
      }
    };
    logLevelStringToEnum = (logLevel) => {
      switch (logLevel) {
        case "verbose":
          return 0;
        case "info":
          return 1;
        case "warning":
          return 2;
        case "error":
          return 3;
        case "fatal":
          return 4;
        default:
          throw new Error(`unsupported logging level: ${logLevel}`);
      }
    };
    isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";
    dataLocationStringToEnum = (location) => {
      switch (location) {
        case "none":
          return 0;
        case "cpu":
          return 1;
        case "cpu-pinned":
          return 2;
        case "texture":
          return 3;
        case "gpu-buffer":
          return 4;
        default:
          throw new Error(`unsupported data location: ${location}`);
      }
    };
  }
});

// nodejs-ignore:node:fs/promises
var readFile2;
var init_promises = __esm({
  "nodejs-ignore:node:fs/promises"() {
    readFile2 = void 0;
  }
});

// web/lib/wasm/wasm-utils-load-file.ts
var loadFile;
var init_wasm_utils_load_file = __esm({
  "web/lib/wasm/wasm-utils-load-file.ts"() {
    "use strict";
    init_fs();
    init_promises();
    loadFile = async (file) => {
      if (typeof file === "string") {
        if (typeof process !== "undefined" && process.versions && process.versions.node) {
          try {
            return new Uint8Array(await readFile2(file));
          } catch (e) {
            if (e.code === "ERR_FS_FILE_TOO_LARGE") {
              const stream = createReadStream(file);
              const chunks = [];
              for await (const chunk of stream) {
                chunks.push(chunk);
              }
              return new Uint8Array(Buffer.concat(chunks));
            }
            throw e;
          }
        } else {
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`failed to load external data file: ${file}`);
          }
          const contentLengthHeader = response.headers.get("Content-Length");
          const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
          if (fileSize < 1073741824) {
            return new Uint8Array(await response.arrayBuffer());
          } else {
            if (!response.body) {
              throw new Error(`failed to load external data file: ${file}, no response body.`);
            }
            const reader = response.body.getReader();
            let buffer;
            try {
              buffer = new ArrayBuffer(fileSize);
            } catch (e) {
              if (e instanceof RangeError) {
                const pages = Math.ceil(fileSize / 65536);
                buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;
              } else {
                throw e;
              }
            }
            let offset = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              const chunkSize = value.byteLength;
              const chunk = new Uint8Array(buffer, offset, chunkSize);
              chunk.set(value);
              offset += chunkSize;
            }
            return new Uint8Array(buffer, 0, fileSize);
          }
        }
      } else if (file instanceof Blob) {
        return new Uint8Array(await file.arrayBuffer());
      } else if (file instanceof Uint8Array) {
        return file;
      } else {
        return new Uint8Array(file);
      }
    };
  }
});

// web/lib/wasm/wasm-core-impl.ts
var initOrt, initRuntime, initEp, activeSessions, getSessionInputOutputCount, copyFromExternalBuffer, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling, extractTransferableBuffers;
var init_wasm_core_impl = __esm({
  "web/lib/wasm/wasm-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_factory();
    init_wasm_utils();
    init_wasm_utils_load_file();
    initOrt = (numThreads, loggingLevel) => {
      const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);
      if (errorCode !== 0) {
        checkLastError("Can't initialize onnxruntime.");
      }
    };
    initRuntime = async (env3) => {
      initOrt(env3.wasm.numThreads, logLevelStringToEnum(env3.logLevel));
    };
    initEp = async (env3, epName) => {
      if (false) {
        if (typeof navigator === "undefined" || !navigator.gpu) {
          throw new Error("WebGPU is not supported in current environment");
        }
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          throw new Error(
            'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.'
          );
        }
        if (!env3.wasm.simd) {
          throw new Error(
            "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"
          );
        }
        const initJsep = null.init;
        await initJsep(getInstance(), env3, adapter);
      }
    };
    activeSessions = /* @__PURE__ */ new Map();
    getSessionInputOutputCount = (sessionHandle) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);
        if (errorCode !== 0) {
          checkLastError("Can't get session input/output count.");
        }
        return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    copyFromExternalBuffer = (model) => {
      const wasm2 = getInstance();
      const modelDataOffset = wasm2._malloc(model.byteLength);
      if (modelDataOffset === 0) {
        throw new Error(`Can't create a session. failed to allocate a buffer of size ${model.byteLength}.`);
      }
      wasm2.HEAPU8.set(model, modelDataOffset);
      return [modelDataOffset, model.byteLength];
    };
    createSession = async (modelData, options) => {
      let modelDataOffset, modelDataLength;
      const wasm2 = getInstance();
      if (Array.isArray(modelData)) {
        [modelDataOffset, modelDataLength] = modelData;
      } else if (modelData.buffer === wasm2.HEAPU8.buffer) {
        [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];
      } else {
        [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);
      }
      let sessionHandle = 0;
      let sessionOptionsHandle = 0;
      let ioBindingHandle = 0;
      let allocs = [];
      const inputNamesUTF8Encoded = [];
      const outputNamesUTF8Encoded = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (options?.externalData && wasm2.mountExternalData) {
          const loadingPromises = [];
          for (const file of options.externalData) {
            const path = typeof file === "string" ? file : file.path;
            loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {
              wasm2.mountExternalData(path, data);
            }));
          }
          await Promise.all(loadingPromises);
        }
        sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);
        if (sessionHandle === 0) {
          checkLastError("Can't create a session.");
        }
        const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);
        const enableGraphCapture = !!options?.enableGraphCapture;
        const inputNames = [];
        const outputNames = [];
        const outputPreferredLocations = [];
        for (let i = 0; i < inputCount; i++) {
          const name = wasm2._OrtGetInputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an input name.");
          }
          inputNamesUTF8Encoded.push(name);
          inputNames.push(wasm2.UTF8ToString(name));
        }
        for (let i = 0; i < outputCount; i++) {
          const name = wasm2._OrtGetOutputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an output name.");
          }
          outputNamesUTF8Encoded.push(name);
          const nameString = wasm2.UTF8ToString(name);
          outputNames.push(nameString);
          if (false) {
            if (enableGraphCapture && options?.preferredOutputLocation === void 0) {
              outputPreferredLocations.push("gpu-buffer");
              continue;
            }
            const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";
            if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}.`);
            }
            if (enableGraphCapture && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);
            }
            outputPreferredLocations.push(location);
          }
        }
        let bindingState = null;
        if (false) {
          ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);
          if (ioBindingHandle === 0) {
            checkLastError("Can't create IO binding.");
          }
          bindingState = {
            handle: ioBindingHandle,
            outputPreferredLocations,
            outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))
          };
        }
        activeSessions.set(
          sessionHandle,
          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState, enableGraphCapture, false]
        );
        return [sessionHandle, inputNames, outputNames];
      } catch (e) {
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        if (ioBindingHandle !== 0) {
          wasm2._OrtReleaseBinding(ioBindingHandle);
        }
        if (sessionHandle !== 0) {
          wasm2._OrtReleaseSession(sessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(modelDataOffset);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        wasm2.unmountExternalData?.();
      }
    };
    releaseSession = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot release session. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture] = session;
      if (ioBindingState) {
        if (enableGraphCapture) {
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
        }
        wasm2._OrtReleaseBinding(ioBindingState.handle);
      }
      wasm2.jsepOnReleaseSession?.(sessionId);
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      wasm2._OrtReleaseSession(sessionHandle);
      activeSessions.delete(sessionId);
    };
    prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index, enableGraphCapture = false) => {
      if (!tensor) {
        tensorHandles.push(0);
        return;
      }
      const wasm2 = getInstance();
      const dataType = tensor[0];
      const dims = tensor[1];
      const location = tensor[3];
      let rawData;
      let dataByteLength;
      if (dataType === "string" && location === "gpu-buffer") {
        throw new Error("String tensor is not supported on GPU.");
      }
      if (enableGraphCapture && location !== "gpu-buffer") {
        throw new Error(
          `External buffer must be provided for input/output index ${index} when enableGraphCapture is true.`
        );
      }
      if (location === "gpu-buffer") {
        const gpuBuffer = tensor[2].gpuBuffer;
        const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));
        dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;
        rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);
      } else {
        const data = tensor[2];
        if (Array.isArray(data)) {
          dataByteLength = 4 * data.length;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          let dataIndex = rawData / 4;
          for (let i = 0; i < data.length; i++) {
            if (typeof data[i] !== "string") {
              throw new TypeError(`tensor data at index ${i} is not a string`);
            }
            wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);
          }
        } else {
          dataByteLength = data.byteLength;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);
        }
      }
      const stack = wasm2.stackSave();
      const dimsOffset = wasm2.stackAlloc(4 * dims.length);
      try {
        let dimIndex = dimsOffset / 4;
        dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);
        const tensor2 = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(dataType),
          rawData,
          dataByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(location)
        );
        if (tensor2 === 0) {
          checkLastError(`Can't create tensor for input/output. session=${sessionId}, index=${index}.`);
        }
        tensorHandles.push(tensor2);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot run inference. invalid session id: ${sessionId}`);
      }
      const sessionHandle = session[0];
      const inputNamesUTF8Encoded = session[1];
      const outputNamesUTF8Encoded = session[2];
      const ioBindingState = session[3];
      const enableGraphCapture = session[4];
      const inputOutputBound = session[5];
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);
      const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);
      const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);
      const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        for (let i = 0; i < inputCount; i++) {
          prepareInputOutputTensor(
            inputTensors[i],
            inputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputIndices[i],
            enableGraphCapture
          );
        }
        for (let i = 0; i < outputCount; i++) {
          prepareInputOutputTensor(
            outputTensors[i],
            outputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputCount + outputIndices[i],
            enableGraphCapture
          );
        }
        let inputValuesIndex = inputValuesOffset / 4;
        let inputNamesIndex = inputNamesOffset / 4;
        let outputValuesIndex = outputValuesOffset / 4;
        let outputNamesIndex = outputNamesOffset / 4;
        for (let i = 0; i < inputCount; i++) {
          wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];
          wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];
        }
        for (let i = 0; i < outputCount; i++) {
          wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];
          wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];
        }
        if (false) {
          const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;
          if (inputNamesUTF8Encoded.length !== inputCount) {
            throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model's input count (${inputNamesUTF8Encoded.length}).`);
          }
          for (let i = 0; i < inputCount; i++) {
            const index = inputIndices[i];
            const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);
            if (errorCode2 !== 0) {
              checkLastError(`Can't bind input[${i}] for session=${sessionId}.`);
            }
          }
          for (let i = 0; i < outputCount; i++) {
            const index = outputIndices[i];
            const location = outputTensors[i]?.[3];
            if (location) {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind pre-allocated output[${i}] for session=${sessionId}.`);
              }
            } else {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);
              }
            }
          }
          activeSessions.set(
            sessionId,
            [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, true]
          );
        }
        wasm2.jsepOnRunStart?.(sessionHandle);
        let errorCode;
        if (false) {
          errorCode = await wasm2._OrtRunWithBinding(
            sessionHandle,
            ioBindingState.handle,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        } else {
          errorCode = await wasm2._OrtRun(
            sessionHandle,
            inputNamesOffset,
            inputValuesOffset,
            inputCount,
            outputNamesOffset,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        }
        if (errorCode !== 0) {
          checkLastError("failed to call OrtRun().");
        }
        const output = [];
        for (let i = 0; i < outputCount; i++) {
          const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
          if (tensor === outputTensorHandles[i]) {
            output.push(outputTensors[i]);
            continue;
          }
          const beforeGetTensorDataStack = wasm2.stackSave();
          const tensorDataOffset = wasm2.stackAlloc(4 * 4);
          let keepOutputTensor = false;
          let type, dataOffset = 0;
          try {
            const errorCode2 = wasm2._OrtGetTensorData(
              tensor,
              tensorDataOffset,
              tensorDataOffset + 4,
              tensorDataOffset + 8,
              tensorDataOffset + 12
            );
            if (errorCode2 !== 0) {
              checkLastError(`Can't access output tensor data on index ${i}.`);
            }
            let tensorDataIndex = tensorDataOffset / 4;
            const dataType = wasm2.HEAPU32[tensorDataIndex++];
            dataOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
            const dims = [];
            for (let i2 = 0; i2 < dimsLength; i2++) {
              dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
            }
            wasm2._OrtFree(dimsOffset);
            const size = dims.reduce((a, b) => a * b, 1);
            type = tensorDataTypeEnumToString(dataType);
            const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];
            if (type === "string") {
              if (preferredLocation === "gpu-buffer") {
                throw new Error("String tensor is not supported on GPU.");
              }
              const stringData = [];
              let dataIndex = dataOffset / 4;
              for (let i2 = 0; i2 < size; i2++) {
                const offset = wasm2.HEAPU32[dataIndex++];
                const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
                stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
              }
              output.push([type, dims, stringData, "cpu"]);
            } else {
              if (preferredLocation === "gpu-buffer" && size > 0) {
                const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);
                const elementSize = getTensorElementSize(dataType);
                if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {
                  throw new Error(`Unsupported data type: ${type}`);
                }
                keepOutputTensor = true;
                output.push([
                  type,
                  dims,
                  {
                    gpuBuffer,
                    download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),
                    dispose: () => {
                      wasm2._OrtReleaseTensor(tensor);
                    }
                  },
                  "gpu-buffer"
                ]);
              } else {
                const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
                const data = new typedArrayConstructor(size);
                new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
                output.push([type, dims, data, "cpu"]);
              }
            }
          } finally {
            wasm2.stackRestore(beforeGetTensorDataStack);
            if (type === "string" && dataOffset) {
              wasm2._free(dataOffset);
            }
            if (!keepOutputTensor) {
              wasm2._OrtReleaseTensor(tensor);
            }
          }
        }
        if (ioBindingState && !enableGraphCapture) {
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
          activeSessions.set(
            sessionId,
            [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, false]
          );
        }
        return output;
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    endProfiling = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error("invalid session id");
      }
      const sessionHandle = session[0];
      const profileFileName = wasm2._OrtEndProfiling(sessionHandle);
      if (profileFileName === 0) {
        checkLastError("Can't get an profile file name.");
      }
      wasm2._OrtFree(profileFileName);
    };
    extractTransferableBuffers = (tensors) => {
      const buffers = [];
      for (const tensor of tensors) {
        const data = tensor[2];
        if (!Array.isArray(data) && "buffer" in data) {
          buffers.push(data.buffer);
        }
      }
      return buffers;
    };
  }
});

// proxy-worker:./proxy-worker/main
var require_main = __commonJS({
  "proxy-worker:./proxy-worker/main"(exports, module2) {
    module2.exports = '/*!\n * ONNX Runtime Web v1.18.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    createReadStream: () => createReadStream,\n    readFile: () => readFile,\n    readFileSync: () => readFileSync\n  });\n  var readFile, readFileSync, createReadStream;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n      readFileSync = void 0;\n      createReadStream = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-training-wasm-simd.js\n  var require_ort_training_wasm_simd = __commonJS({\n    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var d = moduleArg, k, l;\n          d.ready = new Promise((a, b) => {\n            k = a;\n            l = b;\n          });\n          var r = Object.assign({}, d), v = "./this.program", aa = "object" == typeof window, x = "function" == typeof importScripts, ba = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, y = "", A, B, C;\n          if (ba) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), D = (init_path(), __toCommonJS(path_exports));\n            y = x ? D.dirname(y) + "/" : __dirname + "/";\n            A = (a, b) => {\n              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            C = (a) => {\n              a = A(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            B = (a, b, c, f = true) => {\n              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);\n              fs.readFile(a, f ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(f ? h.buffer : h);\n              });\n            };\n            !d.thisProgram && 1 < process.argv.length && (v = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            d.inspect = () => "[Emscripten Module object]";\n          } else if (aa || x)\n            x ? y = self.location.href : "undefined" != typeof document && document.currentScript && (y = document.currentScript.src), _scriptDir && (y = _scriptDir), 0 !== y.indexOf("blob:") ? y = y.substr(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1) : y = "", A = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, x && (C = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), B = (a, b, c) => {\n              var f = new XMLHttpRequest();\n              f.open("GET", a, true);\n              f.responseType = "arraybuffer";\n              f.onload = () => {\n                200 == f.status || 0 == f.status && f.response ? b(f.response) : c();\n              };\n              f.onerror = c;\n              f.send(null);\n            };\n          var ca = d.print || console.log.bind(console), E = d.printErr || console.error.bind(console);\n          Object.assign(d, r);\n          r = null;\n          d.thisProgram && (v = d.thisProgram);\n          var F;\n          d.wasmBinary && (F = d.wasmBinary);\n          var noExitRuntime = d.noExitRuntime || true;\n          "object" != typeof WebAssembly && G("no native wasm support detected");\n          var H, I, da = false, J, K, L, M;\n          function ea() {\n            var a = H.buffer;\n            d.HEAP8 = J = new Int8Array(a);\n            d.HEAP16 = new Int16Array(a);\n            d.HEAP32 = L = new Int32Array(a);\n            d.HEAPU8 = K = new Uint8Array(a);\n            d.HEAPU16 = new Uint16Array(a);\n            d.HEAPU32 = M = new Uint32Array(a);\n            d.HEAPF32 = new Float32Array(a);\n            d.HEAPF64 = new Float64Array(a);\n          }\n          var fa = [], ha = [], ia = [];\n          function ja() {\n            var a = d.preRun.shift();\n            fa.unshift(a);\n          }\n          var N = 0, O = null, P = null;\n          function G(a) {\n            if (d.onAbort)\n              d.onAbort(a);\n            a = "Aborted(" + a + ")";\n            E(a);\n            da = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          function ka(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var Q;\n          Q = "ort-training-wasm-simd.wasm";\n          if (!ka(Q)) {\n            var la = Q;\n            Q = d.locateFile ? d.locateFile(la, y) : y + la;\n          }\n          function ma(a) {\n            if (a == Q && F)\n              return new Uint8Array(F);\n            if (C)\n              return C(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function na(a) {\n            if (!F && (aa || x)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => ma(a));\n              if (B)\n                return new Promise((b, c) => {\n                  B(a, (f) => b(new Uint8Array(f)), c);\n                });\n            }\n            return Promise.resolve().then(() => ma(a));\n          }\n          function oa(a, b, c) {\n            return na(a).then((f) => WebAssembly.instantiate(f, b)).then((f) => f).then(c, (f) => {\n              E("failed to asynchronously prepare wasm: " + f);\n              G(f);\n            });\n          }\n          function pa(a, b) {\n            var c = Q;\n            return F || "function" != typeof WebAssembly.instantiateStreaming || ka(c) || c.startsWith("file://") || ba || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((f) => WebAssembly.instantiateStreaming(f, a).then(b, function(g) {\n              E("wasm streaming compile failed: " + g);\n              E("falling back to ArrayBuffer instantiation");\n              return oa(c, a, b);\n            }));\n          }\n          var R, S = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(d);\n          };\n          function qa(a) {\n            this.Ha = a - 24;\n            this.La = function(b) {\n              M[this.Ha + 4 >> 2 >>> 0] = b;\n            };\n            this.Ka = function(b) {\n              M[this.Ha + 8 >> 2 >>> 0] = b;\n            };\n            this.Ia = function(b, c) {\n              this.Ja();\n              this.La(b);\n              this.Ka(c);\n            };\n            this.Ja = function() {\n              M[this.Ha + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {\n            b >>>= 0;\n            var f = b + c;\n            for (c = b; a[c] && !(c >= f); )\n              ++c;\n            if (16 < c - b && a.buffer && ta)\n              return ta.decode(a.subarray(b, c));\n            for (f = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  f += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var m = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;\n                  65536 > g ? f += String.fromCharCode(g) : (g -= 65536, f += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                f += String.fromCharCode(g);\n            }\n            return f;\n          }, T = (a, b) => (a >>>= 0) ? ua(K, a, b) : "", U = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var f = a.charCodeAt(c);\n              127 >= f ? b++ : 2047 >= f ? b += 2 : 55296 <= f && 57343 >= f ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, V = (a, b, c, f) => {\n            c >>>= 0;\n            if (!(0 < f))\n              return 0;\n            var g = c;\n            f = c + f - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var m = a.charCodeAt(h);\n              if (55296 <= m && 57343 >= m) {\n                var q = a.charCodeAt(++h);\n                m = 65536 + ((m & 1023) << 10) | q & 1023;\n              }\n              if (127 >= m) {\n                if (c >= f)\n                  break;\n                b[c++ >>> 0] = m;\n              } else {\n                if (2047 >= m) {\n                  if (c + 1 >= f)\n                    break;\n                  b[c++ >>> 0] = 192 | m >> 6;\n                } else {\n                  if (65535 >= m) {\n                    if (c + 2 >= f)\n                      break;\n                    b[c++ >>> 0] = 224 | m >> 12;\n                  } else {\n                    if (c + 3 >= f)\n                      break;\n                    b[c++ >>> 0] = 240 | m >> 18;\n                    b[c++ >>> 0] = 128 | m >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | m >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | m & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, W = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), va = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], wa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ba = (a) => {\n            var b = U(a) + 1, c = Aa(b);\n            c && V(a, K, c, b);\n            return c;\n          }, X = {}, Ca = () => {\n            if (!Y) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(\n                "-",\n                "_"\n              ) + ".UTF-8", _: v || "./this.program" }, b;\n              for (b in X)\n                void 0 === X[b] ? delete a[b] : a[b] = X[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Y = c;\n            }\n            return Y;\n          }, Y, Da = [null, [], []], Ea = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Fa = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ga(a) {\n            var b = Array(U(a) + 1);\n            V(a, b, 0, b.length);\n            return b;\n          }\n          function Ha(a, b, c, f) {\n            function g(e, n, p) {\n              for (e = "number" == typeof e ? e.toString() : e || ""; e.length < n; )\n                e = p[0] + e;\n              return e;\n            }\n            function h(e, n) {\n              return g(e, n, "0");\n            }\n            function m(e, n) {\n              function p(xa) {\n                return 0 > xa ? -1 : 0 < xa ? 1 : 0;\n              }\n              var z;\n              0 === (z = p(e.getFullYear() - n.getFullYear())) && 0 === (z = p(e.getMonth() - n.getMonth())) && (z = p(e.getDate() - n.getDate()));\n              return z;\n            }\n            function q(e) {\n              switch (e.getDay()) {\n                case 0:\n                  return new Date(e.getFullYear() - 1, 11, 29);\n                case 1:\n                  return e;\n                case 2:\n                  return new Date(e.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    e.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(e.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(e.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(e.getFullYear() - 1, 11, 30);\n              }\n            }\n            function w(e) {\n              var n = e.Ca;\n              for (e = new Date(new Date(e.Da + 1900, 0, 1).getTime()); 0 < n; ) {\n                var p = e.getMonth(), z = (W(e.getFullYear()) ? Ea : Fa)[p];\n                if (n > z - e.getDate())\n                  n -= z - e.getDate() + 1, e.setDate(1), 11 > p ? e.setMonth(p + 1) : (e.setMonth(0), e.setFullYear(e.getFullYear() + 1));\n                else {\n                  e.setDate(e.getDate() + n);\n                  break;\n                }\n              }\n              p = new Date(e.getFullYear() + 1, 0, 4);\n              n = q(new Date(\n                e.getFullYear(),\n                0,\n                4\n              ));\n              p = q(p);\n              return 0 >= m(n, e) ? 0 >= m(p, e) ? e.getFullYear() + 1 : e.getFullYear() : e.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            f >>>= 0;\n            var t = L[f + 40 >> 2 >>> 0];\n            f = { Oa: L[f >> 2 >>> 0], Na: L[f + 4 >> 2 >>> 0], Ea: L[f + 8 >> 2 >>> 0], Ga: L[f + 12 >> 2 >>> 0], Fa: L[f + 16 >> 2 >>> 0], Da: L[f + 20 >> 2 >>> 0], xa: L[f + 24 >> 2 >>> 0], Ca: L[f + 28 >> 2 >>> 0], Qa: L[f + 32 >> 2 >>> 0], Ma: L[f + 36 >> 2 >>> 0], Pa: t ? T(t) : "" };\n            c = T(c);\n            t = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var u in t)\n              c = c.replace(new RegExp(u, "g"), t[u]);\n            var ya = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), za = "January February March April May June July August September October November December".split(" ");\n            t = { "%a": (e) => ya[e.xa].substring(0, 3), "%A": (e) => ya[e.xa], "%b": (e) => za[e.Fa].substring(0, 3), "%B": (e) => za[e.Fa], "%C": (e) => h((e.Da + 1900) / 100 | 0, 2), "%d": (e) => h(e.Ga, 2), "%e": (e) => g(e.Ga, 2, " "), "%g": (e) => w(e).toString().substring(2), "%G": (e) => w(e), "%H": (e) => h(e.Ea, 2), "%I": (e) => {\n              e = e.Ea;\n              0 == e ? e = 12 : 12 < e && (e -= 12);\n              return h(e, 2);\n            }, "%j": (e) => {\n              for (var n = 0, p = 0; p <= e.Fa - 1; n += (W(e.Da + 1900) ? Ea : Fa)[p++])\n                ;\n              return h(e.Ga + n, 3);\n            }, "%m": (e) => h(e.Fa + 1, 2), "%M": (e) => h(e.Na, 2), "%n": () => "\\n", "%p": (e) => 0 <= e.Ea && 12 > e.Ea ? "AM" : "PM", "%S": (e) => h(e.Oa, 2), "%t": () => "	", "%u": (e) => e.xa || 7, "%U": (e) => h(Math.floor((e.Ca + 7 - e.xa) / 7), 2), "%V": (e) => {\n              var n = Math.floor((e.Ca + 7 - (e.xa + 6) % 7) / 7);\n              2 >= (e.xa + 371 - e.Ca - 2) % 7 && n++;\n              if (n)\n                53 == n && (p = (e.xa + 371 - e.Ca) % 7, 4 == p || 3 == p && W(e.Da) || (n = 1));\n              else {\n                n = 52;\n                var p = (e.xa + 7 - e.Ca - 1) % 7;\n                (4 == p || 5 == p && W(e.Da % 400 - 1)) && n++;\n              }\n              return h(n, 2);\n            }, "%w": (e) => e.xa, "%W": (e) => h(Math.floor((e.Ca + 7 - (e.xa + 6) % 7) / 7), 2), "%y": (e) => (e.Da + 1900).toString().substring(2), "%Y": (e) => e.Da + 1900, "%z": (e) => {\n              e = e.Ma;\n              var n = 0 <= e;\n              e = Math.abs(e) / 60;\n              return (n ? "+" : "-") + String("0000" + (e / 60 * 100 + e % 60)).slice(-4);\n            }, "%Z": (e) => e.Pa, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (u in t)\n              c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](f)));\n            c = c.replace(/\\0\\0/g, "%");\n            u = Ga(c);\n            if (u.length > b)\n              return 0;\n            J.set(u, a >>> 0);\n            return u.length - 1;\n          }\n          var Ja = {\n            a: function(a, b, c) {\n              a >>>= 0;\n              new qa(a).Ia(b >>> 0, c >>> 0);\n              ra = a;\n              sa++;\n              throw ra;\n            },\n            e: function() {\n              return 0;\n            },\n            H: function() {\n            },\n            x: function() {\n            },\n            z: function() {\n            },\n            k: function() {\n              return 0;\n            },\n            F: function() {\n            },\n            B: function() {\n            },\n            E: function() {\n            },\n            g: function() {\n            },\n            y: function() {\n            },\n            v: function() {\n            },\n            G: function() {\n            },\n            w: function() {\n            },\n            l: () => true,\n            o: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              L[c >> 2 >>> 0] = a.getUTCSeconds();\n              L[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              L[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              L[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              L[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              L[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              L[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              L[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n            },\n            p: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              L[c >> 2 >>> 0] = a.getSeconds();\n              L[c + 4 >> 2 >>> 0] = a.getMinutes();\n              L[c + 8 >> 2 >>> 0] = a.getHours();\n              L[c + 12 >> 2 >>> 0] = a.getDate();\n              L[c + 16 >> 2 >>> 0] = a.getMonth();\n              L[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              L[c + 24 >> 2 >>> 0] = a.getDay();\n              L[c + 28 >> 2 >>> 0] = (W(a.getFullYear()) ? va : wa)[a.getMonth()] + a.getDate() - 1 | 0;\n              L[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var f = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              L[c + 32 >> 2 >>> 0] = (b != f && a.getTimezoneOffset() == Math.min(f, b)) | 0;\n            },\n            q: function(a) {\n              a >>>= 0;\n              var b = new Date(L[a + 20 >> 2 >>> 0] + 1900, L[a + 16 >> 2 >>> 0], L[a + 12 >> 2 >>> 0], L[a + 8 >> 2 >>> 0], L[a + 4 >> 2 >>> 0], L[a >> 2 >>> 0], 0), c = L[a + 32 >> 2 >>> 0], f = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);\n              0 > c ? L[a + 32 >> 2 >>> 0] = Number(g != h && m == f) : 0 < c != (m == f) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - f)));\n              L[a + 24 >> 2 >>> 0] = b.getDay();\n              L[a + 28 >> 2 >>> 0] = (W(b.getFullYear()) ? va : wa)[b.getMonth()] + b.getDate() - 1 | 0;\n              L[a >> 2 >>> 0] = b.getSeconds();\n              L[a + 4 >> 2 >>> 0] = b.getMinutes();\n              L[a + 8 >> 2 >>> 0] = b.getHours();\n              L[a + 12 >> 2 >>> 0] = b.getDate();\n              L[a + 16 >> 2 >>> 0] = b.getMonth();\n              L[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Ia((R = a, 1 <= +Math.abs(R) ? 0 < R ? +Math.floor(R / 4294967296) >>> 0 : ~~+Math.ceil((R - +(~~R >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            m: function() {\n              return -52;\n            },\n            n: function() {\n            },\n            t: function(a, b, c) {\n              function f(w) {\n                return (w = w.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? w[1] : "GMT";\n              }\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var q = m.getTimezoneOffset();\n              M[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, q);\n              L[b >>> 0 >> 2 >>> 0] = Number(g != q);\n              a = f(h);\n              b = f(m);\n              a = Ba(a);\n              b = Ba(b);\n              q < g ? (M[c >> 2 >>> 0] = a, M[c + 4 >> 2 >>> 0] = b) : (M[c >> 2 >>> 0] = b, M[c + 4 >> 2 >>> 0] = a);\n            },\n            d: () => {\n              G("");\n            },\n            h: function() {\n              return Date.now();\n            },\n            u: function() {\n              return 4294901760;\n            },\n            b: () => performance.now(),\n            I: function(a, b, c) {\n              b >>>= 0;\n              return K.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n            },\n            s: function(a) {\n              a >>>= 0;\n              var b = K.length;\n              if (4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var f = b * (1 + 0.2 / c);\n                f = Math.min(f, a + 100663296);\n                var g = Math;\n                f = Math.max(a, f);\n                a: {\n                  g = g.min.call(g, 4294901760, f + (65536 - f % 65536) % 65536) - H.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    H.grow(g);\n                    ea();\n                    var h = 1;\n                    break a;\n                  } catch (m) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            C: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = 0;\n              Ca().forEach(function(f, g) {\n                var h = b + c;\n                g = M[a + 4 * g >> 2 >>> 0] = h;\n                for (h = 0; h < f.length; ++h)\n                  J[g++ >> 0 >>> 0] = f.charCodeAt(h);\n                J[g >> 0 >>> 0] = 0;\n                c += f.length + 1;\n              });\n              return 0;\n            },\n            D: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = Ca();\n              M[a >> 2 >>> 0] = c.length;\n              var f = 0;\n              c.forEach(function(g) {\n                f += g.length + 1;\n              });\n              M[b >> 2 >>> 0] = f;\n              return 0;\n            },\n            f: () => 52,\n            j: function() {\n              return 52;\n            },\n            r: function() {\n              return 70;\n            },\n            i: function(a, b, c, f) {\n              b >>>= 0;\n              c >>>= 0;\n              f >>>= 0;\n              for (var g = 0, h = 0; h < c; h++) {\n                var m = M[b >> 2 >>> 0], q = M[b + 4 >> 2 >>> 0];\n                b += 8;\n                for (var w = 0; w < q; w++) {\n                  var t = K[m + w >>> 0], u = Da[a];\n                  0 === t || 10 === t ? ((1 === a ? ca : E)(ua(u, 0)), u.length = 0) : u.push(t);\n                }\n                g += q;\n              }\n              M[f >> 2 >>> 0] = g;\n              return 0;\n            },\n            A: Ha,\n            c: function(a, b, c, f) {\n              return Ha(a >>> 0, b >>> 0, c >>> 0, f >>> 0);\n            }\n          };\n          (function() {\n            function a(c) {\n              c = c.exports;\n              I = c = Ka(c);\n              H = I.J;\n              ea();\n              ha.unshift(I.K);\n              N--;\n              d.monitorRunDependencies && d.monitorRunDependencies(N);\n              if (0 == N && (null !== O && (clearInterval(O), O = null), P)) {\n                var f = P;\n                P = null;\n                f();\n              }\n              return c;\n            }\n            var b = { a: Ja };\n            N++;\n            d.monitorRunDependencies && d.monitorRunDependencies(N);\n            if (d.instantiateWasm)\n              try {\n                return d.instantiateWasm(b, a);\n              } catch (c) {\n                E("Module.instantiateWasm callback failed with error: " + c), l(c);\n              }\n            pa(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          })();\n          d._OrtInit = (a, b) => (d._OrtInit = I.L)(a, b);\n          d._OrtGetLastError = (a, b) => (d._OrtGetLastError = I.M)(a, b);\n          d._OrtCreateSessionOptions = (a, b, c, f, g, h, m, q, w, t) => (d._OrtCreateSessionOptions = I.N)(a, b, c, f, g, h, m, q, w, t);\n          d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = I.O)(a, b);\n          d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = I.P)(a, b, c);\n          d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = I.Q)(a, b, c);\n          d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = I.R)(a);\n          d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = I.S)(a, b, c);\n          d._OrtReleaseSession = (a) => (d._OrtReleaseSession = I.T)(a);\n          d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = I.U)(a, b, c);\n          d._OrtGetInputName = (a, b) => (d._OrtGetInputName = I.V)(a, b);\n          d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = I.W)(a, b);\n          d._OrtFree = (a) => (d._OrtFree = I.X)(a);\n          d._OrtCreateTensor = (a, b, c, f, g, h) => (d._OrtCreateTensor = I.Y)(a, b, c, f, g, h);\n          d._OrtGetTensorData = (a, b, c, f, g) => (d._OrtGetTensorData = I.Z)(a, b, c, f, g);\n          d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = I._)(a);\n          d._OrtCreateRunOptions = (a, b, c, f) => (d._OrtCreateRunOptions = I.$)(a, b, c, f);\n          d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = I.aa)(a, b, c);\n          d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = I.ba)(a);\n          d._OrtCreateBinding = (a) => (d._OrtCreateBinding = I.ca)(a);\n          d._OrtBindInput = (a, b, c) => (d._OrtBindInput = I.da)(a, b, c);\n          d._OrtBindOutput = (a, b, c, f) => (d._OrtBindOutput = I.ea)(a, b, c, f);\n          d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = I.fa)(a);\n          d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = I.ga)(a);\n          d._OrtRunWithBinding = (a, b, c, f, g) => (d._OrtRunWithBinding = I.ha)(a, b, c, f, g);\n          d._OrtRun = (a, b, c, f, g, h, m, q) => (d._OrtRun = I.ia)(a, b, c, f, g, h, m, q);\n          d._OrtEndProfiling = (a) => (d._OrtEndProfiling = I.ja)(a);\n          d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = I.ka)(a, b);\n          d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = I.la)(a);\n          d._OrtTrainingCreateSession = (a, b, c, f, g, h, m, q) => (d._OrtTrainingCreateSession = I.ma)(a, b, c, f, g, h, m, q);\n          d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = I.na)(a);\n          d._OrtTrainingRunTrainStep = (a, b, c, f, g, h) => (d._OrtTrainingRunTrainStep = I.oa)(a, b, c, f, g, h);\n          d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = I.pa)(a, b);\n          d._OrtTrainingEvalStep = (a, b, c, f, g, h) => (d._OrtTrainingEvalStep = I.qa)(a, b, c, f, g, h);\n          d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = I.ra)(a, b, c);\n          d._OrtTrainingCopyParametersToBuffer = (a, b, c, f) => (d._OrtTrainingCopyParametersToBuffer = I.sa)(a, b, c, f);\n          d._OrtTrainingCopyParametersFromBuffer = (a, b, c, f) => (d._OrtTrainingCopyParametersFromBuffer = I.ta)(a, b, c, f);\n          d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = I.ua)(a);\n          var Aa = d._malloc = (a) => (Aa = d._malloc = I.va)(a);\n          d._free = (a) => (d._free = I.wa)(a);\n          var Ia = (a) => (Ia = I.ya)(a), La = () => (La = I.za)(), Ma = (a) => (Ma = I.Aa)(a), Na = (a) => (Na = I.Ba)(a);\n          function Ka(a) {\n            a = Object.assign({}, a);\n            var b = (f) => () => f() >>> 0, c = (f) => (g) => f(g) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          d.stackAlloc = Na;\n          d.stackSave = La;\n          d.stackRestore = Ma;\n          d.UTF8ToString = T;\n          d.stringToUTF8 = (a, b, c) => V(a, K, b, c);\n          d.lengthBytesUTF8 = U;\n          var Z;\n          P = function Oa() {\n            Z || Pa();\n            Z || (P = Oa);\n          };\n          function Pa() {\n            function a() {\n              if (!Z && (Z = true, d.calledRun = true, !da)) {\n                S(ha);\n                k(d);\n                if (d.onRuntimeInitialized)\n                  d.onRuntimeInitialized();\n                if (d.postRun)\n                  for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {\n                    var b = d.postRun.shift();\n                    ia.unshift(b);\n                  }\n                S(ia);\n              }\n            }\n            if (!(0 < N)) {\n              if (d.preRun)\n                for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )\n                  ja();\n              S(fa);\n              0 < N || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {\n                setTimeout(function() {\n                  d.setStatus("");\n                }, 1);\n                a();\n              }, 1)) : a());\n            }\n          }\n          if (d.preInit)\n            for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )\n              d.preInit.pop()();\n          Pa();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function aa() {\n            d.buffer != l.buffer && m();\n            return l;\n          }\n          function n() {\n            d.buffer != l.buffer && m();\n            return ba;\n          }\n          function p() {\n            d.buffer != l.buffer && m();\n            return ca;\n          }\n          function r() {\n            d.buffer != l.buffer && m();\n            return da;\n          }\n          function ea() {\n            d.buffer != l.buffer && m();\n            return fa;\n          }\n          var w = moduleArg, ha, x;\n          w.ready = new Promise((a, b) => {\n            ha = a;\n            x = b;\n          });\n          var ia = Object.assign({}, w), ja = "./this.program", z = (a, b) => {\n            throw b;\n          }, ka = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = w.ENVIRONMENT_IS_PTHREAD || false, E = "";\n          function la(a) {\n            return w.locateFile ? w.locateFile(a, E) : E + a;\n          }\n          var ma, F, H;\n          if (B) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));\n            E = A ? na.dirname(E) + "/" : __dirname + "/";\n            ma = (b, c) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            H = (b) => {\n              b = ma(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            F = (b, c, e, h = true) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              fs.readFile(b, h ? void 0 : "utf8", (g, k) => {\n                g ? e(g) : c(h ? k.buffer : k);\n              });\n            };\n            !w.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            z = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            w.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (ka || A)\n            A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ma = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, A && (H = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), F = (a, b, c) => {\n              var e = new XMLHttpRequest();\n              e.open("GET", a, true);\n              e.responseType = "arraybuffer";\n              e.onload = () => {\n                200 == e.status || 0 == e.status && e.response ? b(e.response) : c();\n              };\n              e.onerror = c;\n              e.send(null);\n            });\n          B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var oa = console.log.bind(console), pa = console.error.bind(console);\n          B && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var qa = w.print || oa, I = w.printErr || pa;\n          Object.assign(w, ia);\n          ia = null;\n          w.thisProgram && (ja = w.thisProgram);\n          w.quit && (z = w.quit);\n          var J;\n          w.wasmBinary && (J = w.wasmBinary);\n          var noExitRuntime = w.noExitRuntime || true;\n          "object" != typeof WebAssembly && K("no native wasm support detected");\n          var d, L, ra, M = false, N, l, ba, ca, da, fa;\n          function m() {\n            var a = d.buffer;\n            w.HEAP8 = l = new Int8Array(a);\n            w.HEAP16 = new Int16Array(a);\n            w.HEAP32 = ca = new Int32Array(a);\n            w.HEAPU8 = ba = new Uint8Array(a);\n            w.HEAPU16 = new Uint16Array(a);\n            w.HEAPU32 = da = new Uint32Array(a);\n            w.HEAPF32 = new Float32Array(a);\n            w.HEAPF64 = fa = new Float64Array(a);\n          }\n          var O = w.INITIAL_MEMORY || 16777216;\n          5242880 <= O || K("INITIAL_MEMORY should be larger than STACK_SIZE, was " + O + "! (STACK_SIZE=5242880)");\n          if (D)\n            d = w.wasmMemory;\n          else if (w.wasmMemory)\n            d = w.wasmMemory;\n          else if (d = new WebAssembly.Memory({ initial: O / 65536, maximum: 65536, shared: true }), !(d.buffer instanceof SharedArrayBuffer))\n            throw I("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && I("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          m();\n          O = d.buffer.byteLength;\n          var sa, ta = [], ua = [], va = [], wa = 0;\n          function P() {\n            return noExitRuntime || 0 < wa;\n          }\n          var Q = 0, xa = null, R = null;\n          function ya() {\n            Q++;\n            w.monitorRunDependencies && w.monitorRunDependencies(Q);\n          }\n          function za() {\n            Q--;\n            w.monitorRunDependencies && w.monitorRunDependencies(Q);\n            if (0 == Q && (null !== xa && (clearInterval(xa), xa = null), R)) {\n              var a = R;\n              R = null;\n              a();\n            }\n          }\n          function K(a) {\n            if (w.onAbort)\n              w.onAbort(a);\n            a = "Aborted(" + a + ")";\n            I(a);\n            M = true;\n            N = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            x(a);\n            throw a;\n          }\n          function Aa(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var S;\n          S = "ort-wasm-threaded.wasm";\n          Aa(S) || (S = la(S));\n          function Ba(a) {\n            if (a == S && J)\n              return new Uint8Array(J);\n            if (H)\n              return H(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ca(a) {\n            if (!J && (ka || A)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => Ba(a));\n              if (F)\n                return new Promise((b, c) => {\n                  F(a, (e) => b(new Uint8Array(e)), c);\n                });\n            }\n            return Promise.resolve().then(() => Ba(a));\n          }\n          function Da(a, b, c) {\n            return Ca(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {\n              I("failed to asynchronously prepare wasm: " + e);\n              K(e);\n            });\n          }\n          function Ea(a, b) {\n            var c = S;\n            return J || "function" != typeof WebAssembly.instantiateStreaming || Aa(c) || c.startsWith("file://") || B || "function" != typeof fetch ? Da(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(h) {\n              I("wasm streaming compile failed: " + h);\n              I("falling back to ArrayBuffer instantiation");\n              return Da(c, a, b);\n            }));\n          }\n          var T;\n          function U(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          function Fa(a) {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }\n          function Ga(a) {\n            (a = V.La[a]) || K();\n            V.lb(a);\n          }\n          function Ha(a) {\n            var b = V.fb();\n            if (!b)\n              return 6;\n            V.Oa.push(b);\n            V.La[a.Na] = b;\n            b.Na = a.Na;\n            var c = { cmd: "run", start_routine: a.mb, arg: a.eb, pthread_ptr: a.Na };\n            B && b.unref();\n            b.postMessage(c, a.sb);\n            return 0;\n          }\n          var Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {\n            b >>>= 0;\n            var e = b + c;\n            for (c = b; a[c] && !(c >= e); )\n              ++c;\n            if (16 < c - b && a.buffer && Ia)\n              return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (e = ""; b < c; ) {\n              var h = a[b++];\n              if (h & 128) {\n                var g = a[b++] & 63;\n                if (192 == (h & 224))\n                  e += String.fromCharCode((h & 31) << 6 | g);\n                else {\n                  var k = a[b++] & 63;\n                  h = 224 == (h & 240) ? (h & 15) << 12 | g << 6 | k : (h & 7) << 18 | g << 12 | k << 6 | a[b++] & 63;\n                  65536 > h ? e += String.fromCharCode(h) : (h -= 65536, e += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));\n                }\n              } else\n                e += String.fromCharCode(h);\n            }\n            return e;\n          }, Ka = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "";\n          function La(a) {\n            if (D)\n              return W(1, 1, a);\n            N = a;\n            if (!P()) {\n              V.nb();\n              if (w.onExit)\n                w.onExit(a);\n              M = true;\n            }\n            z(a, new U(a));\n          }\n          var Na = (a) => {\n            N = a;\n            if (D)\n              throw Ma(a), "unwind";\n            La(a);\n          }, V = {\n            Ra: [],\n            Oa: [],\n            Za: [],\n            La: {},\n            Va: function() {\n              D ? V.hb() : V.gb();\n            },\n            gb: function() {\n              ta.unshift(() => {\n                ya();\n                V.ib(() => za());\n              });\n            },\n            hb: function() {\n              V.receiveObjectTransfer = V.kb;\n              V.threadInitTLS = V.Ya;\n              V.setExitStatus = V.Xa;\n              noExitRuntime = false;\n            },\n            Xa: function(a) {\n              N = a;\n            },\n            xb: ["$terminateWorker"],\n            nb: function() {\n              for (var a of V.Oa)\n                Fa(a);\n              for (a of V.Ra)\n                Fa(a);\n              V.Ra = [];\n              V.Oa = [];\n              V.La = [];\n            },\n            lb: function(a) {\n              var b = a.Na;\n              delete V.La[b];\n              V.Ra.push(a);\n              V.Oa.splice(V.Oa.indexOf(a), 1);\n              a.Na = 0;\n              Oa(b);\n            },\n            kb: function() {\n            },\n            Ya: function() {\n              V.Za.forEach((a) => a());\n            },\n            jb: (a) => new Promise((b) => {\n              a.onmessage = (g) => {\n                g = g.data;\n                var k = g.cmd;\n                if (g.targetThread && g.targetThread != X()) {\n                  var t = V.La[g.wb];\n                  t ? t.postMessage(g, g.transferList) : I(\'Internal error! Worker sent a message "\' + k + \'" to target pthread \' + g.targetThread + ", but that thread no longer exists!");\n                } else if ("checkMailbox" === k)\n                  Y();\n                else if ("spawnThread" === k)\n                  Ha(g);\n                else if ("cleanupThread" === k)\n                  Ga(g.thread);\n                else if ("killThread" === k)\n                  g = g.thread, k = V.La[g], delete V.La[g], Fa(k), Oa(g), V.Oa.splice(\n                    V.Oa.indexOf(k),\n                    1\n                  ), k.Na = 0;\n                else if ("cancelThread" === k)\n                  V.La[g.thread].postMessage({ cmd: "cancel" });\n                else if ("loaded" === k)\n                  a.loaded = true, b(a);\n                else if ("alert" === k)\n                  alert("Thread " + g.threadId + ": " + g.text);\n                else if ("setimmediate" === g.target)\n                  a.postMessage(g);\n                else if ("callHandler" === k)\n                  w[g.handler](...g.args);\n                else\n                  k && I("worker sent an unknown command " + k);\n              };\n              a.onerror = (g) => {\n                I("worker sent an error! " + g.filename + ":" + g.lineno + ": " + g.message);\n                throw g;\n              };\n              B && (a.on("message", function(g) {\n                a.onmessage({ data: g });\n              }), a.on("error", function(g) {\n                a.onerror(g);\n              }));\n              var c = [], e = ["onExit", "onAbort", "print", "printErr"], h;\n              for (h of e)\n                w.hasOwnProperty(h) && c.push(h);\n              a.postMessage({ cmd: "load", handlers: c, urlOrBlob: w.mainScriptUrlOrBlob || _scriptDir, wasmMemory: d, wasmModule: ra });\n            }),\n            ib: function(a) {\n              a();\n            },\n            cb: function() {\n              var a = la("ort-wasm-threaded.worker.js");\n              a = new Worker(a);\n              V.Ra.push(a);\n            },\n            fb: function() {\n              0 == V.Ra.length && (V.cb(), V.jb(V.Ra[0]));\n              return V.Ra.pop();\n            }\n          };\n          w.PThread = V;\n          var Pa = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(w);\n          };\n          w.establishStackSpace = function() {\n            var a = X(), b = p()[a + 52 >> 2 >>> 0];\n            a = p()[a + 56 >> 2 >>> 0];\n            Qa(b, b - a);\n            Ra(b);\n          };\n          function Ma(a) {\n            if (D)\n              return W(2, 0, a);\n            Na(a);\n          }\n          var Sa = [];\n          w.invokeEntryPoint = function(a, b) {\n            var c = Sa[a];\n            c || (a >= Sa.length && (Sa.length = a + 1), Sa[a] = c = sa.get(a));\n            a = c(b);\n            P() ? V.Xa(a) : Ta(a);\n          };\n          function Ua(a) {\n            this.Ua = a - 24;\n            this.bb = function(b) {\n              r()[this.Ua + 4 >> 2 >>> 0] = b;\n            };\n            this.ab = function(b) {\n              r()[this.Ua + 8 >> 2 >>> 0] = b;\n            };\n            this.Va = function(b, c) {\n              this.$a();\n              this.bb(b);\n              this.ab(c);\n            };\n            this.$a = function() {\n              r()[this.Ua + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var Va = 0, Wa = 0;\n          function Xa(a, b, c, e) {\n            return D ? W(3, 1, a, b, c, e) : Ya(a, b, c, e);\n          }\n          function Ya(a, b, c, e) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return I("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var h = [];\n            if (D && 0 === h.length)\n              return Xa(a, b, c, e);\n            a = { mb: c, Na: a, eb: e, sb: h };\n            return D ? (a.ub = "spawnThread", postMessage(a, h), 0) : Ha(a);\n          }\n          function Za(a, b, c) {\n            return D ? W(4, 1, a, b, c) : 0;\n          }\n          function $a(a, b) {\n            if (D)\n              return W(5, 1, a, b);\n          }\n          var ab = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var e = a.charCodeAt(c);\n              127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, bb = (a, b, c, e) => {\n            c >>>= 0;\n            if (!(0 < e))\n              return 0;\n            var h = c;\n            e = c + e - 1;\n            for (var g = 0; g < a.length; ++g) {\n              var k = a.charCodeAt(g);\n              if (55296 <= k && 57343 >= k) {\n                var t = a.charCodeAt(++g);\n                k = 65536 + ((k & 1023) << 10) | t & 1023;\n              }\n              if (127 >= k) {\n                if (c >= e)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= e)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= e)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= e)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - h;\n          }, cb = (a, b, c) => bb(a, n(), b, c);\n          function db(a, b) {\n            if (D)\n              return W(6, 1, a, b);\n          }\n          function eb(a, b, c) {\n            if (D)\n              return W(7, 1, a, b, c);\n          }\n          function fb(a, b, c) {\n            return D ? W(8, 1, a, b, c) : 0;\n          }\n          function gb(a, b) {\n            if (D)\n              return W(9, 1, a, b);\n          }\n          function hb(a, b, c) {\n            if (D)\n              return W(10, 1, a, b, c);\n          }\n          function ib(a, b, c, e) {\n            if (D)\n              return W(11, 1, a, b, c, e);\n          }\n          function jb(a, b, c, e) {\n            if (D)\n              return W(12, 1, a, b, c, e);\n          }\n          function kb(a, b, c, e) {\n            if (D)\n              return W(13, 1, a, b, c, e);\n          }\n          function lb(a) {\n            if (D)\n              return W(14, 1, a);\n          }\n          function mb(a, b) {\n            if (D)\n              return W(15, 1, a, b);\n          }\n          function nb(a, b, c) {\n            if (D)\n              return W(16, 1, a, b, c);\n          }\n          var ob = (a) => {\n            if (!M)\n              try {\n                if (a(), !P())\n                  try {\n                    D ? Ta(N) : Na(N);\n                  } catch (b) {\n                    b instanceof U || "unwind" == b || z(1, b);\n                  }\n              } catch (b) {\n                b instanceof U || "unwind" == b || z(1, b);\n              }\n          };\n          function pb(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.tb && (Atomics.tb(p(), a >> 2, a).value.then(Y), a += 128, Atomics.store(p(), a >> 2, 1));\n          }\n          w.__emscripten_thread_mailbox_await = pb;\n          function Y() {\n            var a = X();\n            a && (pb(a), ob(() => qb()));\n          }\n          w.checkMailbox = Y;\n          var Z = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), rb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], sb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function tb(a, b, c, e, h, g, k, t) {\n            return D ? W(17, 1, a, b, c, e, h, g, k, t) : -52;\n          }\n          function ub(a, b, c, e, h, g, k) {\n            if (D)\n              return W(18, 1, a, b, c, e, h, g, k);\n          }\n          var wb = (a) => {\n            var b = ab(a) + 1, c = vb(b);\n            c && cb(a, c, b);\n            return c;\n          }, yb = (a) => {\n            var b = xb();\n            a = a();\n            Ra(b);\n            return a;\n          };\n          function W(a, b) {\n            var c = arguments.length - 2, e = arguments;\n            return yb(() => {\n              for (var h = zb(8 * c), g = h >> 3, k = 0; k < c; k++) {\n                var t = e[2 + k];\n                ea()[g + k >>> 0] = t;\n              }\n              return Ab(a, c, h, b);\n            });\n          }\n          var Bb = [], Cb = {}, Eb = () => {\n            if (!Db) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;\n              for (b in Cb)\n                void 0 === Cb[b] ? delete a[b] : a[b] = Cb[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Db = c;\n            }\n            return Db;\n          }, Db;\n          function Fb(a, b) {\n            if (D)\n              return W(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Eb().forEach(function(e, h) {\n              var g = b + c;\n              h = r()[a + 4 * h >> 2 >>> 0] = g;\n              for (g = 0; g < e.length; ++g)\n                aa()[h++ >> 0 >>> 0] = e.charCodeAt(g);\n              aa()[h >> 0 >>> 0] = 0;\n              c += e.length + 1;\n            });\n            return 0;\n          }\n          function Gb(a, b) {\n            if (D)\n              return W(20, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = Eb();\n            r()[a >> 2 >>> 0] = c.length;\n            var e = 0;\n            c.forEach(function(h) {\n              e += h.length + 1;\n            });\n            r()[b >> 2 >>> 0] = e;\n            return 0;\n          }\n          function Hb(a) {\n            return D ? W(21, 1, a) : 52;\n          }\n          function Lb(a, b, c, e) {\n            return D ? W(22, 1, a, b, c, e) : 52;\n          }\n          function Mb(a, b, c, e, h) {\n            return D ? W(23, 1, a, b, c, e, h) : 70;\n          }\n          var Nb = [null, [], []];\n          function Ob(a, b, c, e) {\n            if (D)\n              return W(24, 1, a, b, c, e);\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            for (var h = 0, g = 0; g < c; g++) {\n              var k = r()[b >> 2 >>> 0], t = r()[b + 4 >> 2 >>> 0];\n              b += 8;\n              for (var C = 0; C < t; C++) {\n                var v = n()[k + C >>> 0], y = Nb[a];\n                0 === v || 10 === v ? ((1 === a ? qa : I)(Ja(y, 0)), y.length = 0) : y.push(v);\n              }\n              h += t;\n            }\n            r()[e >> 2 >>> 0] = h;\n            return 0;\n          }\n          var Pb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Qb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Rb(a) {\n            var b = Array(ab(a) + 1);\n            bb(a, b, 0, b.length);\n            return b;\n          }\n          var Sb = (a, b) => {\n            aa().set(a, b >>> 0);\n          };\n          function Tb(a, b, c, e) {\n            function h(f, q, u) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < q; )\n                f = u[0] + f;\n              return f;\n            }\n            function g(f, q) {\n              return h(f, q, "0");\n            }\n            function k(f, q) {\n              function u(Ib) {\n                return 0 > Ib ? -1 : 0 < Ib ? 1 : 0;\n              }\n              var G;\n              0 === (G = u(f.getFullYear() - q.getFullYear())) && 0 === (G = u(f.getMonth() - q.getMonth())) && (G = u(f.getDate() - q.getDate()));\n              return G;\n            }\n            function t(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function C(f) {\n              var q = f.Pa;\n              for (f = new Date(new Date(f.Qa + 1900, 0, 1).getTime()); 0 < q; ) {\n                var u = f.getMonth(), G = (Z(f.getFullYear()) ? Pb : Qb)[u];\n                if (q > G - f.getDate())\n                  q -= G - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + q);\n                  break;\n                }\n              }\n              u = new Date(f.getFullYear() + 1, 0, 4);\n              q = t(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              u = t(u);\n              return 0 >= k(q, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            var v = p()[e + 40 >> 2 >>> 0];\n            e = { qb: p()[e >> 2 >>> 0], pb: p()[e + 4 >> 2 >>> 0], Sa: p()[e + 8 >> 2 >>> 0], Wa: p()[e + 12 >> 2 >>> 0], Ta: p()[e + 16 >> 2 >>> 0], Qa: p()[e + 20 >> 2 >>> 0], Ma: p()[e + 24 >> 2 >>> 0], Pa: p()[e + 28 >> 2 >>> 0], yb: p()[e + 32 >> 2 >>> 0], ob: p()[e + 36 >> 2 >>> 0], rb: v ? Ka(v) : "" };\n            c = Ka(c);\n            v = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var y in v)\n              c = c.replace(new RegExp(y, "g"), v[y]);\n            var Jb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Kb = "January February March April May June July August September October November December".split(" ");\n            v = {\n              "%a": (f) => Jb[f.Ma].substring(0, 3),\n              "%A": (f) => Jb[f.Ma],\n              "%b": (f) => Kb[f.Ta].substring(0, 3),\n              "%B": (f) => Kb[f.Ta],\n              "%C": (f) => g((f.Qa + 1900) / 100 | 0, 2),\n              "%d": (f) => g(f.Wa, 2),\n              "%e": (f) => h(f.Wa, 2, " "),\n              "%g": (f) => C(f).toString().substring(2),\n              "%G": (f) => C(f),\n              "%H": (f) => g(f.Sa, 2),\n              "%I": (f) => {\n                f = f.Sa;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return g(f, 2);\n              },\n              "%j": (f) => {\n                for (var q = 0, u = 0; u <= f.Ta - 1; q += (Z(f.Qa + 1900) ? Pb : Qb)[u++])\n                  ;\n                return g(f.Wa + q, 3);\n              },\n              "%m": (f) => g(f.Ta + 1, 2),\n              "%M": (f) => g(f.pb, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Sa && 12 > f.Sa ? "AM" : "PM",\n              "%S": (f) => g(f.qb, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Ma || 7,\n              "%U": (f) => g(Math.floor((f.Pa + 7 - f.Ma) / 7), 2),\n              "%V": (f) => {\n                var q = Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7);\n                2 >= (f.Ma + 371 - f.Pa - 2) % 7 && q++;\n                if (q)\n                  53 == q && (u = (f.Ma + 371 - f.Pa) % 7, 4 == u || 3 == u && Z(f.Qa) || (q = 1));\n                else {\n                  q = 52;\n                  var u = (f.Ma + 7 - f.Pa - 1) % 7;\n                  (4 == u || 5 == u && Z(f.Qa % 400 - 1)) && q++;\n                }\n                return g(q, 2);\n              },\n              "%w": (f) => f.Ma,\n              "%W": (f) => g(Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Qa + 1900).toString().substring(2),\n              "%Y": (f) => f.Qa + 1900,\n              "%z": (f) => {\n                f = f.ob;\n                var q = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (q ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.rb,\n              "%%": () => "%"\n            };\n            c = c.replace(\n              /%%/g,\n              "\\0\\0"\n            );\n            for (y in v)\n              c.includes(y) && (c = c.replace(new RegExp(y, "g"), v[y](e)));\n            c = c.replace(/\\0\\0/g, "%");\n            y = Rb(c);\n            if (y.length > b)\n              return 0;\n            Sb(y, a);\n            return y.length - 1;\n          }\n          V.Va();\n          var Ub = [null, La, Ma, Xa, Za, $a, db, eb, fb, gb, hb, ib, jb, kb, lb, mb, nb, tb, ub, Fb, Gb, Hb, Lb, Mb, Ob], Xb = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new Ua(a).Va(b >>> 0, c >>> 0);\n              Va = a;\n              Wa++;\n              throw Va;\n            },\n            N: function(a) {\n              Vb(a >>> 0, !A, 1, !ka, 131072, false);\n              V.Ya();\n            },\n            j: function(a) {\n              a >>>= 0;\n              D ? postMessage({ cmd: "cleanupThread", thread: a }) : Ga(a);\n            },\n            I: Ya,\n            h: Za,\n            T: $a,\n            D: db,\n            F: eb,\n            U: fb,\n            R: gb,\n            J: hb,\n            Q: ib,\n            n: jb,\n            E: kb,\n            B: lb,\n            S: mb,\n            C: nb,\n            q: () => true,\n            z: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => Y()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = V.La[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            L: function() {\n              return -1;\n            },\n            M: pb,\n            p: function(a) {\n              B && V.La[a >>> 0].ref();\n            },\n            t: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getUTCSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              p()[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              p()[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              p()[c + 28 >> 2 >>> 0] = a;\n            },\n            u: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getHours();\n              p()[c + 12 >> 2 >>> 0] = a.getDate();\n              p()[c + 16 >> 2 >>> 0] = a.getMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getDay();\n              b = (Z(a.getFullYear()) ? rb : sb)[a.getMonth()] + a.getDate() - 1 | 0;\n              p()[c + 28 >> 2 >>> 0] = b;\n              p()[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;\n              p()[c + 32 >> 2 >>> 0] = a;\n            },\n            v: function(a) {\n              a >>>= 0;\n              var b = new Date(p()[a + 20 >> 2 >>> 0] + 1900, p()[a + 16 >> 2 >>> 0], p()[a + 12 >> 2 >>> 0], p()[a + 8 >> 2 >>> 0], p()[a + 4 >> 2 >>> 0], p()[a >> 2 >>> 0], 0), c = p()[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), h = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), g = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(g, h);\n              0 > c ? p()[a + 32 >> 2 >>> 0] = Number(h != g && k == e) : 0 < c != (k == e) && (h = Math.max(g, h), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : h) - e)));\n              p()[a + 24 >> 2 >>> 0] = b.getDay();\n              c = (Z(b.getFullYear()) ? rb : sb)[b.getMonth()] + b.getDate() - 1 | 0;\n              p()[a + 28 >> 2 >>> 0] = c;\n              p()[a >> 2 >>> 0] = b.getSeconds();\n              p()[a + 4 >> 2 >>> 0] = b.getMinutes();\n              p()[a + 8 >> 2 >>> 0] = b.getHours();\n              p()[a + 12 >> 2 >>> 0] = b.getDate();\n              p()[a + 16 >> 2 >>> 0] = b.getMonth();\n              p()[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Wb((T = a, 1 <= +Math.abs(T) ? 0 < T ? +Math.floor(T / 4294967296) >>> 0 : ~~+Math.ceil((T - +(~~T >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            r: tb,\n            s: ub,\n            y: function(a, b, c) {\n              function e(v) {\n                return (v = v.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? v[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var h = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(h, 0, 1), k = new Date(h, 6, 1);\n              h = g.getTimezoneOffset();\n              var t = k.getTimezoneOffset(), C = Math.max(h, t);\n              r()[a >> 2 >>> 0] = 60 * C;\n              p()[b >> 2 >>> 0] = Number(h != t);\n              a = e(g);\n              b = e(k);\n              a = wb(a);\n              b = wb(b);\n              t < h ? (r()[c >> 2 >>> 0] = a, r()[c + 4 >> 2 >>> 0] = b) : (r()[c >> 2 >>> 0] = b, r()[c + 4 >> 2 >>> 0] = a);\n            },\n            c: () => {\n              K("");\n            },\n            k: function() {\n            },\n            i: function() {\n              return Date.now();\n            },\n            o: () => {\n              wa += 1;\n              throw "unwind";\n            },\n            A: function() {\n              return 4294901760;\n            },\n            e: () => performance.timeOrigin + performance.now(),\n            f: function() {\n              return B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency;\n            },\n            K: function(a, b, c, e) {\n              V.vb = b >>> 0;\n              Bb.length = c;\n              b = e >>> 0 >> 3;\n              for (e = 0; e < c; e++)\n                Bb[e] = ea()[b + e >>> 0];\n              return Ub[a].apply(null, Bb);\n            },\n            x: function(a) {\n              a >>>= 0;\n              var b = n().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var e = b * (1 + 0.2 / c);\n                e = Math.min(e, a + 100663296);\n                var h = Math;\n                e = Math.max(a, e);\n                a: {\n                  h = h.min.call(h, 4294901760, e + (65536 - e % 65536) % 65536) - d.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    d.grow(h);\n                    m();\n                    var g = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  g = void 0;\n                }\n                if (g)\n                  return true;\n              }\n              return false;\n            },\n            O: Fb,\n            P: Gb,\n            H: Na,\n            g: Hb,\n            m: Lb,\n            w: Mb,\n            l: Ob,\n            a: d || w.wasmMemory,\n            G: Tb,\n            d: function(a, b, c, e) {\n              return Tb(a >>> 0, b >>> 0, c >>> 0, e >>> 0);\n            }\n          };\n          (function() {\n            function a(c, e) {\n              c = c.exports;\n              L = c = Yb(c);\n              V.Za.push(L.ya);\n              sa = L.za;\n              ua.unshift(L.V);\n              ra = e;\n              za();\n              return c;\n            }\n            var b = { a: Xb };\n            ya();\n            if (w.instantiateWasm)\n              try {\n                return w.instantiateWasm(b, a);\n              } catch (c) {\n                I("Module.instantiateWasm callback failed with error: " + c), x(c);\n              }\n            Ea(b, function(c) {\n              a(c.instance, c.module);\n            }).catch(x);\n            return {};\n          })();\n          w._OrtInit = (a, b) => (w._OrtInit = L.W)(a, b);\n          w._OrtGetLastError = (a, b) => (w._OrtGetLastError = L.X)(a, b);\n          w._OrtCreateSessionOptions = (a, b, c, e, h, g, k, t, C, v) => (w._OrtCreateSessionOptions = L.Y)(a, b, c, e, h, g, k, t, C, v);\n          w._OrtAppendExecutionProvider = (a, b) => (w._OrtAppendExecutionProvider = L.Z)(a, b);\n          w._OrtAddFreeDimensionOverride = (a, b, c) => (w._OrtAddFreeDimensionOverride = L._)(a, b, c);\n          w._OrtAddSessionConfigEntry = (a, b, c) => (w._OrtAddSessionConfigEntry = L.$)(a, b, c);\n          w._OrtReleaseSessionOptions = (a) => (w._OrtReleaseSessionOptions = L.aa)(a);\n          w._OrtCreateSession = (a, b, c) => (w._OrtCreateSession = L.ba)(a, b, c);\n          w._OrtReleaseSession = (a) => (w._OrtReleaseSession = L.ca)(a);\n          w._OrtGetInputOutputCount = (a, b, c) => (w._OrtGetInputOutputCount = L.da)(a, b, c);\n          w._OrtGetInputName = (a, b) => (w._OrtGetInputName = L.ea)(a, b);\n          w._OrtGetOutputName = (a, b) => (w._OrtGetOutputName = L.fa)(a, b);\n          w._OrtFree = (a) => (w._OrtFree = L.ga)(a);\n          w._OrtCreateTensor = (a, b, c, e, h, g) => (w._OrtCreateTensor = L.ha)(a, b, c, e, h, g);\n          w._OrtGetTensorData = (a, b, c, e, h) => (w._OrtGetTensorData = L.ia)(a, b, c, e, h);\n          w._OrtReleaseTensor = (a) => (w._OrtReleaseTensor = L.ja)(a);\n          w._OrtCreateRunOptions = (a, b, c, e) => (w._OrtCreateRunOptions = L.ka)(a, b, c, e);\n          w._OrtAddRunConfigEntry = (a, b, c) => (w._OrtAddRunConfigEntry = L.la)(a, b, c);\n          w._OrtReleaseRunOptions = (a) => (w._OrtReleaseRunOptions = L.ma)(a);\n          w._OrtCreateBinding = (a) => (w._OrtCreateBinding = L.na)(a);\n          w._OrtBindInput = (a, b, c) => (w._OrtBindInput = L.oa)(a, b, c);\n          w._OrtBindOutput = (a, b, c, e) => (w._OrtBindOutput = L.pa)(a, b, c, e);\n          w._OrtClearBoundOutputs = (a) => (w._OrtClearBoundOutputs = L.qa)(a);\n          w._OrtReleaseBinding = (a) => (w._OrtReleaseBinding = L.ra)(a);\n          w._OrtRunWithBinding = (a, b, c, e, h) => (w._OrtRunWithBinding = L.sa)(a, b, c, e, h);\n          w._OrtRun = (a, b, c, e, h, g, k, t) => (w._OrtRun = L.ta)(a, b, c, e, h, g, k, t);\n          w._OrtEndProfiling = (a) => (w._OrtEndProfiling = L.ua)(a);\n          var X = w._pthread_self = () => (X = w._pthread_self = L.va)(), vb = w._malloc = (a) => (vb = w._malloc = L.wa)(a);\n          w._free = (a) => (w._free = L.xa)(a);\n          w.__emscripten_tls_init = () => (w.__emscripten_tls_init = L.ya)();\n          var Vb = w.__emscripten_thread_init = (a, b, c, e, h, g) => (Vb = w.__emscripten_thread_init = L.Aa)(a, b, c, e, h, g);\n          w.__emscripten_thread_crashed = () => (w.__emscripten_thread_crashed = L.Ba)();\n          var Ab = (a, b, c, e) => (Ab = L.Ca)(a, b, c, e), Oa = (a) => (Oa = L.Da)(a), Ta = w.__emscripten_thread_exit = (a) => (Ta = w.__emscripten_thread_exit = L.Ea)(a), qb = w.__emscripten_check_mailbox = () => (qb = w.__emscripten_check_mailbox = L.Fa)(), Wb = (a) => (Wb = L.Ga)(a), Qa = (a, b) => (Qa = L.Ha)(a, b), xb = () => (xb = L.Ia)(), Ra = (a) => (Ra = L.Ja)(a), zb = (a) => (zb = L.Ka)(a);\n          function Yb(a) {\n            a = Object.assign({}, a);\n            var b = (e) => () => e() >>> 0, c = (e) => (h) => e(h) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.pthread_self = b(a.pthread_self);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          w.keepRuntimeAlive = P;\n          w.wasmMemory = d;\n          w.stackAlloc = zb;\n          w.stackSave = xb;\n          w.stackRestore = Ra;\n          w.UTF8ToString = Ka;\n          w.stringToUTF8 = cb;\n          w.lengthBytesUTF8 = ab;\n          w.ExitStatus = U;\n          w.PThread = V;\n          var Zb;\n          R = function $b() {\n            Zb || ac();\n            Zb || (R = $b);\n          };\n          function ac() {\n            function a() {\n              if (!Zb && (Zb = true, w.calledRun = true, !M)) {\n                D || Pa(ua);\n                ha(w);\n                if (w.onRuntimeInitialized)\n                  w.onRuntimeInitialized();\n                if (!D) {\n                  if (w.postRun)\n                    for ("function" == typeof w.postRun && (w.postRun = [w.postRun]); w.postRun.length; ) {\n                      var b = w.postRun.shift();\n                      va.unshift(b);\n                    }\n                  Pa(va);\n                }\n              }\n            }\n            if (!(0 < Q))\n              if (D)\n                ha(w), D || Pa(ua), startWorker(w);\n              else {\n                if (w.preRun)\n                  for ("function" == typeof w.preRun && (w.preRun = [w.preRun]); w.preRun.length; )\n                    ta.unshift(w.preRun.shift());\n                Pa(ta);\n                0 < Q || (w.setStatus ? (w.setStatus("Running..."), setTimeout(function() {\n                  setTimeout(\n                    function() {\n                      w.setStatus("");\n                    },\n                    1\n                  );\n                  a();\n                }, 1)) : a());\n              }\n          }\n          if (w.preInit)\n            for ("function" == typeof w.preInit && (w.preInit = [w.preInit]); 0 < w.preInit.length; )\n              w.preInit.pop()();\n          ac();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason??e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (true) {\n    ortWasmFactory = require_ort_training_wasm_simd();\n  } else {\n    ortWasmFactory = true ? null : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = (numThreads) => {\n    if (numThreads === 1) {\n      return false;\n    }\n    if (typeof SharedArrayBuffer === "undefined") {\n      if (typeof self !== "undefined" && !self.crossOriginIsolated) {\n        console.warn(\n          "env.wasm.numThreads is set to " + numThreads + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."\n        );\n      }\n      return false;\n    }\n    if (typeof process !== "undefined" && process.versions && process.versions.node) {\n      console.warn(\n        "env.wasm.numThreads is set to " + numThreads + ", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios."\n      );\n    }\n    try {\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (true) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = isMultiThreadSupported(numThreads);\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        config.numThreads = numThreads;\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.enableGraphCapture !== void 0) {\n        if (typeof sessionOptions.enableGraphCapture !== "boolean") {\n          throw new Error(`enableGraphCapture must be a boolean value: ${sessionOptions.enableGraphCapture}`);\n        }\n        const keyDataOffset = allocWasmString("enableGraphCapture", allocs);\n        const valueDataOffset = allocWasmString(sessionOptions.enableGraphCapture.toString(), allocs);\n        if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n          checkLastError(\n            `Can\'t set a session config entry: \'enableGraphCapture\' - ${sessionOptions.enableGraphCapture}.`\n          );\n        }\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  init_fs();\n\n  // nodejs-ignore:node:fs/promises\n  var readFile2 = void 0;\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  var loadFile = async (file) => {\n    if (typeof file === "string") {\n      if (typeof process !== "undefined" && process.versions && process.versions.node) {\n        try {\n          return new Uint8Array(await readFile2(file));\n        } catch (e) {\n          if (e.code === "ERR_FS_FILE_TOO_LARGE") {\n            const stream = createReadStream(file);\n            const chunks = [];\n            for await (const chunk of stream) {\n              chunks.push(chunk);\n            }\n            return new Uint8Array(Buffer.concat(chunks));\n          }\n          throw e;\n        }\n      } else {\n        const response = await fetch(file);\n        if (!response.ok) {\n          throw new Error(`failed to load external data file: ${file}`);\n        }\n        const contentLengthHeader = response.headers.get("Content-Length");\n        const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;\n        if (fileSize < 1073741824) {\n          return new Uint8Array(await response.arrayBuffer());\n        } else {\n          if (!response.body) {\n            throw new Error(`failed to load external data file: ${file}, no response body.`);\n          }\n          const reader = response.body.getReader();\n          let buffer;\n          try {\n            buffer = new ArrayBuffer(fileSize);\n          } catch (e) {\n            if (e instanceof RangeError) {\n              const pages = Math.ceil(fileSize / 65536);\n              buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;\n            } else {\n              throw e;\n            }\n          }\n          let offset = 0;\n          while (true) {\n            const { done, value } = await reader.read();\n            if (done) {\n              break;\n            }\n            const chunkSize = value.byteLength;\n            const chunk = new Uint8Array(buffer, offset, chunkSize);\n            chunk.set(value);\n            offset += chunkSize;\n          }\n          return new Uint8Array(buffer, 0, fileSize);\n        }\n      }\n    } else if (file instanceof Blob) {\n      return new Uint8Array(await file.arrayBuffer());\n    } else if (file instanceof Uint8Array) {\n      return file;\n    } else {\n      return new Uint8Array(file);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n  };\n  var initEp = async (env, epName) => {\n    if (false) {\n      if (typeof navigator === "undefined" || !navigator.gpu) {\n        throw new Error("WebGPU is not supported in current environment");\n      }\n      const adapter = await navigator.gpu.requestAdapter();\n      if (!adapter) {\n        throw new Error(\n          \'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.\'\n        );\n      }\n      if (!env.wasm.simd) {\n        throw new Error(\n          "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"\n        );\n      }\n      const initJsep = null.init;\n      await initJsep(getInstance(), env, adapter);\n    }\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var copyFromExternalBuffer = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSession = async (modelData, options) => {\n    let modelDataOffset, modelDataLength;\n    const wasm2 = getInstance();\n    if (Array.isArray(modelData)) {\n      [modelDataOffset, modelDataLength] = modelData;\n    } else if (modelData.buffer === wasm2.HEAPU8.buffer) {\n      [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];\n    } else {\n      [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);\n    }\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      if (options?.externalData && wasm2.mountExternalData) {\n        const loadingPromises = [];\n        for (const file of options.externalData) {\n          const path = typeof file === "string" ? file : file.path;\n          loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {\n            wasm2.mountExternalData(path, data);\n          }));\n        }\n        await Promise.all(loadingPromises);\n      }\n      sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const enableGraphCapture = !!options?.enableGraphCapture;\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          if (enableGraphCapture && options?.preferredOutputLocation === void 0) {\n            outputPreferredLocations.push("gpu-buffer");\n            continue;\n          }\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          if (enableGraphCapture && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}. Only \'gpu-buffer\' location is supported when enableGraphCapture is true.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(\n        sessionHandle,\n        [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState, enableGraphCapture, false]\n      );\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelDataOffset);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      wasm2.unmountExternalData?.();\n    }\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture] = session;\n    if (ioBindingState) {\n      if (enableGraphCapture) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepOnReleaseSession?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index, enableGraphCapture = false) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (enableGraphCapture && location !== "gpu-buffer") {\n      throw new Error(\n        `External buffer must be provided for input/output index ${index} when enableGraphCapture is true.`\n      );\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const sessionHandle = session[0];\n    const inputNamesUTF8Encoded = session[1];\n    const outputNamesUTF8Encoded = session[2];\n    const ioBindingState = session[3];\n    const enableGraphCapture = session[4];\n    const inputOutputBound = session[5];\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(\n          inputTensors[i],\n          inputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputIndices[i],\n          enableGraphCapture\n        );\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i],\n          enableGraphCapture\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n        activeSessions.set(\n          sessionId,\n          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, true]\n        );\n      }\n      wasm2.jsepOnRunStart?.(sessionHandle);\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState && !enableGraphCapture) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n        activeSessions.set(\n          sessionId,\n          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, false]\n        );\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    const { type, in: message } = ev.data;\n    try {\n      switch (type) {\n        case "init-wasm":\n          initializeWebAssembly(message.wasm).then(\n            () => {\n              initRuntime(message).then(\n                () => {\n                  postMessage({ type });\n                },\n                (err) => {\n                  postMessage({ type, err });\n                }\n              );\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        case "init-ep": {\n          const { epName, env } = message;\n          initEp(env, epName).then(\n            () => {\n              postMessage({ type });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "copy-from": {\n          const { buffer } = message;\n          const bufferData = copyFromExternalBuffer(buffer);\n          postMessage({ type, out: bufferData });\n          break;\n        }\n        case "create": {\n          const { model, options } = message;\n          createSession(model, options).then(\n            (sessionMetadata) => {\n              postMessage({ type, out: sessionMetadata });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "release":\n          releaseSession(message);\n          postMessage({ type });\n          break;\n        case "run": {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = message;\n          run(sessionId, inputIndices, inputs, outputIndices, new Array(outputIndices.length).fill(null), options).then(\n            (outputs) => {\n              if (outputs.some((o) => o[3] !== "cpu")) {\n                postMessage({ type, err: "Proxy does not support non-cpu tensor location." });\n              } else {\n                postMessage(\n                  { type, out: outputs },\n                  extractTransferableBuffers(outputs)\n                );\n              }\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "end-profiling":\n          endProfiling(message);\n          postMessage({ type });\n          break;\n        default:\n      }\n    } catch (err) {\n      postMessage({ type, err });\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzIiwgIm5vZGVqcy1pZ25vcmU6d29ya2VyX3RocmVhZHMiLCAibm9kZWpzLWlnbm9yZTpwZXJmX2hvb2tzIiwgIm5vZGVqcy1pZ25vcmU6b3MiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcyIsICIuLi8uLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcyIsICJub2RlanMtaWdub3JlOm5vZGU6cGF0aCIsICIuLi8uLi9saWIvd2FzbS93YXNtLWZhY3RvcnkudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy50cyIsICIuLi8uLi9saWIvd2FzbS9ydW4tb3B0aW9ucy50cyIsICIuLi8uLi9saWIvd2FzbS9zZXNzaW9uLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb21tb24udHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy1sb2FkLWZpbGUudHMiLCAibm9kZWpzLWlnbm9yZTpub2RlOmZzL3Byb21pc2VzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tY29yZS1pbXBsLnRzIiwgIi4uLy4uL2xpYi93YXNtL3Byb3h5LXdvcmtlci9tYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc20gPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxudmFyIGQ9bW9kdWxlQXJnLGssbDtkLnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57az1hO2w9Yn0pO3ZhciByPU9iamVjdC5hc3NpZ24oe30sZCksdj1cIi4vdGhpcy5wcm9ncmFtXCIsYWE9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyx4PVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsYmE9XCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MmJlwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zJiZcInN0cmluZ1wiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLHk9XCJcIixBLEIsQztcbmlmKGJhKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLEQ9cmVxdWlyZShcInBhdGhcIik7eT14P0QuZGlybmFtZSh5KStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7QT0oYSxiKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkQubm9ybWFsaXplKGEpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYSxiP3ZvaWQgMDpcInV0ZjhcIil9O0M9YT0+e2E9QShhLCEwKTthLmJ1ZmZlcnx8KGE9bmV3IFVpbnQ4QXJyYXkoYSkpO3JldHVybiBhfTtCPShhLGIsYyxmPSEwKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkQubm9ybWFsaXplKGEpO2ZzLnJlYWRGaWxlKGEsZj92b2lkIDA6XCJ1dGY4XCIsKGcsaCk9PntnP2MoZyk6YihmP2guYnVmZmVyOmgpfSl9OyFkLnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJih2PXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ZC5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCJ9ZWxzZSBpZihhYXx8XG54KXg/eT1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksX3NjcmlwdERpciYmKHk9X3NjcmlwdERpciksMCE9PXkuaW5kZXhPZihcImJsb2I6XCIpP3k9eS5zdWJzdHIoMCx5LnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOnk9XCJcIixBPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0seCYmKEM9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLEI9KGEsYixjKT0+e3ZhciBmPW5ldyBYTUxIdHRwUmVxdWVzdDtmLm9wZW4oXCJHRVRcIixhLCEwKTtmLnJlc3BvbnNlVHlwZT1cblwiYXJyYXlidWZmZXJcIjtmLm9ubG9hZD0oKT0+ezIwMD09Zi5zdGF0dXN8fDA9PWYuc3RhdHVzJiZmLnJlc3BvbnNlP2IoZi5yZXNwb25zZSk6YygpfTtmLm9uZXJyb3I9YztmLnNlbmQobnVsbCl9O3ZhciBjYT1kLnByaW50fHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLEU9ZC5wcmludEVycnx8Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZCxyKTtyPW51bGw7ZC50aGlzUHJvZ3JhbSYmKHY9ZC50aGlzUHJvZ3JhbSk7dmFyIEY7ZC53YXNtQmluYXJ5JiYoRj1kLndhc21CaW5hcnkpO3ZhciBub0V4aXRSdW50aW1lPWQubm9FeGl0UnVudGltZXx8ITA7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZHKFwibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZFwiKTt2YXIgSCxJLGRhPSExLEosSyxMLE07XG5mdW5jdGlvbiBlYSgpe3ZhciBhPUguYnVmZmVyO2QuSEVBUDg9Sj1uZXcgSW50OEFycmF5KGEpO2QuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO2QuSEVBUDMyPUw9bmV3IEludDMyQXJyYXkoYSk7ZC5IRUFQVTg9Sz1uZXcgVWludDhBcnJheShhKTtkLkhFQVBVMTY9bmV3IFVpbnQxNkFycmF5KGEpO2QuSEVBUFUzMj1NPW5ldyBVaW50MzJBcnJheShhKTtkLkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTtkLkhFQVBGNjQ9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgZmE9W10saGE9W10saWE9W107ZnVuY3Rpb24gamEoKXt2YXIgYT1kLnByZVJ1bi5zaGlmdCgpO2ZhLnVuc2hpZnQoYSl9dmFyIE49MCxPPW51bGwsUD1udWxsO1xuZnVuY3Rpb24gRyhhKXtpZihkLm9uQWJvcnQpZC5vbkFib3J0KGEpO2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7RShhKTtkYT0hMDthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7bChhKTt0aHJvdyBhO31mdW5jdGlvbiBrYShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgUTtRPVwib3J0LXRyYWluaW5nLXdhc20tc2ltZC53YXNtXCI7aWYoIWthKFEpKXt2YXIgbGE9UTtRPWQubG9jYXRlRmlsZT9kLmxvY2F0ZUZpbGUobGEseSk6eStsYX1mdW5jdGlvbiBtYShhKXtpZihhPT1RJiZGKXJldHVybiBuZXcgVWludDhBcnJheShGKTtpZihDKXJldHVybiBDKGEpO3Rocm93XCJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZFwiO31cbmZ1bmN0aW9uIG5hKGEpe2lmKCFGJiYoYWF8fHgpKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmZXRjaCYmIWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93XCJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICdcIithK1wiJ1wiO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+bWEoYSkpO2lmKEIpcmV0dXJuIG5ldyBQcm9taXNlKChiLGMpPT57QihhLGY9PmIobmV3IFVpbnQ4QXJyYXkoZikpLGMpfSl9cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9Pm1hKGEpKX1mdW5jdGlvbiBvYShhLGIsYyl7cmV0dXJuIG5hKGEpLnRoZW4oZj0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZixiKSkudGhlbihmPT5mKS50aGVuKGMsZj0+e0UoXCJmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiBcIitmKTtHKGYpfSl9XG5mdW5jdGlvbiBwYShhLGIpe3ZhciBjPVE7cmV0dXJuIEZ8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nfHxrYShjKXx8Yy5zdGFydHNXaXRoKFwiZmlsZTovL1wiKXx8YmF8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP29hKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGY9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGYsYSkudGhlbihiLGZ1bmN0aW9uKGcpe0UoXCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogXCIrZyk7RShcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBvYShjLGEsYil9KSl9dmFyIFIsUz1hPT57Zm9yKDswPGEubGVuZ3RoOylhLnNoaWZ0KCkoZCl9O1xuZnVuY3Rpb24gcWEoYSl7dGhpcy5IYT1hLTI0O3RoaXMuTGE9ZnVuY3Rpb24oYil7TVt0aGlzLkhhKzQ+PjI+Pj4wXT1ifTt0aGlzLkthPWZ1bmN0aW9uKGIpe01bdGhpcy5IYSs4Pj4yPj4+MF09Yn07dGhpcy5JYT1mdW5jdGlvbihiLGMpe3RoaXMuSmEoKTt0aGlzLkxhKGIpO3RoaXMuS2EoYyl9O3RoaXMuSmE9ZnVuY3Rpb24oKXtNW3RoaXMuSGErMTY+PjI+Pj4wXT0wfX1cbnZhciByYT0wLHNhPTAsdGE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLHVhPShhLGIsYyk9PntiPj4+PTA7dmFyIGY9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1mKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJnRhKXJldHVybiB0YS5kZWNvZGUoYS5zdWJhcnJheShiLGMpKTtmb3IoZj1cIlwiO2I8Yzspe3ZhciBnPWFbYisrXTtpZihnJjEyOCl7dmFyIGg9YVtiKytdJjYzO2lmKDE5Mj09KGcmMjI0KSlmKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChnJjMxKTw8NnxoKTtlbHNle3ZhciBtPWFbYisrXSY2MztnPTIyND09KGcmMjQwKT8oZyYxNSk8PDEyfGg8PDZ8bTooZyY3KTw8MTh8aDw8MTJ8bTw8NnxhW2IrK10mNjM7NjU1MzY+Zz9mKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpOihnLT02NTUzNixmKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGc+PjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGYrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGZ9LFxuVD0oYSxiKT0+KGE+Pj49MCk/dWEoSyxhLGIpOlwiXCIsVT1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZj1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1mP2IrKzoyMDQ3Pj1mP2IrPTI6NTUyOTY8PWYmJjU3MzQzPj1mPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sVj0oYSxiLGMsZik9PntjPj4+PTA7aWYoISgwPGYpKXJldHVybiAwO3ZhciBnPWM7Zj1jK2YtMTtmb3IodmFyIGg9MDtoPGEubGVuZ3RoOysraCl7dmFyIG09YS5jaGFyQ29kZUF0KGgpO2lmKDU1Mjk2PD1tJiY1NzM0Mz49bSl7dmFyIHE9YS5jaGFyQ29kZUF0KCsraCk7bT02NTUzNisoKG0mMTAyMyk8PDEwKXxxJjEwMjN9aWYoMTI3Pj1tKXtpZihjPj1mKWJyZWFrO2JbYysrPj4+MF09bX1lbHNle2lmKDIwNDc+PW0pe2lmKGMrMT49ZilicmVhaztiW2MrKz4+PjBdPTE5MnxtPj42fWVsc2V7aWYoNjU1MzU+PW0pe2lmKGMrMj49ZilicmVhaztiW2MrKz4+PjBdPTIyNHxtPj4xMn1lbHNle2lmKGMrMz49XG5mKWJyZWFrO2JbYysrPj4+MF09MjQwfG0+PjE4O2JbYysrPj4+MF09MTI4fG0+PjEyJjYzfWJbYysrPj4+MF09MTI4fG0+PjYmNjN9YltjKys+Pj4wXT0xMjh8bSY2M319YltjPj4+MF09MDtyZXR1cm4gYy1nfSxXPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCksdmE9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sd2E9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sQmE9YT0+e3ZhciBiPVUoYSkrMSxjPUFhKGIpO2MmJlYoYSxLLGMsYik7cmV0dXJuIGN9LFg9e30sQ2E9KCk9PntpZighWSl7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFxuXCJfXCIpK1wiLlVURi04XCIsXzp2fHxcIi4vdGhpcy5wcm9ncmFtXCJ9LGI7Zm9yKGIgaW4gWCl2b2lkIDA9PT1YW2JdP2RlbGV0ZSBhW2JdOmFbYl09WFtiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7WT1jfXJldHVybiBZfSxZLERhPVtudWxsLFtdLFtdXSxFYT1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLEZhPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gR2EoYSl7dmFyIGI9QXJyYXkoVShhKSsxKTtWKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIEhhKGEsYixjLGYpe2Z1bmN0aW9uIGcoZSxuLHApe2ZvcihlPVwibnVtYmVyXCI9PXR5cGVvZiBlP2UudG9TdHJpbmcoKTplfHxcIlwiO2UubGVuZ3RoPG47KWU9cFswXStlO3JldHVybiBlfWZ1bmN0aW9uIGgoZSxuKXtyZXR1cm4gZyhlLG4sXCIwXCIpfWZ1bmN0aW9uIG0oZSxuKXtmdW5jdGlvbiBwKHhhKXtyZXR1cm4gMD54YT8tMTowPHhhPzE6MH12YXIgejswPT09KHo9cChlLmdldEZ1bGxZZWFyKCktbi5nZXRGdWxsWWVhcigpKSkmJjA9PT0oej1wKGUuZ2V0TW9udGgoKS1uLmdldE1vbnRoKCkpKSYmKHo9cChlLmdldERhdGUoKS1uLmdldERhdGUoKSkpO3JldHVybiB6fWZ1bmN0aW9uIHEoZSl7c3dpdGNoKGUuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZTtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGUuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGUuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiB3KGUpe3ZhciBuPWUuQ2E7Zm9yKGU9bmV3IERhdGUoKG5ldyBEYXRlKGUuRGErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8bjspe3ZhciBwPWUuZ2V0TW9udGgoKSx6PShXKGUuZ2V0RnVsbFllYXIoKSk/RWE6RmEpW3BdO2lmKG4+ei1lLmdldERhdGUoKSluLT16LWUuZ2V0RGF0ZSgpKzEsZS5zZXREYXRlKDEpLDExPnA/ZS5zZXRNb250aChwKzEpOihlLnNldE1vbnRoKDApLGUuc2V0RnVsbFllYXIoZS5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Uuc2V0RGF0ZShlLmdldERhdGUoKStuKTticmVha319cD1uZXcgRGF0ZShlLmdldEZ1bGxZZWFyKCkrMSwwLDQpO249cShuZXcgRGF0ZShlLmdldEZ1bGxZZWFyKCksXG4wLDQpKTtwPXEocCk7cmV0dXJuIDA+PW0obixlKT8wPj1tKHAsZSk/ZS5nZXRGdWxsWWVhcigpKzE6ZS5nZXRGdWxsWWVhcigpOmUuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Y+Pj49MDt2YXIgdD1MW2YrNDA+PjI+Pj4wXTtmPXtPYTpMW2Y+PjI+Pj4wXSxOYTpMW2YrND4+Mj4+PjBdLEVhOkxbZis4Pj4yPj4+MF0sR2E6TFtmKzEyPj4yPj4+MF0sRmE6TFtmKzE2Pj4yPj4+MF0sRGE6TFtmKzIwPj4yPj4+MF0seGE6TFtmKzI0Pj4yPj4+MF0sQ2E6TFtmKzI4Pj4yPj4+MF0sUWE6TFtmKzMyPj4yPj4+MF0sTWE6TFtmKzM2Pj4yPj4+MF0sUGE6dD9UKHQpOlwiXCJ9O2M9VChjKTt0PXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXCIlWFwiOlwiJUg6JU06JVNcIixcIiVFY1wiOlwiJWNcIixcblwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIHUgaW4gdCljPWMucmVwbGFjZShuZXcgUmVnRXhwKHUsXCJnXCIpLHRbdV0pO3ZhciB5YT1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLHphPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTt0PXtcIiVhXCI6ZT0+eWFbZS54YV0uc3Vic3RyaW5nKDAsMyksXCIlQVwiOmU9PnlhW2UueGFdLFwiJWJcIjplPT5cbnphW2UuRmFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjplPT56YVtlLkZhXSxcIiVDXCI6ZT0+aCgoZS5EYSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6ZT0+aChlLkdhLDIpLFwiJWVcIjplPT5nKGUuR2EsMixcIiBcIiksXCIlZ1wiOmU9PncoZSkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOmU9PncoZSksXCIlSFwiOmU9PmgoZS5FYSwyKSxcIiVJXCI6ZT0+e2U9ZS5FYTswPT1lP2U9MTI6MTI8ZSYmKGUtPTEyKTtyZXR1cm4gaChlLDIpfSxcIiVqXCI6ZT0+e2Zvcih2YXIgbj0wLHA9MDtwPD1lLkZhLTE7bis9KFcoZS5EYSsxOTAwKT9FYTpGYSlbcCsrXSk7cmV0dXJuIGgoZS5HYStuLDMpfSxcIiVtXCI6ZT0+aChlLkZhKzEsMiksXCIlTVwiOmU9PmgoZS5OYSwyKSxcIiVuXCI6KCk9PlwiXFxuXCIsXCIlcFwiOmU9PjA8PWUuRWEmJjEyPmUuRWE/XCJBTVwiOlwiUE1cIixcIiVTXCI6ZT0+aChlLk9hLDIpLFwiJXRcIjooKT0+XCJcXHRcIixcIiV1XCI6ZT0+ZS54YXx8NyxcIiVVXCI6ZT0+aChNYXRoLmZsb29yKChlLkNhKzctZS54YSkvNyksMiksXCIlVlwiOmU9Plxue3ZhciBuPU1hdGguZmxvb3IoKGUuQ2ErNy0oZS54YSs2KSU3KS83KTsyPj0oZS54YSszNzEtZS5DYS0yKSU3JiZuKys7aWYobik1Mz09biYmKHA9KGUueGErMzcxLWUuQ2EpJTcsND09cHx8Mz09cCYmVyhlLkRhKXx8KG49MSkpO2Vsc2V7bj01Mjt2YXIgcD0oZS54YSs3LWUuQ2EtMSklNzsoND09cHx8NT09cCYmVyhlLkRhJTQwMC0xKSkmJm4rK31yZXR1cm4gaChuLDIpfSxcIiV3XCI6ZT0+ZS54YSxcIiVXXCI6ZT0+aChNYXRoLmZsb29yKChlLkNhKzctKGUueGErNiklNykvNyksMiksXCIleVwiOmU9PihlLkRhKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjplPT5lLkRhKzE5MDAsXCIlelwiOmU9PntlPWUuTWE7dmFyIG49MDw9ZTtlPU1hdGguYWJzKGUpLzYwO3JldHVybihuP1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKGUvNjAqMTAwK2UlNjApKS5zbGljZSgtNCl9LFwiJVpcIjplPT5lLlBhLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFwiXFx4MDBcXHgwMFwiKTtmb3IodSBpbiB0KWMuaW5jbHVkZXModSkmJlxuKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodSxcImdcIiksdFt1XShmKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7dT1HYShjKTtpZih1Lmxlbmd0aD5iKXJldHVybiAwO0ouc2V0KHUsYT4+PjApO3JldHVybiB1Lmxlbmd0aC0xfVxudmFyIEphPXthOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBxYShhKSkuSWEoYj4+PjAsYz4+PjApO3JhPWE7c2ErKzt0aHJvdyByYTt9LGU6ZnVuY3Rpb24oKXtyZXR1cm4gMH0sSDpmdW5jdGlvbigpe30seDpmdW5jdGlvbigpe30sejpmdW5jdGlvbigpe30sazpmdW5jdGlvbigpe3JldHVybiAwfSxGOmZ1bmN0aW9uKCl7fSxCOmZ1bmN0aW9uKCl7fSxFOmZ1bmN0aW9uKCl7fSxnOmZ1bmN0aW9uKCl7fSx5OmZ1bmN0aW9uKCl7fSx2OmZ1bmN0aW9uKCl7fSxHOmZ1bmN0aW9uKCl7fSx3OmZ1bmN0aW9uKCl7fSxsOigpPT4hMCxvOmZ1bmN0aW9uKGEsYixjKXthPWIrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtMW2M+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtMW2MrND4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO0xbYys4Pj4yPj4+MF09YS5nZXRVVENIb3VycygpO0xbYysxMj4+Mj4+PlxuMF09YS5nZXRVVENEYXRlKCk7TFtjKzE2Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO0xbYysyMD4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO0xbYysyND4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7TFtjKzI4Pj4yPj4+MF09KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDB9LHA6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0xbYz4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO0xbYys0Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7TFtjKzg+PjI+Pj4wXT1hLmdldEhvdXJzKCk7TFtjKzEyPj4yPj4+MF09YS5nZXREYXRlKCk7TFtjKzE2Pj4yPj4+MF09YS5nZXRNb250aCgpO0xbYysyMD4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO0xbYysyND4+Mj4+PjBdPWEuZ2V0RGF5KCk7TFtjKzI4Pj4yPj4+XG4wXT0oVyhhLmdldEZ1bGxZZWFyKCkpP3ZhOndhKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtMW2MrMzY+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGY9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0xbYyszMj4+Mj4+PjBdPShiIT1mJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGYsYikpfDB9LHE6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKExbYSsyMD4+Mj4+PjBdKzE5MDAsTFthKzE2Pj4yPj4+MF0sTFthKzEyPj4yPj4+MF0sTFthKzg+PjI+Pj4wXSxMW2ErND4+Mj4+PjBdLExbYT4+Mj4+PjBdLDApLGM9TFthKzMyPj4yPj4+MF0sZj1iLmdldFRpbWV6b25lT2Zmc2V0KCksZz0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksXG5oPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxtPU1hdGgubWluKGgsZyk7MD5jP0xbYSszMj4+Mj4+PjBdPU51bWJlcihnIT1oJiZtPT1mKTowPGMhPShtPT1mKSYmKGc9TWF0aC5tYXgoaCxnKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP206ZyktZikpKTtMW2ErMjQ+PjI+Pj4wXT1iLmdldERheSgpO0xbYSsyOD4+Mj4+PjBdPShXKGIuZ2V0RnVsbFllYXIoKSk/dmE6d2EpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO0xbYT4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO0xbYSs0Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7TFthKzg+PjI+Pj4wXT1iLmdldEhvdXJzKCk7TFthKzEyPj4yPj4+MF09Yi5nZXREYXRlKCk7TFthKzE2Pj4yPj4+MF09Yi5nZXRNb250aCgpO0xbYSsyMD4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCkvMUUzO3JldHVybiBJYSgoUj1hLDE8PStNYXRoLmFicyhSKT8wPFI/K01hdGguZmxvb3IoUi9cbjQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKFItKyh+flI+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApKSxhPj4+MH0sbTpmdW5jdGlvbigpe3JldHVybi01Mn0sbjpmdW5jdGlvbigpe30sdDpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZih3KXtyZXR1cm4odz13LnRvVGltZVN0cmluZygpLm1hdGNoKC9cXCgoW0EtWmEteiBdKylcXCkkLykpP3dbMV06XCJHTVRcIn1jPj4+PTA7dmFyIGc9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGg9bmV3IERhdGUoZywwLDEpLG09bmV3IERhdGUoZyw2LDEpO2c9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBxPW0uZ2V0VGltZXpvbmVPZmZzZXQoKTtNW2E+Pj4wPj4yPj4+MF09NjAqTWF0aC5tYXgoZyxxKTtMW2I+Pj4wPj4yPj4+MF09TnVtYmVyKGchPXEpO2E9ZihoKTtiPWYobSk7YT1CYShhKTtiPUJhKGIpO3E8Zz8oTVtjPj4yPj4+MF09YSxNW2MrND4+Mj4+PjBdPWIpOihNW2M+PjI+Pj4wXT1iLE1bYys0Pj4yPj4+MF09YSl9LGQ6KCk9PntHKFwiXCIpfSxcbmg6ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX0sdTpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxiOigpPT5wZXJmb3JtYW5jZS5ub3coKSxJOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7cmV0dXJuIEsuY29weVdpdGhpbihhPj4+MD4+PjAsYj4+PjAsYisoYz4+PjApPj4+MCl9LHM6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPUsubGVuZ3RoO2lmKDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBmPWIqKDErLjIvYyk7Zj1NYXRoLm1pbihmLGErMTAwNjYzMjk2KTt2YXIgZz1NYXRoO2Y9TWF0aC5tYXgoYSxmKTthOntnPWcubWluLmNhbGwoZyw0Mjk0OTAxNzYwLGYrKDY1NTM2LWYlNjU1MzYpJTY1NTM2KS1ILmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTY7dHJ5e0guZ3JvdyhnKTtlYSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChtKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sQzpmdW5jdGlvbihhLGIpe2E+Pj49XG4wO2I+Pj49MDt2YXIgYz0wO0NhKCkuZm9yRWFjaChmdW5jdGlvbihmLGcpe3ZhciBoPWIrYztnPU1bYSs0Kmc+PjI+Pj4wXT1oO2ZvcihoPTA7aDxmLmxlbmd0aDsrK2gpSltnKys+PjA+Pj4wXT1mLmNoYXJDb2RlQXQoaCk7SltnPj4wPj4+MF09MDtjKz1mLmxlbmd0aCsxfSk7cmV0dXJuIDB9LEQ6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPUNhKCk7TVthPj4yPj4+MF09Yy5sZW5ndGg7dmFyIGY9MDtjLmZvckVhY2goZnVuY3Rpb24oZyl7Zis9Zy5sZW5ndGgrMX0pO01bYj4+Mj4+PjBdPWY7cmV0dXJuIDB9LGY6KCk9PjUyLGo6ZnVuY3Rpb24oKXtyZXR1cm4gNTJ9LHI6ZnVuY3Rpb24oKXtyZXR1cm4gNzB9LGk6ZnVuY3Rpb24oYSxiLGMsZil7Yj4+Pj0wO2M+Pj49MDtmPj4+PTA7Zm9yKHZhciBnPTAsaD0wO2g8YztoKyspe3ZhciBtPU1bYj4+Mj4+PjBdLHE9TVtiKzQ+PjI+Pj4wXTtiKz04O2Zvcih2YXIgdz0wO3c8cTt3Kyspe3ZhciB0PUtbbSt3Pj4+MF0sdT1cbkRhW2FdOzA9PT10fHwxMD09PXQ/KCgxPT09YT9jYTpFKSh1YSh1LDApKSx1Lmxlbmd0aD0wKTp1LnB1c2godCl9Zys9cX1NW2Y+PjI+Pj4wXT1nO3JldHVybiAwfSxBOkhhLGM6ZnVuY3Rpb24oYSxiLGMsZil7cmV0dXJuIEhhKGE+Pj4wLGI+Pj4wLGM+Pj4wLGY+Pj4wKX19O1xuKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShjKXtjPWMuZXhwb3J0cztJPWM9S2EoYyk7SD1JLko7ZWEoKTtoYS51bnNoaWZ0KEkuSyk7Ti0tO2QubW9uaXRvclJ1bkRlcGVuZGVuY2llcyYmZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzKE4pO2lmKDA9PU4mJihudWxsIT09TyYmKGNsZWFySW50ZXJ2YWwoTyksTz1udWxsKSxQKSl7dmFyIGY9UDtQPW51bGw7ZigpfXJldHVybiBjfXZhciBiPXthOkphfTtOKys7ZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZkLm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoTik7aWYoZC5pbnN0YW50aWF0ZVdhc20pdHJ5e3JldHVybiBkLmluc3RhbnRpYXRlV2FzbShiLGEpfWNhdGNoKGMpe0UoXCJNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiBcIitjKSxsKGMpfXBhKGIsZnVuY3Rpb24oYyl7YShjLmluc3RhbmNlKX0pLmNhdGNoKGwpO3JldHVybnt9fSkoKTtcbmQuX09ydEluaXQ9KGEsYik9PihkLl9PcnRJbml0PUkuTCkoYSxiKTtkLl9PcnRHZXRMYXN0RXJyb3I9KGEsYik9PihkLl9PcnRHZXRMYXN0RXJyb3I9SS5NKShhLGIpO2QuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPShhLGIsYyxmLGcsaCxtLHEsdyx0KT0+KGQuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPUkuTikoYSxiLGMsZixnLGgsbSxxLHcsdCk7ZC5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihkLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1JLk8pKGEsYik7ZC5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShhLGIsYyk9PihkLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9SS5QKShhLGIsYyk7ZC5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9SS5RKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihkLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9SS5SKShhKTtcbmQuX09ydENyZWF0ZVNlc3Npb249KGEsYixjKT0+KGQuX09ydENyZWF0ZVNlc3Npb249SS5TKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVNlc3Npb249YT0+KGQuX09ydFJlbGVhc2VTZXNzaW9uPUkuVCkoYSk7ZC5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD0oYSxiLGMpPT4oZC5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD1JLlUpKGEsYixjKTtkLl9PcnRHZXRJbnB1dE5hbWU9KGEsYik9PihkLl9PcnRHZXRJbnB1dE5hbWU9SS5WKShhLGIpO2QuX09ydEdldE91dHB1dE5hbWU9KGEsYik9PihkLl9PcnRHZXRPdXRwdXROYW1lPUkuVykoYSxiKTtkLl9PcnRGcmVlPWE9PihkLl9PcnRGcmVlPUkuWCkoYSk7ZC5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxmLGcsaCk9PihkLl9PcnRDcmVhdGVUZW5zb3I9SS5ZKShhLGIsYyxmLGcsaCk7ZC5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZixnKT0+KGQuX09ydEdldFRlbnNvckRhdGE9SS5aKShhLGIsYyxmLGcpO1xuZC5fT3J0UmVsZWFzZVRlbnNvcj1hPT4oZC5fT3J0UmVsZWFzZVRlbnNvcj1JLl8pKGEpO2QuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGEsYixjLGYpPT4oZC5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1JLiQpKGEsYixjLGYpO2QuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRSdW5Db25maWdFbnRyeT1JLmFhKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KGQuX09ydFJlbGVhc2VSdW5PcHRpb25zPUkuYmEpKGEpO2QuX09ydENyZWF0ZUJpbmRpbmc9YT0+KGQuX09ydENyZWF0ZUJpbmRpbmc9SS5jYSkoYSk7ZC5fT3J0QmluZElucHV0PShhLGIsYyk9PihkLl9PcnRCaW5kSW5wdXQ9SS5kYSkoYSxiLGMpO2QuX09ydEJpbmRPdXRwdXQ9KGEsYixjLGYpPT4oZC5fT3J0QmluZE91dHB1dD1JLmVhKShhLGIsYyxmKTtkLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1hPT4oZC5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9SS5mYSkoYSk7XG5kLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oZC5fT3J0UmVsZWFzZUJpbmRpbmc9SS5nYSkoYSk7ZC5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGYsZyk9PihkLl9PcnRSdW5XaXRoQmluZGluZz1JLmhhKShhLGIsYyxmLGcpO2QuX09ydFJ1bj0oYSxiLGMsZixnLGgsbSxxKT0+KGQuX09ydFJ1bj1JLmlhKShhLGIsYyxmLGcsaCxtLHEpO2QuX09ydEVuZFByb2ZpbGluZz1hPT4oZC5fT3J0RW5kUHJvZmlsaW5nPUkuamEpKGEpO2QuX09ydFRyYWluaW5nTG9hZENoZWNrcG9pbnQ9KGEsYik9PihkLl9PcnRUcmFpbmluZ0xvYWRDaGVja3BvaW50PUkua2EpKGEsYik7ZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1hPT4oZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1JLmxhKShhKTtkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249KGEsYixjLGYsZyxoLG0scSk9PihkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249SS5tYSkoYSxiLGMsZixnLGgsbSxxKTtcbmQuX09ydFRyYWluaW5nTGF6eVJlc2V0R3JhZD1hPT4oZC5fT3J0VHJhaW5pbmdMYXp5UmVzZXRHcmFkPUkubmEpKGEpO2QuX09ydFRyYWluaW5nUnVuVHJhaW5TdGVwPShhLGIsYyxmLGcsaCk9PihkLl9PcnRUcmFpbmluZ1J1blRyYWluU3RlcD1JLm9hKShhLGIsYyxmLGcsaCk7ZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPShhLGIpPT4oZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPUkucGEpKGEsYik7ZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD0oYSxiLGMsZixnLGgpPT4oZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD1JLnFhKShhLGIsYyxmLGcsaCk7ZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT0oYSxiLGMpPT4oZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT1JLnJhKShhLGIsYyk7ZC5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc1RvQnVmZmVyPShhLGIsYyxmKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNUb0J1ZmZlcj1JLnNhKShhLGIsYyxmKTtcbmQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPShhLGIsYyxmKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPUkudGEpKGEsYixjLGYpO2QuX09ydFRyYWluaW5nUmVsZWFzZVNlc3Npb249YT0+KGQuX09ydFRyYWluaW5nUmVsZWFzZVNlc3Npb249SS51YSkoYSk7dmFyIEFhPWQuX21hbGxvYz1hPT4oQWE9ZC5fbWFsbG9jPUkudmEpKGEpO2QuX2ZyZWU9YT0+KGQuX2ZyZWU9SS53YSkoYSk7dmFyIElhPWE9PihJYT1JLnlhKShhKSxMYT0oKT0+KExhPUkuemEpKCksTWE9YT0+KE1hPUkuQWEpKGEpLE5hPWE9PihOYT1JLkJhKShhKTtcbmZ1bmN0aW9uIEthKGEpe2E9T2JqZWN0LmFzc2lnbih7fSxhKTt2YXIgYj1mPT4oKT0+ZigpPj4+MCxjPWY9Pmc9PmYoZyk+Pj4wO2EuX19lcnJub19sb2NhdGlvbj1iKGEuX19lcnJub19sb2NhdGlvbik7YS5tYWxsb2M9YyhhLm1hbGxvYyk7YS5zdGFja1NhdmU9YihhLnN0YWNrU2F2ZSk7YS5zdGFja0FsbG9jPWMoYS5zdGFja0FsbG9jKTtyZXR1cm4gYX1kLnN0YWNrQWxsb2M9TmE7ZC5zdGFja1NhdmU9TGE7ZC5zdGFja1Jlc3RvcmU9TWE7ZC5VVEY4VG9TdHJpbmc9VDtkLnN0cmluZ1RvVVRGOD0oYSxiLGMpPT5WKGEsSyxiLGMpO2QubGVuZ3RoQnl0ZXNVVEY4PVU7dmFyIFo7UD1mdW5jdGlvbiBPYSgpe1p8fFBhKCk7Wnx8KFA9T2EpfTtcbmZ1bmN0aW9uIFBhKCl7ZnVuY3Rpb24gYSgpe2lmKCFaJiYoWj0hMCxkLmNhbGxlZFJ1bj0hMCwhZGEpKXtTKGhhKTtrKGQpO2lmKGQub25SdW50aW1lSW5pdGlhbGl6ZWQpZC5vblJ1bnRpbWVJbml0aWFsaXplZCgpO2lmKGQucG9zdFJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2YgZC5wb3N0UnVuJiYoZC5wb3N0UnVuPVtkLnBvc3RSdW5dKTtkLnBvc3RSdW4ubGVuZ3RoOyl7dmFyIGI9ZC5wb3N0UnVuLnNoaWZ0KCk7aWEudW5zaGlmdChiKX1TKGlhKX19aWYoISgwPE4pKXtpZihkLnByZVJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2YgZC5wcmVSdW4mJihkLnByZVJ1bj1bZC5wcmVSdW5dKTtkLnByZVJ1bi5sZW5ndGg7KWphKCk7UyhmYSk7MDxOfHwoZC5zZXRTdGF0dXM/KGQuc2V0U3RhdHVzKFwiUnVubmluZy4uLlwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe2Quc2V0U3RhdHVzKFwiXCIpfSwxKTthKCl9LDEpKTphKCkpfX1cbmlmKGQucHJlSW5pdClmb3IoXCJmdW5jdGlvblwiPT10eXBlb2YgZC5wcmVJbml0JiYoZC5wcmVJbml0PVtkLnByZUluaXRdKTswPGQucHJlSW5pdC5sZW5ndGg7KWQucHJlSW5pdC5wb3AoKSgpO1BhKCk7XG5cblxuICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5XG59XG5cbik7XG59KSgpO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtO1xuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKVxuICBkZWZpbmUoW10sICgpID0+IG9ydFdhc20pO1xuIiwgIiIsICIiLCAiZXhwb3J0IGNvbnN0IGNwdXMgPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc21UaHJlYWRlZCA9ICgoKSA9PiB7XG4gIHZhciBfc2NyaXB0RGlyID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5jdXJyZW50U2NyaXB0ID8gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMgOiB1bmRlZmluZWQ7XG4gIGlmICh0eXBlb2YgX19maWxlbmFtZSAhPT0gJ3VuZGVmaW5lZCcpIF9zY3JpcHREaXIgPSBfc2NyaXB0RGlyIHx8IF9fZmlsZW5hbWU7XG4gIHJldHVybiAoXG5mdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkge1xuXG5mdW5jdGlvbiBhYSgpe2QuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBsfWZ1bmN0aW9uIG4oKXtkLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gYmF9ZnVuY3Rpb24gcCgpe2QuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBjYX1mdW5jdGlvbiByKCl7ZC5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGRhfWZ1bmN0aW9uIGVhKCl7ZC5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGZhfXZhciB3PW1vZHVsZUFyZyxoYSx4O3cucmVhZHk9bmV3IFByb21pc2UoKGEsYik9PntoYT1hO3g9Yn0pO1xudmFyIGlhPU9iamVjdC5hc3NpZ24oe30sdyksamE9XCIuL3RoaXMucHJvZ3JhbVwiLHo9KGEsYik9Pnt0aHJvdyBiO30sa2E9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyxBPVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsQj1cIm9iamVjdFwiPT10eXBlb2YgcHJvY2VzcyYmXCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMmJlwic3RyaW5nXCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGUsRD13LkVOVklST05NRU5UX0lTX1BUSFJFQUR8fCExLEU9XCJcIjtmdW5jdGlvbiBsYShhKXtyZXR1cm4gdy5sb2NhdGVGaWxlP3cubG9jYXRlRmlsZShhLEUpOkUrYX12YXIgbWEsRixIO1xuaWYoQil7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKSxuYT1yZXF1aXJlKFwicGF0aFwiKTtFPUE/bmEuZGlybmFtZShFKStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7bWE9KGIsYyk9PntiPWIuc3RhcnRzV2l0aChcImZpbGU6Ly9cIik/bmV3IFVSTChiKTpuYS5ub3JtYWxpemUoYik7cmV0dXJuIGZzLnJlYWRGaWxlU3luYyhiLGM/dm9pZCAwOlwidXRmOFwiKX07SD1iPT57Yj1tYShiLCEwKTtiLmJ1ZmZlcnx8KGI9bmV3IFVpbnQ4QXJyYXkoYikpO3JldHVybiBifTtGPShiLGMsZSxoPSEwKT0+e2I9Yi5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGIpOm5hLm5vcm1hbGl6ZShiKTtmcy5yZWFkRmlsZShiLGg/dm9pZCAwOlwidXRmOFwiLChnLGspPT57Zz9lKGcpOmMoaD9rLmJ1ZmZlcjprKX0pfTshdy50aGlzUHJvZ3JhbSYmMTxwcm9jZXNzLmFyZ3YubGVuZ3RoJiYoamE9cHJvY2Vzcy5hcmd2WzFdLnJlcGxhY2UoL1xcXFwvZyxcIi9cIikpO3Byb2Nlc3MuYXJndi5zbGljZSgyKTt6PShiLGMpPT57cHJvY2Vzcy5leGl0Q29kZT1cbmI7dGhyb3cgYzt9O3cuaW5zcGVjdD0oKT0+XCJbRW1zY3JpcHRlbiBNb2R1bGUgb2JqZWN0XVwiO2xldCBhO3RyeXthPXJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKX1jYXRjaChiKXt0aHJvdyBjb25zb2xlLmVycm9yKCdUaGUgXCJ3b3JrZXJfdGhyZWFkc1wiIG1vZHVsZSBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgbm9kZS5qcyBidWlsZCAtIHBlcmhhcHMgYSBuZXdlciB2ZXJzaW9uIGlzIG5lZWRlZD8nKSxiO31nbG9iYWwuV29ya2VyPWEuV29ya2VyfWVsc2UgaWYoa2F8fEEpQT9FPXNlbGYubG9jYXRpb24uaHJlZjpcInVuZGVmaW5lZFwiIT10eXBlb2YgZG9jdW1lbnQmJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQmJihFPWRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjKSwodHlwZW9mIF9zY3JpcHREaXIgIT09IFwidW5kZWZpbmVkXCIgJiYgX3NjcmlwdERpcikmJihFPV9zY3JpcHREaXIpLDAhPT1FLmluZGV4T2YoXCJibG9iOlwiKT9FPUUuc3Vic3RyKDAsRS5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKTpFPVwiXCIsQnx8KG1hPWE9Pnt2YXIgYj1cbm5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnNlbmQobnVsbCk7cmV0dXJuIGIucmVzcG9uc2VUZXh0fSxBJiYoSD1hPT57dmFyIGI9bmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLGEsITEpO2IucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIjtiLnNlbmQobnVsbCk7cmV0dXJuIG5ldyBVaW50OEFycmF5KGIucmVzcG9uc2UpfSksRj0oYSxiLGMpPT57dmFyIGU9bmV3IFhNTEh0dHBSZXF1ZXN0O2Uub3BlbihcIkdFVFwiLGEsITApO2UucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIjtlLm9ubG9hZD0oKT0+ezIwMD09ZS5zdGF0dXN8fDA9PWUuc3RhdHVzJiZlLnJlc3BvbnNlP2IoZS5yZXNwb25zZSk6YygpfTtlLm9uZXJyb3I9YztlLnNlbmQobnVsbCl9KTtCJiZcInVuZGVmaW5lZFwiPT10eXBlb2YgcGVyZm9ybWFuY2UmJihnbG9iYWwucGVyZm9ybWFuY2U9cmVxdWlyZShcInBlcmZfaG9va3NcIikucGVyZm9ybWFuY2UpO1xudmFyIG9hPWNvbnNvbGUubG9nLmJpbmQoY29uc29sZSkscGE9Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO0ImJihvYT0oLi4uYSk9PmZzLndyaXRlU3luYygxLGEuam9pbihcIiBcIikrXCJcXG5cIikscGE9KC4uLmEpPT5mcy53cml0ZVN5bmMoMixhLmpvaW4oXCIgXCIpK1wiXFxuXCIpKTt2YXIgcWE9dy5wcmludHx8b2EsST13LnByaW50RXJyfHxwYTtPYmplY3QuYXNzaWduKHcsaWEpO2lhPW51bGw7dy50aGlzUHJvZ3JhbSYmKGphPXcudGhpc1Byb2dyYW0pO3cucXVpdCYmKHo9dy5xdWl0KTt2YXIgSjt3Lndhc21CaW5hcnkmJihKPXcud2FzbUJpbmFyeSk7dmFyIG5vRXhpdFJ1bnRpbWU9dy5ub0V4aXRSdW50aW1lfHwhMDtcIm9iamVjdFwiIT10eXBlb2YgV2ViQXNzZW1ibHkmJksoXCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkXCIpO3ZhciBkLEwscmEsTT0hMSxOLGwsYmEsY2EsZGEsZmE7XG5mdW5jdGlvbiBtKCl7dmFyIGE9ZC5idWZmZXI7dy5IRUFQOD1sPW5ldyBJbnQ4QXJyYXkoYSk7dy5IRUFQMTY9bmV3IEludDE2QXJyYXkoYSk7dy5IRUFQMzI9Y2E9bmV3IEludDMyQXJyYXkoYSk7dy5IRUFQVTg9YmE9bmV3IFVpbnQ4QXJyYXkoYSk7dy5IRUFQVTE2PW5ldyBVaW50MTZBcnJheShhKTt3LkhFQVBVMzI9ZGE9bmV3IFVpbnQzMkFycmF5KGEpO3cuSEVBUEYzMj1uZXcgRmxvYXQzMkFycmF5KGEpO3cuSEVBUEY2ND1mYT1uZXcgRmxvYXQ2NEFycmF5KGEpfXZhciBPPXcuSU5JVElBTF9NRU1PUll8fDE2Nzc3MjE2OzUyNDI4ODA8PU98fEsoXCJJTklUSUFMX01FTU9SWSBzaG91bGQgYmUgbGFyZ2VyIHRoYW4gU1RBQ0tfU0laRSwgd2FzIFwiK08rXCIhIChTVEFDS19TSVpFPTUyNDI4ODApXCIpO1xuaWYoRClkPXcud2FzbU1lbW9yeTtlbHNlIGlmKHcud2FzbU1lbW9yeSlkPXcud2FzbU1lbW9yeTtlbHNlIGlmKGQ9bmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDpPLzY1NTM2LG1heGltdW06NjU1MzYsc2hhcmVkOiEwfSksIShkLmJ1ZmZlciBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyKSl0aHJvdyBJKFwicmVxdWVzdGVkIGEgc2hhcmVkIFdlYkFzc2VtYmx5Lk1lbW9yeSBidXQgdGhlIHJldHVybmVkIGJ1ZmZlciBpcyBub3QgYSBTaGFyZWRBcnJheUJ1ZmZlciwgaW5kaWNhdGluZyB0aGF0IHdoaWxlIHRoZSBicm93c2VyIGhhcyBTaGFyZWRBcnJheUJ1ZmZlciBpdCBkb2VzIG5vdCBoYXZlIFdlYkFzc2VtYmx5IHRocmVhZHMgc3VwcG9ydCAtIHlvdSBtYXkgbmVlZCB0byBzZXQgYSBmbGFnXCIpLEImJkkoXCIob24gbm9kZSB5b3UgbWF5IG5lZWQ6IC0tZXhwZXJpbWVudGFsLXdhc20tdGhyZWFkcyAtLWV4cGVyaW1lbnRhbC13YXNtLWJ1bGstbWVtb3J5IGFuZC9vciByZWNlbnQgdmVyc2lvbilcIiksXG5FcnJvcihcImJhZCBtZW1vcnlcIik7bSgpO089ZC5idWZmZXIuYnl0ZUxlbmd0aDt2YXIgc2EsdGE9W10sdWE9W10sdmE9W10sd2E9MDtmdW5jdGlvbiBQKCl7cmV0dXJuIG5vRXhpdFJ1bnRpbWV8fDA8d2F9dmFyIFE9MCx4YT1udWxsLFI9bnVsbDtmdW5jdGlvbiB5YSgpe1ErKzt3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMmJncubW9uaXRvclJ1bkRlcGVuZGVuY2llcyhRKX1mdW5jdGlvbiB6YSgpe1EtLTt3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMmJncubW9uaXRvclJ1bkRlcGVuZGVuY2llcyhRKTtpZigwPT1RJiYobnVsbCE9PXhhJiYoY2xlYXJJbnRlcnZhbCh4YSkseGE9bnVsbCksUikpe3ZhciBhPVI7Uj1udWxsO2EoKX19XG5mdW5jdGlvbiBLKGEpe2lmKHcub25BYm9ydCl3Lm9uQWJvcnQoYSk7YT1cIkFib3J0ZWQoXCIrYStcIilcIjtJKGEpO009ITA7Tj0xO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTt4KGEpO3Rocm93IGE7fWZ1bmN0aW9uIEFhKGEpe3JldHVybiBhLnN0YXJ0c1dpdGgoXCJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsXCIpfXZhciBTO1M9XCJvcnQtd2FzbS10aHJlYWRlZC53YXNtXCI7QWEoUyl8fChTPWxhKFMpKTtmdW5jdGlvbiBCYShhKXtpZihhPT1TJiZKKXJldHVybiBuZXcgVWludDhBcnJheShKKTtpZihIKXJldHVybiBIKGEpO3Rocm93XCJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZFwiO31cbmZ1bmN0aW9uIENhKGEpe2lmKCFKJiYoa2F8fEEpKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmZXRjaCYmIWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93XCJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICdcIithK1wiJ1wiO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+QmEoYSkpO2lmKEYpcmV0dXJuIG5ldyBQcm9taXNlKChiLGMpPT57RihhLGU9PmIobmV3IFVpbnQ4QXJyYXkoZSkpLGMpfSl9cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9PkJhKGEpKX1mdW5jdGlvbiBEYShhLGIsYyl7cmV0dXJuIENhKGEpLnRoZW4oZT0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZSxiKSkudGhlbihlPT5lKS50aGVuKGMsZT0+e0koXCJmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiBcIitlKTtLKGUpfSl9XG5mdW5jdGlvbiBFYShhLGIpe3ZhciBjPVM7cmV0dXJuIEp8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nfHxBYShjKXx8Yy5zdGFydHNXaXRoKFwiZmlsZTovL1wiKXx8Qnx8XCJmdW5jdGlvblwiIT10eXBlb2YgZmV0Y2g/RGEoYyxhLGIpOmZldGNoKGMse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oZT0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcoZSxhKS50aGVuKGIsZnVuY3Rpb24oaCl7SShcIndhc20gc3RyZWFtaW5nIGNvbXBpbGUgZmFpbGVkOiBcIitoKTtJKFwiZmFsbGluZyBiYWNrIHRvIEFycmF5QnVmZmVyIGluc3RhbnRpYXRpb25cIik7cmV0dXJuIERhKGMsYSxiKX0pKX12YXIgVDtmdW5jdGlvbiBVKGEpe3RoaXMubmFtZT1cIkV4aXRTdGF0dXNcIjt0aGlzLm1lc3NhZ2U9YFByb2dyYW0gdGVybWluYXRlZCB3aXRoIGV4aXQoJHthfSlgO3RoaXMuc3RhdHVzPWF9XG5mdW5jdGlvbiBGYShhKXthLnRlcm1pbmF0ZSgpO2Eub25tZXNzYWdlPSgpPT57fX1mdW5jdGlvbiBHYShhKXsoYT1WLkxhW2FdKXx8SygpO1YubGIoYSl9ZnVuY3Rpb24gSGEoYSl7dmFyIGI9Vi5mYigpO2lmKCFiKXJldHVybiA2O1YuT2EucHVzaChiKTtWLkxhW2EuTmFdPWI7Yi5OYT1hLk5hO3ZhciBjPXtjbWQ6XCJydW5cIixzdGFydF9yb3V0aW5lOmEubWIsYXJnOmEuZWIscHRocmVhZF9wdHI6YS5OYX07QiYmYi51bnJlZigpO2IucG9zdE1lc3NhZ2UoYyxhLnNiKTtyZXR1cm4gMH1cbnZhciBJYT1cInVuZGVmaW5lZFwiIT10eXBlb2YgVGV4dERlY29kZXI/bmV3IFRleHREZWNvZGVyKFwidXRmOFwiKTp2b2lkIDAsSmE9KGEsYixjKT0+e2I+Pj49MDt2YXIgZT1iK2M7Zm9yKGM9YjthW2NdJiYhKGM+PWUpOykrK2M7aWYoMTY8Yy1iJiZhLmJ1ZmZlciYmSWEpcmV0dXJuIElhLmRlY29kZShhLmJ1ZmZlciBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyP2Euc2xpY2UoYixjKTphLnN1YmFycmF5KGIsYykpO2ZvcihlPVwiXCI7YjxjOyl7dmFyIGg9YVtiKytdO2lmKGgmMTI4KXt2YXIgZz1hW2IrK10mNjM7aWYoMTkyPT0oaCYyMjQpKWUrPVN0cmluZy5mcm9tQ2hhckNvZGUoKGgmMzEpPDw2fGcpO2Vsc2V7dmFyIGs9YVtiKytdJjYzO2g9MjI0PT0oaCYyNDApPyhoJjE1KTw8MTJ8Zzw8NnxrOihoJjcpPDwxOHxnPDwxMnxrPDw2fGFbYisrXSY2Mzs2NTUzNj5oP2UrPVN0cmluZy5mcm9tQ2hhckNvZGUoaCk6KGgtPTY1NTM2LGUrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8aD4+XG4xMCw1NjMyMHxoJjEwMjMpKX19ZWxzZSBlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGgpfXJldHVybiBlfSxLYT0oYSxiKT0+KGE+Pj49MCk/SmEobigpLGEsYik6XCJcIjtmdW5jdGlvbiBMYShhKXtpZihEKXJldHVybiBXKDEsMSxhKTtOPWE7aWYoIVAoKSl7Vi5uYigpO2lmKHcub25FeGl0KXcub25FeGl0KGEpO009ITB9eihhLG5ldyBVKGEpKX1cbnZhciBOYT1hPT57Tj1hO2lmKEQpdGhyb3cgTWEoYSksXCJ1bndpbmRcIjtMYShhKX0sVj17UmE6W10sT2E6W10sWmE6W10sTGE6e30sVmE6ZnVuY3Rpb24oKXtEP1YuaGIoKTpWLmdiKCl9LGdiOmZ1bmN0aW9uKCl7dGEudW5zaGlmdCgoKT0+e3lhKCk7Vi5pYigoKT0+emEoKSl9KX0saGI6ZnVuY3Rpb24oKXtWLnJlY2VpdmVPYmplY3RUcmFuc2Zlcj1WLmtiO1YudGhyZWFkSW5pdFRMUz1WLllhO1Yuc2V0RXhpdFN0YXR1cz1WLlhhO25vRXhpdFJ1bnRpbWU9ITF9LFhhOmZ1bmN0aW9uKGEpe049YX0seGI6W1wiJHRlcm1pbmF0ZVdvcmtlclwiXSxuYjpmdW5jdGlvbigpe2Zvcih2YXIgYSBvZiBWLk9hKUZhKGEpO2ZvcihhIG9mIFYuUmEpRmEoYSk7Vi5SYT1bXTtWLk9hPVtdO1YuTGE9W119LGxiOmZ1bmN0aW9uKGEpe3ZhciBiPWEuTmE7ZGVsZXRlIFYuTGFbYl07Vi5SYS5wdXNoKGEpO1YuT2Euc3BsaWNlKFYuT2EuaW5kZXhPZihhKSwxKTthLk5hPTA7T2EoYil9LGtiOmZ1bmN0aW9uKCl7fSxcbllhOmZ1bmN0aW9uKCl7Vi5aYS5mb3JFYWNoKGE9PmEoKSl9LGpiOmE9Pm5ldyBQcm9taXNlKGI9PnthLm9ubWVzc2FnZT1nPT57Zz1nLmRhdGE7dmFyIGs9Zy5jbWQ7aWYoZy50YXJnZXRUaHJlYWQmJmcudGFyZ2V0VGhyZWFkIT1YKCkpe3ZhciB0PVYuTGFbZy53Yl07dD90LnBvc3RNZXNzYWdlKGcsZy50cmFuc2Zlckxpc3QpOkkoJ0ludGVybmFsIGVycm9yISBXb3JrZXIgc2VudCBhIG1lc3NhZ2UgXCInK2srJ1wiIHRvIHRhcmdldCBwdGhyZWFkICcrZy50YXJnZXRUaHJlYWQrXCIsIGJ1dCB0aGF0IHRocmVhZCBubyBsb25nZXIgZXhpc3RzIVwiKX1lbHNlIGlmKFwiY2hlY2tNYWlsYm94XCI9PT1rKVkoKTtlbHNlIGlmKFwic3Bhd25UaHJlYWRcIj09PWspSGEoZyk7ZWxzZSBpZihcImNsZWFudXBUaHJlYWRcIj09PWspR2EoZy50aHJlYWQpO2Vsc2UgaWYoXCJraWxsVGhyZWFkXCI9PT1rKWc9Zy50aHJlYWQsaz1WLkxhW2ddLGRlbGV0ZSBWLkxhW2ddLEZhKGspLE9hKGcpLFYuT2Euc3BsaWNlKFYuT2EuaW5kZXhPZihrKSxcbjEpLGsuTmE9MDtlbHNlIGlmKFwiY2FuY2VsVGhyZWFkXCI9PT1rKVYuTGFbZy50aHJlYWRdLnBvc3RNZXNzYWdlKHtjbWQ6XCJjYW5jZWxcIn0pO2Vsc2UgaWYoXCJsb2FkZWRcIj09PWspYS5sb2FkZWQ9ITAsYihhKTtlbHNlIGlmKFwiYWxlcnRcIj09PWspYWxlcnQoXCJUaHJlYWQgXCIrZy50aHJlYWRJZCtcIjogXCIrZy50ZXh0KTtlbHNlIGlmKFwic2V0aW1tZWRpYXRlXCI9PT1nLnRhcmdldClhLnBvc3RNZXNzYWdlKGcpO2Vsc2UgaWYoXCJjYWxsSGFuZGxlclwiPT09ayl3W2cuaGFuZGxlcl0oLi4uZy5hcmdzKTtlbHNlIGsmJkkoXCJ3b3JrZXIgc2VudCBhbiB1bmtub3duIGNvbW1hbmQgXCIrayl9O2Eub25lcnJvcj1nPT57SShcIndvcmtlciBzZW50IGFuIGVycm9yISBcIitnLmZpbGVuYW1lK1wiOlwiK2cubGluZW5vK1wiOiBcIitnLm1lc3NhZ2UpO3Rocm93IGc7fTtCJiYoYS5vbihcIm1lc3NhZ2VcIixmdW5jdGlvbihnKXthLm9ubWVzc2FnZSh7ZGF0YTpnfSl9KSxhLm9uKFwiZXJyb3JcIixmdW5jdGlvbihnKXthLm9uZXJyb3IoZyl9KSk7XG52YXIgYz1bXSxlPVtcIm9uRXhpdFwiLFwib25BYm9ydFwiLFwicHJpbnRcIixcInByaW50RXJyXCJdLGg7Zm9yKGggb2YgZSl3Lmhhc093blByb3BlcnR5KGgpJiZjLnB1c2goaCk7YS5wb3N0TWVzc2FnZSh7Y21kOlwibG9hZFwiLGhhbmRsZXJzOmMsdXJsT3JCbG9iOncubWFpblNjcmlwdFVybE9yQmxvYnx8X3NjcmlwdERpcix3YXNtTWVtb3J5OmQsd2FzbU1vZHVsZTpyYX0pfSksaWI6ZnVuY3Rpb24oYSl7YSgpfSxjYjpmdW5jdGlvbigpe3ZhciBhPWxhKFwib3J0LXdhc20tdGhyZWFkZWQud29ya2VyLmpzXCIpO2E9bmV3IFdvcmtlcihhKTtWLlJhLnB1c2goYSl9LGZiOmZ1bmN0aW9uKCl7MD09Vi5SYS5sZW5ndGgmJihWLmNiKCksVi5qYihWLlJhWzBdKSk7cmV0dXJuIFYuUmEucG9wKCl9fTt3LlBUaHJlYWQ9Vjt2YXIgUGE9YT0+e2Zvcig7MDxhLmxlbmd0aDspYS5zaGlmdCgpKHcpfTtcbncuZXN0YWJsaXNoU3RhY2tTcGFjZT1mdW5jdGlvbigpe3ZhciBhPVgoKSxiPXAoKVthKzUyPj4yPj4+MF07YT1wKClbYSs1Nj4+Mj4+PjBdO1FhKGIsYi1hKTtSYShiKX07ZnVuY3Rpb24gTWEoYSl7aWYoRClyZXR1cm4gVygyLDAsYSk7TmEoYSl9dmFyIFNhPVtdO3cuaW52b2tlRW50cnlQb2ludD1mdW5jdGlvbihhLGIpe3ZhciBjPVNhW2FdO2N8fChhPj1TYS5sZW5ndGgmJihTYS5sZW5ndGg9YSsxKSxTYVthXT1jPXNhLmdldChhKSk7YT1jKGIpO1AoKT9WLlhhKGEpOlRhKGEpfTtmdW5jdGlvbiBVYShhKXt0aGlzLlVhPWEtMjQ7dGhpcy5iYj1mdW5jdGlvbihiKXtyKClbdGhpcy5VYSs0Pj4yPj4+MF09Yn07dGhpcy5hYj1mdW5jdGlvbihiKXtyKClbdGhpcy5VYSs4Pj4yPj4+MF09Yn07dGhpcy5WYT1mdW5jdGlvbihiLGMpe3RoaXMuJGEoKTt0aGlzLmJiKGIpO3RoaXMuYWIoYyl9O3RoaXMuJGE9ZnVuY3Rpb24oKXtyKClbdGhpcy5VYSsxNj4+Mj4+PjBdPTB9fVxudmFyIFZhPTAsV2E9MDtmdW5jdGlvbiBYYShhLGIsYyxlKXtyZXR1cm4gRD9XKDMsMSxhLGIsYyxlKTpZYShhLGIsYyxlKX1mdW5jdGlvbiBZYShhLGIsYyxlKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtlPj4+PTA7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyKXJldHVybiBJKFwiQ3VycmVudCBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IFNoYXJlZEFycmF5QnVmZmVyLCBwdGhyZWFkcyBhcmUgbm90IGF2YWlsYWJsZSFcIiksNjt2YXIgaD1bXTtpZihEJiYwPT09aC5sZW5ndGgpcmV0dXJuIFhhKGEsYixjLGUpO2E9e21iOmMsTmE6YSxlYjplLHNiOmh9O3JldHVybiBEPyhhLnViPVwic3Bhd25UaHJlYWRcIixwb3N0TWVzc2FnZShhLGgpLDApOkhhKGEpfWZ1bmN0aW9uIFphKGEsYixjKXtyZXR1cm4gRD9XKDQsMSxhLGIsYyk6MH1mdW5jdGlvbiAkYShhLGIpe2lmKEQpcmV0dXJuIFcoNSwxLGEsYil9XG52YXIgYWI9YT0+e2Zvcih2YXIgYj0wLGM9MDtjPGEubGVuZ3RoOysrYyl7dmFyIGU9YS5jaGFyQ29kZUF0KGMpOzEyNz49ZT9iKys6MjA0Nz49ZT9iKz0yOjU1Mjk2PD1lJiY1NzM0Mz49ZT8oYis9NCwrK2MpOmIrPTN9cmV0dXJuIGJ9LGJiPShhLGIsYyxlKT0+e2M+Pj49MDtpZighKDA8ZSkpcmV0dXJuIDA7dmFyIGg9YztlPWMrZS0xO2Zvcih2YXIgZz0wO2c8YS5sZW5ndGg7KytnKXt2YXIgaz1hLmNoYXJDb2RlQXQoZyk7aWYoNTUyOTY8PWsmJjU3MzQzPj1rKXt2YXIgdD1hLmNoYXJDb2RlQXQoKytnKTtrPTY1NTM2KygoayYxMDIzKTw8MTApfHQmMTAyM31pZigxMjc+PWspe2lmKGM+PWUpYnJlYWs7YltjKys+Pj4wXT1rfWVsc2V7aWYoMjA0Nz49ayl7aWYoYysxPj1lKWJyZWFrO2JbYysrPj4+MF09MTkyfGs+PjZ9ZWxzZXtpZig2NTUzNT49ayl7aWYoYysyPj1lKWJyZWFrO2JbYysrPj4+MF09MjI0fGs+PjEyfWVsc2V7aWYoYyszPj1lKWJyZWFrO2JbYysrPj4+MF09MjQwfGs+PlxuMTg7YltjKys+Pj4wXT0xMjh8az4+MTImNjN9YltjKys+Pj4wXT0xMjh8az4+NiY2M31iW2MrKz4+PjBdPTEyOHxrJjYzfX1iW2M+Pj4wXT0wO3JldHVybiBjLWh9LGNiPShhLGIsYyk9PmJiKGEsbigpLGIsYyk7ZnVuY3Rpb24gZGIoYSxiKXtpZihEKXJldHVybiBXKDYsMSxhLGIpfWZ1bmN0aW9uIGViKGEsYixjKXtpZihEKXJldHVybiBXKDcsMSxhLGIsYyl9ZnVuY3Rpb24gZmIoYSxiLGMpe3JldHVybiBEP1coOCwxLGEsYixjKTowfWZ1bmN0aW9uIGdiKGEsYil7aWYoRClyZXR1cm4gVyg5LDEsYSxiKX1mdW5jdGlvbiBoYihhLGIsYyl7aWYoRClyZXR1cm4gVygxMCwxLGEsYixjKX1mdW5jdGlvbiBpYihhLGIsYyxlKXtpZihEKXJldHVybiBXKDExLDEsYSxiLGMsZSl9ZnVuY3Rpb24gamIoYSxiLGMsZSl7aWYoRClyZXR1cm4gVygxMiwxLGEsYixjLGUpfWZ1bmN0aW9uIGtiKGEsYixjLGUpe2lmKEQpcmV0dXJuIFcoMTMsMSxhLGIsYyxlKX1cbmZ1bmN0aW9uIGxiKGEpe2lmKEQpcmV0dXJuIFcoMTQsMSxhKX1mdW5jdGlvbiBtYihhLGIpe2lmKEQpcmV0dXJuIFcoMTUsMSxhLGIpfWZ1bmN0aW9uIG5iKGEsYixjKXtpZihEKXJldHVybiBXKDE2LDEsYSxiLGMpfXZhciBvYj1hPT57aWYoIU0pdHJ5e2lmKGEoKSwhUCgpKXRyeXtEP1RhKE4pOk5hKE4pfWNhdGNoKGIpe2IgaW5zdGFuY2VvZiBVfHxcInVud2luZFwiPT1ifHx6KDEsYil9fWNhdGNoKGIpe2IgaW5zdGFuY2VvZiBVfHxcInVud2luZFwiPT1ifHx6KDEsYil9fTtmdW5jdGlvbiBwYihhKXthPj4+PTA7XCJmdW5jdGlvblwiPT09dHlwZW9mIEF0b21pY3MudGImJihBdG9taWNzLnRiKHAoKSxhPj4yLGEpLnZhbHVlLnRoZW4oWSksYSs9MTI4LEF0b21pY3Muc3RvcmUocCgpLGE+PjIsMSkpfXcuX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0PXBiO2Z1bmN0aW9uIFkoKXt2YXIgYT1YKCk7YSYmKHBiKGEpLG9iKCgpPT5xYigpKSl9dy5jaGVja01haWxib3g9WTtcbnZhciBaPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCkscmI9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sc2I9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF07ZnVuY3Rpb24gdGIoYSxiLGMsZSxoLGcsayx0KXtyZXR1cm4gRD9XKDE3LDEsYSxiLGMsZSxoLGcsayx0KTotNTJ9ZnVuY3Rpb24gdWIoYSxiLGMsZSxoLGcsayl7aWYoRClyZXR1cm4gVygxOCwxLGEsYixjLGUsaCxnLGspfXZhciB3Yj1hPT57dmFyIGI9YWIoYSkrMSxjPXZiKGIpO2MmJmNiKGEsYyxiKTtyZXR1cm4gY30seWI9YT0+e3ZhciBiPXhiKCk7YT1hKCk7UmEoYik7cmV0dXJuIGF9O1xuZnVuY3Rpb24gVyhhLGIpe3ZhciBjPWFyZ3VtZW50cy5sZW5ndGgtMixlPWFyZ3VtZW50cztyZXR1cm4geWIoKCk9Pntmb3IodmFyIGg9emIoOCpjKSxnPWg+PjMsaz0wO2s8YztrKyspe3ZhciB0PWVbMitrXTtlYSgpW2craz4+PjBdPXR9cmV0dXJuIEFiKGEsYyxoLGIpfSl9XG52YXIgQmI9W10sQ2I9e30sRWI9KCk9PntpZighRGIpe3ZhciBhPXtVU0VSOlwid2ViX3VzZXJcIixMT0dOQU1FOlwid2ViX3VzZXJcIixQQVRIOlwiL1wiLFBXRDpcIi9cIixIT01FOlwiL2hvbWUvd2ViX3VzZXJcIixMQU5HOihcIm9iamVjdFwiPT10eXBlb2YgbmF2aWdhdG9yJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzWzBdfHxcIkNcIikucmVwbGFjZShcIi1cIixcIl9cIikrXCIuVVRGLThcIixfOmphfHxcIi4vdGhpcy5wcm9ncmFtXCJ9LGI7Zm9yKGIgaW4gQ2Ipdm9pZCAwPT09Q2JbYl0/ZGVsZXRlIGFbYl06YVtiXT1DYltiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7RGI9Y31yZXR1cm4gRGJ9LERiO1xuZnVuY3Rpb24gRmIoYSxiKXtpZihEKXJldHVybiBXKDE5LDEsYSxiKTthPj4+PTA7Yj4+Pj0wO3ZhciBjPTA7RWIoKS5mb3JFYWNoKGZ1bmN0aW9uKGUsaCl7dmFyIGc9YitjO2g9cigpW2ErNCpoPj4yPj4+MF09Zztmb3IoZz0wO2c8ZS5sZW5ndGg7KytnKWFhKClbaCsrPj4wPj4+MF09ZS5jaGFyQ29kZUF0KGcpO2FhKClbaD4+MD4+PjBdPTA7Yys9ZS5sZW5ndGgrMX0pO3JldHVybiAwfWZ1bmN0aW9uIEdiKGEsYil7aWYoRClyZXR1cm4gVygyMCwxLGEsYik7YT4+Pj0wO2I+Pj49MDt2YXIgYz1FYigpO3IoKVthPj4yPj4+MF09Yy5sZW5ndGg7dmFyIGU9MDtjLmZvckVhY2goZnVuY3Rpb24oaCl7ZSs9aC5sZW5ndGgrMX0pO3IoKVtiPj4yPj4+MF09ZTtyZXR1cm4gMH1mdW5jdGlvbiBIYihhKXtyZXR1cm4gRD9XKDIxLDEsYSk6NTJ9ZnVuY3Rpb24gTGIoYSxiLGMsZSl7cmV0dXJuIEQ/VygyMiwxLGEsYixjLGUpOjUyfVxuZnVuY3Rpb24gTWIoYSxiLGMsZSxoKXtyZXR1cm4gRD9XKDIzLDEsYSxiLGMsZSxoKTo3MH12YXIgTmI9W251bGwsW10sW11dO2Z1bmN0aW9uIE9iKGEsYixjLGUpe2lmKEQpcmV0dXJuIFcoMjQsMSxhLGIsYyxlKTtiPj4+PTA7Yz4+Pj0wO2U+Pj49MDtmb3IodmFyIGg9MCxnPTA7ZzxjO2crKyl7dmFyIGs9cigpW2I+PjI+Pj4wXSx0PXIoKVtiKzQ+PjI+Pj4wXTtiKz04O2Zvcih2YXIgQz0wO0M8dDtDKyspe3ZhciB2PW4oKVtrK0M+Pj4wXSx5PU5iW2FdOzA9PT12fHwxMD09PXY/KCgxPT09YT9xYTpJKShKYSh5LDApKSx5Lmxlbmd0aD0wKTp5LnB1c2godil9aCs9dH1yKClbZT4+Mj4+PjBdPWg7cmV0dXJuIDB9dmFyIFBiPVszMSwyOSwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV0sUWI9WzMxLDI4LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXTtmdW5jdGlvbiBSYihhKXt2YXIgYj1BcnJheShhYihhKSsxKTtiYihhLGIsMCxiLmxlbmd0aCk7cmV0dXJuIGJ9XG52YXIgU2I9KGEsYik9PnthYSgpLnNldChhLGI+Pj4wKX07XG5mdW5jdGlvbiBUYihhLGIsYyxlKXtmdW5jdGlvbiBoKGYscSx1KXtmb3IoZj1cIm51bWJlclwiPT10eXBlb2YgZj9mLnRvU3RyaW5nKCk6Znx8XCJcIjtmLmxlbmd0aDxxOylmPXVbMF0rZjtyZXR1cm4gZn1mdW5jdGlvbiBnKGYscSl7cmV0dXJuIGgoZixxLFwiMFwiKX1mdW5jdGlvbiBrKGYscSl7ZnVuY3Rpb24gdShJYil7cmV0dXJuIDA+SWI/LTE6MDxJYj8xOjB9dmFyIEc7MD09PShHPXUoZi5nZXRGdWxsWWVhcigpLXEuZ2V0RnVsbFllYXIoKSkpJiYwPT09KEc9dShmLmdldE1vbnRoKCktcS5nZXRNb250aCgpKSkmJihHPXUoZi5nZXREYXRlKCktcS5nZXREYXRlKCkpKTtyZXR1cm4gR31mdW5jdGlvbiB0KGYpe3N3aXRjaChmLmdldERheSgpKXtjYXNlIDA6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKS0xLDExLDI5KTtjYXNlIDE6cmV0dXJuIGY7Y2FzZSAyOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksMCwzKTtjYXNlIDM6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSxcbjAsMik7Y2FzZSA0OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksMCwxKTtjYXNlIDU6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKS0xLDExLDMxKTtjYXNlIDY6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKS0xLDExLDMwKX19ZnVuY3Rpb24gQyhmKXt2YXIgcT1mLlBhO2ZvcihmPW5ldyBEYXRlKChuZXcgRGF0ZShmLlFhKzE5MDAsMCwxKSkuZ2V0VGltZSgpKTswPHE7KXt2YXIgdT1mLmdldE1vbnRoKCksRz0oWihmLmdldEZ1bGxZZWFyKCkpP1BiOlFiKVt1XTtpZihxPkctZi5nZXREYXRlKCkpcS09Ry1mLmdldERhdGUoKSsxLGYuc2V0RGF0ZSgxKSwxMT51P2Yuc2V0TW9udGgodSsxKTooZi5zZXRNb250aCgwKSxmLnNldEZ1bGxZZWFyKGYuZ2V0RnVsbFllYXIoKSsxKSk7ZWxzZXtmLnNldERhdGUoZi5nZXREYXRlKCkrcSk7YnJlYWt9fXU9bmV3IERhdGUoZi5nZXRGdWxsWWVhcigpKzEsMCw0KTtxPXQobmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCw0KSk7dT10KHUpO3JldHVybiAwPj1rKHEsZik/MD49ayh1LGYpP2YuZ2V0RnVsbFllYXIoKSsxOmYuZ2V0RnVsbFllYXIoKTpmLmdldEZ1bGxZZWFyKCktMX1hPj4+PTA7Yj4+Pj0wO2M+Pj49MDtlPj4+PTA7dmFyIHY9cCgpW2UrNDA+PjI+Pj4wXTtlPXtxYjpwKClbZT4+Mj4+PjBdLHBiOnAoKVtlKzQ+PjI+Pj4wXSxTYTpwKClbZSs4Pj4yPj4+MF0sV2E6cCgpW2UrMTI+PjI+Pj4wXSxUYTpwKClbZSsxNj4+Mj4+PjBdLFFhOnAoKVtlKzIwPj4yPj4+MF0sTWE6cCgpW2UrMjQ+PjI+Pj4wXSxQYTpwKClbZSsyOD4+Mj4+PjBdLHliOnAoKVtlKzMyPj4yPj4+MF0sb2I6cCgpW2UrMzY+PjI+Pj4wXSxyYjp2P0thKHYpOlwiXCJ9O2M9S2EoYyk7dj17XCIlY1wiOlwiJWEgJWIgJWQgJUg6JU06JVMgJVlcIixcIiVEXCI6XCIlbS8lZC8leVwiLFwiJUZcIjpcIiVZLSVtLSVkXCIsXCIlaFwiOlwiJWJcIixcIiVyXCI6XCIlSTolTTolUyAlcFwiLFwiJVJcIjpcIiVIOiVNXCIsXCIlVFwiOlwiJUg6JU06JVNcIixcIiV4XCI6XCIlbS8lZC8leVwiLFxuXCIlWFwiOlwiJUg6JU06JVNcIixcIiVFY1wiOlwiJWNcIixcIiVFQ1wiOlwiJUNcIixcIiVFeFwiOlwiJW0vJWQvJXlcIixcIiVFWFwiOlwiJUg6JU06JVNcIixcIiVFeVwiOlwiJXlcIixcIiVFWVwiOlwiJVlcIixcIiVPZFwiOlwiJWRcIixcIiVPZVwiOlwiJWVcIixcIiVPSFwiOlwiJUhcIixcIiVPSVwiOlwiJUlcIixcIiVPbVwiOlwiJW1cIixcIiVPTVwiOlwiJU1cIixcIiVPU1wiOlwiJVNcIixcIiVPdVwiOlwiJXVcIixcIiVPVVwiOlwiJVVcIixcIiVPVlwiOlwiJVZcIixcIiVPd1wiOlwiJXdcIixcIiVPV1wiOlwiJVdcIixcIiVPeVwiOlwiJXlcIn07Zm9yKHZhciB5IGluIHYpYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh5LFwiZ1wiKSx2W3ldKTt2YXIgSmI9XCJTdW5kYXkgTW9uZGF5IFR1ZXNkYXkgV2VkbmVzZGF5IFRodXJzZGF5IEZyaWRheSBTYXR1cmRheVwiLnNwbGl0KFwiIFwiKSxLYj1cIkphbnVhcnkgRmVicnVhcnkgTWFyY2ggQXByaWwgTWF5IEp1bmUgSnVseSBBdWd1c3QgU2VwdGVtYmVyIE9jdG9iZXIgTm92ZW1iZXIgRGVjZW1iZXJcIi5zcGxpdChcIiBcIik7dj17XCIlYVwiOmY9PkpiW2YuTWFdLnN1YnN0cmluZygwLDMpLFxuXCIlQVwiOmY9PkpiW2YuTWFdLFwiJWJcIjpmPT5LYltmLlRhXS5zdWJzdHJpbmcoMCwzKSxcIiVCXCI6Zj0+S2JbZi5UYV0sXCIlQ1wiOmY9PmcoKGYuUWErMTkwMCkvMTAwfDAsMiksXCIlZFwiOmY9PmcoZi5XYSwyKSxcIiVlXCI6Zj0+aChmLldhLDIsXCIgXCIpLFwiJWdcIjpmPT5DKGYpLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJUdcIjpmPT5DKGYpLFwiJUhcIjpmPT5nKGYuU2EsMiksXCIlSVwiOmY9PntmPWYuU2E7MD09Zj9mPTEyOjEyPGYmJihmLT0xMik7cmV0dXJuIGcoZiwyKX0sXCIlalwiOmY9Pntmb3IodmFyIHE9MCx1PTA7dTw9Zi5UYS0xO3ErPShaKGYuUWErMTkwMCk/UGI6UWIpW3UrK10pO3JldHVybiBnKGYuV2ErcSwzKX0sXCIlbVwiOmY9PmcoZi5UYSsxLDIpLFwiJU1cIjpmPT5nKGYucGIsMiksXCIlblwiOigpPT5cIlxcblwiLFwiJXBcIjpmPT4wPD1mLlNhJiYxMj5mLlNhP1wiQU1cIjpcIlBNXCIsXCIlU1wiOmY9PmcoZi5xYiwyKSxcIiV0XCI6KCk9PlwiXFx0XCIsXCIldVwiOmY9PmYuTWF8fDcsXCIlVVwiOmY9PmcoTWF0aC5mbG9vcigoZi5QYStcbjctZi5NYSkvNyksMiksXCIlVlwiOmY9Pnt2YXIgcT1NYXRoLmZsb29yKChmLlBhKzctKGYuTWErNiklNykvNyk7Mj49KGYuTWErMzcxLWYuUGEtMiklNyYmcSsrO2lmKHEpNTM9PXEmJih1PShmLk1hKzM3MS1mLlBhKSU3LDQ9PXV8fDM9PXUmJlooZi5RYSl8fChxPTEpKTtlbHNle3E9NTI7dmFyIHU9KGYuTWErNy1mLlBhLTEpJTc7KDQ9PXV8fDU9PXUmJlooZi5RYSU0MDAtMSkpJiZxKyt9cmV0dXJuIGcocSwyKX0sXCIld1wiOmY9PmYuTWEsXCIlV1wiOmY9PmcoTWF0aC5mbG9vcigoZi5QYSs3LShmLk1hKzYpJTcpLzcpLDIpLFwiJXlcIjpmPT4oZi5RYSsxOTAwKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVZXCI6Zj0+Zi5RYSsxOTAwLFwiJXpcIjpmPT57Zj1mLm9iO3ZhciBxPTA8PWY7Zj1NYXRoLmFicyhmKS82MDtyZXR1cm4ocT9cIitcIjpcIi1cIikrU3RyaW5nKFwiMDAwMFwiKyhmLzYwKjEwMCtmJTYwKSkuc2xpY2UoLTQpfSxcIiVaXCI6Zj0+Zi5yYixcIiUlXCI6KCk9PlwiJVwifTtjPWMucmVwbGFjZSgvJSUvZyxcblwiXFx4MDBcXHgwMFwiKTtmb3IoeSBpbiB2KWMuaW5jbHVkZXMoeSkmJihjPWMucmVwbGFjZShuZXcgUmVnRXhwKHksXCJnXCIpLHZbeV0oZSkpKTtjPWMucmVwbGFjZSgvXFwwXFwwL2csXCIlXCIpO3k9UmIoYyk7aWYoeS5sZW5ndGg+YilyZXR1cm4gMDtTYih5LGEpO3JldHVybiB5Lmxlbmd0aC0xfVYuVmEoKTtcbnZhciBVYj1bbnVsbCxMYSxNYSxYYSxaYSwkYSxkYixlYixmYixnYixoYixpYixqYixrYixsYixtYixuYix0Yix1YixGYixHYixIYixMYixNYixPYl0sWGI9e2I6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDsobmV3IFVhKGEpKS5WYShiPj4+MCxjPj4+MCk7VmE9YTtXYSsrO3Rocm93IFZhO30sTjpmdW5jdGlvbihhKXtWYihhPj4+MCwhQSwxLCFrYSwxMzEwNzIsITEpO1YuWWEoKX0sajpmdW5jdGlvbihhKXthPj4+PTA7RD9wb3N0TWVzc2FnZSh7Y21kOlwiY2xlYW51cFRocmVhZFwiLHRocmVhZDphfSk6R2EoYSl9LEk6WWEsaDpaYSxUOiRhLEQ6ZGIsRjplYixVOmZiLFI6Z2IsSjpoYixROmliLG46amIsRTprYixCOmxiLFM6bWIsQzpuYixxOigpPT4hMCx6OmZ1bmN0aW9uKGEsYil7YT4+Pj0wO2E9PWI+Pj4wP3NldFRpbWVvdXQoKCk9PlkoKSk6RD9wb3N0TWVzc2FnZSh7dGFyZ2V0VGhyZWFkOmEsY21kOlwiY2hlY2tNYWlsYm94XCJ9KTooYT1WLkxhW2FdKSYmYS5wb3N0TWVzc2FnZSh7Y21kOlwiY2hlY2tNYWlsYm94XCJ9KX0sXG5MOmZ1bmN0aW9uKCl7cmV0dXJuLTF9LE06cGIscDpmdW5jdGlvbihhKXtCJiZWLkxhW2E+Pj4wXS5yZWYoKX0sdDpmdW5jdGlvbihhLGIsYyl7YT1iKzIwOTcxNTI+Pj4wPDQxOTQzMDUtISFhPyhhPj4+MCkrNDI5NDk2NzI5NipiOk5hTjtjPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7cCgpW2M+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtwKClbYys0Pj4yPj4+MF09YS5nZXRVVENNaW51dGVzKCk7cCgpW2MrOD4+Mj4+PjBdPWEuZ2V0VVRDSG91cnMoKTtwKClbYysxMj4+Mj4+PjBdPWEuZ2V0VVRDRGF0ZSgpO3AoKVtjKzE2Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO3AoKVtjKzIwPj4yPj4+MF09YS5nZXRVVENGdWxsWWVhcigpLTE5MDA7cCgpW2MrMjQ+PjI+Pj4wXT1hLmdldFVUQ0RheSgpO2E9KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDA7cCgpW2MrMjg+PjI+Pj4wXT1hfSx1OmZ1bmN0aW9uKGEsYixjKXthPWIrXG4yMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3AoKVtjPj4yPj4+MF09YS5nZXRTZWNvbmRzKCk7cCgpW2MrND4+Mj4+PjBdPWEuZ2V0TWludXRlcygpO3AoKVtjKzg+PjI+Pj4wXT1hLmdldEhvdXJzKCk7cCgpW2MrMTI+PjI+Pj4wXT1hLmdldERhdGUoKTtwKClbYysxNj4+Mj4+PjBdPWEuZ2V0TW9udGgoKTtwKClbYysyMD4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO3AoKVtjKzI0Pj4yPj4+MF09YS5nZXREYXkoKTtiPShaKGEuZ2V0RnVsbFllYXIoKSk/cmI6c2IpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO3AoKVtjKzI4Pj4yPj4+MF09YjtwKClbYyszNj4+Mj4+PjBdPS0oNjAqYS5nZXRUaW1lem9uZU9mZnNldCgpKTtiPShuZXcgRGF0ZShhLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgZT0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDAsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7XG5hPShiIT1lJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGUsYikpfDA7cCgpW2MrMzI+PjI+Pj4wXT1hfSx2OmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj1uZXcgRGF0ZShwKClbYSsyMD4+Mj4+PjBdKzE5MDAscCgpW2ErMTY+PjI+Pj4wXSxwKClbYSsxMj4+Mj4+PjBdLHAoKVthKzg+PjI+Pj4wXSxwKClbYSs0Pj4yPj4+MF0scCgpW2E+PjI+Pj4wXSwwKSxjPXAoKVthKzMyPj4yPj4+MF0sZT1iLmdldFRpbWV6b25lT2Zmc2V0KCksaD0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksZz0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDAsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksaz1NYXRoLm1pbihnLGgpOzA+Yz9wKClbYSszMj4+Mj4+PjBdPU51bWJlcihoIT1nJiZrPT1lKTowPGMhPShrPT1lKSYmKGg9TWF0aC5tYXgoZyxoKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP2s6aCktZSkpKTtwKClbYSsyND4+Mj4+PlxuMF09Yi5nZXREYXkoKTtjPShaKGIuZ2V0RnVsbFllYXIoKSk/cmI6c2IpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO3AoKVthKzI4Pj4yPj4+MF09YztwKClbYT4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO3AoKVthKzQ+PjI+Pj4wXT1iLmdldE1pbnV0ZXMoKTtwKClbYSs4Pj4yPj4+MF09Yi5nZXRIb3VycygpO3AoKVthKzEyPj4yPj4+MF09Yi5nZXREYXRlKCk7cCgpW2ErMTY+PjI+Pj4wXT1iLmdldE1vbnRoKCk7cCgpW2ErMjA+PjI+Pj4wXT1iLmdldFllYXIoKTthPWIuZ2V0VGltZSgpLzFFMztyZXR1cm4gV2IoKFQ9YSwxPD0rTWF0aC5hYnMoVCk/MDxUPytNYXRoLmZsb29yKFQvNDI5NDk2NzI5Nik+Pj4wOn5+K01hdGguY2VpbCgoVC0rKH5+VD4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCkpLGE+Pj4wfSxyOnRiLHM6dWIseTpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZSh2KXtyZXR1cm4odj12LnRvVGltZVN0cmluZygpLm1hdGNoKC9cXCgoW0EtWmEteiBdKylcXCkkLykpP1xudlsxXTpcIkdNVFwifWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO3ZhciBoPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxnPW5ldyBEYXRlKGgsMCwxKSxrPW5ldyBEYXRlKGgsNiwxKTtoPWcuZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgdD1rLmdldFRpbWV6b25lT2Zmc2V0KCksQz1NYXRoLm1heChoLHQpO3IoKVthPj4yPj4+MF09NjAqQztwKClbYj4+Mj4+PjBdPU51bWJlcihoIT10KTthPWUoZyk7Yj1lKGspO2E9d2IoYSk7Yj13YihiKTt0PGg/KHIoKVtjPj4yPj4+MF09YSxyKClbYys0Pj4yPj4+MF09Yik6KHIoKVtjPj4yPj4+MF09YixyKClbYys0Pj4yPj4+MF09YSl9LGM6KCk9PntLKFwiXCIpfSxrOmZ1bmN0aW9uKCl7fSxpOmZ1bmN0aW9uKCl7cmV0dXJuIERhdGUubm93KCl9LG86KCk9Pnt3YSs9MTt0aHJvd1widW53aW5kXCI7fSxBOmZ1bmN0aW9uKCl7cmV0dXJuIDQyOTQ5MDE3NjB9LGU6KCk9PnBlcmZvcm1hbmNlLnRpbWVPcmlnaW4rcGVyZm9ybWFuY2Uubm93KCksZjpmdW5jdGlvbigpe3JldHVybiBCP1xucmVxdWlyZShcIm9zXCIpLmNwdXMoKS5sZW5ndGg6bmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3l9LEs6ZnVuY3Rpb24oYSxiLGMsZSl7Vi52Yj1iPj4+MDtCYi5sZW5ndGg9YztiPWU+Pj4wPj4zO2ZvcihlPTA7ZTxjO2UrKylCYltlXT1lYSgpW2IrZT4+PjBdO3JldHVybiBVYlthXS5hcHBseShudWxsLEJiKX0seDpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9bigpLmxlbmd0aDtpZihhPD1ifHw0Mjk0OTAxNzYwPGEpcmV0dXJuITE7Zm9yKHZhciBjPTE7ND49YztjKj0yKXt2YXIgZT1iKigxKy4yL2MpO2U9TWF0aC5taW4oZSxhKzEwMDY2MzI5Nik7dmFyIGg9TWF0aDtlPU1hdGgubWF4KGEsZSk7YTp7aD1oLm1pbi5jYWxsKGgsNDI5NDkwMTc2MCxlKyg2NTUzNi1lJTY1NTM2KSU2NTUzNiktZC5idWZmZXIuYnl0ZUxlbmd0aCs2NTUzNT4+PjE2O3RyeXtkLmdyb3coaCk7bSgpO3ZhciBnPTE7YnJlYWsgYX1jYXRjaChrKXt9Zz12b2lkIDB9aWYoZylyZXR1cm4hMH1yZXR1cm4hMX0sXG5POkZiLFA6R2IsSDpOYSxnOkhiLG06TGIsdzpNYixsOk9iLGE6ZHx8dy53YXNtTWVtb3J5LEc6VGIsZDpmdW5jdGlvbihhLGIsYyxlKXtyZXR1cm4gVGIoYT4+PjAsYj4+PjAsYz4+PjAsZT4+PjApfX07KGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShjLGUpe2M9Yy5leHBvcnRzO0w9Yz1ZYihjKTtWLlphLnB1c2goTC55YSk7c2E9TC56YTt1YS51bnNoaWZ0KEwuVik7cmE9ZTt6YSgpO3JldHVybiBjfXZhciBiPXthOlhifTt5YSgpO2lmKHcuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gdy5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtJKFwiTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogXCIrYykseChjKX1FYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSxjLm1vZHVsZSl9KS5jYXRjaCh4KTtyZXR1cm57fX0pKCk7dy5fT3J0SW5pdD0oYSxiKT0+KHcuX09ydEluaXQ9TC5XKShhLGIpO1xudy5fT3J0R2V0TGFzdEVycm9yPShhLGIpPT4ody5fT3J0R2V0TGFzdEVycm9yPUwuWCkoYSxiKTt3Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZSxoLGcsayx0LEMsdik9Pih3Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1MLlkpKGEsYixjLGUsaCxnLGssdCxDLHYpO3cuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShhLGIpPT4ody5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9TC5aKShhLGIpO3cuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oYSxiLGMpPT4ody5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPUwuXykoYSxiLGMpO3cuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT0oYSxiLGMpPT4ody5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PUwuJCkoYSxiLGMpO3cuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1hPT4ody5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPUwuYWEpKGEpO1xudy5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4ody5fT3J0Q3JlYXRlU2Vzc2lvbj1MLmJhKShhLGIsYyk7dy5fT3J0UmVsZWFzZVNlc3Npb249YT0+KHcuX09ydFJlbGVhc2VTZXNzaW9uPUwuY2EpKGEpO3cuX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KHcuX09ydEdldElucHV0T3V0cHV0Q291bnQ9TC5kYSkoYSxiLGMpO3cuX09ydEdldElucHV0TmFtZT0oYSxiKT0+KHcuX09ydEdldElucHV0TmFtZT1MLmVhKShhLGIpO3cuX09ydEdldE91dHB1dE5hbWU9KGEsYik9Pih3Ll9PcnRHZXRPdXRwdXROYW1lPUwuZmEpKGEsYik7dy5fT3J0RnJlZT1hPT4ody5fT3J0RnJlZT1MLmdhKShhKTt3Ll9PcnRDcmVhdGVUZW5zb3I9KGEsYixjLGUsaCxnKT0+KHcuX09ydENyZWF0ZVRlbnNvcj1MLmhhKShhLGIsYyxlLGgsZyk7dy5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZSxoKT0+KHcuX09ydEdldFRlbnNvckRhdGE9TC5pYSkoYSxiLGMsZSxoKTtcbncuX09ydFJlbGVhc2VUZW5zb3I9YT0+KHcuX09ydFJlbGVhc2VUZW5zb3I9TC5qYSkoYSk7dy5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0oYSxiLGMsZSk9Pih3Ll9PcnRDcmVhdGVSdW5PcHRpb25zPUwua2EpKGEsYixjLGUpO3cuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9Pih3Ll9PcnRBZGRSdW5Db25maWdFbnRyeT1MLmxhKShhLGIsYyk7dy5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KHcuX09ydFJlbGVhc2VSdW5PcHRpb25zPUwubWEpKGEpO3cuX09ydENyZWF0ZUJpbmRpbmc9YT0+KHcuX09ydENyZWF0ZUJpbmRpbmc9TC5uYSkoYSk7dy5fT3J0QmluZElucHV0PShhLGIsYyk9Pih3Ll9PcnRCaW5kSW5wdXQ9TC5vYSkoYSxiLGMpO3cuX09ydEJpbmRPdXRwdXQ9KGEsYixjLGUpPT4ody5fT3J0QmluZE91dHB1dD1MLnBhKShhLGIsYyxlKTt3Ll9PcnRDbGVhckJvdW5kT3V0cHV0cz1hPT4ody5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9TC5xYSkoYSk7XG53Ll9PcnRSZWxlYXNlQmluZGluZz1hPT4ody5fT3J0UmVsZWFzZUJpbmRpbmc9TC5yYSkoYSk7dy5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGUsaCk9Pih3Ll9PcnRSdW5XaXRoQmluZGluZz1MLnNhKShhLGIsYyxlLGgpO3cuX09ydFJ1bj0oYSxiLGMsZSxoLGcsayx0KT0+KHcuX09ydFJ1bj1MLnRhKShhLGIsYyxlLGgsZyxrLHQpO3cuX09ydEVuZFByb2ZpbGluZz1hPT4ody5fT3J0RW5kUHJvZmlsaW5nPUwudWEpKGEpO3ZhciBYPXcuX3B0aHJlYWRfc2VsZj0oKT0+KFg9dy5fcHRocmVhZF9zZWxmPUwudmEpKCksdmI9dy5fbWFsbG9jPWE9Pih2Yj13Ll9tYWxsb2M9TC53YSkoYSk7dy5fZnJlZT1hPT4ody5fZnJlZT1MLnhhKShhKTt3Ll9fZW1zY3JpcHRlbl90bHNfaW5pdD0oKT0+KHcuX19lbXNjcmlwdGVuX3Rsc19pbml0PUwueWEpKCk7XG52YXIgVmI9dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9KGEsYixjLGUsaCxnKT0+KFZiPXcuX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PUwuQWEpKGEsYixjLGUsaCxnKTt3Ll9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD0oKT0+KHcuX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPUwuQmEpKCk7dmFyIEFiPShhLGIsYyxlKT0+KEFiPUwuQ2EpKGEsYixjLGUpLE9hPWE9PihPYT1MLkRhKShhKSxUYT13Ll9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1hPT4oVGE9dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9TC5FYSkoYSkscWI9dy5fX2Vtc2NyaXB0ZW5fY2hlY2tfbWFpbGJveD0oKT0+KHFiPXcuX19lbXNjcmlwdGVuX2NoZWNrX21haWxib3g9TC5GYSkoKSxXYj1hPT4oV2I9TC5HYSkoYSksUWE9KGEsYik9PihRYT1MLkhhKShhLGIpLHhiPSgpPT4oeGI9TC5JYSkoKSxSYT1hPT4oUmE9TC5KYSkoYSksemI9YT0+KHpiPUwuS2EpKGEpO1xuZnVuY3Rpb24gWWIoYSl7YT1PYmplY3QuYXNzaWduKHt9LGEpO3ZhciBiPWU9PigpPT5lKCk+Pj4wLGM9ZT0+aD0+ZShoKT4+PjA7YS5fX2Vycm5vX2xvY2F0aW9uPWIoYS5fX2Vycm5vX2xvY2F0aW9uKTthLnB0aHJlYWRfc2VsZj1iKGEucHRocmVhZF9zZWxmKTthLm1hbGxvYz1jKGEubWFsbG9jKTthLnN0YWNrU2F2ZT1iKGEuc3RhY2tTYXZlKTthLnN0YWNrQWxsb2M9YyhhLnN0YWNrQWxsb2MpO3JldHVybiBhfXcua2VlcFJ1bnRpbWVBbGl2ZT1QO3cud2FzbU1lbW9yeT1kO3cuc3RhY2tBbGxvYz16Yjt3LnN0YWNrU2F2ZT14Yjt3LnN0YWNrUmVzdG9yZT1SYTt3LlVURjhUb1N0cmluZz1LYTt3LnN0cmluZ1RvVVRGOD1jYjt3Lmxlbmd0aEJ5dGVzVVRGOD1hYjt3LkV4aXRTdGF0dXM9VTt3LlBUaHJlYWQ9Vjt2YXIgWmI7Uj1mdW5jdGlvbiAkYigpe1pifHxhYygpO1pifHwoUj0kYil9O1xuZnVuY3Rpb24gYWMoKXtmdW5jdGlvbiBhKCl7aWYoIVpiJiYoWmI9ITAsdy5jYWxsZWRSdW49ITAsIU0pKXtEfHxQYSh1YSk7aGEodyk7aWYody5vblJ1bnRpbWVJbml0aWFsaXplZCl3Lm9uUnVudGltZUluaXRpYWxpemVkKCk7aWYoIUQpe2lmKHcucG9zdFJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2Ygdy5wb3N0UnVuJiYody5wb3N0UnVuPVt3LnBvc3RSdW5dKTt3LnBvc3RSdW4ubGVuZ3RoOyl7dmFyIGI9dy5wb3N0UnVuLnNoaWZ0KCk7dmEudW5zaGlmdChiKX1QYSh2YSl9fX1pZighKDA8USkpaWYoRCloYSh3KSxEfHxQYSh1YSksc3RhcnRXb3JrZXIodyk7ZWxzZXtpZih3LnByZVJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2Ygdy5wcmVSdW4mJih3LnByZVJ1bj1bdy5wcmVSdW5dKTt3LnByZVJ1bi5sZW5ndGg7KXRhLnVuc2hpZnQody5wcmVSdW4uc2hpZnQoKSk7UGEodGEpOzA8UXx8KHcuc2V0U3RhdHVzPyh3LnNldFN0YXR1cyhcIlJ1bm5pbmcuLi5cIiksc2V0VGltZW91dChmdW5jdGlvbigpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXt3LnNldFN0YXR1cyhcIlwiKX0sXG4xKTthKCl9LDEpKTphKCkpfX1pZih3LnByZUluaXQpZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIHcucHJlSW5pdCYmKHcucHJlSW5pdD1bdy5wcmVJbml0XSk7MDx3LnByZUluaXQubGVuZ3RoOyl3LnByZUluaXQucG9wKCkoKTthYygpO1xuXG5cbiAgcmV0dXJuIG1vZHVsZUFyZy5yZWFkeVxufVxuXG4pO1xufSkoKTtcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbVRocmVhZGVkO1xuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKVxuICBkZWZpbmUoW10sICgpID0+IG9ydFdhc21UaHJlYWRlZCk7XG4iLCAiXCJ1c2Ugc3RyaWN0XCI7dmFyIE1vZHVsZT17fTt2YXIgRU5WSVJPTk1FTlRfSVNfTk9ERT10eXBlb2YgcHJvY2Vzcz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnM9PVwib2JqZWN0XCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGU9PVwic3RyaW5nXCI7aWYoRU5WSVJPTk1FTlRfSVNfTk9ERSl7dmFyIG5vZGVXb3JrZXJUaHJlYWRzPXJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTt2YXIgcGFyZW50UG9ydD1ub2RlV29ya2VyVGhyZWFkcy5wYXJlbnRQb3J0O3BhcmVudFBvcnQub24oXCJtZXNzYWdlXCIsZGF0YT0+b25tZXNzYWdlKHtkYXRhOmRhdGF9KSk7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKTtPYmplY3QuYXNzaWduKGdsb2JhbCx7c2VsZjpnbG9iYWwscmVxdWlyZTpyZXF1aXJlLE1vZHVsZTpNb2R1bGUsbG9jYXRpb246e2hyZWY6X19maWxlbmFtZX0sV29ya2VyOm5vZGVXb3JrZXJUaHJlYWRzLldvcmtlcixpbXBvcnRTY3JpcHRzOmY9PigwLGV2YWwpKGZzLnJlYWRGaWxlU3luYyhmLFwidXRmOFwiKStcIi8vIyBzb3VyY2VVUkw9XCIrZikscG9zdE1lc3NhZ2U6bXNnPT5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKG1zZykscGVyZm9ybWFuY2U6Z2xvYmFsLnBlcmZvcm1hbmNlfHx7bm93OkRhdGUubm93fX0pfXZhciBpbml0aWFsaXplZEpTPWZhbHNlO2Z1bmN0aW9uIHRocmVhZFByaW50RXJyKCl7dmFyIHRleHQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKFwiIFwiKTtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXtmcy53cml0ZVN5bmMoMix0ZXh0K1wiXFxuXCIpO3JldHVybn1jb25zb2xlLmVycm9yKHRleHQpfWZ1bmN0aW9uIHRocmVhZEFsZXJ0KCl7dmFyIHRleHQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKFwiIFwiKTtwb3N0TWVzc2FnZSh7Y21kOlwiYWxlcnRcIix0ZXh0OnRleHQsdGhyZWFkSWQ6TW9kdWxlW1wiX3B0aHJlYWRfc2VsZlwiXSgpfSl9dmFyIGVycj10aHJlYWRQcmludEVycjtzZWxmLmFsZXJ0PXRocmVhZEFsZXJ0O01vZHVsZVtcImluc3RhbnRpYXRlV2FzbVwiXT0oaW5mbyxyZWNlaXZlSW5zdGFuY2UpPT57dmFyIG1vZHVsZT1Nb2R1bGVbXCJ3YXNtTW9kdWxlXCJdO01vZHVsZVtcIndhc21Nb2R1bGVcIl09bnVsbDt2YXIgaW5zdGFuY2U9bmV3IFdlYkFzc2VtYmx5Lkluc3RhbmNlKG1vZHVsZSxpbmZvKTtyZXR1cm4gcmVjZWl2ZUluc3RhbmNlKGluc3RhbmNlKX07c2VsZi5vbnVuaGFuZGxlZHJlamVjdGlvbj1lPT57dGhyb3cgZS5yZWFzb24/P2V9O2Z1bmN0aW9uIGhhbmRsZU1lc3NhZ2UoZSl7dHJ5e2lmKGUuZGF0YS5jbWQ9PT1cImxvYWRcIil7bGV0IG1lc3NhZ2VRdWV1ZT1bXTtzZWxmLm9ubWVzc2FnZT1lPT5tZXNzYWdlUXVldWUucHVzaChlKTtzZWxmLnN0YXJ0V29ya2VyPWluc3RhbmNlPT57TW9kdWxlPWluc3RhbmNlO3Bvc3RNZXNzYWdlKHtcImNtZFwiOlwibG9hZGVkXCJ9KTtmb3IobGV0IG1zZyBvZiBtZXNzYWdlUXVldWUpe2hhbmRsZU1lc3NhZ2UobXNnKX1zZWxmLm9ubWVzc2FnZT1oYW5kbGVNZXNzYWdlfTtNb2R1bGVbXCJ3YXNtTW9kdWxlXCJdPWUuZGF0YS53YXNtTW9kdWxlO2Zvcihjb25zdCBoYW5kbGVyIG9mIGUuZGF0YS5oYW5kbGVycyl7TW9kdWxlW2hhbmRsZXJdPSguLi5hcmdzKT0+e3Bvc3RNZXNzYWdlKHtjbWQ6XCJjYWxsSGFuZGxlclwiLGhhbmRsZXI6aGFuZGxlcixhcmdzOmFyZ3N9KX19TW9kdWxlW1wid2FzbU1lbW9yeVwiXT1lLmRhdGEud2FzbU1lbW9yeTtNb2R1bGVbXCJidWZmZXJcIl09TW9kdWxlW1wid2FzbU1lbW9yeVwiXS5idWZmZXI7TW9kdWxlW1wiRU5WSVJPTk1FTlRfSVNfUFRIUkVBRFwiXT10cnVlO2lmKHR5cGVvZiBlLmRhdGEudXJsT3JCbG9iPT1cInN0cmluZ1wiKXtpbXBvcnRTY3JpcHRzKGUuZGF0YS51cmxPckJsb2IpfWVsc2V7dmFyIG9iamVjdFVybD1VUkwuY3JlYXRlT2JqZWN0VVJMKGUuZGF0YS51cmxPckJsb2IpO2ltcG9ydFNjcmlwdHMob2JqZWN0VXJsKTtVUkwucmV2b2tlT2JqZWN0VVJMKG9iamVjdFVybCl9b3J0V2FzbVRocmVhZGVkKE1vZHVsZSl9ZWxzZSBpZihlLmRhdGEuY21kPT09XCJydW5cIil7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9pbml0XCJdKGUuZGF0YS5wdGhyZWFkX3B0ciwvKmlzTWFpbkJyb3dzZXJUaHJlYWQ9Ki8wLC8qaXNNYWluUnVudGltZVRocmVhZD0qLzAsLypjYW5CbG9jaz0qLzEpO01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfbWFpbGJveF9hd2FpdFwiXShlLmRhdGEucHRocmVhZF9wdHIpO01vZHVsZVtcImVzdGFibGlzaFN0YWNrU3BhY2VcIl0oKTtNb2R1bGVbXCJQVGhyZWFkXCJdLnJlY2VpdmVPYmplY3RUcmFuc2ZlcihlLmRhdGEpO01vZHVsZVtcIlBUaHJlYWRcIl0udGhyZWFkSW5pdFRMUygpO2lmKCFpbml0aWFsaXplZEpTKXtpbml0aWFsaXplZEpTPXRydWV9dHJ5e01vZHVsZVtcImludm9rZUVudHJ5UG9pbnRcIl0oZS5kYXRhLnN0YXJ0X3JvdXRpbmUsZS5kYXRhLmFyZyl9Y2F0Y2goZXgpe2lmKGV4IT1cInVud2luZFwiKXt0aHJvdyBleH19fWVsc2UgaWYoZS5kYXRhLmNtZD09PVwiY2FuY2VsXCIpe2lmKE1vZHVsZVtcIl9wdGhyZWFkX3NlbGZcIl0oKSl7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9leGl0XCJdKC0xKX19ZWxzZSBpZihlLmRhdGEudGFyZ2V0PT09XCJzZXRpbW1lZGlhdGVcIil7fWVsc2UgaWYoZS5kYXRhLmNtZD09PVwiY2hlY2tNYWlsYm94XCIpe2lmKGluaXRpYWxpemVkSlMpe01vZHVsZVtcImNoZWNrTWFpbGJveFwiXSgpfX1lbHNlIGlmKGUuZGF0YS5jbWQpe2VycihcIndvcmtlci5qcyByZWNlaXZlZCB1bmtub3duIGNvbW1hbmQgXCIrZS5kYXRhLmNtZCk7ZXJyKGUuZGF0YSl9fWNhdGNoKGV4KXtpZihNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWRcIl0pe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZFwiXSgpfXRocm93IGV4fX1zZWxmLm9ubWVzc2FnZT1oYW5kbGVNZXNzYWdlO1xuIiwgImV4cG9ydCBjb25zdCBqb2luID0gdW5kZWZpbmVkOyIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHtFbnZ9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7T3J0V2FzbU1vZHVsZX0gZnJvbSAnLi9iaW5kaW5nL29ydC13YXNtJztcbmltcG9ydCB7T3J0V2FzbVRocmVhZGVkTW9kdWxlfSBmcm9tICcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG5sZXQgb3J0V2FzbUZhY3Rvcnk6IEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+O1xuXG5pZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9UUkFJTklORykge1xuICBvcnRXYXNtRmFjdG9yeSA9IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzJyk7XG59IGVsc2Uge1xuICBvcnRXYXNtRmFjdG9yeSA9XG4gICAgICBCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVID8gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLmpzJykgOiByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tc2ltZC5qc2VwLmpzJyk7XG59XG5cbmNvbnN0IG9ydFdhc21GYWN0b3J5VGhyZWFkZWQ6IEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+ID0gIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCA/XG4gICAgKEJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgPyByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQuanMnKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLmpzJykpIDpcbiAgICBvcnRXYXNtRmFjdG9yeTtcbi8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xuXG5sZXQgd2FzbTogT3J0V2FzbU1vZHVsZXx1bmRlZmluZWQ7XG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbmxldCBpbml0aWFsaXppbmcgPSBmYWxzZTtcbmxldCBhYm9ydGVkID0gZmFsc2U7XG5cbmNvbnN0IGlzTXVsdGlUaHJlYWRTdXBwb3J0ZWQgPSAobnVtVGhyZWFkczogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gIC8vIFdlYkFzc2VtYmx5IHRocmVhZHMgYXJlIHNldCB0byAxIChzaW5nbGUgdGhyZWFkKS5cbiAgaWYgKG51bVRocmVhZHMgPT09IDEpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiAnU2hhcmVkQXJyYXlCdWZmZXInIGlzIG5vdCBhdmFpbGFibGUsIFdlYkFzc2VtYmx5IHRocmVhZHMgd2lsbCBub3Qgd29yay5cbiAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnICYmICFzZWxmLmNyb3NzT3JpZ2luSXNvbGF0ZWQpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgJ2Vudi53YXNtLm51bVRocmVhZHMgaXMgc2V0IHRvICcgKyBudW1UaHJlYWRzICtcbiAgICAgICAgICAnLCBidXQgdGhpcyB3aWxsIG5vdCB3b3JrIHVubGVzcyB5b3UgZW5hYmxlIGNyb3NzT3JpZ2luSXNvbGF0ZWQgbW9kZS4gJyArXG4gICAgICAgICAgJ1NlZSBodHRwczovL3dlYi5kZXYvY3Jvc3Mtb3JpZ2luLWlzb2xhdGlvbi1ndWlkZS8gZm9yIG1vcmUgaW5mby4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gb25ueHJ1bnRpbWUtd2ViIGRvZXMgbm90IHN1cHBvcnQgbXVsdGktdGhyZWFkcyBpbiBOb2RlLmpzLlxuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdlbnYud2FzbS5udW1UaHJlYWRzIGlzIHNldCB0byAnICsgbnVtVGhyZWFkcyArXG4gICAgICAgICcsIGhvd2V2ZXIsIGN1cnJlbnRseSBvbm54cnVudGltZS13ZWIgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aS10aHJlYWRzIGluIE5vZGUuanMuICcgK1xuICAgICAgICAnUGxlYXNlIGNvbnNpZGVyIHVzaW5nIG9ubnhydW50aW1lLW5vZGUgZm9yIHBlcmZvcm1hbmNlIGNyaXRpY2FsIHNjZW5hcmlvcy4nKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gVGVzdCBmb3IgdHJhbnNmZXJhYmlsaXR5IG9mIFNBQnMgKGZvciBicm93c2Vycy4gbmVlZGVkIGZvciBGaXJlZm94KVxuICAgIC8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyFtc2cvbW96aWxsYS5kZXYucGxhdGZvcm0vSUhrQlpsSEVUcEEvZHdzTU5jaFdFUUFKXG4gICAgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG5ldyBNZXNzYWdlQ2hhbm5lbCgpLnBvcnQxLnBvc3RNZXNzYWdlKG5ldyBTaGFyZWRBcnJheUJ1ZmZlcigxKSk7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgdGhyZWFkcyBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIHRocmVhZGVkIGluc3RydWN0aW9ucy5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUobmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAgMCwgIDAsIDEsIDQsIDEsICA5NiwgMCwgICAwLCAgMywgMiwgMSwgIDAsIDUsXG4gICAgICA0LCAxLCAgMywgICAxLCAgIDEsIDEwLCAxMSwgMSwgOSwgMCwgNjUsIDAsICAyNTQsIDE2LCAyLCAwLCAyNiwgMTFcbiAgICBdKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGlzU2ltZFN1cHBvcnRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSBTSU1EIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgU0lNRCBpbnN0cnVjdGlvbnMuXG5cbiAgICAvLyBUaGUgYmluYXJ5IGRhdGEgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIGZvbGxvd2luZyBjb2RlIGJ5IHdhdDJ3YXNtOlxuICAgIC8vXG4gICAgLy8gKG1vZHVsZVxuICAgIC8vICAgKHR5cGUgJHQwIChmdW5jKSlcbiAgICAvLyAgIChmdW5jICRmMCAodHlwZSAkdDApXG4gICAgLy8gICAgIChkcm9wXG4gICAgLy8gICAgICAgKGkzMng0LmRvdF9pMTZ4OF9zXG4gICAgLy8gICAgICAgICAoaTh4MTYuc3BsYXRcbiAgICAvLyAgICAgICAgICAgKGkzMi5jb25zdCAwKSlcbiAgICAvLyAgICAgICAgICh2MTI4LmNvbnN0IGkzMng0IDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDApKSkpKVxuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDAsICAgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCA0LCAxLCA5NiwgMCwgMCwgMywgMiwgMSwgMCwgMTAsIDMwLCAxLCAgIDI4LCAgMCwgNjUsIDAsXG4gICAgICAyNTMsIDE1LCAyNTMsIDEyLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAgMjUzLCAxODYsIDEsIDI2LCAxMVxuICAgIF0pKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgZ2V0V2FzbUZpbGVOYW1lID0gKHVzZVNpbWQ6IGJvb2xlYW4sIHVzZVRocmVhZHM6IGJvb2xlYW4pID0+IHtcbiAgaWYgKHVzZVNpbWQpIHtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9UUkFJTklORykge1xuICAgICAgcmV0dXJuICdvcnQtdHJhaW5pbmctd2FzbS1zaW1kLndhc20nO1xuICAgIH1cbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nIDogJ29ydC13YXNtLXNpbWQud2FzbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tdGhyZWFkZWQud2FzbScgOiAnb3J0LXdhc20ud2FzbSc7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplV2ViQXNzZW1ibHkgPSBhc3luYyhmbGFnczogRW52LldlYkFzc2VtYmx5RmxhZ3MpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIGlmIChpbml0aWFsaXppbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211bHRpcGxlIGNhbGxzIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGRldGVjdGVkLicpO1xuICB9XG4gIGlmIChhYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcmV2aW91cyBjYWxsIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGZhaWxlZC4nKTtcbiAgfVxuXG4gIGluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgLy8gd2FzbSBmbGFncyBhcmUgYWxyZWFkeSBpbml0aWFsaXplZFxuICBjb25zdCB0aW1lb3V0ID0gZmxhZ3MuaW5pdFRpbWVvdXQhO1xuICBjb25zdCBudW1UaHJlYWRzID0gZmxhZ3MubnVtVGhyZWFkcyE7XG4gIGNvbnN0IHNpbWQgPSBmbGFncy5zaW1kITtcblxuICBjb25zdCB1c2VUaHJlYWRzID0gaXNNdWx0aVRocmVhZFN1cHBvcnRlZChudW1UaHJlYWRzKTtcbiAgY29uc3QgdXNlU2ltZCA9IHNpbWQgJiYgaXNTaW1kU3VwcG9ydGVkKCk7XG5cbiAgY29uc3Qgd2FzbVBhdGhzID0gZmxhZ3Mud2FzbVBhdGhzO1xuICBjb25zdCB3YXNtUHJlZml4T3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnc3RyaW5nJyA/IHdhc21QYXRocyA6IHVuZGVmaW5lZDtcbiAgY29uc3Qgd2FzbUZpbGVOYW1lID0gZ2V0V2FzbUZpbGVOYW1lKHVzZVNpbWQsIHVzZVRocmVhZHMpO1xuICBjb25zdCB3YXNtUGF0aE92ZXJyaWRlID0gdHlwZW9mIHdhc21QYXRocyA9PT0gJ29iamVjdCcgPyB3YXNtUGF0aHNbd2FzbUZpbGVOYW1lXSA6IHVuZGVmaW5lZDtcblxuICBsZXQgaXNUaW1lb3V0ID0gZmFsc2U7XG5cbiAgY29uc3QgdGFza3M6IEFycmF5PFByb21pc2U8dm9pZD4+ID0gW107XG5cbiAgLy8gcHJvbWlzZSBmb3IgdGltZW91dFxuICBpZiAodGltZW91dCA+IDApIHtcbiAgICB0YXNrcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaXNUaW1lb3V0ID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgdGltZW91dCk7XG4gICAgfSkpO1xuICB9XG5cbiAgLy8gcHJvbWlzZSBmb3IgbW9kdWxlIGluaXRpYWxpemF0aW9uXG4gIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGZhY3RvcnkgPSB1c2VUaHJlYWRzID8gb3J0V2FzbUZhY3RvcnlUaHJlYWRlZCA6IG9ydFdhc21GYWN0b3J5O1xuICAgIGNvbnN0IGNvbmZpZzogUGFydGlhbDxPcnRXYXNtTW9kdWxlPiA9IHtcbiAgICAgIGxvY2F0ZUZpbGU6IChmaWxlTmFtZTogc3RyaW5nLCBzY3JpcHREaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCAmJiB1c2VUaHJlYWRzICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcud29ya2VyLmpzJykgJiZcbiAgICAgICAgICAgIHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybiBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFxuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgLy8gVGhpcyByZXF1aXJlKCkgZnVuY3Rpb24gaXMgaGFuZGxlZCBieSBlc2J1aWxkIHBsdWdpbiB0byBsb2FkIGZpbGUgY29udGVudCBhcyBzdHJpbmcuXG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbiAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQud29ya2VyLmpzJylcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcud2FzbScpKSB7XG4gICAgICAgICAgaWYgKHdhc21QYXRoT3ZlcnJpZGUpIHtcbiAgICAgICAgICAgIHJldHVybiB3YXNtUGF0aE92ZXJyaWRlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHByZWZpeCA9IHdhc21QcmVmaXhPdmVycmlkZSA/PyBzY3JpcHREaXJlY3Rvcnk7XG5cbiAgICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAgICAgICAgIGlmICh3YXNtRmlsZU5hbWUgPT09ICdvcnQtd2FzbS1zaW1kLndhc20nKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnb3J0LXdhc20tc2ltZC5qc2VwLndhc20nO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3YXNtRmlsZU5hbWUgPT09ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLndhc20nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBwcmVmaXggKyB3YXNtRmlsZU5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2NyaXB0RGlyZWN0b3J5ICsgZmlsZU5hbWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMpIHtcbiAgICAgIGNvbmZpZy5udW1UaHJlYWRzID0gbnVtVGhyZWFkcztcbiAgICAgIGlmICh0eXBlb2YgQmxvYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uZmlnLm1haW5TY3JpcHRVcmxPckJsb2IgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnb3J0LXdhc20tdGhyZWFkZWQuanMnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHNjcmlwdFNvdXJjZUNvZGUgPSBgdmFyIG9ydFdhc21UaHJlYWRlZD0ke2ZhY3RvcnkudG9TdHJpbmcoKX07YDtcbiAgICAgICAgY29uZmlnLm1haW5TY3JpcHRVcmxPckJsb2IgPSBuZXcgQmxvYihbc2NyaXB0U291cmNlQ29kZV0sIHt0eXBlOiAndGV4dC9qYXZhc2NyaXB0J30pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZhY3RvcnkoY29uZmlnKS50aGVuKFxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgbW9kdWxlID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgd2FzbSA9IG1vZHVsZTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGZhaWxlZCB0byBpbml0aWFsaXplXG4gICAgICAgICh3aGF0KSA9PiB7XG4gICAgICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgcmVqZWN0KHdoYXQpO1xuICAgICAgICB9KTtcbiAgfSkpO1xuXG4gIGF3YWl0IFByb21pc2UucmFjZSh0YXNrcyk7XG5cbiAgaWYgKGlzVGltZW91dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgV2ViQXNzZW1ibHkgYmFja2VuZCBpbml0aWFsaXppbmcgZmFpbGVkIGR1ZSB0byB0aW1lb3V0OiAke3RpbWVvdXR9bXNgKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEluc3RhbmNlID0gKCk6IE9ydFdhc21Nb2R1bGUgPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQgJiYgd2FzbSkge1xuICAgIHJldHVybiB3YXNtO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdXZWJBc3NlbWJseSBpcyBub3QgaW5pdGlhbGl6ZWQgeWV0LicpO1xufTtcblxuZXhwb3J0IGNvbnN0IGRpc3Bvc2UgPSAoKTogdm9pZCA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiAhaW5pdGlhbGl6aW5nICYmICFhYm9ydGVkKSB7XG4gICAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICAgICh3YXNtIGFzIE9ydFdhc21UaHJlYWRlZE1vZHVsZSkuUFRocmVhZD8udGVybWluYXRlQWxsVGhyZWFkcygpO1xuICAgIHdhc20gPSB1bmRlZmluZWQ7XG5cbiAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICBpbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIGFib3J0ZWQgPSB0cnVlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5cbmV4cG9ydCBjb25zdCBhbGxvY1dhc21TdHJpbmcgPSAoZGF0YTogc3RyaW5nLCBhbGxvY3M6IG51bWJlcltdKTogbnVtYmVyID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3QgZGF0YUxlbmd0aCA9IHdhc20ubGVuZ3RoQnl0ZXNVVEY4KGRhdGEpICsgMTtcbiAgY29uc3QgZGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhkYXRhTGVuZ3RoKTtcbiAgd2FzbS5zdHJpbmdUb1VURjgoZGF0YSwgZGF0YU9mZnNldCwgZGF0YUxlbmd0aCk7XG4gIGFsbG9jcy5wdXNoKGRhdGFPZmZzZXQpO1xuXG4gIHJldHVybiBkYXRhT2Zmc2V0O1xufTtcblxuaW50ZXJmYWNlIEV4dHJhT3B0aW9uc0hhbmRsZXIge1xuICAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IGl0ZXJhdGVFeHRyYU9wdGlvbnMgPVxuICAgIChvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcHJlZml4OiBzdHJpbmcsIHNlZW46IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+LFxuICAgICBoYW5kbGVyOiBFeHRyYU9wdGlvbnNIYW5kbGVyKTogdm9pZCA9PiB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoc2Vlbi5oYXMob3B0aW9ucykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NpcmN1bGFyIHJlZmVyZW5jZSBpbiBvcHRpb25zJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2Vlbi5hZGQob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmVudHJpZXMob3B0aW9ucykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSAocHJlZml4KSA/IHByZWZpeCArIGtleSA6IGtleTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBuYW1lICsgJy4nLCBzZWVuLCBoYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgaGFuZGxlcihuYW1lLCAodmFsdWUpID8gJzEnIDogJzAnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGhhbmRsZSBleHRyYSBjb25maWcgdHlwZTogJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbi8qKlxuICogY2hlY2sgd2ViIGFzc2VtYmx5IEFQSSdzIGxhc3QgZXJyb3IgYW5kIHRocm93IGVycm9yIGlmIGFueSBlcnJvciBvY2N1cnJlZC5cbiAqIEBwYXJhbSBtZXNzYWdlIGEgbWVzc2FnZSB1c2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJyZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBjaGVja0xhc3RFcnJvciA9IChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IHBhcmFtc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg4KTtcbiAgICB3YXNtLl9PcnRHZXRMYXN0RXJyb3IocGFyYW1zT2Zmc2V0LCBwYXJhbXNPZmZzZXQgKyA0KTtcbiAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLkhFQVAzMltwYXJhbXNPZmZzZXQgLyA0XTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2VQb2ludGVyID0gd2FzbS5IRUFQVTMyW3BhcmFtc09mZnNldCAvIDQgKyAxXTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2VQb2ludGVyID8gd2FzbS5VVEY4VG9TdHJpbmcoZXJyb3JNZXNzYWdlUG9pbnRlcikgOiAnJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bWVzc2FnZX0gRVJST1JfQ09ERTogJHtlcnJvckNvZGV9LCBFUlJPUl9NRVNTQUdFOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7SW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yLCBpdGVyYXRlRXh0cmFPcHRpb25zfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuXG5leHBvcnQgY29uc3Qgc2V0UnVuT3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBbbnVtYmVyLCBudW1iZXJbXV0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgcnVuT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0cnkge1xuICAgIGlmIChvcHRpb25zPy5sb2dTZXZlcml0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA9IDI7ICAvLyBEZWZhdWx0IHRvIHdhcm5pbmdcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICB0eXBlb2Ygb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwpIHx8XG4gICAgICAgIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgc2VydmVyaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmxvZ1ZlcmJvc2l0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgPSAwOyAgLy8gRGVmYXVsdCB0byAwXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHZlcmJvc2l0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8udGVybWluYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMudGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHRhZ0RhdGFPZmZzZXQgPSAwO1xuICAgIGlmIChvcHRpb25zPy50YWcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFnRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhvcHRpb25zLnRhZywgYWxsb2NzKTtcbiAgICB9XG5cbiAgICBydW5PcHRpb25zSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlUnVuT3B0aW9ucyhcbiAgICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsISwgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCEsICEhcnVuT3B0aW9ucy50ZXJtaW5hdGUhLCB0YWdEYXRhT2Zmc2V0KTtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIHJ1biBvcHRpb25zLicpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKG9wdGlvbnMuZXh0cmEsICcnLCBuZXcgV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oKSwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhrZXksIGFsbG9jcyk7XG4gICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh2YWx1ZSwgYWxsb2NzKTtcblxuICAgICAgICBpZiAod2FzbS5fT3J0QWRkUnVuQ29uZmlnRW50cnkocnVuT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBydW4gY29uZmlnIGVudHJ5OiAke2tleX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtydW5PcHRpb25zSGFuZGxlLCBhbGxvY3NdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VSdW5PcHRpb25zKHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmNvbnN0IGdldEdyYXBoT3B0aW16YXRpb25MZXZlbCA9IChncmFwaE9wdGltaXphdGlvbkxldmVsOiBzdHJpbmd8dW5rbm93bik6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCkge1xuICAgIGNhc2UgJ2Rpc2FibGVkJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ2Jhc2ljJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ2V4dGVuZGVkJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ2FsbCc6XG4gICAgICByZXR1cm4gOTk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZ3JhcGggb3B0aW1pemF0aW9uIGxldmVsOiAke2dyYXBoT3B0aW1pemF0aW9uTGV2ZWx9YCk7XG4gIH1cbn07XG5cbmNvbnN0IGdldEV4ZWN1dGlvbk1vZGUgPSAoZXhlY3V0aW9uTW9kZTogJ3NlcXVlbnRpYWwnfCdwYXJhbGxlbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGV4ZWN1dGlvbk1vZGUpIHtcbiAgICBjYXNlICdzZXF1ZW50aWFsJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ3BhcmFsbGVsJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGV4ZWN1dGlvbiBtb2RlOiAke2V4ZWN1dGlvbk1vZGV9YCk7XG4gIH1cbn07XG5cbmNvbnN0IGFwcGVuZERlZmF1bHRPcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiB2b2lkID0+IHtcbiAgaWYgKCFvcHRpb25zLmV4dHJhKSB7XG4gICAgb3B0aW9ucy5leHRyYSA9IHt9O1xuICB9XG4gIGlmICghb3B0aW9ucy5leHRyYS5zZXNzaW9uKSB7XG4gICAgb3B0aW9ucy5leHRyYS5zZXNzaW9uID0ge307XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbiA9IG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBpZiAoIXNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkgPSAnMSc7XG4gIH1cblxuICAvLyBpZiB1c2luZyBKU0VQIHdpdGggV2ViR1BVLCBhbHdheXMgZGlzYWJsZSBtZW1vcnkgcGF0dGVyblxuICBpZiAob3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMgJiZcbiAgICAgIG9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLnNvbWUoZXAgPT4gKHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWUpID09PSAnd2ViZ3B1JykpIHtcbiAgICBvcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4gPSBmYWxzZTtcbiAgfVxufTtcblxuY29uc3Qgc2V0RXhlY3V0aW9uUHJvdmlkZXJzID1cbiAgICAoc2Vzc2lvbk9wdGlvbnNIYW5kbGU6IG51bWJlciwgZXhlY3V0aW9uUHJvdmlkZXJzOiByZWFkb25seSBJbmZlcmVuY2VTZXNzaW9uLkV4ZWN1dGlvblByb3ZpZGVyQ29uZmlnW10sXG4gICAgIGFsbG9jczogbnVtYmVyW10pOiB2b2lkID0+IHtcbiAgICAgIGZvciAoY29uc3QgZXAgb2YgZXhlY3V0aW9uUHJvdmlkZXJzKSB7XG4gICAgICAgIGxldCBlcE5hbWUgPSB0eXBlb2YgZXAgPT09ICdzdHJpbmcnID8gZXAgOiBlcC5uYW1lO1xuXG4gICAgICAgIC8vIGNoZWNrIEVQIG5hbWVcbiAgICAgICAgc3dpdGNoIChlcE5hbWUpIHtcbiAgICAgICAgICBjYXNlICd3ZWJubic6XG4gICAgICAgICAgICBlcE5hbWUgPSAnV0VCTk4nO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2Vibm5PcHRpb25zID0gZXAgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJOTkV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgICAgICAgICAgICBpZiAod2Vibm5PcHRpb25zPy5kZXZpY2VUeXBlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygnZGV2aWNlVHlwZScsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHdlYm5uT3B0aW9ucy5kZXZpY2VUeXBlLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09XG4gICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ2RldmljZVR5cGUnIC0gJHt3ZWJubk9wdGlvbnMuZGV2aWNlVHlwZX0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/Lm51bVRocmVhZHMpIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtVGhyZWFkcyA9IHdlYm5uT3B0aW9ucy5udW1UaHJlYWRzO1xuICAgICAgICAgICAgICAgIC8vIEp1c3QgaWdub3JlIGludmFsaWQgd2Vibm5PcHRpb25zLm51bVRocmVhZHMuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBudW1UaHJlYWRzICE9ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG51bVRocmVhZHMpIHx8IG51bVRocmVhZHMgPCAwKSB7XG4gICAgICAgICAgICAgICAgICBudW1UaHJlYWRzID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygnbnVtVGhyZWFkcycsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG51bVRocmVhZHMudG9TdHJpbmcoKSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdudW1UaHJlYWRzJyAtICR7d2Vibm5PcHRpb25zLm51bVRocmVhZHN9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAod2Vibm5PcHRpb25zPy5wb3dlclByZWZlcmVuY2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdwb3dlclByZWZlcmVuY2UnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJubk9wdGlvbnMucG93ZXJQcmVmZXJlbmNlLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09XG4gICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ3Bvd2VyUHJlZmVyZW5jZScgLSAke3dlYm5uT3B0aW9ucy5wb3dlclByZWZlcmVuY2V9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnd2ViZ3B1JzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdKUyc7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVwICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb25zdCB3ZWJncHVPcHRpb25zID0gZXAgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJHcHVFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICAgICAgICAgICAgaWYgKHdlYmdwdU9wdGlvbnM/LnByZWZlcnJlZExheW91dCkge1xuICAgICAgICAgICAgICAgIGlmICh3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05DSFcnICYmIHdlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0ICE9PSAnTkhXQycpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgcHJlZmVycmVkTGF5b3V0IG11c3QgYmUgZWl0aGVyICdOQ0hXJyBvciAnTkhXQyc6ICR7d2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ3ByZWZlcnJlZExheW91dCcsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHdlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0LCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09XG4gICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgIGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ3ByZWZlcnJlZExheW91dCcgLSAke3dlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0fS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dhc20nOlxuICAgICAgICAgIGNhc2UgJ2NwdSc6XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBub3Qgc3VwcG9ydGVkIGV4ZWN1dGlvbiBwcm92aWRlcjogJHtlcE5hbWV9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlcE5hbWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGVwTmFtZSwgYWxsb2NzKTtcbiAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyKHNlc3Npb25PcHRpb25zSGFuZGxlLCBlcE5hbWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBhcHBlbmQgZXhlY3V0aW9uIHByb3ZpZGVyOiAke2VwTmFtZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG5leHBvcnQgY29uc3Qgc2V0U2Vzc2lvbk9wdGlvbnMgPSAob3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBbbnVtYmVyLCBudW1iZXJbXV0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgbGV0IHNlc3Npb25PcHRpb25zSGFuZGxlID0gMDtcbiAgY29uc3QgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IHNlc3Npb25PcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgYXBwZW5kRGVmYXVsdE9wdGlvbnMoc2Vzc2lvbk9wdGlvbnMpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA9IGdldEdyYXBoT3B0aW16YXRpb25MZXZlbChzZXNzaW9uT3B0aW9ucy5ncmFwaE9wdGltaXphdGlvbkxldmVsID8/ICdhbGwnKTtcbiAgICBjb25zdCBleGVjdXRpb25Nb2RlID0gZ2V0RXhlY3V0aW9uTW9kZShzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Nb2RlID8/ICdzZXF1ZW50aWFsJyk7XG4gICAgY29uc3QgbG9nSWREYXRhT2Zmc2V0ID1cbiAgICAgICAgdHlwZW9mIHNlc3Npb25PcHRpb25zLmxvZ0lkID09PSAnc3RyaW5nJyA/IGFsbG9jV2FzbVN0cmluZyhzZXNzaW9uT3B0aW9ucy5sb2dJZCwgYWxsb2NzKSA6IDA7XG5cbiAgICBjb25zdCBsb2dTZXZlcml0eUxldmVsID0gc2Vzc2lvbk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA/PyAyOyAgLy8gRGVmYXVsdCB0byAyIC0gd2FybmluZ1xuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihsb2dTZXZlcml0eUxldmVsKSB8fCBsb2dTZXZlcml0eUxldmVsIDwgMCB8fCBsb2dTZXZlcml0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgc2VydmVyaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtsb2dTZXZlcml0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ1ZlcmJvc2l0eUxldmVsID0gc2Vzc2lvbk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgPz8gMDsgIC8vIERlZmF1bHQgdG8gMCAtIHZlcmJvc2VcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobG9nVmVyYm9zaXR5TGV2ZWwpIHx8IGxvZ1ZlcmJvc2l0eUxldmVsIDwgMCB8fCBsb2dWZXJib3NpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHZlcmJvc2l0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7bG9nVmVyYm9zaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW1pemVkTW9kZWxGaWxlUGF0aE9mZnNldCA9IHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5vcHRpbWl6ZWRNb2RlbEZpbGVQYXRoID09PSAnc3RyaW5nJyA/XG4gICAgICAgIGFsbG9jV2FzbVN0cmluZyhzZXNzaW9uT3B0aW9ucy5vcHRpbWl6ZWRNb2RlbEZpbGVQYXRoLCBhbGxvY3MpIDpcbiAgICAgICAgMDtcblxuICAgIHNlc3Npb25PcHRpb25zSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnMoXG4gICAgICAgIGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwsICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlQ3B1TWVtQXJlbmEsICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlTWVtUGF0dGVybiwgZXhlY3V0aW9uTW9kZSxcbiAgICAgICAgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVQcm9maWxpbmcsIDAsIGxvZ0lkRGF0YU9mZnNldCwgbG9nU2V2ZXJpdHlMZXZlbCwgbG9nVmVyYm9zaXR5TGV2ZWwsXG4gICAgICAgIG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQpO1xuICAgIGlmIChzZXNzaW9uT3B0aW9uc0hhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIHNlc3Npb24gb3B0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzKSB7XG4gICAgICBzZXRFeGVjdXRpb25Qcm92aWRlcnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycywgYWxsb2NzKTtcbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZW5hYmxlR3JhcGhDYXB0dXJlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMuZW5hYmxlR3JhcGhDYXB0dXJlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbmFibGVHcmFwaENhcHR1cmUgbXVzdCBiZSBhIGJvb2xlYW4gdmFsdWU6ICR7c2Vzc2lvbk9wdGlvbnMuZW5hYmxlR3JhcGhDYXB0dXJlfWApO1xuICAgICAgfVxuICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygnZW5hYmxlR3JhcGhDYXB0dXJlJywgYWxsb2NzKTtcbiAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmUudG9TdHJpbmcoKSwgYWxsb2NzKTtcbiAgICAgIGlmICh3YXNtLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdlbmFibGVHcmFwaENhcHR1cmUnIC0gJHtzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmV9LmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc2Vzc2lvbk9wdGlvbnMuZnJlZURpbWVuc2lvbk92ZXJyaWRlcykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nOiAke25hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsdWUpIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgdmFsdWUgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyOiAke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWVPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobmFtZSwgYWxsb2NzKTtcbiAgICAgICAgaWYgKHdhc20uX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZShzZXNzaW9uT3B0aW9uc0hhbmRsZSwgbmFtZU9mZnNldCwgdmFsdWUpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIGZyZWUgZGltZW5zaW9uIG92ZXJyaWRlOiAke25hbWV9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZXh0cmEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyhzZXNzaW9uT3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtUZW5zb3J9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbi8vIFRoaXMgZmlsZSBpbmNsdWRlcyBjb21tb24gZGVmaW5pdGlvbnMuIFRoZXkgZG8gTk9UIGhhdmUgZGVwZW5kZW5jeSBvbiB0aGUgV2ViQXNzZW1ibHkgaW5zdGFuY2UuXG5cbi8qKlxuICogQ29waWVkIGZyb20gT05OWCBkZWZpbml0aW9uLiBVc2UgdGhpcyB0byBkcm9wIGRlcGVuZGVuY3kgJ29ubnhfcHJvdG8nIHRvIGRlY3JlYXNlIGNvbXBpbGVkIC5qcyBmaWxlIHNpemUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIERhdGFUeXBlIHtcbiAgdW5kZWZpbmVkID0gMCxcbiAgZmxvYXQgPSAxLFxuICB1aW50OCA9IDIsXG4gIGludDggPSAzLFxuICB1aW50MTYgPSA0LFxuICBpbnQxNiA9IDUsXG4gIGludDMyID0gNixcbiAgaW50NjQgPSA3LFxuICBzdHJpbmcgPSA4LFxuICBib29sID0gOSxcbiAgZmxvYXQxNiA9IDEwLFxuICBkb3VibGUgPSAxMSxcbiAgdWludDMyID0gMTIsXG4gIHVpbnQ2NCA9IDEzLFxuICBjb21wbGV4NjQgPSAxNCxcbiAgY29tcGxleDEyOCA9IDE1LFxuICBiZmxvYXQxNiA9IDE2XG59XG5cbi8qKlxuICogTWFwIHN0cmluZyB0ZW5zb3IgZGF0YSB0byBlbnVtIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSA9ICh0eXBlOiBzdHJpbmcpOiBEYXRhVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2ludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDg7XG4gICAgY2FzZSAndWludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ4O1xuICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmJvb2w7XG4gICAgY2FzZSAnaW50MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDE2O1xuICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDE2O1xuICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQzMjtcbiAgICBjYXNlICd1aW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQzMjtcbiAgICBjYXNlICdmbG9hdDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5mbG9hdDE2O1xuICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0O1xuICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmRvdWJsZTtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnN0cmluZztcbiAgICBjYXNlICdpbnQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50NjQ7XG4gICAgY2FzZSAndWludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50NjQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgZW51bSB2YWx1ZSB0byBzdHJpbmcgdGVuc29yIGRhdGFcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nID0gKHR5cGVQcm90bzogRGF0YVR5cGUpOiBUZW5zb3IuVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZVByb3RvKSB7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ4OlxuICAgICAgcmV0dXJuICdpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ4OlxuICAgICAgcmV0dXJuICd1aW50OCc7XG4gICAgY2FzZSBEYXRhVHlwZS5ib29sOlxuICAgICAgcmV0dXJuICdib29sJztcbiAgICBjYXNlIERhdGFUeXBlLmludDE2OlxuICAgICAgcmV0dXJuICdpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MTY6XG4gICAgICByZXR1cm4gJ3VpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQzMjpcbiAgICAgIHJldHVybiAnaW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDMyOlxuICAgICAgcmV0dXJuICd1aW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUuZmxvYXQxNjpcbiAgICAgIHJldHVybiAnZmxvYXQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDpcbiAgICAgIHJldHVybiAnZmxvYXQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5kb3VibGU6XG4gICAgICByZXR1cm4gJ2Zsb2F0NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUuc3RyaW5nOlxuICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50NjQ6XG4gICAgICByZXR1cm4gJ2ludDY0JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ2NDpcbiAgICAgIHJldHVybiAndWludDY0JztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlUHJvdG99YCk7XG4gIH1cbn07XG5cbi8qKlxuICogZ2V0IHRlbnNvciBlbGVtZW50IHNpemUgaW4gYnl0ZXMgYnkgdGhlIGdpdmVuIGRhdGEgdHlwZVxuICogQHJldHVybnMgc2l6ZSBpbiBpbnRlZ2VyIG9yIHVuZGVmaW5lZCBpZiB0aGUgZGF0YSB0eXBlIGlzIG5vdCBzdXBwb3J0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFRlbnNvckVsZW1lbnRTaXplID0gKGRhdGVUeXBlOiBudW1iZXIpOiBudW1iZXJ8XG4gICAgdW5kZWZpbmVkID0+IFt1bmRlZmluZWQsIDQsIDEsIDEsIDIsIDIsIDQsIDgsIHVuZGVmaW5lZCwgMSwgMiwgOCwgNCwgOCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1bZGF0ZVR5cGVdO1xuXG4vKipcbiAqIGdldCB0eXBlZCBhcnJheSBjb25zdHJ1Y3RvciBieSB0aGUgZ2l2ZW4gdGVuc29yIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3RvciA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yfFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxcbiAgICBJbnQ4QXJyYXlDb25zdHJ1Y3RvcnxVaW50MTZBcnJheUNvbnN0cnVjdG9yfEludDE2QXJyYXlDb25zdHJ1Y3RvcnxJbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnSW50NjRBcnJheUNvbnN0cnVjdG9yfFxuICAgIFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxGbG9hdDY0QXJyYXlDb25zdHJ1Y3RvcnxVaW50MzJBcnJheUNvbnN0cnVjdG9yfEJpZ1VpbnQ2NEFycmF5Q29uc3RydWN0b3IgPT4ge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICAgICAgcmV0dXJuIEZsb2F0MzJBcnJheTtcbiAgICAgICAgY2FzZSAndWludDgnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdpbnQ4JzpcbiAgICAgICAgICByZXR1cm4gSW50OEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MTYnOlxuICAgICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnaW50MTYnOlxuICAgICAgICAgIHJldHVybiBJbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIEludDMyQXJyYXk7XG4gICAgICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDY0JzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MzInOlxuICAgICAgICAgIHJldHVybiBVaW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnaW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdJbnQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdVaW50NjRBcnJheTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGU6ICR7dHlwZX1gKTtcbiAgICAgIH1cbiAgICB9O1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgbG9nIGxldmVsIHRvIGludGVnZXIgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvZ0xldmVsU3RyaW5nVG9FbnVtID0gKGxvZ0xldmVsPzogJ3ZlcmJvc2UnfCdpbmZvJ3wnd2FybmluZyd8J2Vycm9yJ3wnZmF0YWwnKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2dMZXZlbCkge1xuICAgIGNhc2UgJ3ZlcmJvc2UnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnaW5mbyc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2ZhdGFsJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGxvZ2dpbmcgbGV2ZWw6ICR7bG9nTGV2ZWx9YCk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdGVuc29yIHR5cGUgaXMgc3VwcG9ydGVkIGJ5IEdQVSBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IHR5cGUgaXMgVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlcyA9PiB0eXBlID09PSAnZmxvYXQzMicgfHxcbiAgICB0eXBlID09PSAnaW50MzInIHx8IHR5cGUgPT09ICdpbnQ2NCcgfHwgdHlwZSA9PT0gJ2Jvb2wnIHx8IHR5cGUgPT09ICdmbG9hdDE2JyB8fCB0eXBlID09PSAndWludDMyJztcblxuLyoqXG4gKiBNYXAgc3RyaW5nIGRhdGEgbG9jYXRpb24gdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtID0gKGxvY2F0aW9uOiBUZW5zb3IuRGF0YUxvY2F0aW9uKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2NhdGlvbikge1xuICAgIGNhc2UgJ25vbmUnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnY3B1JzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ2NwdS1waW5uZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAndGV4dHVyZSc6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICdncHUtYnVmZmVyJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgbG9jYXRpb246ICR7bG9jYXRpb259YCk7XG4gIH1cbn07XG5cbi8qKlxuICogTWFwIGludGVnZXIgZGF0YSBsb2NhdGlvbiB0byBzdHJpbmcgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGRhdGFMb2NhdGlvbkVudW1Ub1N0cmluZyA9IChsb2NhdGlvbjogbnVtYmVyKTogVGVuc29yLkRhdGFMb2NhdGlvbnx1bmRlZmluZWQgPT5cbiAgICAoWydub25lJywgJ2NwdScsICdjcHUtcGlubmVkJywgJ3RleHR1cmUnLCAnZ3B1LWJ1ZmZlciddIGFzIGNvbnN0KVtsb2NhdGlvbl07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7cmVhZEZpbGV9IGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnO1xuXG4vKipcbiAqIExvYWQgYSBmaWxlIGludG8gYSBVaW50OEFycmF5LlxuICpcbiAqIEBwYXJhbSBmaWxlIC0gdGhlIGZpbGUgdG8gbG9hZC4gQ2FuIGJlIGEgVVJML3BhdGgsIGEgQmxvYiwgYW4gQXJyYXlCdWZmZXIsIG9yIGEgVWludDhBcnJheS5cbiAqIEByZXR1cm5zIGEgVWludDhBcnJheSBjb250YWluaW5nIHRoZSBmaWxlIGRhdGEuXG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkRmlsZSA9IGFzeW5jKGZpbGU6IHN0cmluZ3xCbG9ifEFycmF5QnVmZmVyTGlrZXxVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PiA9PiB7XG4gIGlmICh0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlKSB7XG4gICAgICAvLyBsb2FkIGZpbGUgaW50byBBcnJheUJ1ZmZlciBpbiBOb2RlLmpzXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVhZEZpbGUoZmlsZSkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5jb2RlID09PSAnRVJSX0ZTX0ZJTEVfVE9PX0xBUkdFJykge1xuICAgICAgICAgIC8vIGZpbGUgaXMgdG9vIGxhcmdlLCB1c2UgZnMuY3JlYXRlUmVhZFN0cmVhbSBpbnN0ZWFkXG4gICAgICAgICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKTtcbiAgICAgICAgICBjb25zdCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICAgICAgICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2Ygc3RyZWFtKSB7XG4gICAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShCdWZmZXIuY29uY2F0KGNodW5rcykpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGxvYWQgZmlsZSBpbnRvIEFycmF5QnVmZmVyIGluIGJyb3dzZXJzXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGZpbGUpO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGZhaWxlZCB0byBsb2FkIGV4dGVybmFsIGRhdGEgZmlsZTogJHtmaWxlfWApO1xuICAgICAgfVxuICAgICAgY29uc3QgY29udGVudExlbmd0aEhlYWRlciA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LUxlbmd0aCcpO1xuICAgICAgY29uc3QgZmlsZVNpemUgPSBjb250ZW50TGVuZ3RoSGVhZGVyID8gcGFyc2VJbnQoY29udGVudExlbmd0aEhlYWRlciwgMTApIDogMDtcbiAgICAgIGlmIChmaWxlU2l6ZSA8IDEwNzM3NDE4MjQgLyogMUdCICovKSB7XG4gICAgICAgIC8vIHdoZW4gQ29udGVudC1MZW5ndGggaGVhZGVyIGlzIG5vdCBzZXQsIHdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIGZpbGUgc2l6ZS4gV2UgYXNzdW1lIGl0IGlzIHNtYWxsIGVub3VnaCB0b1xuICAgICAgICAvLyBsb2FkIGludG8gbWVtb3J5LlxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaWxlIGlzIHRvbyBsYXJnZSwgdXNlIHN0cmVhbSBpbnN0ZWFkXG4gICAgICAgIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9LCBubyByZXNwb25zZSBib2R5LmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKCk7XG5cbiAgICAgICAgbGV0IGJ1ZmZlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyB0cnkgdG8gY3JlYXRlIEFycmF5QnVmZmVyIGRpcmVjdGx5XG4gICAgICAgICAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGZpbGVTaXplKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgUmFuZ2VFcnJvcikge1xuICAgICAgICAgICAgLy8gdXNlIFdlYkFzc2VtYmx5IE1lbW9yeSB0byBhbGxvY2F0ZSBsYXJnZXIgQXJyYXlCdWZmZXJcbiAgICAgICAgICAgIGNvbnN0IHBhZ2VzID0gTWF0aC5jZWlsKGZpbGVTaXplIC8gNjU1MzYpO1xuICAgICAgICAgICAgYnVmZmVyID0gbmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDogcGFnZXMsIG1heGltdW06IHBhZ2VzfSkuYnVmZmVyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvZmZzZXQgPSAwO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgY29uc3Qge2RvbmUsIHZhbHVlfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjaHVua1NpemUgPSB2YWx1ZS5ieXRlTGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IGNodW5rID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCBvZmZzZXQsIGNodW5rU2l6ZSk7XG4gICAgICAgICAgY2h1bmsuc2V0KHZhbHVlKTtcbiAgICAgICAgICBvZmZzZXQgKz0gY2h1bmtTaXplO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShidWZmZXIsIDAsIGZpbGVTaXplKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSBlbHNlIGlmIChmaWxlIGluc3RhbmNlb2YgQmxvYikge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCBmaWxlLmFycmF5QnVmZmVyKCkpO1xuICB9IGVsc2UgaWYgKGZpbGUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgcmV0dXJuIGZpbGU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGZpbGUpO1xuICB9XG59O1xuIiwgImV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgcmVhZEZpbGVTeW5jID0gdW5kZWZpbmVkO2V4cG9ydCBjb25zdCBjcmVhdGVSZWFkU3RyZWFtID0gdW5kZWZpbmVkOyIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtFbnYsIEluZmVyZW5jZVNlc3Npb24sIFRlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlciwgU2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhLCBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YSwgVGVuc29yTWV0YWRhdGF9IGZyb20gJy4vcHJveHktbWVzc2FnZXMnO1xuaW1wb3J0IHtzZXRSdW5PcHRpb25zfSBmcm9tICcuL3J1bi1vcHRpb25zJztcbmltcG9ydCB7c2V0U2Vzc2lvbk9wdGlvbnN9IGZyb20gJy4vc2Vzc2lvbi1vcHRpb25zJztcbmltcG9ydCB7ZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtLCBnZXRUZW5zb3JFbGVtZW50U2l6ZSwgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlLCBsb2dMZXZlbFN0cmluZ1RvRW51bSwgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcsIHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtLCB0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3J9IGZyb20gJy4vd2FzbS1jb21tb24nO1xuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuaW1wb3J0IHtsb2FkRmlsZX0gZnJvbSAnLi93YXNtLXV0aWxzLWxvYWQtZmlsZSc7XG5cbi8vICNyZWdpb24gSW5pdGlhbGl6YXRpb25zXG5cbi8qKlxuICogVGhlcmUgYXJlIDQgZGlmZmVyZW50IFwiaW5pdGlhbGl6YXRpb25cIiBzdGVwcyBmb3IgT1JULiBUaGV5IGhhcHBlbiBpbiBkaWZmZXJlbnQgcGxhY2VzIGFuZCBkaWZmZXJlbnQgdGltZS5cbiAqXG4gKiAxLiBKYXZhU2NyaXB0IGluaXRpYWxpemF0aW9uIGZvciBvbm54cnVudGltZS1jb21tb24gYW5kIG9ubnhydW50aW1lLXdlYi5cbiAqICAgIFRoaXMgaXMgdGhlIGZpcnN0IGluaXRpYWxpemF0aW9uIHN0ZXAuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGNhbGxzIG9ubnhydW50aW1lLWNvbW1vbidzIHJlZ2lzdGVyQmFja2VuZCgpXG4gKiBmdW5jdGlvbiBtdWx0aXBsZSB0aW1lcyB0byByZWdpc3RlciBhbGwgdGhlIGF2YWlsYWJsZSBiYWNrZW5kcy4gVGhlIGJhY2tlbmQgcmVnaXN0cmF0aW9uIGlzIHZlcnkgZmFzdC4gSXQgb25seVxuICogcmVnaXN0ZXJzIHRoZSBiYWNrZW5kIG5hbWUgd2l0aCB0aGUgdW5pbml0aWFsaXplZCBiYWNrZW5kIG9iamVjdC4gTm8gaGVhdnkgaW5pdGlhbGl6YXRpb24gaXMgZG9uZSBpbiB0aGlzIHN0ZXAuXG4gKiAgICBSZWZlciB0byB3ZWIvbGliL2luZGV4LnRzIGZvciB0aGUgYmFja2VuZCByZWdpc3RyYXRpb24uXG4gKlxuICogMi4gV2ViQXNzZW1ibHkgYXJ0aWZhY3QgaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgd2hlbiBhbnkgcmVnaXN0ZXJlZCB3YXNtIGJhY2tlbmQgaXMgdXNlZCBmb3IgdGhlIGZpcnN0IHRpbWUgKGllLiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIG9yXG4gKiBgb3J0LlRyYWluaW5nU2Vzc2lvbi5jcmVhdGUoKWAgaXMgY2FsbGVkKS4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgZG9lcyB0aGUgZm9sbG93aW5nczpcbiAqICAgICAtIGNyZWF0ZSBhIHByb3h5IHdvcmtlciBhbmQgbWFrZSBzdXJlIHRoZSBwcm94eSB3b3JrZXIgaXMgcmVhZHkgdG8gcmVjZWl2ZSBtZXNzYWdlcywgaWYgcHJveHkgaXMgZW5hYmxlZC5cbiAqICAgICAtIHBlcmZvcm0gZmVhdHVyZSBkZXRlY3Rpb24sIGxvY2F0ZSBjb3JyZWN0IFdlYkFzc2VtYmx5IGFydGlmYWN0IHBhdGggYW5kIGNhbGwgdGhlIEVtc2NyaXB0ZW4gZ2VuZXJhdGVkXG4gKiBKYXZhU2NyaXB0IGNvZGUgdG8gaW5pdGlhbGl6ZSB0aGUgV2ViQXNzZW1ibHkgcnVudGltZS5cbiAqICAgICAgICAgLSBpZiBwcm94eSBpcyBlbmFibGVkLCB0aGlzIHN0ZXAgaGFwcGVucyBpbiB0aGUgcHJveHkgd29ya2VyIHVzaW5nIG1lc3NhZ2UgJ2luaXQtd2FzbScuXG4gKiAgICAgICAgIC0gZG93bmxvYWRpbmcgdGhlICdvcnQtd2FzbXsuLi59Lndhc20nIGZpbGUgaXMgZG9uZSBpbiB0aGlzIHN0ZXAuXG4gKiAgICAgICAgIC0gaWYgbXVsdGktdGhyZWFkIGlzIGVuYWJsZWQsIG9uZSBvciBtb3JlIHdlYndvcmtlciB3aWxsIGJlIGNyZWF0ZWQgdG8gaW5pdGlhbGl6ZSB0aGUgUFRocmVhZCB0aHJlYWRwb29sLlxuICpcbiAqIDMuIE9SVCBlbnZpcm9ubWVudCBpbml0aWFsaXphdGlvbi5cbiAqICAgIFRoaXMgaGFwcGVucyBhZnRlciBzdGVwIDIuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIHBlcmZvcm1zIE9OTlggUnVudGltZSBlbnZpcm9ubWVudCBpbml0aWFsaXphdGlvbi5cbiAqIEZ1bmN0aW9uIGBfT3J0SW5pdCgpYCBpcyBjYWxsZWQgaW4gdGhpcyBzdGVwLlxuICogICAgIC0gaWYgcHJveHkgaXMgZW5hYmxlZCwgdGhpcyBzdGVwIGhhcHBlbnMgaW4gdGhlIHByb3h5IHdvcmtlciB1c2luZyBtZXNzYWdlICdpbml0LW9ydCcuXG4gKiAgICAgLSBsb2dnaW5nIGxldmVsIChvcnQuZW52LmxvZ0xldmVsKSBhbmQgdGhyZWFkIG51bWJlciAob3J0LmVudi53YXNtLm51bVRocmVhZHMpIGFyZSBzZXQgaW4gdGhpcyBzdGVwLlxuICpcbiAqIDQuIFNlc3Npb24gaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgd2hlbiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIG9yIGBvcnQuVHJhaW5pbmdTZXNzaW9uLmNyZWF0ZSgpYCBpcyBjYWxsZWQuIFVubGlrZSB0aGUgZmlyc3QgM1xuICogc3RlcHMgKHRoZXkgb25seSBjYWxsZWQgb25jZSksIHRoaXMgc3RlcCB3aWxsIGJlIGRvbmUgZm9yIGVhY2ggc2Vzc2lvbi4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgZG9lcyB0aGVcbiAqIGZvbGxvd2luZ3M6XG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVVJMOlxuICogICAgLSBkb3dubG9hZCB0aGUgbW9kZWwgZGF0YSBmcm9tIHRoZSBVUkwuXG4gKiAgICAtIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC4gKHByb3h5OiAnY29weS1mcm9tJylcbiAqICAgIC0gZGVyZWZlcmVuY2UgdGhlIG1vZGVsIGJ1ZmZlci4gVGhpcyBzdGVwIGFsbG93cyB0aGUgb3JpZ2luYWwgQXJyYXlCdWZmZXIgdG8gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQuXG4gKiAgICAtIGNhbGwgYF9PcnRDcmVhdGVTZXNzaW9uKClgIHRvIGNyZWF0ZSB0aGUgc2Vzc2lvbi4gKHByb3h5OiAnY3JlYXRlJylcbiAqXG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVWludDhBcnJheSBvYmplY3Q6XG4gKiAgICAtIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC4gKHByb3h5OiAnY29weS1mcm9tJylcbiAqICAgIC0gY2FsbCBgX09ydENyZWF0ZVNlc3Npb24oKWAgdG8gY3JlYXRlIHRoZSBzZXNzaW9uLiAocHJveHk6ICdjcmVhdGUnKVxuICpcbiAqXG4gKi9cblxuLyoqXG4gKiBpbml0aWFsaXplIE9SVCBlbnZpcm9ubWVudC5cbiAqXG4gKiBAcGFyYW0gbnVtVGhyZWFkcyBTZXRHbG9iYWxJbnRyYU9wTnVtVGhyZWFkcyhudW1UaHJlYWRzKVxuICogQHBhcmFtIGxvZ2dpbmdMZXZlbCBDcmVhdGVFbnYoc3RhdGljX2Nhc3Q8T3J0TG9nZ2luZ0xldmVsPihsb2dnaW5nX2xldmVsKSlcbiAqL1xuY29uc3QgaW5pdE9ydCA9IChudW1UaHJlYWRzOiBudW1iZXIsIGxvZ2dpbmdMZXZlbDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IGVycm9yQ29kZSA9IGdldEluc3RhbmNlKCkuX09ydEluaXQobnVtVGhyZWFkcywgbG9nZ2luZ0xldmVsKTtcbiAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGluaXRpYWxpemUgb25ueHJ1bnRpbWUuJyk7XG4gIH1cbn07XG5cbi8qKlxuICogaW50aWFsaXplIHJ1bnRpbWUgZW52aXJvbm1lbnQuXG4gKiBAcGFyYW0gZW52IHBhc3NlZCBpbiB0aGUgZW52aXJvbm1lbnQgY29uZmlnIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRSdW50aW1lID0gYXN5bmMoZW52OiBFbnYpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgLy8gaW5pdCBPUlRcbiAgaW5pdE9ydChlbnYud2FzbS5udW1UaHJlYWRzISwgbG9nTGV2ZWxTdHJpbmdUb0VudW0oZW52LmxvZ0xldmVsKSk7XG59O1xuXG4vKipcbiAqIHBlcmZvcm0gRVAgc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24uXG4gKlxuICogQHBhcmFtIGVudlxuICogQHBhcmFtIGVwTmFtZVxuICovXG5leHBvcnQgY29uc3QgaW5pdEVwID0gYXN5bmMoZW52OiBFbnYsIGVwTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiAoZXBOYW1lID09PSAnd2ViZ3B1JyB8fCBlcE5hbWUgPT09ICd3ZWJubicpKSB7XG4gICAgLy8gcGVyZm9ybSBXZWJHUFUgYXZhaWxhYmlsaXR5IGNoZWNrXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnIHx8ICFuYXZpZ2F0b3IuZ3B1KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkdQVSBpcyBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnQnKTtcbiAgICB9XG4gICAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIoKTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnRmFpbGVkIHRvIGdldCBHUFUgYWRhcHRlci4gWW91IG1heSBuZWVkIHRvIGVuYWJsZSBmbGFnIFwiLS1lbmFibGUtdW5zYWZlLXdlYmdwdVwiIGlmIHlvdSBhcmUgdXNpbmcgQ2hyb21lLicpO1xuICAgIH1cblxuICAgIGlmICghZW52Lndhc20uc2ltZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdOb3Qgc3VwcG9ydGVkIGZvciBXZWJHUFU9T04gYW5kIFNJTUQ9T0ZGLiBQbGVhc2Ugc2V0IGBlbnYud2FzbS5zaW1kYCB0byB0cnVlIHdoZW4gdXNpbmcgYHdlYmdwdWAgRVAnKTtcbiAgICB9XG5cbiAgICAvLyBpbml0IEpTRVAgaWYgYXZhaWxhYmxlXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICAgIGNvbnN0IGluaXRKc2VwID0gcmVxdWlyZSgnLi9qc2VwL2luaXQnKS5pbml0O1xuICAgIGF3YWl0IGluaXRKc2VwKGdldEluc3RhbmNlKCksIGVudiwgYWRhcHRlcik7XG4gIH1cbn07XG5cbi8vICNlbmRyZWdpb24gSW5pdGlhbGl6YXRpb25zXG5cbi8qKlxuICogdmFsaWQgZGF0YSBsb2NhdGlvbnMgZm9yIGlucHV0L291dHB1dCB0ZW5zb3JzLlxuICovXG50eXBlIFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0ID0gJ2NwdSd8J2NwdS1waW5uZWQnfCdncHUtYnVmZmVyJztcblxudHlwZSBJT0JpbmRpbmdTdGF0ZSA9IHtcbiAgLyoqXG4gICAqIHRoZSBoYW5kbGUgb2YgSU8gYmluZGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGhhbmRsZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXG4gICAqXG4gICAqIHZhbHVlIGlzIG9uZSBvZiAnY3B1JywgJ2NwdS1waW5uZWQnLCAnZ3B1LWJ1ZmZlcicuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IHJlYWRvbmx5IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W107XG5cbiAgLyoqXG4gICAqIGVudW0gdmFsdWUgb2YgdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG4vKipcbiAqICB0dXBsZSBlbGVtZW50cyBhcmU6IEluZmVyZW5jZVNlc3Npb24gSUQ7IGlucHV0TmFtZXNVVEY4RW5jb2RlZDsgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDsgYmluZGluZ1N0YXRlXG4gKi9cbnR5cGUgU2Vzc2lvbk1ldGFkYXRhID0gW1xuICBpbmZlcmVuY2VTZXNzaW9uSWQ6IG51bWJlciwgaW5wdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sXG4gIGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGV8bnVsbCwgZW5hYmxlR3JhcGhDYXB0dXJlOiBib29sZWFuLCBpbnB1dE91dHB1dEJvdW5kOiBib29sZWFuXG5dO1xuXG5jb25zdCBhY3RpdmVTZXNzaW9ucyA9IG5ldyBNYXA8bnVtYmVyLCBTZXNzaW9uTWV0YWRhdGE+KCk7XG5cbi8qKlxuICogZ2V0IHRoZSBpbnB1dC9vdXRwdXQgY291bnQgb2YgdGhlIHNlc3Npb24uXG4gKiBAcGFyYW0gc2Vzc2lvbkhhbmRsZSB0aGUgaGFuZGxlIHJlcHJlc2VudGluZyB0aGUgc2Vzc2lvbi4gc2hvdWxkIGJlIG5vbi16ZXJvLlxuICogQHJldHVybnMgYSB0dXBsZSBpbmNsdWRpbmcgMiBudW1iZXJzLCByZXByZXNlbnRpbmcgdGhlIGlucHV0IGNvdW50IGFuZCBvdXRwdXQgY291bnQuXG4gKi9cbmNvbnN0IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50ID0gKHNlc3Npb25IYW5kbGU6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoOCk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlLCBkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgNCk7XG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IHNlc3Npb24gaW5wdXQvb3V0cHV0IGNvdW50LicpO1xuICAgIH1cbiAgICByZXR1cm4gW3dhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0XSwgd2FzbS5IRUFQMzJbZGF0YU9mZnNldCAvIDQgKyAxXV07XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuXG4vKipcbiAqIGFsbG9jYXRlIHRoZSBtZW1vcnkgYW5kIG1lbWNweSB0aGUgZXh0ZXJuYWwgYnVmZmVyLlxuICpcbiAqIEBwYXJhbSBtb2RlbCAtIHRoZSBleHRlcm5hbCBidWZmZXIgY29udGFpbmluZyB0aGUgbW9kZWwgZGF0YS4gTXVzdCBub3QgYmUgdGhlIHNhbWUgYnVmZmVyIGFzIHRoZSBXQVNNIGhlYXAuXG4gKiBAcmV0dXJucyBhIDItZWxlbWVudHMgdHVwbGUgLSB0aGUgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgYWxsb2NhdGVkIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgY29weUZyb21FeHRlcm5hbEJ1ZmZlciA9IChtb2RlbDogVWludDhBcnJheSk6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3QgbW9kZWxEYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKG1vZGVsLmJ5dGVMZW5ndGgpO1xuICBpZiAobW9kZWxEYXRhT2Zmc2V0ID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBjcmVhdGUgYSBzZXNzaW9uLiBmYWlsZWQgdG8gYWxsb2NhdGUgYSBidWZmZXIgb2Ygc2l6ZSAke21vZGVsLmJ5dGVMZW5ndGh9LmApO1xuICB9XG4gIHdhc20uSEVBUFU4LnNldChtb2RlbCwgbW9kZWxEYXRhT2Zmc2V0KTtcbiAgcmV0dXJuIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsLmJ5dGVMZW5ndGhdO1xufTtcblxuLyoqXG4gKiBjcmVhdGUgYW4gaW5mZXJlbmNlIHNlc3Npb24gZnJvbSBhIG1vZGVsIGRhdGEgYnVmZmVyLlxuICpcbiAqIEBwYXJhbSBtb2RlbERhdGEgLSBlaXRoZXIgYSBVaW50OEFycmF5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG1vZGVsIGRhdGEsIG9yIGEgMi1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIHRoZVxuICogICAgIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGEgYnVmZmVyLlxuICogQHBhcmFtIG9wdGlvbnMgYW4gb3B0aW9uYWwgc2Vzc2lvbiBvcHRpb25zIG9iamVjdC5cbiAqIEByZXR1cm5zIGEgMy1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIFtzZXNzaW9uIGhhbmRsZSwgaW5wdXQgbmFtZXMsIG91dHB1dCBuYW1lc11cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb24gPSBhc3luYyhcbiAgICBtb2RlbERhdGE6IFVpbnQ4QXJyYXl8U2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXIsXG4gICAgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YT4gPT4ge1xuICBsZXQgbW9kZWxEYXRhT2Zmc2V0OiBudW1iZXIsIG1vZGVsRGF0YUxlbmd0aDogbnVtYmVyO1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBpZiAoQXJyYXkuaXNBcnJheShtb2RlbERhdGEpKSB7XG4gICAgLy8gaWYgbW9kZWwgZGF0YSBpcyBhbiBhcnJheSwgaXQgbXVzdCBiZSBhIDItZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyB0aGUgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgbW9kZWwgZGF0YVxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBtb2RlbERhdGE7XG4gIH0gZWxzZSBpZiAobW9kZWxEYXRhLmJ1ZmZlciA9PT0gd2FzbS5IRUFQVTguYnVmZmVyKSB7XG4gICAgLy8gaWYgbW9kZWwgZGF0YSB1c2VzIHRoZSBzYW1lIGJ1ZmZlciBhcyB0aGUgV0FTTSBoZWFwLCB3ZSBkb24ndCBuZWVkIHRvIGNvcHkgaXQuXG4gICAgW21vZGVsRGF0YU9mZnNldCwgbW9kZWxEYXRhTGVuZ3RoXSA9IFttb2RlbERhdGEuYnl0ZU9mZnNldCwgbW9kZWxEYXRhLmJ5dGVMZW5ndGhdO1xuICB9IGVsc2Uge1xuICAgIC8vIG90aGVyd2lzZSwgY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLlxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBjb3B5RnJvbUV4dGVybmFsQnVmZmVyKG1vZGVsRGF0YSk7XG4gIH1cblxuICBsZXQgc2Vzc2lvbkhhbmRsZSA9IDA7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBpb0JpbmRpbmdIYW5kbGUgPSAwO1xuICBsZXQgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbnB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuXG4gIHRyeSB7XG4gICAgW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdID0gc2V0U2Vzc2lvbk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBpZiAob3B0aW9ucz8uZXh0ZXJuYWxEYXRhICYmIHdhc20ubW91bnRFeHRlcm5hbERhdGEpIHtcbiAgICAgIGNvbnN0IGxvYWRpbmdQcm9taXNlcyA9IFtdO1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIG9wdGlvbnMuZXh0ZXJuYWxEYXRhKSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSB0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycgPyBmaWxlIDogZmlsZS5wYXRoO1xuICAgICAgICBsb2FkaW5nUHJvbWlzZXMucHVzaChsb2FkRmlsZSh0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycgPyBmaWxlIDogZmlsZS5kYXRhKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgIHdhc20ubW91bnRFeHRlcm5hbERhdGEhKHBhdGgsIGRhdGEpO1xuICAgICAgICB9KSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHdhaXQgZm9yIGFsbCBleHRlcm5hbCBkYXRhIGZpbGVzIHRvIGJlIGxvYWRlZFxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwobG9hZGluZ1Byb21pc2VzKTtcbiAgICB9XG5cbiAgICBzZXNzaW9uSGFuZGxlID0gYXdhaXQgd2FzbS5fT3J0Q3JlYXRlU2Vzc2lvbihtb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aCwgc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgIGlmIChzZXNzaW9uSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgYSBzZXNzaW9uLicpO1xuICAgIH1cblxuICAgIGNvbnN0IFtpbnB1dENvdW50LCBvdXRwdXRDb3VudF0gPSBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlKTtcblxuICAgIGNvbnN0IGVuYWJsZUdyYXBoQ2FwdHVyZSA9ICEhb3B0aW9ucz8uZW5hYmxlR3JhcGhDYXB0dXJlO1xuXG4gICAgY29uc3QgaW5wdXROYW1lcyA9IFtdO1xuICAgIGNvbnN0IG91dHB1dE5hbWVzID0gW107XG4gICAgY29uc3Qgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IG5hbWUgPSB3YXNtLl9PcnRHZXRJbnB1dE5hbWUoc2Vzc2lvbkhhbmRsZSwgaSk7XG4gICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gaW5wdXQgbmFtZS4nKTtcbiAgICAgIH1cbiAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xuICAgICAgaW5wdXROYW1lcy5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0T3V0cHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgIGlmIChuYW1lID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBvdXRwdXQgbmFtZS4nKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQucHVzaChuYW1lKTtcbiAgICAgIGNvbnN0IG5hbWVTdHJpbmcgPSB3YXNtLlVURjhUb1N0cmluZyhuYW1lKTtcbiAgICAgIG91dHB1dE5hbWVzLnB1c2gobmFtZVN0cmluZyk7XG5cbiAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlICYmIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMucHVzaCgnZ3B1LWJ1ZmZlcicpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdHlwZW9mIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICBvcHRpb25zLnByZWZlcnJlZE91dHB1dExvY2F0aW9uIDpcbiAgICAgICAgICAgIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uPy5bbmFtZVN0cmluZ10gPz8gJ2NwdSc7XG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gJ2NwdScgJiYgbG9jYXRpb24gIT09ICdjcHUtcGlubmVkJyAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOb3Qgc3VwcG9ydGVkIHByZWZlcnJlZCBvdXRwdXQgbG9jYXRpb246ICR7bG9jYXRpb259LmApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbmFibGVHcmFwaENhcHR1cmUgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke1xuICAgICAgICAgICAgICBsb2NhdGlvbn0uIE9ubHkgJ2dwdS1idWZmZXInIGxvY2F0aW9uIGlzIHN1cHBvcnRlZCB3aGVuIGVuYWJsZUdyYXBoQ2FwdHVyZSBpcyB0cnVlLmApO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB1c2UgSU8gYmluZGluZyBvbmx5IHdoZW4gYXQgbGVhc3Qgb25lIG91dHB1dCBpcyBwcmVmZmVyZWQgdG8gYmUgb24gR1BVLlxuICAgIGxldCBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGwgPSBudWxsO1xuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMuc29tZShsID0+IGwgPT09ICdncHUtYnVmZmVyJykpIHtcbiAgICAgIGlvQmluZGluZ0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZUJpbmRpbmcoc2Vzc2lvbkhhbmRsZSk7XG4gICAgICBpZiAoaW9CaW5kaW5nSGFuZGxlID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBJTyBiaW5kaW5nLicpO1xuICAgICAgfVxuXG4gICAgICBiaW5kaW5nU3RhdGUgPSB7XG4gICAgICAgIGhhbmRsZTogaW9CaW5kaW5nSGFuZGxlLFxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsXG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5tYXAobCA9PiBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obCkpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBhY3RpdmVTZXNzaW9ucy5zZXQoXG4gICAgICAgIHNlc3Npb25IYW5kbGUsXG4gICAgICAgIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGJpbmRpbmdTdGF0ZSwgZW5hYmxlR3JhcGhDYXB0dXJlLCBmYWxzZV0pO1xuICAgIHJldHVybiBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lcywgb3V0cHV0TmFtZXNdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuXG4gICAgaWYgKGlvQmluZGluZ0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZUJpbmRpbmcoaW9CaW5kaW5nSGFuZGxlKTtcbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbkhhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5fZnJlZShtb2RlbERhdGFPZmZzZXQpO1xuICAgIGlmIChzZXNzaW9uT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zKHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgYWxsb2NzLmZvckVhY2goYWxsb2MgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuXG4gICAgLy8gdW5tb3VudCBleHRlcm5hbCBkYXRhIGlmIG5lY2Vzc2FyeVxuICAgIHdhc20udW5tb3VudEV4dGVybmFsRGF0YT8uKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCByZWxlYXNlU2Vzc2lvbiA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCByZWxlYXNlIHNlc3Npb24uIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGUsIGVuYWJsZUdyYXBoQ2FwdHVyZV0gPSBzZXNzaW9uO1xuXG4gIGlmIChpb0JpbmRpbmdTdGF0ZSkge1xuICAgIGlmIChlbmFibGVHcmFwaENhcHR1cmUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgfVxuICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gIH1cblxuICB3YXNtLmpzZXBPblJlbGVhc2VTZXNzaW9uPy4oc2Vzc2lvbklkKTtcblxuICBpbnB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbihzZXNzaW9uSGFuZGxlKTtcbiAgYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25JZCk7XG59O1xuXG5leHBvcnQgY29uc3QgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yID1cbiAgICAodGVuc29yOiBUZW5zb3JNZXRhZGF0YXxudWxsLCB0ZW5zb3JIYW5kbGVzOiBudW1iZXJbXSwgYWxsb2NzOiBudW1iZXJbXSwgc2Vzc2lvbklkOiBudW1iZXIsIGluZGV4OiBudW1iZXIsXG4gICAgIGVuYWJsZUdyYXBoQ2FwdHVyZSA9IGZhbHNlKTogdm9pZCA9PiB7XG4gICAgICBpZiAoIXRlbnNvcikge1xuICAgICAgICB0ZW5zb3JIYW5kbGVzLnB1c2goMCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgICAgIGNvbnN0IGRhdGFUeXBlID0gdGVuc29yWzBdO1xuICAgICAgY29uc3QgZGltcyA9IHRlbnNvclsxXTtcbiAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGVuc29yWzNdO1xuXG4gICAgICBsZXQgcmF3RGF0YTogbnVtYmVyO1xuICAgICAgbGV0IGRhdGFCeXRlTGVuZ3RoOiBudW1iZXI7XG5cbiAgICAgIGlmIChkYXRhVHlwZSA9PT0gJ3N0cmluZycgJiYgbG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmFibGVHcmFwaENhcHR1cmUgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRXh0ZXJuYWwgYnVmZmVyIG11c3QgYmUgcHJvdmlkZWQgZm9yIGlucHV0L291dHB1dCBpbmRleCAke2luZGV4fSB3aGVuIGVuYWJsZUdyYXBoQ2FwdHVyZSBpcyB0cnVlLmApO1xuICAgICAgfVxuXG4gICAgICBpZiAobG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICBjb25zdCBncHVCdWZmZXIgPSB0ZW5zb3JbMl0uZ3B1QnVmZmVyIGFzIEdQVUJ1ZmZlcjtcbiAgICAgICAgY29uc3QgZWxlbWVudFNpemVJbkJ5dGVzID0gZ2V0VGVuc29yRWxlbWVudFNpemUodGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpKSE7XG4gICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKSAqIGVsZW1lbnRTaXplSW5CeXRlcztcbiAgICAgICAgcmF3RGF0YSA9IHdhc20uanNlcFJlZ2lzdGVyQnVmZmVyKHNlc3Npb25JZCwgaW5kZXgsIGdwdUJ1ZmZlciwgZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IDQgKiBkYXRhLmxlbmd0aDtcbiAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gcmF3RGF0YSAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHRlbnNvciBkYXRhIGF0IGluZGV4ICR7aX0gaXMgbm90IGEgc3RyaW5nYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGFsbG9jcy5wdXNoKHJhd0RhdGEpO1xuICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoNCAqIGRpbXMubGVuZ3RoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBkaW1JbmRleCA9IGRpbXNPZmZzZXQgLyA0O1xuICAgICAgICBkaW1zLmZvckVhY2goZCA9PiB3YXNtLkhFQVAzMltkaW1JbmRleCsrXSA9IGQpO1xuICAgICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLl9PcnRDcmVhdGVUZW5zb3IoXG4gICAgICAgICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksIHJhd0RhdGEsIGRhdGFCeXRlTGVuZ3RoLCBkaW1zT2Zmc2V0LCBkaW1zLmxlbmd0aCxcbiAgICAgICAgICAgIGRhdGFMb2NhdGlvblN0cmluZ1RvRW51bShsb2NhdGlvbikpO1xuICAgICAgICBpZiAodGVuc29yID09PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgICAgICB9XG4gICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCh0ZW5zb3IpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICAgICAgfVxuICAgIH07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG4gIGNvbnN0IGlucHV0TmFtZXNVVEY4RW5jb2RlZCA9IHNlc3Npb25bMV07XG4gIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBzZXNzaW9uWzJdO1xuICBjb25zdCBpb0JpbmRpbmdTdGF0ZSA9IHNlc3Npb25bM107XG4gIGNvbnN0IGVuYWJsZUdyYXBoQ2FwdHVyZSA9IHNlc3Npb25bNF07XG4gIGNvbnN0IGlucHV0T3V0cHV0Qm91bmQgPSBzZXNzaW9uWzVdO1xuXG4gIGNvbnN0IGlucHV0Q291bnQgPSBpbnB1dEluZGljZXMubGVuZ3RoO1xuICBjb25zdCBvdXRwdXRDb3VudCA9IG91dHB1dEluZGljZXMubGVuZ3RoO1xuXG4gIGxldCBydW5PcHRpb25zSGFuZGxlID0gMDtcbiAgbGV0IHJ1bk9wdGlvbnNBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgaW5wdXRUZW5zb3JIYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBvdXRwdXRUZW5zb3JIYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbnB1dE91dHB1dEFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBiZWZvcmVSdW5TdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIGNvbnN0IGlucHV0VmFsdWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKGlucHV0Q291bnQgKiA0KTtcbiAgY29uc3QgaW5wdXROYW1lc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XG4gIGNvbnN0IG91dHB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhvdXRwdXRDb3VudCAqIDQpO1xuICBjb25zdCBvdXRwdXROYW1lc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhvdXRwdXRDb3VudCAqIDQpO1xuXG4gIHRyeSB7XG4gICAgW3J1bk9wdGlvbnNIYW5kbGUsIHJ1bk9wdGlvbnNBbGxvY3NdID0gc2V0UnVuT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIC8vIGNyZWF0ZSBpbnB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIHByZXBhcmVJbnB1dE91dHB1dFRlbnNvcihcbiAgICAgICAgICBpbnB1dFRlbnNvcnNbaV0sIGlucHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzW2ldLCBlbmFibGVHcmFwaENhcHR1cmUpO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBvdXRwdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKFxuICAgICAgICAgIG91dHB1dFRlbnNvcnNbaV0sIG91dHB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0Q291bnQgKyBvdXRwdXRJbmRpY2VzW2ldLFxuICAgICAgICAgIGVuYWJsZUdyYXBoQ2FwdHVyZSk7XG4gICAgfVxuXG4gICAgbGV0IGlucHV0VmFsdWVzSW5kZXggPSBpbnB1dFZhbHVlc09mZnNldCAvIDQ7XG4gICAgbGV0IGlucHV0TmFtZXNJbmRleCA9IGlucHV0TmFtZXNPZmZzZXQgLyA0O1xuICAgIGxldCBvdXRwdXRWYWx1ZXNJbmRleCA9IG91dHB1dFZhbHVlc09mZnNldCAvIDQ7XG4gICAgbGV0IG91dHB1dE5hbWVzSW5kZXggPSBvdXRwdXROYW1lc09mZnNldCAvIDQ7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dFZhbHVlc0luZGV4KytdID0gaW5wdXRUZW5zb3JIYW5kbGVzW2ldO1xuICAgICAgd2FzbS5IRUFQVTMyW2lucHV0TmFtZXNJbmRleCsrXSA9IGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbnB1dEluZGljZXNbaV1dO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgIHdhc20uSEVBUFUzMltvdXRwdXRWYWx1ZXNJbmRleCsrXSA9IG91dHB1dFRlbnNvckhhbmRsZXNbaV07XG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0TmFtZXNJbmRleCsrXSA9IG91dHB1dE5hbWVzVVRGOEVuY29kZWRbb3V0cHV0SW5kaWNlc1tpXV07XG4gICAgfVxuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIGlvQmluZGluZ1N0YXRlICYmICFpbnB1dE91dHB1dEJvdW5kKSB7XG4gICAgICBjb25zdCB7aGFuZGxlLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWR9ID0gaW9CaW5kaW5nU3RhdGU7XG5cbiAgICAgIGlmIChpbnB1dE5hbWVzVVRGOEVuY29kZWQubGVuZ3RoICE9PSBpbnB1dENvdW50KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW5wdXQgY291bnQgZnJvbSBmZWVkcyAoJHtcbiAgICAgICAgICAgIGlucHV0Q291bnR9KSBpcyBleHBlY3RlZCB0byBiZSBhbHdheXMgZXF1YWwgdG8gbW9kZWwncyBpbnB1dCBjb3VudCAoJHtpbnB1dE5hbWVzVVRGOEVuY29kZWQubGVuZ3RofSkuYCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgaW5wdXRzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IGlucHV0SW5kaWNlc1tpXTtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gYXdhaXQgd2FzbS5fT3J0QmluZElucHV0KGhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgaW5wdXRUZW5zb3JIYW5kbGVzW2ldKTtcbiAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIGlucHV0WyR7aX1dIGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIHByZS1hbGxvY2F0ZWQgb3V0cHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gb3V0cHV0SW5kaWNlc1tpXTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBvdXRwdXRUZW5zb3JzW2ldPy5bM107ICAvLyB1bmRlZmluZWQgbWVhbnMgb3V0cHV0IGlzIG5vdCBwcmUtYWxsb2NhdGVkLlxuXG4gICAgICAgIGlmIChsb2NhdGlvbikge1xuICAgICAgICAgIC8vIG91dHB1dCBpcyBwcmUtYWxsb2NhdGVkLiBiaW5kIHRoZSB0ZW5zb3IuXG4gICAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldLCAwKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBwcmUtYWxsb2NhdGVkIG91dHB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC4gcmVzZXQgcHJlZmVycmVkIGxvY2F0aW9uLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9XG4gICAgICAgICAgICAgIHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgMCwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZFtpbmRleF0pO1xuICAgICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIG91dHB1dFske2l9XSB0byAke291dHB1dFByZWZlcnJlZExvY2F0aW9uc1tpXX0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYWN0aXZlU2Vzc2lvbnMuc2V0KFxuICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBpb0JpbmRpbmdTdGF0ZSwgZW5hYmxlR3JhcGhDYXB0dXJlLCB0cnVlXSk7XG4gICAgfVxuXG4gICAgd2FzbS5qc2VwT25SdW5TdGFydD8uKHNlc3Npb25IYW5kbGUpO1xuICAgIGxldCBlcnJvckNvZGU6IG51bWJlcjtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlvQmluZGluZ1N0YXRlLmhhbmRsZSwgb3V0cHV0Q291bnQsIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzT2Zmc2V0LCBpbnB1dFZhbHVlc09mZnNldCwgaW5wdXRDb3VudCwgb3V0cHV0TmFtZXNPZmZzZXQsIG91dHB1dENvdW50LFxuICAgICAgICAgIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFjY2VzcyBvdXRwdXQgdGVuc29yIGRhdGEgb24gaW5kZXggJHtpfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVuc29yRGF0YUluZGV4ID0gdGVuc29yRGF0YU9mZnNldCAvIDQ7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaCh3YXNtLkhFQVBVMzJbZGltc09mZnNldCAvIDQgKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KTtcblxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gZGF0YU9mZnNldCAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogd2FzbS5IRUFQVTMyW2RhdGFJbmRleF0gLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemUgPSBnZXRUZW5zb3JFbGVtZW50U2l6ZShkYXRhVHlwZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgdHlwZSwgZGltcywge1xuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlcihncHVCdWZmZXIsIHNpemUgKiBlbGVtZW50U2l6ZSwgdHlwZSksXG4gICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2dwdS1idWZmZXInXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpXG4gICAgICAgICAgICAgICAgLnNldCh3YXNtLkhFQVBVOC5zdWJhcnJheShkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgZGF0YS5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBkYXRhT2Zmc2V0KSB7XG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBPdXRwdXRUZW5zb3IpIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW9CaW5kaW5nU3RhdGUgJiYgIWVuYWJsZUdyYXBoQ2FwdHVyZSkge1xuICAgICAgd2FzbS5fT3J0Q2xlYXJCb3VuZE91dHB1dHMoaW9CaW5kaW5nU3RhdGUuaGFuZGxlKTtcbiAgICAgIGFjdGl2ZVNlc3Npb25zLnNldChcbiAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGUsIGVuYWJsZUdyYXBoQ2FwdHVyZSwgZmFsc2VdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVSdW5TdGFjayk7XG5cbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIG91dHB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIGlucHV0T3V0cHV0QWxsb2NzLmZvckVhY2gocCA9PiB3YXNtLl9mcmVlKHApKTtcblxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgcnVuT3B0aW9uc0FsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG4gIH1cbn07XG5cbi8qKlxuICogZW5kIHByb2ZpbGluZ1xuICovXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG5cbiAgLy8gcHJvZmlsZSBmaWxlIG5hbWUgaXMgbm90IHVzZWQgeWV0LCBidXQgaXQgbXVzdCBiZSBmcmVlZC5cbiAgY29uc3QgcHJvZmlsZUZpbGVOYW1lID0gd2FzbS5fT3J0RW5kUHJvZmlsaW5nKHNlc3Npb25IYW5kbGUpO1xuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIHByb2ZpbGUgZmlsZSBuYW1lLicpO1xuICB9XG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xuICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlckxpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHRlbnNvciBvZiB0ZW5zb3JzKSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgJ2J1ZmZlcicgaW4gZGF0YSkge1xuICAgICAgYnVmZmVycy5wdXNoKGRhdGEuYnVmZmVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBsaWI9XCJ3ZWJ3b3JrZXJcIiAvPlxuXG4vL1xuLy8gKiB0eXBlIGhhY2sgZm9yIFwiSFRNTEltYWdlRWxlbWVudFwiXG4vL1xuLy8gaW4gdHlwZXNjcmlwdCwgdGhlIHR5cGUgb2YgXCJIVE1MSW1hZ2VFbGVtZW50XCIgaXMgZGVmaW5lZCBpbiBsaWIuZG9tLmQudHMsIHdoaWNoIGlzIGNvbmZsaWN0IHdpdGggbGliLndlYndvcmtlci5kLnRzLlxuLy8gd2hlbiB3ZSB1c2Ugd2Vid29ya2VyLCB0aGUgbGliLndlYndvcmtlci5kLnRzIHdpbGwgYmUgdXNlZCwgd2hpY2ggZG9lcyBub3QgaGF2ZSBIVE1MSW1hZ2VFbGVtZW50IGRlZmluZWQuXG4vL1xuLy8gd2Ugd2lsbCBnZXQgdGhlIGZvbGxvd2luZyBlcnJvcnMgY29tcGxhaW5pbmcgdGhhdCBIVE1MSW1hZ2VFbGVtZW50IGlzIG5vdCBkZWZpbmVkOlxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vL1xuLy8gLi4vY29tbW9uL2Rpc3QvY2pzL3RlbnNvci1mYWN0b3J5LmQudHM6MTg3OjI5IC0gZXJyb3IgVFMyNTUyOiBDYW5ub3QgZmluZCBuYW1lICdIVE1MSW1hZ2VFbGVtZW50Jy4gRGlkIHlvdSBtZWFuXG4vLyAnSFRNTExJRWxlbWVudCc/XG4vL1xuLy8gMTg3ICAgICBmcm9tSW1hZ2UoaW1hZ2VFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50LCBvcHRpb25zPzogVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnMpOlxuLy8gUHJvbWlzZTxUeXBlZFRlbnNvcjwnZmxvYXQzMic+IHwgVHlwZWRUZW5zb3I8J3VpbnQ4Jz4+O1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB+fn5+fn5+fn5+fn5+fn5+XG4vL1xuLy8gbm9kZV9tb2R1bGVzL0B3ZWJncHUvdHlwZXMvZGlzdC9pbmRleC5kLnRzOjgzOjcgLSBlcnJvciBUUzI1NTI6IENhbm5vdCBmaW5kIG5hbWUgJ0hUTUxJbWFnZUVsZW1lbnQnLiBEaWQgeW91IG1lYW5cbi8vICdIVE1MTElFbGVtZW50Jz9cbi8vXG4vLyA4MyAgICAgfCBIVE1MSW1hZ2VFbGVtZW50XG4vLyAgICAgICAgICB+fn5+fn5+fn5+fn5+fn5+XG4vL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vXG4vLyBgSFRNTEltYWdlRWxlbWVudGAgaXMgb25seSB1c2VkIGluIHR5cGUgZGVjbGFyYXRpb24gYW5kIG5vdCBpbiByZWFsIGNvZGUuIFNvIHdlIGRlZmluZSBpdCBhcyBgdW5rbm93bmAgaGVyZSB0b1xuLy8gYnlwYXNzIHRoZSB0eXBlIGNoZWNrLlxuLy9cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdHlwZSBIVE1MSW1hZ2VFbGVtZW50ID0gdW5rbm93bjtcbn1cblxuaW1wb3J0IHtPcnRXYXNtTWVzc2FnZSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGF9IGZyb20gJy4uL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7Y3JlYXRlU2Vzc2lvbiwgY29weUZyb21FeHRlcm5hbEJ1ZmZlciwgZW5kUHJvZmlsaW5nLCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycywgaW5pdEVwLCBpbml0UnVudGltZSwgcmVsZWFzZVNlc3Npb24sIHJ1bn0gZnJvbSAnLi4vd2FzbS1jb3JlLWltcGwnO1xuaW1wb3J0IHtpbml0aWFsaXplV2ViQXNzZW1ibHl9IGZyb20gJy4uL3dhc20tZmFjdG9yeSc7XG5cbnNlbGYub25tZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQ8T3J0V2FzbU1lc3NhZ2U+KTogdm9pZCA9PiB7XG4gIGNvbnN0IHt0eXBlLCBpbiA6IG1lc3NhZ2V9ID0gZXYuZGF0YTtcbiAgdHJ5IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ2luaXQtd2FzbSc6XG4gICAgICAgIGluaXRpYWxpemVXZWJBc3NlbWJseShtZXNzYWdlIS53YXNtKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaW5pdFJ1bnRpbWUobWVzc2FnZSEpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGV9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2luaXQtZXAnOiB7XG4gICAgICAgIGNvbnN0IHtlcE5hbWUsIGVudn0gPSBtZXNzYWdlITtcbiAgICAgICAgaW5pdEVwKGVudiwgZXBOYW1lKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGV9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnY29weS1mcm9tJzoge1xuICAgICAgICBjb25zdCB7YnVmZmVyfSA9IG1lc3NhZ2UhO1xuICAgICAgICBjb25zdCBidWZmZXJEYXRhID0gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihidWZmZXIpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgb3V0OiBidWZmZXJEYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnY3JlYXRlJzoge1xuICAgICAgICBjb25zdCB7bW9kZWwsIG9wdGlvbnN9ID0gbWVzc2FnZSE7XG4gICAgICAgIGNyZWF0ZVNlc3Npb24obW9kZWwsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICBzZXNzaW9uTWV0YWRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIG91dDogc2Vzc2lvbk1ldGFkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ3JlbGVhc2UnOlxuICAgICAgICByZWxlYXNlU2Vzc2lvbihtZXNzYWdlISk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncnVuJzoge1xuICAgICAgICBjb25zdCB7c2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3B0aW9uc30gPSBtZXNzYWdlITtcbiAgICAgICAgcnVuKHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG5ldyBBcnJheShvdXRwdXRJbmRpY2VzLmxlbmd0aCkuZmlsbChudWxsKSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIG91dHB1dHMgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dHMuc29tZShvID0+IG9bM10gIT09ICdjcHUnKSkge1xuICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyOiAnUHJveHkgZG9lcyBub3Qgc3VwcG9ydCBub24tY3B1IHRlbnNvciBsb2NhdGlvbi4nfSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0eXBlLCBvdXQ6IG91dHB1dHN9IGFzIE9ydFdhc21NZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMob3V0cHV0cyBhcyBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2VuZC1wcm9maWxpbmcnOlxuICAgICAgICBlbmRQcm9maWxpbmcobWVzc2FnZSEpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZX0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gIH1cbn07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQWEsVUFBa0MsY0FBc0M7QUFBckY7QUFBQTtBQUFPLE1BQU0sV0FBVztBQUFpQixNQUFNLGVBQWU7QUFBaUIsTUFBTSxtQkFBbUI7QUFBQTtBQUFBOzs7QUNBeEc7QUFBQTtBQUFBLGdCQUFBQTtBQUFBO0FBQUEsTUFBYUE7QUFBYjtBQUFBO0FBQU8sTUFBTUEsUUFBTztBQUFBO0FBQUE7OztBQ0FwQjtBQUFBO0FBQUE7QUFDQSxVQUFJLFdBQVcsTUFBTTtBQUNuQixZQUFJLGFBQWEsT0FBTyxhQUFhLGVBQWUsU0FBUyxnQkFBZ0IsU0FBUyxjQUFjLE1BQU07QUFDMUcsWUFBSSxPQUFPLGVBQWU7QUFBYSx1QkFBYSxjQUFjO0FBQ2xFLGVBQ0YsU0FBUyxZQUFZLENBQUMsR0FBRztBQUV6QixjQUFJLElBQUUsV0FBVSxHQUFFO0FBQUUsWUFBRSxRQUFNLElBQUksUUFBUSxDQUFDLEdBQUUsTUFBSTtBQUFDLGdCQUFFO0FBQUUsZ0JBQUU7QUFBQSxVQUFDLENBQUM7QUFBRSxjQUFJLElBQUUsT0FBTyxPQUFPLENBQUMsR0FBRSxDQUFDLEdBQUUsSUFBRSxrQkFBaUIsS0FBRyxZQUFVLE9BQU8sUUFBTyxJQUFFLGNBQVksT0FBTyxlQUFjLEtBQUcsWUFBVSxPQUFPLFdBQVMsWUFBVSxPQUFPLFFBQVEsWUFBVSxZQUFVLE9BQU8sUUFBUSxTQUFTLE1BQUssSUFBRSxJQUFHLEdBQUUsR0FBRTtBQUNyUixjQUFHLElBQUc7QUFBQyxnQkFBSSxLQUFHLHVDQUFjLElBQUU7QUFBZ0IsZ0JBQUUsSUFBRSxFQUFFLFFBQVEsQ0FBQyxJQUFFLE1BQUksWUFBVTtBQUFJLGdCQUFFLENBQUMsR0FBRSxNQUFJO0FBQUMsa0JBQUUsRUFBRSxXQUFXLFNBQVMsSUFBRSxJQUFJLElBQUksQ0FBQyxJQUFFLEVBQUUsVUFBVSxDQUFDO0FBQUUscUJBQU8sR0FBRyxhQUFhLEdBQUUsSUFBRSxTQUFPLE1BQU07QUFBQSxZQUFDO0FBQUUsZ0JBQUUsT0FBRztBQUFDLGtCQUFFLEVBQUUsR0FBRSxJQUFFO0FBQUUsZ0JBQUUsV0FBUyxJQUFFLElBQUksV0FBVyxDQUFDO0FBQUcscUJBQU87QUFBQSxZQUFDO0FBQUUsZ0JBQUUsQ0FBQyxHQUFFLEdBQUUsR0FBRSxJQUFFLFNBQUs7QUFBQyxrQkFBRSxFQUFFLFdBQVcsU0FBUyxJQUFFLElBQUksSUFBSSxDQUFDLElBQUUsRUFBRSxVQUFVLENBQUM7QUFBRSxpQkFBRyxTQUFTLEdBQUUsSUFBRSxTQUFPLFFBQU8sQ0FBQyxHQUFFLE1BQUk7QUFBQyxvQkFBRSxFQUFFLENBQUMsSUFBRSxFQUFFLElBQUUsRUFBRSxTQUFPLENBQUM7QUFBQSxjQUFDLENBQUM7QUFBQSxZQUFDO0FBQUUsYUFBQyxFQUFFLGVBQWEsSUFBRSxRQUFRLEtBQUssV0FBUyxJQUFFLFFBQVEsS0FBSyxDQUFDLEVBQUUsUUFBUSxPQUFNLEdBQUc7QUFBRyxvQkFBUSxLQUFLLE1BQU0sQ0FBQztBQUFFLGNBQUUsVUFBUSxNQUFJO0FBQUEsVUFBNEIsV0FBUyxNQUNoaEI7QUFBRSxnQkFBRSxJQUFFLEtBQUssU0FBUyxPQUFLLGVBQWEsT0FBTyxZQUFVLFNBQVMsa0JBQWdCLElBQUUsU0FBUyxjQUFjLE1BQUssZUFBYSxJQUFFLGFBQVksTUFBSSxFQUFFLFFBQVEsT0FBTyxJQUFFLElBQUUsRUFBRSxPQUFPLEdBQUUsRUFBRSxRQUFRLFVBQVMsRUFBRSxFQUFFLFlBQVksR0FBRyxJQUFFLENBQUMsSUFBRSxJQUFFLElBQUcsSUFBRSxPQUFHO0FBQUMsa0JBQUksSUFBRSxJQUFJO0FBQWUsZ0JBQUUsS0FBSyxPQUFNLEdBQUUsS0FBRTtBQUFFLGdCQUFFLEtBQUssSUFBSTtBQUFFLHFCQUFPLEVBQUU7QUFBQSxZQUFZLEdBQUUsTUFBSSxJQUFFLE9BQUc7QUFBQyxrQkFBSSxJQUFFLElBQUk7QUFBZSxnQkFBRSxLQUFLLE9BQU0sR0FBRSxLQUFFO0FBQUUsZ0JBQUUsZUFBYTtBQUFjLGdCQUFFLEtBQUssSUFBSTtBQUFFLHFCQUFPLElBQUksV0FBVyxFQUFFLFFBQVE7QUFBQSxZQUFDLElBQUcsSUFBRSxDQUFDLEdBQUUsR0FBRSxNQUFJO0FBQUMsa0JBQUksSUFBRSxJQUFJO0FBQWUsZ0JBQUUsS0FBSyxPQUFNLEdBQUUsSUFBRTtBQUFFLGdCQUFFLGVBQ2pmO0FBQWMsZ0JBQUUsU0FBTyxNQUFJO0FBQUMsdUJBQUssRUFBRSxVQUFRLEtBQUcsRUFBRSxVQUFRLEVBQUUsV0FBUyxFQUFFLEVBQUUsUUFBUSxJQUFFLEVBQUU7QUFBQSxjQUFDO0FBQUUsZ0JBQUUsVUFBUTtBQUFFLGdCQUFFLEtBQUssSUFBSTtBQUFBLFlBQUM7QUFBRSxjQUFJLEtBQUcsRUFBRSxTQUFPLFFBQVEsSUFBSSxLQUFLLE9BQU8sR0FBRSxJQUFFLEVBQUUsWUFBVSxRQUFRLE1BQU0sS0FBSyxPQUFPO0FBQUUsaUJBQU8sT0FBTyxHQUFFLENBQUM7QUFBRSxjQUFFO0FBQUssWUFBRSxnQkFBYyxJQUFFLEVBQUU7QUFBYSxjQUFJO0FBQUUsWUFBRSxlQUFhLElBQUUsRUFBRTtBQUFZLGNBQUksZ0JBQWMsRUFBRSxpQkFBZTtBQUFHLHNCQUFVLE9BQU8sZUFBYSxFQUFFLGlDQUFpQztBQUFFLGNBQUksR0FBRSxHQUFFLEtBQUcsT0FBRyxHQUFFLEdBQUUsR0FBRTtBQUNqYSxtQkFBUyxLQUFJO0FBQUMsZ0JBQUksSUFBRSxFQUFFO0FBQU8sY0FBRSxRQUFNLElBQUUsSUFBSSxVQUFVLENBQUM7QUFBRSxjQUFFLFNBQU8sSUFBSSxXQUFXLENBQUM7QUFBRSxjQUFFLFNBQU8sSUFBRSxJQUFJLFdBQVcsQ0FBQztBQUFFLGNBQUUsU0FBTyxJQUFFLElBQUksV0FBVyxDQUFDO0FBQUUsY0FBRSxVQUFRLElBQUksWUFBWSxDQUFDO0FBQUUsY0FBRSxVQUFRLElBQUUsSUFBSSxZQUFZLENBQUM7QUFBRSxjQUFFLFVBQVEsSUFBSSxhQUFhLENBQUM7QUFBRSxjQUFFLFVBQVEsSUFBSSxhQUFhLENBQUM7QUFBQSxVQUFDO0FBQUMsY0FBSSxLQUFHLENBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLENBQUM7QUFBRSxtQkFBUyxLQUFJO0FBQUMsZ0JBQUksSUFBRSxFQUFFLE9BQU8sTUFBTTtBQUFFLGVBQUcsUUFBUSxDQUFDO0FBQUEsVUFBQztBQUFDLGNBQUksSUFBRSxHQUFFLElBQUUsTUFBSyxJQUFFO0FBQy9WLG1CQUFTLEVBQUUsR0FBRTtBQUFDLGdCQUFHLEVBQUU7QUFBUSxnQkFBRSxRQUFRLENBQUM7QUFBRSxnQkFBRSxhQUFXLElBQUU7QUFBSSxjQUFFLENBQUM7QUFBRSxpQkFBRztBQUFHLGdCQUFFLElBQUksWUFBWSxhQUFhLElBQUUsMENBQTBDO0FBQUUsY0FBRSxDQUFDO0FBQUUsa0JBQU07QUFBQSxVQUFFO0FBQUMsbUJBQVMsR0FBRyxHQUFFO0FBQUMsbUJBQU8sRUFBRSxXQUFXLHVDQUF1QztBQUFBLFVBQUM7QUFBQyxjQUFJO0FBQUUsY0FBRTtBQUE4QixjQUFHLENBQUMsR0FBRyxDQUFDLEdBQUU7QUFBQyxnQkFBSSxLQUFHO0FBQUUsZ0JBQUUsRUFBRSxhQUFXLEVBQUUsV0FBVyxJQUFHLENBQUMsSUFBRSxJQUFFO0FBQUEsVUFBRTtBQUFDLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGdCQUFHLEtBQUcsS0FBRztBQUFFLHFCQUFPLElBQUksV0FBVyxDQUFDO0FBQUUsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLENBQUM7QUFBRSxrQkFBSztBQUFBLFVBQWtEO0FBQ3pjLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGdCQUFHLENBQUMsTUFBSSxNQUFJLElBQUc7QUFBQyxrQkFBRyxjQUFZLE9BQU8sU0FBTyxDQUFDLEVBQUUsV0FBVyxTQUFTO0FBQUUsdUJBQU8sTUFBTSxHQUFFLEVBQUMsYUFBWSxjQUFhLENBQUMsRUFBRSxLQUFLLE9BQUc7QUFBQyxzQkFBRyxDQUFDLEVBQUU7QUFBRywwQkFBSyx5Q0FBdUMsSUFBRTtBQUFJLHlCQUFPLEVBQUUsWUFBWTtBQUFBLGdCQUFDLENBQUMsRUFBRSxNQUFNLE1BQUksR0FBRyxDQUFDLENBQUM7QUFBRSxrQkFBRztBQUFFLHVCQUFPLElBQUksUUFBUSxDQUFDLEdBQUUsTUFBSTtBQUFDLG9CQUFFLEdBQUUsT0FBRyxFQUFFLElBQUksV0FBVyxDQUFDLENBQUMsR0FBRSxDQUFDO0FBQUEsZ0JBQUMsQ0FBQztBQUFBLFlBQUM7QUFBQyxtQkFBTyxRQUFRLFFBQVEsRUFBRSxLQUFLLE1BQUksR0FBRyxDQUFDLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLEdBQUcsQ0FBQyxFQUFFLEtBQUssT0FBRyxZQUFZLFlBQVksR0FBRSxDQUFDLENBQUMsRUFBRSxLQUFLLE9BQUcsQ0FBQyxFQUFFLEtBQUssR0FBRSxPQUFHO0FBQUMsZ0JBQUUsNENBQTBDLENBQUM7QUFBRSxnQkFBRSxDQUFDO0FBQUEsWUFBQyxDQUFDO0FBQUEsVUFBQztBQUMxZSxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUU7QUFBRSxtQkFBTyxLQUFHLGNBQVksT0FBTyxZQUFZLHdCQUFzQixHQUFHLENBQUMsS0FBRyxFQUFFLFdBQVcsU0FBUyxLQUFHLE1BQUksY0FBWSxPQUFPLFFBQU0sR0FBRyxHQUFFLEdBQUUsQ0FBQyxJQUFFLE1BQU0sR0FBRSxFQUFDLGFBQVksY0FBYSxDQUFDLEVBQUUsS0FBSyxPQUFHLFlBQVkscUJBQXFCLEdBQUUsQ0FBQyxFQUFFLEtBQUssR0FBRSxTQUFTLEdBQUU7QUFBQyxnQkFBRSxvQ0FBa0MsQ0FBQztBQUFFLGdCQUFFLDJDQUEyQztBQUFFLHFCQUFPLEdBQUcsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLENBQUMsQ0FBQztBQUFBLFVBQUM7QUFBQyxjQUFJLEdBQUUsSUFBRSxPQUFHO0FBQUMsbUJBQUssSUFBRSxFQUFFO0FBQVEsZ0JBQUUsTUFBTSxFQUFFLENBQUM7QUFBQSxVQUFDO0FBQ3haLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGlCQUFLLEtBQUcsSUFBRTtBQUFHLGlCQUFLLEtBQUcsU0FBUyxHQUFFO0FBQUMsZ0JBQUUsS0FBSyxLQUFHLEtBQUcsTUFBSSxDQUFDLElBQUU7QUFBQSxZQUFDO0FBQUUsaUJBQUssS0FBRyxTQUFTLEdBQUU7QUFBQyxnQkFBRSxLQUFLLEtBQUcsS0FBRyxNQUFJLENBQUMsSUFBRTtBQUFBLFlBQUM7QUFBRSxpQkFBSyxLQUFHLFNBQVMsR0FBRSxHQUFFO0FBQUMsbUJBQUssR0FBRztBQUFFLG1CQUFLLEdBQUcsQ0FBQztBQUFFLG1CQUFLLEdBQUcsQ0FBQztBQUFBLFlBQUM7QUFBRSxpQkFBSyxLQUFHLFdBQVU7QUFBQyxnQkFBRSxLQUFLLEtBQUcsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQ25OLGNBQUksS0FBRyxHQUFFLEtBQUcsR0FBRSxLQUFHLGVBQWEsT0FBTyxjQUFZLElBQUksWUFBWSxNQUFNLElBQUUsUUFBTyxLQUFHLENBQUMsR0FBRSxHQUFFLE1BQUk7QUFBQyxtQkFBSztBQUFFLGdCQUFJLElBQUUsSUFBRTtBQUFFLGlCQUFJLElBQUUsR0FBRSxFQUFFLENBQUMsS0FBRyxFQUFFLEtBQUc7QUFBSSxnQkFBRTtBQUFFLGdCQUFHLEtBQUcsSUFBRSxLQUFHLEVBQUUsVUFBUTtBQUFHLHFCQUFPLEdBQUcsT0FBTyxFQUFFLFNBQVMsR0FBRSxDQUFDLENBQUM7QUFBRSxpQkFBSSxJQUFFLElBQUcsSUFBRSxLQUFHO0FBQUMsa0JBQUksSUFBRSxFQUFFLEdBQUc7QUFBRSxrQkFBRyxJQUFFLEtBQUk7QUFBQyxvQkFBSSxJQUFFLEVBQUUsR0FBRyxJQUFFO0FBQUcsb0JBQUcsUUFBTSxJQUFFO0FBQUssdUJBQUcsT0FBTyxjQUFjLElBQUUsT0FBSyxJQUFFLENBQUM7QUFBQSxxQkFBTTtBQUFDLHNCQUFJLElBQUUsRUFBRSxHQUFHLElBQUU7QUFBRyxzQkFBRSxRQUFNLElBQUUsUUFBTSxJQUFFLE9BQUssS0FBRyxLQUFHLElBQUUsS0FBRyxJQUFFLE1BQUksS0FBRyxLQUFHLEtBQUcsS0FBRyxJQUFFLEVBQUUsR0FBRyxJQUFFO0FBQUcsMEJBQU0sSUFBRSxLQUFHLE9BQU8sYUFBYSxDQUFDLEtBQUcsS0FBRyxPQUFNLEtBQUcsT0FBTyxhQUFhLFFBQU0sS0FBRyxJQUFHLFFBQU0sSUFBRSxJQUFJO0FBQUEsZ0JBQUU7QUFBQSxjQUFDO0FBQU0scUJBQUcsT0FBTyxhQUFhLENBQUM7QUFBQSxZQUFDO0FBQUMsbUJBQU87QUFBQSxVQUFDLEdBQ3hnQixJQUFFLENBQUMsR0FBRSxPQUFLLE9BQUssS0FBRyxHQUFHLEdBQUUsR0FBRSxDQUFDLElBQUUsSUFBRyxJQUFFLE9BQUc7QUFBQyxxQkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLElBQUUsRUFBRSxRQUFPLEVBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsRUFBRSxXQUFXLENBQUM7QUFBRSxxQkFBSyxJQUFFLE1BQUksUUFBTSxJQUFFLEtBQUcsSUFBRSxTQUFPLEtBQUcsU0FBTyxLQUFHLEtBQUcsR0FBRSxFQUFFLEtBQUcsS0FBRztBQUFBLFlBQUM7QUFBQyxtQkFBTztBQUFBLFVBQUMsR0FBRSxJQUFFLENBQUMsR0FBRSxHQUFFLEdBQUUsTUFBSTtBQUFDLG1CQUFLO0FBQUUsZ0JBQUcsRUFBRSxJQUFFO0FBQUcscUJBQU87QUFBRSxnQkFBSSxJQUFFO0FBQUUsZ0JBQUUsSUFBRSxJQUFFO0FBQUUscUJBQVEsSUFBRSxHQUFFLElBQUUsRUFBRSxRQUFPLEVBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsRUFBRSxXQUFXLENBQUM7QUFBRSxrQkFBRyxTQUFPLEtBQUcsU0FBTyxHQUFFO0FBQUMsb0JBQUksSUFBRSxFQUFFLFdBQVcsRUFBRSxDQUFDO0FBQUUsb0JBQUUsVUFBUSxJQUFFLFNBQU8sTUFBSSxJQUFFO0FBQUEsY0FBSTtBQUFDLGtCQUFHLE9BQUssR0FBRTtBQUFDLG9CQUFHLEtBQUc7QUFBRTtBQUFNLGtCQUFFLFFBQU0sQ0FBQyxJQUFFO0FBQUEsY0FBQyxPQUFLO0FBQUMsb0JBQUcsUUFBTSxHQUFFO0FBQUMsc0JBQUcsSUFBRSxLQUFHO0FBQUU7QUFBTSxvQkFBRSxRQUFNLENBQUMsSUFBRSxNQUFJLEtBQUc7QUFBQSxnQkFBQyxPQUFLO0FBQUMsc0JBQUcsU0FBTyxHQUFFO0FBQUMsd0JBQUcsSUFBRSxLQUFHO0FBQUU7QUFBTSxzQkFBRSxRQUFNLENBQUMsSUFBRSxNQUFJLEtBQUc7QUFBQSxrQkFBRSxPQUFLO0FBQUMsd0JBQUcsSUFBRSxLQUNuZjtBQUFFO0FBQU0sc0JBQUUsUUFBTSxDQUFDLElBQUUsTUFBSSxLQUFHO0FBQUcsc0JBQUUsUUFBTSxDQUFDLElBQUUsTUFBSSxLQUFHLEtBQUc7QUFBQSxrQkFBRTtBQUFDLG9CQUFFLFFBQU0sQ0FBQyxJQUFFLE1BQUksS0FBRyxJQUFFO0FBQUEsZ0JBQUU7QUFBQyxrQkFBRSxRQUFNLENBQUMsSUFBRSxNQUFJLElBQUU7QUFBQSxjQUFFO0FBQUEsWUFBQztBQUFDLGNBQUUsTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBTyxJQUFFO0FBQUEsVUFBQyxHQUFFLElBQUUsT0FBRyxNQUFJLElBQUUsTUFBSSxNQUFJLElBQUUsT0FBSyxNQUFJLElBQUUsTUFBSyxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUcsR0FBRSxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUcsR0FBRSxLQUFHLE9BQUc7QUFBQyxnQkFBSSxJQUFFLEVBQUUsQ0FBQyxJQUFFLEdBQUUsSUFBRSxHQUFHLENBQUM7QUFBRSxpQkFBRyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBRSxtQkFBTztBQUFBLFVBQUMsR0FBRSxJQUFFLENBQUMsR0FBRSxLQUFHLE1BQUk7QUFBQyxnQkFBRyxDQUFDLEdBQUU7QUFBQyxrQkFBSSxJQUFFLEVBQUMsTUFBSyxZQUFXLFNBQVEsWUFBVyxNQUFLLEtBQUksS0FBSSxLQUFJLE1BQUssa0JBQWlCLE9BQU0sWUFBVSxPQUFPLGFBQVcsVUFBVSxhQUFXLFVBQVUsVUFBVSxDQUFDLEtBQUcsS0FBSztBQUFBLGdCQUFRO0FBQUEsZ0JBQ2xmO0FBQUEsY0FBRyxJQUFFLFVBQVMsR0FBRSxLQUFHLGlCQUFnQixHQUFFO0FBQUUsbUJBQUksS0FBSztBQUFFLDJCQUFTLEVBQUUsQ0FBQyxJQUFFLE9BQU8sRUFBRSxDQUFDLElBQUUsRUFBRSxDQUFDLElBQUUsRUFBRSxDQUFDO0FBQUUsa0JBQUksSUFBRSxDQUFDO0FBQUUsbUJBQUksS0FBSztBQUFFLGtCQUFFLEtBQUssR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRTtBQUFFLGtCQUFFO0FBQUEsWUFBQztBQUFDLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEdBQUUsS0FBRyxDQUFDLE1BQUssQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFFLEtBQUcsQ0FBQyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsRUFBRSxHQUFFLEtBQUcsQ0FBQyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsRUFBRTtBQUFFLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGdCQUFJLElBQUUsTUFBTSxFQUFFLENBQUMsSUFBRSxDQUFDO0FBQUUsY0FBRSxHQUFFLEdBQUUsR0FBRSxFQUFFLE1BQU07QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFDaFQsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMscUJBQVMsRUFBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFJLElBQUUsWUFBVSxPQUFPLElBQUUsRUFBRSxTQUFTLElBQUUsS0FBRyxJQUFHLEVBQUUsU0FBTztBQUFHLG9CQUFFLEVBQUUsQ0FBQyxJQUFFO0FBQUUscUJBQU87QUFBQSxZQUFDO0FBQUMscUJBQVMsRUFBRSxHQUFFLEdBQUU7QUFBQyxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFHO0FBQUEsWUFBQztBQUFDLHFCQUFTLEVBQUUsR0FBRSxHQUFFO0FBQUMsdUJBQVMsRUFBRSxJQUFHO0FBQUMsdUJBQU8sSUFBRSxLQUFHLEtBQUcsSUFBRSxLQUFHLElBQUU7QUFBQSxjQUFDO0FBQUMsa0JBQUk7QUFBRSxxQkFBSyxJQUFFLEVBQUUsRUFBRSxZQUFZLElBQUUsRUFBRSxZQUFZLENBQUMsTUFBSSxPQUFLLElBQUUsRUFBRSxFQUFFLFNBQVMsSUFBRSxFQUFFLFNBQVMsQ0FBQyxPQUFLLElBQUUsRUFBRSxFQUFFLFFBQVEsSUFBRSxFQUFFLFFBQVEsQ0FBQztBQUFHLHFCQUFPO0FBQUEsWUFBQztBQUFDLHFCQUFTLEVBQUUsR0FBRTtBQUFDLHNCQUFPLEVBQUUsT0FBTyxHQUFFO0FBQUEsZ0JBQUMsS0FBSztBQUFFLHlCQUFPLElBQUksS0FBSyxFQUFFLFlBQVksSUFBRSxHQUFFLElBQUcsRUFBRTtBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTztBQUFBLGdCQUFFLEtBQUs7QUFBRSx5QkFBTyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDO0FBQUEsZ0JBQUUsS0FBSztBQUFFLHlCQUFPLElBQUk7QUFBQSxvQkFBSyxFQUFFLFlBQVk7QUFBQSxvQkFDNWY7QUFBQSxvQkFBRTtBQUFBLGtCQUFDO0FBQUEsZ0JBQUUsS0FBSztBQUFFLHlCQUFPLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUM7QUFBQSxnQkFBRSxLQUFLO0FBQUUseUJBQU8sSUFBSSxLQUFLLEVBQUUsWUFBWSxJQUFFLEdBQUUsSUFBRyxFQUFFO0FBQUEsZ0JBQUUsS0FBSztBQUFFLHlCQUFPLElBQUksS0FBSyxFQUFFLFlBQVksSUFBRSxHQUFFLElBQUcsRUFBRTtBQUFBLGNBQUM7QUFBQSxZQUFDO0FBQUMscUJBQVMsRUFBRSxHQUFFO0FBQUMsa0JBQUksSUFBRSxFQUFFO0FBQUcsbUJBQUksSUFBRSxJQUFJLEtBQU0sSUFBSSxLQUFLLEVBQUUsS0FBRyxNQUFLLEdBQUUsQ0FBQyxFQUFHLFFBQVEsQ0FBQyxHQUFFLElBQUUsS0FBRztBQUFDLG9CQUFJLElBQUUsRUFBRSxTQUFTLEdBQUUsS0FBRyxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUUsS0FBRyxJQUFJLENBQUM7QUFBRSxvQkFBRyxJQUFFLElBQUUsRUFBRSxRQUFRO0FBQUUsdUJBQUcsSUFBRSxFQUFFLFFBQVEsSUFBRSxHQUFFLEVBQUUsUUFBUSxDQUFDLEdBQUUsS0FBRyxJQUFFLEVBQUUsU0FBUyxJQUFFLENBQUMsS0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFFLEVBQUUsWUFBWSxFQUFFLFlBQVksSUFBRSxDQUFDO0FBQUEscUJBQU87QUFBQyxvQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFFLENBQUM7QUFBRTtBQUFBLGdCQUFLO0FBQUEsY0FBQztBQUFDLGtCQUFFLElBQUksS0FBSyxFQUFFLFlBQVksSUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLGtCQUFFLEVBQUUsSUFBSTtBQUFBLGdCQUFLLEVBQUUsWUFBWTtBQUFBLGdCQUNuZjtBQUFBLGdCQUFFO0FBQUEsY0FBQyxDQUFDO0FBQUUsa0JBQUUsRUFBRSxDQUFDO0FBQUUscUJBQU8sS0FBRyxFQUFFLEdBQUUsQ0FBQyxJQUFFLEtBQUcsRUFBRSxHQUFFLENBQUMsSUFBRSxFQUFFLFlBQVksSUFBRSxJQUFFLEVBQUUsWUFBWSxJQUFFLEVBQUUsWUFBWSxJQUFFO0FBQUEsWUFBQztBQUFDLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUsZ0JBQUksSUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUM7QUFBRSxnQkFBRSxFQUFDLElBQUcsRUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsSUFBRSxFQUFFLENBQUMsSUFBRSxHQUFFO0FBQUUsZ0JBQUUsRUFBRSxDQUFDO0FBQUUsZ0JBQUU7QUFBQSxjQUFDLE1BQUs7QUFBQSxjQUF1QixNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBSyxNQUFLO0FBQUEsY0FBYyxNQUFLO0FBQUEsY0FBUSxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FDbmYsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLFlBQUk7QUFBRSxxQkFBUSxLQUFLO0FBQUUsa0JBQUUsRUFBRSxRQUFRLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRSxFQUFFLENBQUMsQ0FBQztBQUFFLGdCQUFJLEtBQUcsMkRBQTJELE1BQU0sR0FBRyxHQUFFLEtBQUcsd0ZBQXdGLE1BQU0sR0FBRztBQUFFLGdCQUFFLEVBQUMsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsR0FBRSxNQUFLLE9BQ2xmLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsR0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEtBQUcsUUFBTSxNQUFJLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRyxHQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxPQUFHO0FBQUMsa0JBQUUsRUFBRTtBQUFHLG1CQUFHLElBQUUsSUFBRSxLQUFHLEtBQUcsTUFBSSxLQUFHO0FBQUkscUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxZQUFDLEdBQUUsTUFBSyxPQUFHO0FBQUMsdUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFHLEVBQUUsS0FBRyxHQUFFLE1BQUksRUFBRSxFQUFFLEtBQUcsSUFBSSxJQUFFLEtBQUcsSUFBSSxHQUFHO0FBQUU7QUFBQyxxQkFBTyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxZQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxNQUFJLE1BQUssTUFBSyxPQUFHLEtBQUcsRUFBRSxNQUFJLEtBQUcsRUFBRSxLQUFHLE9BQUssTUFBSyxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssTUFBSSxLQUFLLE1BQUssT0FBRyxFQUFFLE1BQUksR0FBRSxNQUFLLE9BQUcsRUFBRSxLQUFLLE9BQU8sRUFBRSxLQUFHLElBQUUsRUFBRSxNQUFJLENBQUMsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUNyZjtBQUFDLGtCQUFJLElBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQztBQUFFLG9CQUFJLEVBQUUsS0FBRyxNQUFJLEVBQUUsS0FBRyxLQUFHLEtBQUc7QUFBSSxrQkFBRztBQUFFLHNCQUFJLE1BQUksS0FBRyxFQUFFLEtBQUcsTUFBSSxFQUFFLE1BQUksR0FBRSxLQUFHLEtBQUcsS0FBRyxLQUFHLEVBQUUsRUFBRSxFQUFFLE1BQUksSUFBRTtBQUFBLG1CQUFRO0FBQUMsb0JBQUU7QUFBRyxvQkFBSSxLQUFHLEVBQUUsS0FBRyxJQUFFLEVBQUUsS0FBRyxLQUFHO0FBQUUsaUJBQUMsS0FBRyxLQUFHLEtBQUcsS0FBRyxFQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsTUFBSTtBQUFBLGNBQUc7QUFBQyxxQkFBTyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxJQUFHLE1BQUssT0FBRyxFQUFFLEtBQUssT0FBTyxFQUFFLEtBQUcsS0FBRyxFQUFFLEtBQUcsS0FBRyxLQUFHLENBQUMsR0FBRSxDQUFDLEdBQUUsTUFBSyxRQUFJLEVBQUUsS0FBRyxNQUFNLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxLQUFHLE1BQUssTUFBSyxPQUFHO0FBQUMsa0JBQUUsRUFBRTtBQUFHLGtCQUFJLElBQUUsS0FBRztBQUFFLGtCQUFFLEtBQUssSUFBSSxDQUFDLElBQUU7QUFBRyxzQkFBTyxJQUFFLE1BQUksT0FBSyxPQUFPLFVBQVEsSUFBRSxL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QUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFFBQVE7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsWUFBWSxJQUFFO0FBQUssZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsT0FBTztBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUNwZixDQUFDLEtBQUcsRUFBRSxFQUFFLFlBQVksQ0FBQyxJQUFFLEtBQUcsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFFLEVBQUUsUUFBUSxJQUFFLElBQUU7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxLQUFHLEVBQUUsa0JBQWtCO0FBQUcsa0JBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUFFLGtCQUFJLElBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsS0FBRyxLQUFHLEtBQUcsRUFBRSxrQkFBa0IsS0FBRyxLQUFLLElBQUksR0FBRSxDQUFDLEtBQUc7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRTtBQUFDLHFCQUFLO0FBQUUsa0JBQUksSUFBRSxJQUFJLEtBQUssRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsTUFBSyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsQ0FBQyxHQUFFLElBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRSxFQUFFLGtC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QUFBRSxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFDOWQsbUJBQVMsR0FBRyxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsY0FBSSxLQUFHLE9BQUc7QUFBQyxnQkFBRyxDQUFDO0FBQUUsa0JBQUc7QUFBQyxvQkFBRyxFQUFFLEdBQUUsQ0FBQyxFQUFFO0FBQUUsc0JBQUc7QUFBQyx3QkFBRSxHQUFHLENBQUMsSUFBRSxHQUFHLENBQUM7QUFBQSxrQkFBQyxTQUFPLEdBQUU7QUFBQyxpQ0FBYSxLQUFHLFlBQVUsS0FBRyxFQUFFLEdBQUUsQ0FBQztBQUFBLGtCQUFDO0FBQUEsY0FBQyxTQUFPLEdBQUU7QUFBQyw2QkFBYSxLQUFHLFlBQVUsS0FBRyxFQUFFLEdBQUUsQ0FBQztBQUFBLGNBQUM7QUFBQSxVQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFO0FBQUMsbUJBQUs7QUFBRSwyQkFBYSxPQUFPLFFBQVEsT0FBSyxRQUFRLEdBQUcsRUFBRSxHQUFFLEtBQUcsR0FBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUMsR0FBRSxLQUFHLEtBQUksUUFBUSxNQUFNLEVBQUUsR0FBRSxLQUFHLEdBQUUsQ0FBQztBQUFBLFVBQUU7QUFBQyxZQUFFLG9DQUFrQztBQUFHLG1CQUFTLElBQUc7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxrQkFBSSxHQUFHLENBQUMsR0FBRSxHQUFHLE1BQUksR0FBRyxDQUFDO0FBQUEsVUFBRTtBQUFDLFlBQUUsZUFBYTtBQUM5ZSxjQUFJLElBQUUsT0FBRyxNQUFJLElBQUUsTUFBSSxNQUFJLElBQUUsT0FBSyxNQUFJLElBQUUsTUFBSyxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUcsR0FBRSxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUc7QUFBRSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFHO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLGNBQUksS0FBRyxPQUFHO0FBQUMsZ0JBQUksSUFBRSxHQUFHLENBQUMsSUFBRSxHQUFFLElBQUUsR0FBRyxDQUFDO0FBQUUsaUJBQUcsR0FBRyxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEtBQUcsT0FBRztBQUFDLGdCQUFJLElBQUUsR0FBRztBQUFFLGdCQUFFLEVBQUU7QUFBRSxlQUFHLENBQUM7QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFDdFcsbUJBQVMsRUFBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLFVBQVUsU0FBTyxHQUFFLElBQUU7QUFBVSxtQkFBTyxHQUFHLE1BQUk7QUFBQyx1QkFBUSxJQUFFLEdBQUcsSUFBRSxDQUFDLEdBQUUsSUFBRSxLQUFHLEdBQUUsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsb0JBQUksSUFBRSxFQUFFLElBQUUsQ0FBQztBQUFFLG1CQUFHLEVBQUUsSUFBRSxNQUFJLENBQUMsSUFBRTtBQUFBLGNBQUM7QUFBQyxxQkFBTyxHQUFHLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLENBQUM7QUFBQSxVQUFDO0FBQzNKLGNBQUksS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxNQUFJO0FBQUMsZ0JBQUcsQ0FBQyxJQUFHO0FBQUMsa0JBQUksSUFBRSxFQUFDLE1BQUssWUFBVyxTQUFRLFlBQVcsTUFBSyxLQUFJLEtBQUksS0FBSSxNQUFLLGtCQUFpQixPQUFNLFlBQVUsT0FBTyxhQUFXLFVBQVUsYUFBVyxVQUFVLFVBQVUsQ0FBQyxLQUFHLEtBQUssUUFBUSxLQUFJLEdBQUcsSUFBRSxVQUFTLEdBQUUsTUFBSSxpQkFBZ0IsR0FBRTtBQUFFLG1CQUFJLEtBQUs7QUFBRywyQkFBUyxHQUFHLENBQUMsSUFBRSxPQUFPLEVBQUUsQ0FBQyxJQUFFLEVBQUUsQ0FBQyxJQUFFLEdBQUcsQ0FBQztBQUFFLGtCQUFJLElBQUUsQ0FBQztBQUFFLG1CQUFJLEtBQUs7QUFBRSxrQkFBRSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFBRSxtQkFBRztBQUFBLFlBQUM7QUFBQyxtQkFBTztBQUFBLFVBQUUsR0FBRTtBQUN0VyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUU7QUFBRSxlQUFHLEVBQUUsUUFBUSxTQUFTLEdBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsSUFBRTtBQUFFLGtCQUFFLEVBQUUsRUFBRSxJQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFJLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxFQUFFO0FBQUUsbUJBQUcsRUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVyxDQUFDO0FBQUUsaUJBQUcsRUFBRSxLQUFHLE1BQUksQ0FBQyxJQUFFO0FBQUUsbUJBQUcsRUFBRSxTQUFPO0FBQUEsWUFBQyxDQUFDO0FBQUUsbUJBQU87QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxnQkFBSSxJQUFFLEdBQUc7QUFBRSxjQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFO0FBQU8sZ0JBQUksSUFBRTtBQUFFLGNBQUUsUUFBUSxTQUFTLEdBQUU7QUFBQyxtQkFBRyxFQUFFLFNBQU87QUFBQSxZQUFDLENBQUM7QUFBRSxjQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFPO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUNqZCxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFFO0FBQUMsY0FBSSxLQUFHLENBQUMsTUFBSyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUscUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBSTtBQUFDLGtCQUFJLElBQUUsRUFBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsSUFBRSxFQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQztBQUFFLG1CQUFHO0FBQUUsdUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsb0JBQUksSUFBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLENBQUMsR0FBRSxJQUFFLEdBQUcsQ0FBQztBQUFFLHNCQUFJLEtBQUcsT0FBSyxNQUFJLE1BQUksSUFBRSxLQUFHLEdBQUcsR0FBRyxHQUFFLENBQUMsQ0FBQyxHQUFF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QUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLG9CQUFFLEVBQUU7QUFBRyxxQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHVCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsY0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHO0FBQUMseUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFHLEVBQUUsS0FBRyxHQUFFLE1BQUksRUFBRSxFQUFFLEtBQUcsSUFBSSxJQUFFLEtBQUcsSUFBSSxHQUFHO0FBQUU7QUFBQyx1QkFBTyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQztBQUFBLGNBQUUsTUFBSyxNQUFJO0FBQUEsY0FBSyxNQUFLLE9BQUcsS0FBRyxFQUFFLE1BQUksS0FBRyxFQUFFLEtBQUcsT0FBSztBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssTUFBSTtBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsTUFBSTtBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FDeGYsSUFBRSxFQUFFLE1BQUksQ0FBQyxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLG9CQUFJLElBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQztBQUFFLHNCQUFJLEVBQUUsS0FBRyxNQUFJLEVBQUUsS0FBRyxLQUFHLEtBQUc7QUFBSSxvQkFBRztBQUFFLHdCQUFJLE1BQUksS0FBRyxFQUFFLEtBQUcsTUFBSSxFQUFFLE1BQUksR0FBRSxLQUFHLEtBQUcsS0FBRyxLQUFHLEVBQUUsRUFBRSxFQUFFLE1BQUksSUFBRTtBQUFBLHFCQUFRO0FBQUMsc0JBQUU7QUFBRyxzQkFBSSxLQUFHLEVBQUUsS0FBRyxJQUFFLEVBQUUsS0FBRyxLQUFHO0FBQUUsbUJBQUMsS0FBRyxLQUFHLEtBQUcsS0FBRyxFQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsTUFBSTtBQUFBLGdCQUFHO0FBQUMsdUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRTtBQUFBLGNBQUcsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQyxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssUUFBSSxFQUFFLEtBQUcsTUFBTSxTQUFTLEVBQUUsVUFBVSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxLQUFHO0FBQUEsY0FBSyxNQUFLLE9BQUc7QUFBQyxvQkFBRSxFQUFFO0FBQUcsb0JBQUksSUFBRSxLQUFHO0FBQUUsb0JBQUUsS0FBSyxJQUFJLENBQUMsSUFBRTtBQUFHLHdCQUFPLElBQUUsTUFBSSxPQUFLLE9BQU8sVUFBUSxJQUFFLEtBQUcsTUFBSSxJQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRTtBQUFBLGNBQUcsTUFBSyxNQUFJO0FBQUEsWUFBRztBQUFFLGdCQUFFLEVBQUU7QUFBQSxjQUFRO0FBQUEsY0FDbmY7QUFBQSxZQUFVO0FBQUUsaUJBQUksS0FBSztBQUFFLGdCQUFFLFNBQVMsQ0FBQyxNQUFJLElBQUUsRUFBRSxRQUFRLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBRyxnQkFBRSxFQUFFLFFBQVEsU0FBUSxHQUFHO0FBQUUsZ0JBQUUsR0FBRyxDQUFDO0FBQUUsZ0JBQUcsRUFBRSxTQUFPO0FBQUUscUJBQU87QUFBRSxlQUFHLEdBQUUsQ0FBQztBQUFFLG1CQUFPLEVBQUUsU0FBTztBQUFBLFVBQUM7QUFBQyxZQUFFLEdBQUc7QUFDdEssY0FBSSxLQUFHLENBQUMsTUFBSyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsRUFBRSxHQUFFLEtBQUc7QUFBQSxZQUFDLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUsY0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFHLEdBQUcsTUFBSSxHQUFFLE1BQUksQ0FBQztBQUFFLG1CQUFHO0FBQUU7QUFBSyxvQkFBTTtBQUFBLFlBQUc7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMsaUJBQUcsTUFBSSxHQUFFLENBQUMsR0FBRSxHQUFFLENBQUMsSUFBRyxRQUFPLEtBQUU7QUFBRSxnQkFBRSxHQUFHO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxxQkFBSztBQUFFLGtCQUFFLFlBQVksRUFBQyxLQUFJLGlCQUFnQixRQUFPLEVBQUMsQ0FBQyxJQUFFLEdBQUcsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUUsTUFBSTtBQUFBLFlBQUcsR0FBRSxTQUFTLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUsbUJBQUcsTUFBSSxJQUFFLFdBQVcsTUFBSSxFQUFFLENBQUMsSUFBRSxJQUFFLFlBQVksRUFBQyxjQUFhLEdBQUUsS0FBSSxlQUFjLENBQUMsS0FBRyxJQUFFLEVBQUUsR0FBRyxDQUFDLE1BQUksRUFBRSxZQUFZLEVBQUMsS0FBSSxlQUFjLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFDdmdCLEdBQUUsV0FBVTtBQUFDLHFCQUFNO0FBQUEsWUFBRTtBQUFBLFlBQUUsR0FBRTtBQUFBLFlBQUcsR0FBRSxTQUFTLEdBQUU7QUFBQyxtQkFBRyxFQUFFLEdBQUcsTUFBSSxDQUFDLEVBQUUsSUFBSTtBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLGtCQUFFLElBQUUsWUFBVSxJQUFFLFVBQVEsQ0FBQyxDQUFDLEtBQUcsTUFBSSxLQUFHLGFBQVcsSUFBRTtBQUFJLHFCQUFLO0FBQUUsa0JBQUUsSUFBSSxLQUFLLE1BQUksQ0FBQztBQUFFLGdCQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLGVBQWUsSUFBRTtBQUFLLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsVUFBVTtBQUFFLG1CQUFHLEVBQUUsUUFBUSxJQUFFLEtBQUssSUFBSSxFQUFFLGVBQWUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxLQUFHLFFBQU07QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLGtCQUFFLElBQ3BmLFlBQVUsSUFBRSxVQUFRLENBQUMsQ0FBQyxLQUFHLE1BQUksS0FBRyxhQUFXLElBQUU7QUFBSSxxQkFBSztBQUFFLGtCQUFFLElBQUksS0FBSyxNQUFJLENBQUM7QUFBRSxnQkFBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxRQUFRO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxZQUFZLElBQUU7QUFBSyxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLE9BQU87QUFBRSxtQkFBRyxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUUsS0FBRyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUUsRUFBRSxRQUFRLElBQUUsSUFBRTtBQUFFLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxLQUFHLEVBQUUsa0JBQWtCO0FBQUcsa0JBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUFFLGtCQUFJLElBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUN6Z0IsbUJBQUcsS0FBRyxLQUFHLEVBQUUsa0JBQWtCLEtBQUcsS0FBSyxJQUFJLEdBQUUsQ0FBQyxLQUFHO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRTtBQUFDLHFCQUFLO0FBQUUsa0JBQUksSUFBRSxJQUFJLEtBQUssRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxNQUFLLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxFQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLEVBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsRUFBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsQ0FBQyxHQUFFLElBQUUsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFFLEVBQUUsa0JBQWtCLEdBQUUsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRSxLQUFLLElBQUksR0FBRSxDQUFDO0FBQUUsa0JBQUUsSUFBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLE9BQU8sS0FBRyxLQUFHLEtBQUcsQ0FBQyxJQUFFLElBQUUsTUFBSSxLQUFHLE9BQUssSUFBRSxLQUFLLElBQUksR0FBRSxDQUFDLEdBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxJQUFFLFFBQU0sSUFBRSxJQUFFLElBQUUsS0FBRyxFQUFFO0FBQUcsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFDbmYsQ0FBQyxJQUFFLEVBQUUsT0FBTztBQUFFLG1CQUFHLEVBQUUsRUFBRSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxnQkFBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxRQUFRO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxRQUFRO0FBQUUsa0JBQUUsRUFBRSxRQUFRLElBQUU7QUFBSSxxQkFBTyxJQUFJLElBQUUsR0FBRSxLQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBRSxJQUFFLElBQUUsQ0FBQyxLQUFLLE1BQU0sSUFBRSxVQUFVLE1BQUksSUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sSUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFJLE1BQUksVUFBVSxNQUFJLElBQUUsRUFBRSxHQUFFLE1BQUk7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyx1QkFBUyxFQUFFLEdBQUU7QUFBQyx3QkFBTyxJQUFFLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLEtBQ3BmLEVBQUUsQ0FBQyxJQUFFO0FBQUEsY0FBSztBQUFDLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxxQkFBSztBQUFFLGtCQUFJLEtBQUcsb0JBQUksUUFBTSxZQUFZLEdBQUUsSUFBRSxJQUFJLEtBQUssR0FBRSxHQUFFLENBQUMsR0FBRSxJQUFFLElBQUksS0FBSyxHQUFFLEdBQUUsQ0FBQztBQUFFLGtCQUFFLEVBQUUsa0JBQWtCO0FBQUUsa0JB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LDBCQUFZLEVBQUMsTUFBTSxLQUFLLGdCQUFlLENBQW1CO0FBQUEsWUFDNUQ7QUFBQSxZQUNBLFNBQU87QUFDTCwwQkFBWSxFQUFDLE1BQU0sSUFBRyxDQUFDO0FBQUEsWUFDekI7QUFBQSxVQUFDO0FBQ1Q7QUFBQSxRQUNGO0FBQUEsUUFDQSxLQUFLO0FBQ0gseUJBQWUsT0FBUTtBQUN2QixzQkFBWSxFQUFDLEtBQUksQ0FBQztBQUNsQjtBQUFBLFFBQ0YsS0FBSyxPQUFPO0FBQ1YsZ0JBQU0sRUFBQyxXQUFXLGNBQWMsUUFBUSxlQUFlLFFBQU8sSUFBSTtBQUNsRSxjQUFJLFdBQVcsY0FBYyxRQUFRLGVBQWUsSUFBSSxNQUFNLGNBQWMsTUFBTSxFQUFFLEtBQUssSUFBSSxHQUFHLE9BQU8sRUFDbEc7QUFBQSxZQUNHLGFBQVc7QUFDVCxrQkFBSSxRQUFRLEtBQUssT0FBSyxFQUFFLENBQUMsTUFBTSxLQUFLLEdBQUc7QUFDckMsNEJBQVksRUFBQyxNQUFNLEtBQUssa0RBQWlELENBQUM7QUFBQSxjQUM1RSxPQUFPO0FBQ0w7QUFBQSxrQkFDSSxFQUFDLE1BQU0sS0FBSyxRQUFPO0FBQUEsa0JBQ25CLDJCQUEyQixPQUF1QztBQUFBLGdCQUFDO0FBQUEsY0FDekU7QUFBQSxZQUNGO0FBQUEsWUFDQSxTQUFPO0FBQ0wsMEJBQVksRUFBQyxNQUFNLElBQUcsQ0FBQztBQUFBLFlBQ3pCO0FBQUEsVUFBQztBQUNUO0FBQUEsUUFDRjtBQUFBLFFBQ0EsS0FBSztBQUNILHVCQUFhLE9BQVE7QUFDckIsc0JBQVksRUFBQyxLQUFJLENBQUM7QUFDbEI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsU0FBUyxLQUFLO0FBQ1osa0JBQVksRUFBQyxNQUFNLElBQUcsQ0FBbUI7QUFBQSxJQUMzQztBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbImpvaW4iLCAid2FzbSIsICJ3YXNtIiwgIndhc20iLCAicmVhZEZpbGUiLCAicmVhZEZpbGUiLCAid2FzbSIsICJ0ZW5zb3IiLCAiZXJyb3JDb2RlIiwgImkiXQp9Cg==\n';
  }
});

// web/lib/wasm/proxy-wrapper.ts
var isProxy, proxyWorker, initializing2, initialized2, aborted2, initWasmCallbacks, queuedCallbacks, enqueueCallbacks, ensureWorker, onProxyWorkerMessage, scriptSrc, initializeWebAssemblyAndOrtRuntime, initializeOrtEp, copyFromExternalBuffer2, createSession2, releaseSession2, run2, endProfiling2;
var init_proxy_wrapper = __esm({
  "web/lib/wasm/proxy-wrapper.ts"() {
    "use strict";
    init_esm();
    init_wasm_core_impl();
    init_wasm_factory();
    isProxy = () => !!env2.wasm.proxy && typeof document !== "undefined";
    initializing2 = false;
    initialized2 = false;
    aborted2 = false;
    queuedCallbacks = /* @__PURE__ */ new Map();
    enqueueCallbacks = (type, callbacks) => {
      const queue = queuedCallbacks.get(type);
      if (queue) {
        queue.push(callbacks);
      } else {
        queuedCallbacks.set(type, [callbacks]);
      }
    };
    ensureWorker = () => {
      if (initializing2 || !initialized2 || aborted2 || !proxyWorker) {
        throw new Error("worker not ready");
      }
    };
    onProxyWorkerMessage = (ev) => {
      switch (ev.data.type) {
        case "init-wasm":
          initializing2 = false;
          if (ev.data.err) {
            aborted2 = true;
            initWasmCallbacks[1](ev.data.err);
          } else {
            initialized2 = true;
            initWasmCallbacks[0]();
          }
          break;
        case "init-ep":
        case "copy-from":
        case "create":
        case "release":
        case "run":
        case "end-profiling": {
          const callbacks = queuedCallbacks.get(ev.data.type);
          if (ev.data.err) {
            callbacks.shift()[1](ev.data.err);
          } else {
            callbacks.shift()[0](ev.data.out);
          }
          break;
        }
        default:
      }
    };
    scriptSrc = typeof document !== "undefined" ? document?.currentScript?.src : void 0;
    initializeWebAssemblyAndOrtRuntime = async () => {
      if (initialized2) {
        return;
      }
      if (initializing2) {
        throw new Error("multiple calls to 'initWasm()' detected.");
      }
      if (aborted2) {
        throw new Error("previous call to 'initWasm()' failed.");
      }
      initializing2 = true;
      if (isProxy()) {
        if (env2.wasm.wasmPaths === void 0) {
          if (scriptSrc && scriptSrc.indexOf("blob:") !== 0) {
            env2.wasm.wasmPaths = scriptSrc.substr(0, +scriptSrc.lastIndexOf("/") + 1);
          }
        }
        return new Promise((resolve, reject) => {
          proxyWorker?.terminate();
          const workerUrl = URL.createObjectURL(new Blob(
            [
              // This require() function is handled by esbuild plugin to load file content as string.
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              require_main()
            ],
            { type: "text/javascript" }
          ));
          proxyWorker = new Worker(workerUrl, { name: "ort-wasm-proxy-worker" });
          proxyWorker.onerror = (ev) => reject(ev);
          proxyWorker.onmessage = onProxyWorkerMessage;
          URL.revokeObjectURL(workerUrl);
          initWasmCallbacks = [resolve, reject];
          const message = { type: "init-wasm", in: env2 };
          proxyWorker.postMessage(message);
        });
      } else {
        try {
          await initializeWebAssembly(env2.wasm);
          await initRuntime(env2);
          initialized2 = true;
        } catch (e) {
          aborted2 = true;
          throw e;
        } finally {
          initializing2 = false;
        }
      }
    };
    initializeOrtEp = async (epName) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("init-ep", [resolve, reject]);
          const message = { type: "init-ep", in: { epName, env: env2 } };
          proxyWorker.postMessage(message);
        });
      } else {
        await initEp(env2, epName);
      }
    };
    copyFromExternalBuffer2 = async (buffer) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("copy-from", [resolve, reject]);
          const message = { type: "copy-from", in: { buffer } };
          proxyWorker.postMessage(message, [buffer.buffer]);
        });
      } else {
        return copyFromExternalBuffer(buffer);
      }
    };
    createSession2 = async (model, options) => {
      if (isProxy()) {
        if (options?.preferredOutputLocation) {
          throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("create", [resolve, reject]);
          const message = { type: "create", in: { model, options } };
          const transferable = [];
          if (model instanceof Uint8Array) {
            transferable.push(model.buffer);
          }
          proxyWorker.postMessage(message, transferable);
        });
      } else {
        return createSession(model, options);
      }
    };
    releaseSession2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("release", [resolve, reject]);
          const message = { type: "release", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        releaseSession(sessionId);
      }
    };
    run2 = async (sessionId, inputIndices, inputs, outputIndices, outputs, options) => {
      if (isProxy()) {
        if (inputs.some((t) => t[3] !== "cpu")) {
          throw new Error("input tensor on GPU is not supported for proxy.");
        }
        if (outputs.some((t) => t)) {
          throw new Error("pre-allocated output tensor is not supported for proxy.");
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("run", [resolve, reject]);
          const serializableInputs = inputs;
          const message = { type: "run", in: { sessionId, inputIndices, inputs: serializableInputs, outputIndices, options } };
          proxyWorker.postMessage(message, extractTransferableBuffers(serializableInputs));
        });
      } else {
        return run(sessionId, inputIndices, inputs, outputIndices, outputs, options);
      }
    };
    endProfiling2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("end-profiling", [resolve, reject]);
          const message = { type: "end-profiling", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        endProfiling(sessionId);
      }
    };
  }
});

// web/lib/wasm/session-handler-inference.ts
var encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
var init_session_handler_inference = __esm({
  "web/lib/wasm/session-handler-inference.ts"() {
    "use strict";
    init_esm();
    init_proxy_wrapper();
    init_wasm_common();
    init_wasm_utils_load_file();
    encodeTensorMetadata = (tensor, getName) => {
      switch (tensor.location) {
        case "cpu":
          return [tensor.type, tensor.dims, tensor.data, "cpu"];
        case "gpu-buffer":
          return [tensor.type, tensor.dims, { gpuBuffer: tensor.gpuBuffer }, "gpu-buffer"];
        default:
          throw new Error(`invalid data location: ${tensor.location} for ${getName()}`);
      }
    };
    decodeTensorMetadata = (tensor) => {
      switch (tensor[3]) {
        case "cpu":
          return new Tensor2(tensor[0], tensor[2], tensor[1]);
        case "gpu-buffer": {
          const dataType = tensor[0];
          if (!isGpuBufferSupportedType(dataType)) {
            throw new Error(`not supported data type: ${dataType} for deserializing GPU tensor`);
          }
          const { gpuBuffer, download, dispose } = tensor[2];
          return Tensor2.fromGpuBuffer(gpuBuffer, { dataType, dims: tensor[1], download, dispose });
        }
        default:
          throw new Error(`invalid data location: ${tensor[3]}`);
      }
    };
    OnnxruntimeWebAssemblySessionHandler = class {
      async fetchModelAndCopyToWasmMemory(path) {
        return copyFromExternalBuffer2(await loadFile(path));
      }
      async loadModel(pathOrBuffer, options) {
        TRACE_FUNC_BEGIN();
        let model;
        if (typeof pathOrBuffer === "string") {
          if (typeof process !== "undefined" && process.versions && process.versions.node) {
            model = await loadFile(pathOrBuffer);
          } else {
            model = await this.fetchModelAndCopyToWasmMemory(pathOrBuffer);
          }
        } else {
          model = pathOrBuffer;
        }
        [this.sessionId, this.inputNames, this.outputNames] = await createSession2(model, options);
        TRACE_FUNC_END();
      }
      async dispose() {
        return releaseSession2(this.sessionId);
      }
      async run(feeds, fetches, options) {
        TRACE_FUNC_BEGIN();
        const inputArray = [];
        const inputIndices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.inputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}'`);
          }
          inputArray.push(tensor);
          inputIndices.push(index);
        });
        const outputArray = [];
        const outputIndices = [];
        Object.entries(fetches).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.outputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid output '${name}'`);
          }
          outputArray.push(tensor);
          outputIndices.push(index);
        });
        const inputs = inputArray.map((t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`));
        const outputs = outputArray.map(
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await run2(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        TRACE_FUNC_END();
        return resultMap;
      }
      startProfiling() {
      }
      endProfiling() {
        void endProfiling2(this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm.ts
var initializeFlags, OnnxruntimeWebAssemblyBackend;
var init_backend_wasm = __esm({
  "web/lib/backend-wasm.ts"() {
    "use strict";
    init_node_os();
    init_esm();
    init_proxy_wrapper();
    init_session_handler_inference();
    initializeFlags = () => {
      if (typeof env2.wasm.initTimeout !== "number" || env2.wasm.initTimeout < 0) {
        env2.wasm.initTimeout = 0;
      }
      if (typeof env2.wasm.simd !== "boolean") {
        env2.wasm.simd = true;
      }
      if (typeof env2.wasm.proxy !== "boolean") {
        env2.wasm.proxy = false;
      }
      if (typeof env2.wasm.trace !== "boolean") {
        env2.wasm.trace = false;
      }
      if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
        if (typeof self !== "undefined" && !self.crossOriginIsolated || typeof process !== "undefined" && process.versions && process.versions.node) {
          env2.wasm.numThreads = 1;
        }
        const numCpuLogicalCores = typeof navigator === "undefined" ? cpus().length : navigator.hardwareConcurrency;
        env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
      }
    };
    OnnxruntimeWebAssemblyBackend = class {
      /**
       * This function initializes the WebAssembly backend.
       *
       * This function will be called only once for each backend name. It will be called the first time when
       * `ort.InferenceSession.create()` is called with a registered backend name.
       *
       * @param backendName - the registered backend name.
       */
      async init(backendName) {
        initializeFlags();
        await initializeWebAssemblyAndOrtRuntime();
        await initializeOrtEp(backendName);
      }
      async createInferenceSessionHandler(pathOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblySessionHandler();
        await handler.loadModel(pathOrBuffer, options);
        return Promise.resolve(handler);
      }
    };
  }
});

// web/lib/wasm/wasm-training-core-impl.ts
var NO_TRAIN_FUNCS_MSG, ifErrCodeCheckLastError, createCheckpointHandle, getModelInputOutputCount, getModelInputOutputNamesLoop, getModelInputOutputNames, createTrainingSessionHandle, createAndAllocateTensors, moveOutputToTensorMetadataArr, lazyResetGrad, runTrainStep, runOptimizerStep, runEvalStep, getParametersSize, getContiguousParameters, loadParametersBuffer, releaseTrainingSessionAndCheckpoint;
var init_wasm_training_core_impl = __esm({
  "web/lib/wasm/wasm-training-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_core_impl();
    init_wasm_factory();
    init_wasm_utils();
    NO_TRAIN_FUNCS_MSG = "Built without training API's enabled. Use the onnxruntime-web/training import for training functionality, and make sure that all the correct artifacts are built & moved to the correct folder if using a custom build. Check https://onnxruntime.ai/docs/build/web.html for more information.";
    ifErrCodeCheckLastError = (errCode, message, checkNeqZero = true) => {
      if (checkNeqZero && errCode !== 0) {
        checkLastError(message);
      } else if (!checkNeqZero && errCode === 0) {
        checkLastError(message);
      }
    };
    createCheckpointHandle = (checkpointData) => {
      const wasm2 = getInstance();
      const [checkpointDataOffset, checkpointDataLength] = checkpointData;
      let checkpointHandle = 0;
      try {
        if (wasm2._OrtTrainingLoadCheckpoint) {
          checkpointHandle = wasm2._OrtTrainingLoadCheckpoint(checkpointDataOffset, checkpointDataLength);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        ifErrCodeCheckLastError(checkpointHandle, "Error occurred when trying to create a CheckpointState", false);
        return checkpointHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseCheckpoint && checkpointHandle !== 0) {
          wasm2._OrtTrainingReleaseCheckpoint(checkpointHandle);
        }
        throw e;
      } finally {
        wasm2._OrtFree(checkpointData[0]);
      }
    };
    getModelInputOutputCount = (trainingSessionId, isEvalModel) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        if (wasm2._OrtTrainingGetModelInputOutputCount) {
          const errorCode = wasm2._OrtTrainingGetModelInputOutputCount(trainingSessionId, dataOffset, dataOffset + 4, isEvalModel);
          ifErrCodeCheckLastError(errorCode, "Can't get session input/output count.");
          return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getModelInputOutputNamesLoop = (trainingSessionId, count, isInput, isEvalModel) => {
      const names = [];
      const wasm2 = getInstance();
      for (let i = 0; i < count; i++) {
        if (wasm2._OrtTrainingGetModelInputOutputName) {
          const name = wasm2._OrtTrainingGetModelInputOutputName(trainingSessionId, i, isInput, isEvalModel);
          ifErrCodeCheckLastError(name, `Can't get input or output name -- is input: ${isInput}, index ${i}`, false);
          names.push(wasm2.UTF8ToString(name));
          wasm2._free(name);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      }
      return names;
    };
    getModelInputOutputNames = (trainingSessionId, isEvalModel) => {
      let inputNames = [];
      let outputNames = [];
      const [inputCount, outputCount] = getModelInputOutputCount(trainingSessionId, isEvalModel);
      inputNames = getModelInputOutputNamesLoop(trainingSessionId, inputCount, true, isEvalModel);
      outputNames = getModelInputOutputNamesLoop(trainingSessionId, outputCount, false, isEvalModel);
      return [inputNames, outputNames];
    };
    createTrainingSessionHandle = (checkpointHandle, trainModelData, evalModelData, optimizerModelData, options) => {
      const wasm2 = getInstance();
      let trainingSessionHandle = 0;
      let sessionOptionsHandle = 0;
      let allocs = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (wasm2._OrtTrainingCreateSession) {
          trainingSessionHandle = wasm2._OrtTrainingCreateSession(
            sessionOptionsHandle,
            checkpointHandle,
            trainModelData[0],
            trainModelData[1],
            evalModelData[0],
            evalModelData[1],
            optimizerModelData[0],
            optimizerModelData[1]
          );
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        ifErrCodeCheckLastError(trainingSessionHandle, "Error occurred when trying to create a TrainingSession", false);
        return trainingSessionHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseSession && trainingSessionHandle !== 0) {
          wasm2._OrtTrainingReleaseSession(trainingSessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(trainModelData[0]);
        wasm2._free(evalModelData[0]);
        wasm2._free(optimizerModelData[0]);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
      }
    };
    createAndAllocateTensors = (trainingSessionId, indices, tensors, tensorHandles, inputOutputAllocs, indexAdd) => {
      const count = indices.length;
      for (let i = 0; i < count; i++) {
        prepareInputOutputTensor(
          tensors[i],
          tensorHandles,
          inputOutputAllocs,
          trainingSessionId,
          indexAdd + indices[i]
        );
      }
      const wasm2 = getInstance();
      const valuesOffset = wasm2.stackAlloc(count * 4);
      let valuesIndex = valuesOffset / 4;
      for (let i = 0; i < count; i++) {
        wasm2.HEAPU32[valuesIndex++] = tensorHandles[i];
      }
      return valuesOffset;
    };
    moveOutputToTensorMetadataArr = (outputValuesOffset, outputCount, outputTensorHandles, outputTensors) => {
      const wasm2 = getInstance();
      const output = [];
      for (let i = 0; i < outputCount; i++) {
        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
        if (tensor === outputTensorHandles[i]) {
          output.push(outputTensors[i]);
          continue;
        }
        const beforeGetTensorDataStack = wasm2.stackSave();
        const tensorDataOffset = wasm2.stackAlloc(4 * 4);
        let type, dataOffset = 0;
        try {
          const errorCode = wasm2._OrtGetTensorData(
            tensor,
            tensorDataOffset,
            tensorDataOffset + 4,
            tensorDataOffset + 8,
            tensorDataOffset + 12
          );
          ifErrCodeCheckLastError(errorCode, `Can't access output tensor data on index ${i}.`);
          let tensorDataIndex = tensorDataOffset / 4;
          const dataType = wasm2.HEAPU32[tensorDataIndex++];
          dataOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
          const dims = [];
          for (let i2 = 0; i2 < dimsLength; i2++) {
            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
          }
          wasm2._OrtFree(dimsOffset);
          const size = dims.reduce((a, b) => a * b, 1);
          type = tensorDataTypeEnumToString(dataType);
          if (type === "string") {
            const stringData = [];
            let dataIndex = dataOffset / 4;
            for (let i2 = 0; i2 < size; i2++) {
              const offset = wasm2.HEAPU32[dataIndex++];
              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
            }
            output.push([type, dims, stringData, "cpu"]);
          } else {
            const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
            const data = new typedArrayConstructor(size);
            new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
            output.push([type, dims, data, "cpu"]);
          }
        } finally {
          wasm2.stackRestore(beforeGetTensorDataStack);
          if (type === "string" && dataOffset) {
            wasm2._free(dataOffset);
          }
          wasm2._OrtReleaseTensor(tensor);
        }
      }
      return output;
    };
    lazyResetGrad = async (trainingSessionId) => {
      const wasm2 = getInstance();
      if (wasm2._OrtTrainingLazyResetGrad) {
        const errorCode = wasm2._OrtTrainingLazyResetGrad(trainingSessionId);
        ifErrCodeCheckLastError(errorCode, "Can't call lazyResetGrad.");
      } else {
        throw new Error(NO_TRAIN_FUNCS_MSG);
      }
    };
    runTrainStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingRunTrainStep) {
          const errorCode = wasm2._OrtTrainingRunTrainStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          ifErrCodeCheckLastError(errorCode, "failed to call OrtTrainingRunTrainStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    runOptimizerStep = async (trainingSessionId, options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        if (wasm2._OrtTrainingOptimizerStep) {
          const errCode = wasm2._OrtTrainingOptimizerStep(trainingSessionId, runOptionsHandle);
          ifErrCodeCheckLastError(errCode, "Failed to call OrtTrainingOptimizerStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    runEvalStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingEvalStep) {
          const errorCode = wasm2._OrtTrainingEvalStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          ifErrCodeCheckLastError(errorCode, "failed to call OrtTrainingEvalStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    getParametersSize = (trainingSessionId, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const sizeOffset = wasm2.stackAlloc(4);
        if (wasm2._OrtTrainingGetParametersSize) {
          const errorCode = wasm2._OrtTrainingGetParametersSize(trainingSessionId, sizeOffset, trainableOnly);
          ifErrCodeCheckLastError(errorCode, "Can't get parameters size");
          return wasm2.HEAP32[sizeOffset / 4];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getContiguousParameters = async (trainingSessionId, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      const tensorTypeAsString = "float32";
      const locationAsString = "cpu";
      const parametersSize = getParametersSize(trainingSessionId, trainableOnly);
      let tensor = 0;
      const paramsByteLength = 4 * parametersSize;
      const paramsOffset = wasm2._malloc(paramsByteLength);
      const dims = [parametersSize];
      const dimsOffset = wasm2.stackAlloc(4);
      const dimsIndex = dimsOffset / 4;
      wasm2.HEAP32[dimsIndex] = parametersSize;
      try {
        tensor = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(tensorTypeAsString),
          paramsOffset,
          paramsByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(locationAsString)
        );
        ifErrCodeCheckLastError(
          tensor,
          `Can't create tensor for getContiguousParameters. session=${trainingSessionId}.`,
          false
        );
        if (wasm2._OrtTrainingCopyParametersToBuffer) {
          const errCode = wasm2._OrtTrainingCopyParametersToBuffer(trainingSessionId, tensor, parametersSize, trainableOnly);
          ifErrCodeCheckLastError(errCode, "Can't get contiguous parameters.");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        const typedArrayConstructor = tensorTypeToTypedArrayConstructor(tensorTypeAsString);
        const data = new typedArrayConstructor(parametersSize);
        const output = [];
        new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(paramsOffset, paramsOffset + paramsByteLength));
        output.push([tensorTypeAsString, dims, data, locationAsString]);
        if (output.length !== 1) {
          throw new Error(`something unexpected happened in the getContiguousParameters function. Expected output length of
     one, got ${output.length}`);
        } else {
          return output[0];
        }
      } finally {
        if (tensor !== 0) {
          wasm2._OrtReleaseTensor(tensor);
        }
        wasm2._free(paramsOffset);
        wasm2._free(dimsOffset);
        wasm2.stackRestore(stack);
      }
    };
    loadParametersBuffer = async (trainingSessionId, buffer, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      const tensorTypeAsString = "float32";
      const locationAsString = "cpu";
      const bufferByteLength = buffer.length;
      const bufferCount = bufferByteLength / 4;
      const bufferOffset = wasm2._malloc(bufferByteLength);
      wasm2.HEAPU8.set(buffer, bufferOffset);
      const dimsOffset = wasm2.stackAlloc(4);
      wasm2.HEAP32[dimsOffset / 4] = bufferCount;
      const dimsLength = 1;
      let tensor = 0;
      try {
        tensor = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(tensorTypeAsString),
          bufferOffset,
          bufferByteLength,
          dimsOffset,
          dimsLength,
          dataLocationStringToEnum(locationAsString)
        );
        ifErrCodeCheckLastError(tensor, `Can't create tensor for input/output. session=${trainingSessionId}`, false);
        if (wasm2._OrtTrainingCopyParametersFromBuffer) {
          const errCode = wasm2._OrtTrainingCopyParametersFromBuffer(trainingSessionId, tensor, bufferCount, trainableOnly);
          ifErrCodeCheckLastError(errCode, "Can't copy buffer to parameters.");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        if (tensor !== 0) {
          wasm2._OrtReleaseTensor(tensor);
        }
        wasm2.stackRestore(stack);
        wasm2._free(bufferOffset);
        wasm2._free(dimsOffset);
      }
    };
    releaseTrainingSessionAndCheckpoint = (checkpointId, sessionId) => {
      const wasm2 = getInstance();
      if (wasm2._OrtTrainingReleaseSession) {
        wasm2._OrtTrainingReleaseSession(sessionId);
      }
      if (wasm2._OrtTrainingReleaseCheckpoint) {
        wasm2._OrtTrainingReleaseCheckpoint(checkpointId);
      }
    };
  }
});

// web/lib/wasm/session-handler-training.ts
var OnnxruntimeWebAssemblyTrainingSessionHandler;
var init_session_handler_training = __esm({
  "web/lib/wasm/session-handler-training.ts"() {
    "use strict";
    init_session_handler_inference();
    init_wasm_core_impl();
    init_wasm_training_core_impl();
    OnnxruntimeWebAssemblyTrainingSessionHandler = class {
      constructor() {
        this.evalInputNames = [];
        this.evalOutputNames = [];
      }
      async uriOrBufferToHeap(uriOrBuffer) {
        let buffer;
        if (typeof uriOrBuffer === "string") {
          const response = await fetch(uriOrBuffer);
          const arrayBuffer = await response.arrayBuffer();
          buffer = new Uint8Array(arrayBuffer);
        } else {
          buffer = uriOrBuffer;
        }
        return copyFromExternalBuffer(buffer);
      }
      async createTrainingSession(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const checkpointData = await this.uriOrBufferToHeap(checkpointStateUriOrBuffer);
        const trainModelData = await this.uriOrBufferToHeap(trainModelUriOrBuffer);
        let evalModelData = [0, 0];
        let optimizerModelData = [0, 0];
        if (evalModelUriOrBuffer !== "") {
          evalModelData = await this.uriOrBufferToHeap(evalModelUriOrBuffer);
        }
        if (optimizerModelUriOrBuffer !== "") {
          optimizerModelData = await this.uriOrBufferToHeap(optimizerModelUriOrBuffer);
        }
        this.checkpointId = createCheckpointHandle(checkpointData);
        this.sessionId = createTrainingSessionHandle(this.checkpointId, trainModelData, evalModelData, optimizerModelData, options);
        [this.inputNames, this.outputNames] = getModelInputOutputNames(this.sessionId, false);
        if (evalModelUriOrBuffer !== "") {
          [this.evalInputNames, this.evalOutputNames] = getModelInputOutputNames(this.sessionId, true);
        }
      }
      /**
       * Helper method that converts a feeds or fetches datatype to two arrays, one of values and one that stores the
       * corresponding name as a number referring to the index in the list of names provided.
       *
       * @param feeds meant to match either SessionHandler.FeedsType or SessionHandler.FetchesType
       * @param names either inputNames or outputNames
       * @returns a tuple of a list of values and a list of indices.
       */
      convertMapIntoValuesArrayAndIndicesArray(feeds, names, mapFunc) {
        const values = [];
        const indices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = names.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}`);
          }
          values.push(tensor);
          indices.push(index);
        });
        const uList = values.map(mapFunc);
        return [values, indices, uList];
      }
      /**
       * Helper method that converts the TensorMetadata that the wasm-core functions return to the
       * SessionHandler.ReturnType. Any outputs in the provided outputArray that are falsy will be populated with the
       * corresponding result.
       *
       * @param results used to populate the resultMap if there is no value for that outputName already
       * @param outputArray used to populate the resultMap. If null or undefined, use the corresponding result from results
       * @param outputIndices specifies which outputName the corresponding value for outputArray refers to.
       * @returns a map of output names and OnnxValues.
       */
      convertTensorMetadataToReturnType(results, outputArray, outputIndices) {
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        return resultMap;
      }
      async lazyResetGrad() {
        await lazyResetGrad(this.sessionId);
      }
      async runTrainStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.inputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.outputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await runTrainStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async runOptimizerStep(options) {
        await runOptimizerStep(this.sessionId, options);
      }
      async runEvalStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.evalInputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.evalInputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.evalOutputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.evalOutputNames[outputIndices[i]]}"`) : null
        );
        const results = await runEvalStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async getParametersSize(trainableOnly) {
        return getParametersSize(this.sessionId, trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly) {
        await loadParametersBuffer(this.sessionId, array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly) {
        const tensorResult = await getContiguousParameters(this.sessionId, trainableOnly);
        return decodeTensorMetadata(tensorResult);
      }
      async dispose() {
        return releaseTrainingSessionAndCheckpoint(this.checkpointId, this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm-training.ts
var backend_wasm_training_exports = {};
__export(backend_wasm_training_exports, {
  wasmBackend: () => wasmBackend
});
var OnnxruntimeTrainingWebAssemblyBackend, wasmBackend;
var init_backend_wasm_training = __esm({
  "web/lib/backend-wasm-training.ts"() {
    "use strict";
    init_backend_wasm();
    init_session_handler_training();
    OnnxruntimeTrainingWebAssemblyBackend = class extends OnnxruntimeWebAssemblyBackend {
      async createTrainingSessionHandler(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblyTrainingSessionHandler();
        await handler.createTrainingSession(
          checkpointStateUriOrBuffer,
          trainModelUriOrBuffer,
          evalModelUriOrBuffer,
          optimizerModelUriOrBuffer,
          options
        );
        return Promise.resolve(handler);
      }
    };
    wasmBackend = new OnnxruntimeTrainingWebAssemblyBackend();
  }
});

// web/lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  default: () => lib_default,
  env: () => env2,
  registerBackend: () => registerBackend
});
module.exports = __toCommonJS(lib_exports);
init_esm();
init_esm();
init_esm();

// web/lib/version.ts
var version2 = "1.18.0";

// web/lib/index.ts
var lib_default = esm_exports;
if (false) {
  const onnxjsBackend = null.onnxjsBackend;
  registerBackend("webgl", onnxjsBackend, -10);
}
if (true) {
  const wasmBackend2 = false ? null.wasmBackend : (init_backend_wasm_training(), __toCommonJS(backend_wasm_training_exports)).wasmBackend;
  if (false) {
    registerBackend("webgpu", wasmBackend2, 5);
    registerBackend("webnn", wasmBackend2, 5);
  }
  registerBackend("cpu", wasmBackend2, 10);
  registerBackend("wasm", wasmBackend2, 10);
}
Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });