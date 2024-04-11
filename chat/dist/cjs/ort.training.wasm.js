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
var backends, backendsSortedByPriority, registerBackend, tryResolveAndInitializeBackend, resolveBackendAndExecutionProviders;
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
    tryResolveAndInitializeBackend = async (backendName) => {
      const backendInfo = backends.get(backendName);
      if (!backendInfo) {
        return "backend not found.";
      }
      if (backendInfo.initialized) {
        return backendInfo.backend;
      } else if (backendInfo.aborted) {
        return backendInfo.error;
      } else {
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
            backendInfo.error = `${e}`;
            backendInfo.aborted = true;
          }
          return backendInfo.error;
        } finally {
          delete backendInfo.initPromise;
        }
      }
    };
    resolveBackendAndExecutionProviders = async (options) => {
      const eps = options.executionProviders || [];
      const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
      const backendNames = backendHints.length === 0 ? backendsSortedByPriority : backendHints;
      let backend;
      const errors = [];
      const availableBackendNames = /* @__PURE__ */ new Set();
      for (const backendName of backendNames) {
        const resolveResult = await tryResolveAndInitializeBackend(backendName);
        if (typeof resolveResult === "string") {
          errors.push({ name: backendName, err: resolveResult });
        } else {
          if (!backend) {
            backend = resolveResult;
          }
          if (backend === resolveResult) {
            availableBackendNames.add(backendName);
          }
        }
      }
      if (!backend) {
        throw new Error(`no available backend found. ERR: ${errors.map((e) => `[${e.name}] ${e.err}`).join(", ")}`);
      }
      for (const { name, err } of errors) {
        if (backendHints.includes(name)) {
          console.warn(`removing requested execution provider "${name}" from session options because it is not available: ${err}`);
        }
      }
      const filteredEps = eps.filter((i) => availableBackendNames.has(typeof i === "string" ? i : i.name));
      return [
        backend,
        new Proxy(options, {
          get: (target, prop) => {
            if (prop === "executionProviders") {
              return filteredEps;
            }
            return Reflect.get(target, prop);
          }
        })
      ];
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
var NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP, NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, isTypedArrayChecked, checkTypedArray;
var init_tensor_impl_type_mapping = __esm({
  "common/dist/esm/tensor-impl-type-mapping.js"() {
    "use strict";
    NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = /* @__PURE__ */ new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
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
    isTypedArrayChecked = false;
    checkTypedArray = () => {
      if (!isTypedArrayChecked) {
        isTypedArrayChecked = true;
        const isBigInt64ArrayAvailable = typeof BigInt64Array !== "undefined" && BigInt64Array.from;
        const isBigUint64ArrayAvailable = typeof BigUint64Array !== "undefined" && BigUint64Array.from;
        const isFloat16ArrayAvailable = typeof Float16Array !== "undefined" && Float16Array.from;
        if (isBigInt64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("int64", BigInt64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, "int64");
        }
        if (isBigUint64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("uint64", BigUint64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, "uint64");
        }
        if (isFloat16ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("float16", Float16Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(Float16Array, "float16");
        } else {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("float16", Uint16Array);
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
        checkTypedArray();
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
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "uint8" && type !== "bool") {
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
                if (arg0 === "float16" && typedArrayConstructor === Uint16Array) {
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
    TRACE = (_deviceType, _label) => {
    };
    TRACE_FUNC = (_msg, _extraMsg) => {
    };
    TRACE_FUNC_BEGIN = (extraMsg) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      TRACE_FUNC("BEGIN", extraMsg);
    };
    TRACE_FUNC_END = (extraMsg) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
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
        const [backend, optionsWithValidatedEPs] = await resolveBackendAndExecutionProviders(options);
        const handler = await backend.createInferenceSessionHandler(filePathOrUint8Array, optionsWithValidatedEPs);
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

// common/dist/esm/tensor-conversion.js
var init_tensor_conversion = __esm({
  "common/dist/esm/tensor-conversion.js"() {
    "use strict";
  }
});

// common/dist/esm/tensor-factory.js
var init_tensor_factory = __esm({
  "common/dist/esm/tensor-factory.js"() {
    "use strict";
  }
});

// common/dist/esm/onnx-model.js
var init_onnx_model = __esm({
  "common/dist/esm/onnx-model.js"() {
    "use strict";
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
        const [backend, optionsWithValidatedEPs] = await resolveBackendAndExecutionProviders(options);
        if (backend.createTrainingSessionHandler) {
          const handler = await backend.createTrainingSessionHandler(trainingOptions.checkpointState, trainingOptions.trainModel, evalModel, optimizerModel, optionsWithValidatedEPs);
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
    init_tensor_conversion();
    init_tensor_factory();
    init_trace();
    init_onnx_model();
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
          B = (a, b, c, e = true) => {
            a = a.startsWith("file://") ? new URL(a) : D.normalize(a);
            fs.readFile(a, e ? void 0 : "utf8", (g, h) => {
              g ? c(g) : b(e ? h.buffer : h);
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
            var e = new XMLHttpRequest();
            e.open("GET", a, true);
            e.responseType = "arraybuffer";
            e.onload = () => {
              200 == e.status || 0 == e.status && e.response ? b(e.response) : c();
            };
            e.onerror = c;
            e.send(null);
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
                B(a, (e) => b(new Uint8Array(e)), c);
              });
          }
          return Promise.resolve().then(() => ma(a));
        }
        function oa(a, b, c) {
          return na(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {
            E("failed to asynchronously prepare wasm: " + e);
            G(e);
          });
        }
        function pa(a, b) {
          var c = Q;
          return F || "function" != typeof WebAssembly.instantiateStreaming || ka(c) || c.startsWith("file://") || ba || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(g) {
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
          this.Ja = a - 24;
          this.Na = function(b) {
            M[this.Ja + 4 >> 2 >>> 0] = b;
          };
          this.Ma = function(b) {
            M[this.Ja + 8 >> 2 >>> 0] = b;
          };
          this.Ka = function(b, c) {
            this.La();
            this.Na(b);
            this.Ma(c);
          };
          this.La = function() {
            M[this.Ja + 16 >> 2 >>> 0] = 0;
          };
        }
        var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {
          b >>>= 0;
          var e = b + c;
          for (c = b; a[c] && !(c >= e); )
            ++c;
          if (16 < c - b && a.buffer && ta)
            return ta.decode(a.subarray(b, c));
          for (e = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                e += String.fromCharCode((g & 31) << 6 | h);
              else {
                var m = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;
                65536 > g ? e += String.fromCharCode(g) : (g -= 65536, e += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              e += String.fromCharCode(g);
          }
          return e;
        }, T = (a, b) => (a >>>= 0) ? ua(K, a, b) : "", U = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var e = a.charCodeAt(c);
            127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, V = (a, b, c, e) => {
          c >>>= 0;
          if (!(0 < e))
            return 0;
          var g = c;
          e = c + e - 1;
          for (var h = 0; h < a.length; ++h) {
            var m = a.charCodeAt(h);
            if (55296 <= m && 57343 >= m) {
              var q = a.charCodeAt(++h);
              m = 65536 + ((m & 1023) << 10) | q & 1023;
            }
            if (127 >= m) {
              if (c >= e)
                break;
              b[c++ >>> 0] = m;
            } else {
              if (2047 >= m) {
                if (c + 1 >= e)
                  break;
                b[c++ >>> 0] = 192 | m >> 6;
              } else {
                if (65535 >= m) {
                  if (c + 2 >= e)
                    break;
                  b[c++ >>> 0] = 224 | m >> 12;
                } else {
                  if (c + 3 >= e)
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
        function Ha(a, b, c, e) {
          function g(f, n, p) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )
              f = p[0] + f;
            return f;
          }
          function h(f, n) {
            return g(f, n, "0");
          }
          function m(f, n) {
            function p(xa) {
              return 0 > xa ? -1 : 0 < xa ? 1 : 0;
            }
            var z;
            0 === (z = p(f.getFullYear() - n.getFullYear())) && 0 === (z = p(f.getMonth() - n.getMonth())) && (z = p(f.getDate() - n.getDate()));
            return z;
          }
          function q(f) {
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
          function w(f) {
            var n = f.Ea;
            for (f = new Date(new Date(f.Fa + 1900, 0, 1).getTime()); 0 < n; ) {
              var p = f.getMonth(), z = (W(f.getFullYear()) ? Ea : Fa)[p];
              if (n > z - f.getDate())
                n -= z - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + n);
                break;
              }
            }
            p = new Date(f.getFullYear() + 1, 0, 4);
            n = q(new Date(
              f.getFullYear(),
              0,
              4
            ));
            p = q(p);
            return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          var t = L[e + 40 >> 2 >>> 0];
          e = { Qa: L[e >> 2 >>> 0], Pa: L[e + 4 >> 2 >>> 0], Ga: L[e + 8 >> 2 >>> 0], Ia: L[e + 12 >> 2 >>> 0], Ha: L[e + 16 >> 2 >>> 0], Fa: L[e + 20 >> 2 >>> 0], za: L[e + 24 >> 2 >>> 0], Ea: L[e + 28 >> 2 >>> 0], Sa: L[e + 32 >> 2 >>> 0], Oa: L[e + 36 >> 2 >>> 0], Ra: t ? T(t) : "" };
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
          t = { "%a": (f) => ya[f.za].substring(0, 3), "%A": (f) => ya[f.za], "%b": (f) => za[f.Ha].substring(0, 3), "%B": (f) => za[f.Ha], "%C": (f) => h((f.Fa + 1900) / 100 | 0, 2), "%d": (f) => h(f.Ia, 2), "%e": (f) => g(f.Ia, 2, " "), "%g": (f) => w(f).toString().substring(2), "%G": (f) => w(f), "%H": (f) => h(f.Ga, 2), "%I": (f) => {
            f = f.Ga;
            0 == f ? f = 12 : 12 < f && (f -= 12);
            return h(f, 2);
          }, "%j": (f) => {
            for (var n = 0, p = 0; p <= f.Ha - 1; n += (W(f.Fa + 1900) ? Ea : Fa)[p++])
              ;
            return h(f.Ia + n, 3);
          }, "%m": (f) => h(f.Ha + 1, 2), "%M": (f) => h(f.Pa, 2), "%n": () => "\n", "%p": (f) => 0 <= f.Ga && 12 > f.Ga ? "AM" : "PM", "%S": (f) => h(f.Qa, 2), "%t": () => "	", "%u": (f) => f.za || 7, "%U": (f) => h(Math.floor((f.Ea + 7 - f.za) / 7), 2), "%V": (f) => {
            var n = Math.floor((f.Ea + 7 - (f.za + 6) % 7) / 7);
            2 >= (f.za + 371 - f.Ea - 2) % 7 && n++;
            if (n)
              53 == n && (p = (f.za + 371 - f.Ea) % 7, 4 == p || 3 == p && W(f.Fa) || (n = 1));
            else {
              n = 52;
              var p = (f.za + 7 - f.Ea - 1) % 7;
              (4 == p || 5 == p && W(f.Fa % 400 - 1)) && n++;
            }
            return h(n, 2);
          }, "%w": (f) => f.za, "%W": (f) => h(Math.floor((f.Ea + 7 - (f.za + 6) % 7) / 7), 2), "%y": (f) => (f.Fa + 1900).toString().substring(2), "%Y": (f) => f.Fa + 1900, "%z": (f) => {
            f = f.Oa;
            var n = 0 <= f;
            f = Math.abs(f) / 60;
            return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
          }, "%Z": (f) => f.Ra, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (u in t)
            c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](e)));
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
            new qa(a).Ka(b >>> 0, c >>> 0);
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
            var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            L[c + 32 >> 2 >>> 0] = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;
          },
          q: function(a) {
            a >>>= 0;
            var b = new Date(L[a + 20 >> 2 >>> 0] + 1900, L[a + 16 >> 2 >>> 0], L[a + 12 >> 2 >>> 0], L[a + 8 >> 2 >>> 0], L[a + 4 >> 2 >>> 0], L[a >> 2 >>> 0], 0), c = L[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);
            0 > c ? L[a + 32 >> 2 >>> 0] = Number(g != h && m == e) : 0 < c != (m == e) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - e)));
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
            function e(w) {
              return (w = w.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? w[1] : "GMT";
            }
            c >>>= 0;
            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);
            g = h.getTimezoneOffset();
            var q = m.getTimezoneOffset();
            M[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, q);
            L[b >>> 0 >> 2 >>> 0] = Number(g != q);
            a = e(h);
            b = e(m);
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
              var e = b * (1 + 0.2 / c);
              e = Math.min(e, a + 100663296);
              var g = Math;
              e = Math.max(a, e);
              a: {
                g = g.min.call(g, 4294901760, e + (65536 - e % 65536) % 65536) - H.buffer.byteLength + 65535 >>> 16;
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
            Ca().forEach(function(e, g) {
              var h = b + c;
              g = M[a + 4 * g >> 2 >>> 0] = h;
              for (h = 0; h < e.length; ++h)
                J[g++ >> 0 >>> 0] = e.charCodeAt(h);
              J[g >> 0 >>> 0] = 0;
              c += e.length + 1;
            });
            return 0;
          },
          D: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = Ca();
            M[a >> 2 >>> 0] = c.length;
            var e = 0;
            c.forEach(function(g) {
              e += g.length + 1;
            });
            M[b >> 2 >>> 0] = e;
            return 0;
          },
          f: () => 52,
          j: function() {
            return 52;
          },
          r: function() {
            return 70;
          },
          i: function(a, b, c, e) {
            b >>>= 0;
            c >>>= 0;
            e >>>= 0;
            for (var g = 0, h = 0; h < c; h++) {
              var m = M[b >> 2 >>> 0], q = M[b + 4 >> 2 >>> 0];
              b += 8;
              for (var w = 0; w < q; w++) {
                var t = K[m + w >>> 0], u = Da[a];
                0 === t || 10 === t ? ((1 === a ? ca : E)(ua(u, 0)), u.length = 0) : u.push(t);
              }
              g += q;
            }
            M[e >> 2 >>> 0] = g;
            return 0;
          },
          A: Ha,
          c: function(a, b, c, e) {
            return Ha(a >>> 0, b >>> 0, c >>> 0, e >>> 0);
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
              var e = P;
              P = null;
              e();
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
        d._OrtCreateSessionOptions = (a, b, c, e, g, h, m, q, w, t) => (d._OrtCreateSessionOptions = I.N)(a, b, c, e, g, h, m, q, w, t);
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
        d._OrtCreateTensor = (a, b, c, e, g, h) => (d._OrtCreateTensor = I.Y)(a, b, c, e, g, h);
        d._OrtGetTensorData = (a, b, c, e, g) => (d._OrtGetTensorData = I.Z)(a, b, c, e, g);
        d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = I._)(a);
        d._OrtCreateRunOptions = (a, b, c, e) => (d._OrtCreateRunOptions = I.$)(a, b, c, e);
        d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = I.aa)(a, b, c);
        d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = I.ba)(a);
        d._OrtCreateBinding = (a) => (d._OrtCreateBinding = I.ca)(a);
        d._OrtBindInput = (a, b, c) => (d._OrtBindInput = I.da)(a, b, c);
        d._OrtBindOutput = (a, b, c, e) => (d._OrtBindOutput = I.ea)(a, b, c, e);
        d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = I.fa)(a);
        d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = I.ga)(a);
        d._OrtRunWithBinding = (a, b, c, e, g) => (d._OrtRunWithBinding = I.ha)(a, b, c, e, g);
        d._OrtRun = (a, b, c, e, g, h, m, q) => (d._OrtRun = I.ia)(a, b, c, e, g, h, m, q);
        d._OrtEndProfiling = (a) => (d._OrtEndProfiling = I.ja)(a);
        d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = I.ka)(a, b);
        d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = I.la)(a);
        d._OrtTrainingCreateSession = (a, b, c, e, g, h, m, q) => (d._OrtTrainingCreateSession = I.ma)(a, b, c, e, g, h, m, q);
        d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = I.na)(a);
        d._OrtTrainingRunTrainStep = (a, b, c, e, g, h) => (d._OrtTrainingRunTrainStep = I.oa)(a, b, c, e, g, h);
        d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = I.pa)(a, b);
        d._OrtTrainingEvalStep = (a, b, c, e, g, h) => (d._OrtTrainingEvalStep = I.qa)(a, b, c, e, g, h);
        d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = I.ra)(a, b, c);
        d._OrtTrainingCopyParametersToBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersToBuffer = I.sa)(a, b, c, e);
        d._OrtTrainingCopyParametersFromBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersFromBuffer = I.ta)(a, b, c, e);
        d._OrtTrainingGetModelInputOutputCount = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputCount = I.ua)(a, b, c, e);
        d._OrtTrainingGetModelInputOutputName = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputName = I.va)(a, b, c, e);
        d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = I.wa)(a);
        var Aa = d._malloc = (a) => (Aa = d._malloc = I.xa)(a);
        d._free = (a) => (d._free = I.ya)(a);
        var Ia = (a) => (Ia = I.Aa)(a), La = () => (La = I.Ba)(), Ma = (a) => (Ma = I.Ca)(a), Na = (a) => (Na = I.Da)(a);
        function Ka(a) {
          a = Object.assign({}, a);
          var b = (e) => () => e() >>> 0, c = (e) => (g) => e(g) >>> 0;
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
          return typeof Float16Array !== "undefined" && Float16Array.from ? Float16Array : Uint16Array;
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
    isGpuBufferSupportedType = (type) => type === "float32" || type === "float16" || type === "int32" || type === "int64" || type === "uint32" || type === "uint8" || type === "bool";
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
        const initJsep = null.init;
        if (epName === "webgpu") {
          if (typeof navigator === "undefined" || !navigator.gpu) {
            throw new Error("WebGPU is not supported in current environment");
          }
          let adapter = env3.webgpu.adapter;
          if (!adapter) {
            const powerPreference = env3.webgpu.powerPreference;
            if (powerPreference !== void 0 && powerPreference !== "low-power" && powerPreference !== "high-performance") {
              throw new Error(`Invalid powerPreference setting: "${powerPreference}"`);
            }
            const forceFallbackAdapter = env3.webgpu.forceFallbackAdapter;
            if (forceFallbackAdapter !== void 0 && typeof forceFallbackAdapter !== "boolean") {
              throw new Error(`Invalid forceFallbackAdapter setting: "${forceFallbackAdapter}"`);
            }
            adapter = await navigator.gpu.requestAdapter({ powerPreference, forceFallbackAdapter });
            if (!adapter) {
              throw new Error(
                'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.'
              );
            }
          } else {
            if (typeof adapter.limits !== "object" || typeof adapter.features !== "object" || typeof adapter.requestDevice !== "function") {
              throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
            }
          }
          if (!env3.wasm.simd) {
            throw new Error(
              "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"
            );
          }
          await initJsep("webgpu", getInstance(), env3, adapter);
        }
        if (epName === "webnn") {
          if (typeof navigator === "undefined" || !navigator.ml) {
            throw new Error("WebNN is not supported in current environment");
          }
          await initJsep("webnn", getInstance(), env3);
        }
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
        const registerBuffer = wasm2.jsepRegisterBuffer;
        if (!registerBuffer) {
          throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
        }
        rawData = registerBuffer(sessionId, index, gpuBuffer, dataByteLength);
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
                const getBuffer = wasm2.jsepGetBuffer;
                if (!getBuffer) {
                  throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
                }
                const gpuBuffer = getBuffer(dataOffset);
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
    module2.exports = '/*!\n * ONNX Runtime Web v1.18.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    createReadStream: () => createReadStream,\n    readFile: () => readFile,\n    readFileSync: () => readFileSync\n  });\n  var readFile, readFileSync, createReadStream;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n      readFileSync = void 0;\n      createReadStream = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-training-wasm-simd.js\n  var require_ort_training_wasm_simd = __commonJS({\n    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var d = moduleArg, k, l;\n          d.ready = new Promise((a, b) => {\n            k = a;\n            l = b;\n          });\n          var r = Object.assign({}, d), v = "./this.program", aa = "object" == typeof window, x = "function" == typeof importScripts, ba = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, y = "", A, B, C;\n          if (ba) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), D = (init_path(), __toCommonJS(path_exports));\n            y = x ? D.dirname(y) + "/" : __dirname + "/";\n            A = (a, b) => {\n              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            C = (a) => {\n              a = A(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            B = (a, b, c, e = true) => {\n              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);\n              fs.readFile(a, e ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(e ? h.buffer : h);\n              });\n            };\n            !d.thisProgram && 1 < process.argv.length && (v = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            d.inspect = () => "[Emscripten Module object]";\n          } else if (aa || x)\n            x ? y = self.location.href : "undefined" != typeof document && document.currentScript && (y = document.currentScript.src), _scriptDir && (y = _scriptDir), 0 !== y.indexOf("blob:") ? y = y.substr(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1) : y = "", A = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, x && (C = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), B = (a, b, c) => {\n              var e = new XMLHttpRequest();\n              e.open("GET", a, true);\n              e.responseType = "arraybuffer";\n              e.onload = () => {\n                200 == e.status || 0 == e.status && e.response ? b(e.response) : c();\n              };\n              e.onerror = c;\n              e.send(null);\n            };\n          var ca = d.print || console.log.bind(console), E = d.printErr || console.error.bind(console);\n          Object.assign(d, r);\n          r = null;\n          d.thisProgram && (v = d.thisProgram);\n          var F;\n          d.wasmBinary && (F = d.wasmBinary);\n          var noExitRuntime = d.noExitRuntime || true;\n          "object" != typeof WebAssembly && G("no native wasm support detected");\n          var H, I, da = false, J, K, L, M;\n          function ea() {\n            var a = H.buffer;\n            d.HEAP8 = J = new Int8Array(a);\n            d.HEAP16 = new Int16Array(a);\n            d.HEAP32 = L = new Int32Array(a);\n            d.HEAPU8 = K = new Uint8Array(a);\n            d.HEAPU16 = new Uint16Array(a);\n            d.HEAPU32 = M = new Uint32Array(a);\n            d.HEAPF32 = new Float32Array(a);\n            d.HEAPF64 = new Float64Array(a);\n          }\n          var fa = [], ha = [], ia = [];\n          function ja() {\n            var a = d.preRun.shift();\n            fa.unshift(a);\n          }\n          var N = 0, O = null, P = null;\n          function G(a) {\n            if (d.onAbort)\n              d.onAbort(a);\n            a = "Aborted(" + a + ")";\n            E(a);\n            da = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          function ka(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var Q;\n          Q = "ort-training-wasm-simd.wasm";\n          if (!ka(Q)) {\n            var la = Q;\n            Q = d.locateFile ? d.locateFile(la, y) : y + la;\n          }\n          function ma(a) {\n            if (a == Q && F)\n              return new Uint8Array(F);\n            if (C)\n              return C(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function na(a) {\n            if (!F && (aa || x)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => ma(a));\n              if (B)\n                return new Promise((b, c) => {\n                  B(a, (e) => b(new Uint8Array(e)), c);\n                });\n            }\n            return Promise.resolve().then(() => ma(a));\n          }\n          function oa(a, b, c) {\n            return na(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {\n              E("failed to asynchronously prepare wasm: " + e);\n              G(e);\n            });\n          }\n          function pa(a, b) {\n            var c = Q;\n            return F || "function" != typeof WebAssembly.instantiateStreaming || ka(c) || c.startsWith("file://") || ba || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(g) {\n              E("wasm streaming compile failed: " + g);\n              E("falling back to ArrayBuffer instantiation");\n              return oa(c, a, b);\n            }));\n          }\n          var R, S = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(d);\n          };\n          function qa(a) {\n            this.Ja = a - 24;\n            this.Na = function(b) {\n              M[this.Ja + 4 >> 2 >>> 0] = b;\n            };\n            this.Ma = function(b) {\n              M[this.Ja + 8 >> 2 >>> 0] = b;\n            };\n            this.Ka = function(b, c) {\n              this.La();\n              this.Na(b);\n              this.Ma(c);\n            };\n            this.La = function() {\n              M[this.Ja + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {\n            b >>>= 0;\n            var e = b + c;\n            for (c = b; a[c] && !(c >= e); )\n              ++c;\n            if (16 < c - b && a.buffer && ta)\n              return ta.decode(a.subarray(b, c));\n            for (e = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  e += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var m = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;\n                  65536 > g ? e += String.fromCharCode(g) : (g -= 65536, e += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                e += String.fromCharCode(g);\n            }\n            return e;\n          }, T = (a, b) => (a >>>= 0) ? ua(K, a, b) : "", U = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var e = a.charCodeAt(c);\n              127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, V = (a, b, c, e) => {\n            c >>>= 0;\n            if (!(0 < e))\n              return 0;\n            var g = c;\n            e = c + e - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var m = a.charCodeAt(h);\n              if (55296 <= m && 57343 >= m) {\n                var q = a.charCodeAt(++h);\n                m = 65536 + ((m & 1023) << 10) | q & 1023;\n              }\n              if (127 >= m) {\n                if (c >= e)\n                  break;\n                b[c++ >>> 0] = m;\n              } else {\n                if (2047 >= m) {\n                  if (c + 1 >= e)\n                    break;\n                  b[c++ >>> 0] = 192 | m >> 6;\n                } else {\n                  if (65535 >= m) {\n                    if (c + 2 >= e)\n                      break;\n                    b[c++ >>> 0] = 224 | m >> 12;\n                  } else {\n                    if (c + 3 >= e)\n                      break;\n                    b[c++ >>> 0] = 240 | m >> 18;\n                    b[c++ >>> 0] = 128 | m >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | m >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | m & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, W = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), va = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], wa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ba = (a) => {\n            var b = U(a) + 1, c = Aa(b);\n            c && V(a, K, c, b);\n            return c;\n          }, X = {}, Ca = () => {\n            if (!Y) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(\n                "-",\n                "_"\n              ) + ".UTF-8", _: v || "./this.program" }, b;\n              for (b in X)\n                void 0 === X[b] ? delete a[b] : a[b] = X[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Y = c;\n            }\n            return Y;\n          }, Y, Da = [null, [], []], Ea = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Fa = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ga(a) {\n            var b = Array(U(a) + 1);\n            V(a, b, 0, b.length);\n            return b;\n          }\n          function Ha(a, b, c, e) {\n            function g(f, n, p) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )\n                f = p[0] + f;\n              return f;\n            }\n            function h(f, n) {\n              return g(f, n, "0");\n            }\n            function m(f, n) {\n              function p(xa) {\n                return 0 > xa ? -1 : 0 < xa ? 1 : 0;\n              }\n              var z;\n              0 === (z = p(f.getFullYear() - n.getFullYear())) && 0 === (z = p(f.getMonth() - n.getMonth())) && (z = p(f.getDate() - n.getDate()));\n              return z;\n            }\n            function q(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function w(f) {\n              var n = f.Ea;\n              for (f = new Date(new Date(f.Fa + 1900, 0, 1).getTime()); 0 < n; ) {\n                var p = f.getMonth(), z = (W(f.getFullYear()) ? Ea : Fa)[p];\n                if (n > z - f.getDate())\n                  n -= z - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + n);\n                  break;\n                }\n              }\n              p = new Date(f.getFullYear() + 1, 0, 4);\n              n = q(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              p = q(p);\n              return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            var t = L[e + 40 >> 2 >>> 0];\n            e = { Qa: L[e >> 2 >>> 0], Pa: L[e + 4 >> 2 >>> 0], Ga: L[e + 8 >> 2 >>> 0], Ia: L[e + 12 >> 2 >>> 0], Ha: L[e + 16 >> 2 >>> 0], Fa: L[e + 20 >> 2 >>> 0], za: L[e + 24 >> 2 >>> 0], Ea: L[e + 28 >> 2 >>> 0], Sa: L[e + 32 >> 2 >>> 0], Oa: L[e + 36 >> 2 >>> 0], Ra: t ? T(t) : "" };\n            c = T(c);\n            t = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var u in t)\n              c = c.replace(new RegExp(u, "g"), t[u]);\n            var ya = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), za = "January February March April May June July August September October November December".split(" ");\n            t = { "%a": (f) => ya[f.za].substring(0, 3), "%A": (f) => ya[f.za], "%b": (f) => za[f.Ha].substring(0, 3), "%B": (f) => za[f.Ha], "%C": (f) => h((f.Fa + 1900) / 100 | 0, 2), "%d": (f) => h(f.Ia, 2), "%e": (f) => g(f.Ia, 2, " "), "%g": (f) => w(f).toString().substring(2), "%G": (f) => w(f), "%H": (f) => h(f.Ga, 2), "%I": (f) => {\n              f = f.Ga;\n              0 == f ? f = 12 : 12 < f && (f -= 12);\n              return h(f, 2);\n            }, "%j": (f) => {\n              for (var n = 0, p = 0; p <= f.Ha - 1; n += (W(f.Fa + 1900) ? Ea : Fa)[p++])\n                ;\n              return h(f.Ia + n, 3);\n            }, "%m": (f) => h(f.Ha + 1, 2), "%M": (f) => h(f.Pa, 2), "%n": () => "\\n", "%p": (f) => 0 <= f.Ga && 12 > f.Ga ? "AM" : "PM", "%S": (f) => h(f.Qa, 2), "%t": () => "	", "%u": (f) => f.za || 7, "%U": (f) => h(Math.floor((f.Ea + 7 - f.za) / 7), 2), "%V": (f) => {\n              var n = Math.floor((f.Ea + 7 - (f.za + 6) % 7) / 7);\n              2 >= (f.za + 371 - f.Ea - 2) % 7 && n++;\n              if (n)\n                53 == n && (p = (f.za + 371 - f.Ea) % 7, 4 == p || 3 == p && W(f.Fa) || (n = 1));\n              else {\n                n = 52;\n                var p = (f.za + 7 - f.Ea - 1) % 7;\n                (4 == p || 5 == p && W(f.Fa % 400 - 1)) && n++;\n              }\n              return h(n, 2);\n            }, "%w": (f) => f.za, "%W": (f) => h(Math.floor((f.Ea + 7 - (f.za + 6) % 7) / 7), 2), "%y": (f) => (f.Fa + 1900).toString().substring(2), "%Y": (f) => f.Fa + 1900, "%z": (f) => {\n              f = f.Oa;\n              var n = 0 <= f;\n              f = Math.abs(f) / 60;\n              return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n            }, "%Z": (f) => f.Ra, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (u in t)\n              c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](e)));\n            c = c.replace(/\\0\\0/g, "%");\n            u = Ga(c);\n            if (u.length > b)\n              return 0;\n            J.set(u, a >>> 0);\n            return u.length - 1;\n          }\n          var Ja = {\n            a: function(a, b, c) {\n              a >>>= 0;\n              new qa(a).Ka(b >>> 0, c >>> 0);\n              ra = a;\n              sa++;\n              throw ra;\n            },\n            e: function() {\n              return 0;\n            },\n            H: function() {\n            },\n            x: function() {\n            },\n            z: function() {\n            },\n            k: function() {\n              return 0;\n            },\n            F: function() {\n            },\n            B: function() {\n            },\n            E: function() {\n            },\n            g: function() {\n            },\n            y: function() {\n            },\n            v: function() {\n            },\n            G: function() {\n            },\n            w: function() {\n            },\n            l: () => true,\n            o: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              L[c >> 2 >>> 0] = a.getUTCSeconds();\n              L[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              L[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              L[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              L[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              L[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              L[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              L[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n            },\n            p: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              L[c >> 2 >>> 0] = a.getSeconds();\n              L[c + 4 >> 2 >>> 0] = a.getMinutes();\n              L[c + 8 >> 2 >>> 0] = a.getHours();\n              L[c + 12 >> 2 >>> 0] = a.getDate();\n              L[c + 16 >> 2 >>> 0] = a.getMonth();\n              L[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              L[c + 24 >> 2 >>> 0] = a.getDay();\n              L[c + 28 >> 2 >>> 0] = (W(a.getFullYear()) ? va : wa)[a.getMonth()] + a.getDate() - 1 | 0;\n              L[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              L[c + 32 >> 2 >>> 0] = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;\n            },\n            q: function(a) {\n              a >>>= 0;\n              var b = new Date(L[a + 20 >> 2 >>> 0] + 1900, L[a + 16 >> 2 >>> 0], L[a + 12 >> 2 >>> 0], L[a + 8 >> 2 >>> 0], L[a + 4 >> 2 >>> 0], L[a >> 2 >>> 0], 0), c = L[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);\n              0 > c ? L[a + 32 >> 2 >>> 0] = Number(g != h && m == e) : 0 < c != (m == e) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - e)));\n              L[a + 24 >> 2 >>> 0] = b.getDay();\n              L[a + 28 >> 2 >>> 0] = (W(b.getFullYear()) ? va : wa)[b.getMonth()] + b.getDate() - 1 | 0;\n              L[a >> 2 >>> 0] = b.getSeconds();\n              L[a + 4 >> 2 >>> 0] = b.getMinutes();\n              L[a + 8 >> 2 >>> 0] = b.getHours();\n              L[a + 12 >> 2 >>> 0] = b.getDate();\n              L[a + 16 >> 2 >>> 0] = b.getMonth();\n              L[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Ia((R = a, 1 <= +Math.abs(R) ? 0 < R ? +Math.floor(R / 4294967296) >>> 0 : ~~+Math.ceil((R - +(~~R >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            m: function() {\n              return -52;\n            },\n            n: function() {\n            },\n            t: function(a, b, c) {\n              function e(w) {\n                return (w = w.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? w[1] : "GMT";\n              }\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var q = m.getTimezoneOffset();\n              M[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, q);\n              L[b >>> 0 >> 2 >>> 0] = Number(g != q);\n              a = e(h);\n              b = e(m);\n              a = Ba(a);\n              b = Ba(b);\n              q < g ? (M[c >> 2 >>> 0] = a, M[c + 4 >> 2 >>> 0] = b) : (M[c >> 2 >>> 0] = b, M[c + 4 >> 2 >>> 0] = a);\n            },\n            d: () => {\n              G("");\n            },\n            h: function() {\n              return Date.now();\n            },\n            u: function() {\n              return 4294901760;\n            },\n            b: () => performance.now(),\n            I: function(a, b, c) {\n              b >>>= 0;\n              return K.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n            },\n            s: function(a) {\n              a >>>= 0;\n              var b = K.length;\n              if (4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var e = b * (1 + 0.2 / c);\n                e = Math.min(e, a + 100663296);\n                var g = Math;\n                e = Math.max(a, e);\n                a: {\n                  g = g.min.call(g, 4294901760, e + (65536 - e % 65536) % 65536) - H.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    H.grow(g);\n                    ea();\n                    var h = 1;\n                    break a;\n                  } catch (m) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            C: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = 0;\n              Ca().forEach(function(e, g) {\n                var h = b + c;\n                g = M[a + 4 * g >> 2 >>> 0] = h;\n                for (h = 0; h < e.length; ++h)\n                  J[g++ >> 0 >>> 0] = e.charCodeAt(h);\n                J[g >> 0 >>> 0] = 0;\n                c += e.length + 1;\n              });\n              return 0;\n            },\n            D: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = Ca();\n              M[a >> 2 >>> 0] = c.length;\n              var e = 0;\n              c.forEach(function(g) {\n                e += g.length + 1;\n              });\n              M[b >> 2 >>> 0] = e;\n              return 0;\n            },\n            f: () => 52,\n            j: function() {\n              return 52;\n            },\n            r: function() {\n              return 70;\n            },\n            i: function(a, b, c, e) {\n              b >>>= 0;\n              c >>>= 0;\n              e >>>= 0;\n              for (var g = 0, h = 0; h < c; h++) {\n                var m = M[b >> 2 >>> 0], q = M[b + 4 >> 2 >>> 0];\n                b += 8;\n                for (var w = 0; w < q; w++) {\n                  var t = K[m + w >>> 0], u = Da[a];\n                  0 === t || 10 === t ? ((1 === a ? ca : E)(ua(u, 0)), u.length = 0) : u.push(t);\n                }\n                g += q;\n              }\n              M[e >> 2 >>> 0] = g;\n              return 0;\n            },\n            A: Ha,\n            c: function(a, b, c, e) {\n              return Ha(a >>> 0, b >>> 0, c >>> 0, e >>> 0);\n            }\n          };\n          (function() {\n            function a(c) {\n              c = c.exports;\n              I = c = Ka(c);\n              H = I.J;\n              ea();\n              ha.unshift(I.K);\n              N--;\n              d.monitorRunDependencies && d.monitorRunDependencies(N);\n              if (0 == N && (null !== O && (clearInterval(O), O = null), P)) {\n                var e = P;\n                P = null;\n                e();\n              }\n              return c;\n            }\n            var b = { a: Ja };\n            N++;\n            d.monitorRunDependencies && d.monitorRunDependencies(N);\n            if (d.instantiateWasm)\n              try {\n                return d.instantiateWasm(b, a);\n              } catch (c) {\n                E("Module.instantiateWasm callback failed with error: " + c), l(c);\n              }\n            pa(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          })();\n          d._OrtInit = (a, b) => (d._OrtInit = I.L)(a, b);\n          d._OrtGetLastError = (a, b) => (d._OrtGetLastError = I.M)(a, b);\n          d._OrtCreateSessionOptions = (a, b, c, e, g, h, m, q, w, t) => (d._OrtCreateSessionOptions = I.N)(a, b, c, e, g, h, m, q, w, t);\n          d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = I.O)(a, b);\n          d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = I.P)(a, b, c);\n          d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = I.Q)(a, b, c);\n          d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = I.R)(a);\n          d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = I.S)(a, b, c);\n          d._OrtReleaseSession = (a) => (d._OrtReleaseSession = I.T)(a);\n          d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = I.U)(a, b, c);\n          d._OrtGetInputName = (a, b) => (d._OrtGetInputName = I.V)(a, b);\n          d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = I.W)(a, b);\n          d._OrtFree = (a) => (d._OrtFree = I.X)(a);\n          d._OrtCreateTensor = (a, b, c, e, g, h) => (d._OrtCreateTensor = I.Y)(a, b, c, e, g, h);\n          d._OrtGetTensorData = (a, b, c, e, g) => (d._OrtGetTensorData = I.Z)(a, b, c, e, g);\n          d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = I._)(a);\n          d._OrtCreateRunOptions = (a, b, c, e) => (d._OrtCreateRunOptions = I.$)(a, b, c, e);\n          d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = I.aa)(a, b, c);\n          d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = I.ba)(a);\n          d._OrtCreateBinding = (a) => (d._OrtCreateBinding = I.ca)(a);\n          d._OrtBindInput = (a, b, c) => (d._OrtBindInput = I.da)(a, b, c);\n          d._OrtBindOutput = (a, b, c, e) => (d._OrtBindOutput = I.ea)(a, b, c, e);\n          d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = I.fa)(a);\n          d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = I.ga)(a);\n          d._OrtRunWithBinding = (a, b, c, e, g) => (d._OrtRunWithBinding = I.ha)(a, b, c, e, g);\n          d._OrtRun = (a, b, c, e, g, h, m, q) => (d._OrtRun = I.ia)(a, b, c, e, g, h, m, q);\n          d._OrtEndProfiling = (a) => (d._OrtEndProfiling = I.ja)(a);\n          d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = I.ka)(a, b);\n          d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = I.la)(a);\n          d._OrtTrainingCreateSession = (a, b, c, e, g, h, m, q) => (d._OrtTrainingCreateSession = I.ma)(a, b, c, e, g, h, m, q);\n          d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = I.na)(a);\n          d._OrtTrainingRunTrainStep = (a, b, c, e, g, h) => (d._OrtTrainingRunTrainStep = I.oa)(a, b, c, e, g, h);\n          d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = I.pa)(a, b);\n          d._OrtTrainingEvalStep = (a, b, c, e, g, h) => (d._OrtTrainingEvalStep = I.qa)(a, b, c, e, g, h);\n          d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = I.ra)(a, b, c);\n          d._OrtTrainingCopyParametersToBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersToBuffer = I.sa)(a, b, c, e);\n          d._OrtTrainingCopyParametersFromBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersFromBuffer = I.ta)(a, b, c, e);\n          d._OrtTrainingGetModelInputOutputCount = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputCount = I.ua)(a, b, c, e);\n          d._OrtTrainingGetModelInputOutputName = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputName = I.va)(a, b, c, e);\n          d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = I.wa)(a);\n          var Aa = d._malloc = (a) => (Aa = d._malloc = I.xa)(a);\n          d._free = (a) => (d._free = I.ya)(a);\n          var Ia = (a) => (Ia = I.Aa)(a), La = () => (La = I.Ba)(), Ma = (a) => (Ma = I.Ca)(a), Na = (a) => (Na = I.Da)(a);\n          function Ka(a) {\n            a = Object.assign({}, a);\n            var b = (e) => () => e() >>> 0, c = (e) => (g) => e(g) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          d.stackAlloc = Na;\n          d.stackSave = La;\n          d.stackRestore = Ma;\n          d.UTF8ToString = T;\n          d.stringToUTF8 = (a, b, c) => V(a, K, b, c);\n          d.lengthBytesUTF8 = U;\n          var Z;\n          P = function Oa() {\n            Z || Pa();\n            Z || (P = Oa);\n          };\n          function Pa() {\n            function a() {\n              if (!Z && (Z = true, d.calledRun = true, !da)) {\n                S(ha);\n                k(d);\n                if (d.onRuntimeInitialized)\n                  d.onRuntimeInitialized();\n                if (d.postRun)\n                  for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {\n                    var b = d.postRun.shift();\n                    ia.unshift(b);\n                  }\n                S(ia);\n              }\n            }\n            if (!(0 < N)) {\n              if (d.preRun)\n                for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )\n                  ja();\n              S(fa);\n              0 < N || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {\n                setTimeout(function() {\n                  d.setStatus("");\n                }, 1);\n                a();\n              }, 1)) : a());\n            }\n          }\n          if (d.preInit)\n            for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )\n              d.preInit.pop()();\n          Pa();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function aa() {\n            d.buffer != l.buffer && m();\n            return l;\n          }\n          function n() {\n            d.buffer != l.buffer && m();\n            return ba;\n          }\n          function p() {\n            d.buffer != l.buffer && m();\n            return ca;\n          }\n          function r() {\n            d.buffer != l.buffer && m();\n            return da;\n          }\n          function ea() {\n            d.buffer != l.buffer && m();\n            return fa;\n          }\n          var w = moduleArg, ha, x;\n          w.ready = new Promise((a, b) => {\n            ha = a;\n            x = b;\n          });\n          var ia = Object.assign({}, w), ja = "./this.program", z = (a, b) => {\n            throw b;\n          }, ka = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = w.ENVIRONMENT_IS_PTHREAD || false, E = "";\n          function la(a) {\n            return w.locateFile ? w.locateFile(a, E) : E + a;\n          }\n          var ma, F, H;\n          if (B) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));\n            E = A ? na.dirname(E) + "/" : __dirname + "/";\n            ma = (b, c) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            H = (b) => {\n              b = ma(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            F = (b, c, e, h = true) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              fs.readFile(b, h ? void 0 : "utf8", (g, k) => {\n                g ? e(g) : c(h ? k.buffer : k);\n              });\n            };\n            !w.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            z = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            w.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (ka || A)\n            A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ma = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, A && (H = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), F = (a, b, c) => {\n              var e = new XMLHttpRequest();\n              e.open("GET", a, true);\n              e.responseType = "arraybuffer";\n              e.onload = () => {\n                200 == e.status || 0 == e.status && e.response ? b(e.response) : c();\n              };\n              e.onerror = c;\n              e.send(null);\n            });\n          B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var oa = console.log.bind(console), pa = console.error.bind(console);\n          B && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var qa = w.print || oa, I = w.printErr || pa;\n          Object.assign(w, ia);\n          ia = null;\n          w.thisProgram && (ja = w.thisProgram);\n          w.quit && (z = w.quit);\n          var J;\n          w.wasmBinary && (J = w.wasmBinary);\n          var noExitRuntime = w.noExitRuntime || true;\n          "object" != typeof WebAssembly && K("no native wasm support detected");\n          var d, L, ra, M = false, N, l, ba, ca, da, fa;\n          function m() {\n            var a = d.buffer;\n            w.HEAP8 = l = new Int8Array(a);\n            w.HEAP16 = new Int16Array(a);\n            w.HEAP32 = ca = new Int32Array(a);\n            w.HEAPU8 = ba = new Uint8Array(a);\n            w.HEAPU16 = new Uint16Array(a);\n            w.HEAPU32 = da = new Uint32Array(a);\n            w.HEAPF32 = new Float32Array(a);\n            w.HEAPF64 = fa = new Float64Array(a);\n          }\n          var O = w.INITIAL_MEMORY || 16777216;\n          5242880 <= O || K("INITIAL_MEMORY should be larger than STACK_SIZE, was " + O + "! (STACK_SIZE=5242880)");\n          if (D)\n            d = w.wasmMemory;\n          else if (w.wasmMemory)\n            d = w.wasmMemory;\n          else if (d = new WebAssembly.Memory({ initial: O / 65536, maximum: 65536, shared: true }), !(d.buffer instanceof SharedArrayBuffer))\n            throw I("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && I("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          m();\n          O = d.buffer.byteLength;\n          var sa, ta = [], ua = [], va = [], wa = 0;\n          function P() {\n            return noExitRuntime || 0 < wa;\n          }\n          var Q = 0, xa = null, R = null;\n          function ya() {\n            Q++;\n            w.monitorRunDependencies && w.monitorRunDependencies(Q);\n          }\n          function za() {\n            Q--;\n            w.monitorRunDependencies && w.monitorRunDependencies(Q);\n            if (0 == Q && (null !== xa && (clearInterval(xa), xa = null), R)) {\n              var a = R;\n              R = null;\n              a();\n            }\n          }\n          function K(a) {\n            if (w.onAbort)\n              w.onAbort(a);\n            a = "Aborted(" + a + ")";\n            I(a);\n            M = true;\n            N = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            x(a);\n            throw a;\n          }\n          function Aa(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var S;\n          S = "ort-wasm-threaded.wasm";\n          Aa(S) || (S = la(S));\n          function Ba(a) {\n            if (a == S && J)\n              return new Uint8Array(J);\n            if (H)\n              return H(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ca(a) {\n            if (!J && (ka || A)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => Ba(a));\n              if (F)\n                return new Promise((b, c) => {\n                  F(a, (e) => b(new Uint8Array(e)), c);\n                });\n            }\n            return Promise.resolve().then(() => Ba(a));\n          }\n          function Da(a, b, c) {\n            return Ca(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {\n              I("failed to asynchronously prepare wasm: " + e);\n              K(e);\n            });\n          }\n          function Ea(a, b) {\n            var c = S;\n            return J || "function" != typeof WebAssembly.instantiateStreaming || Aa(c) || c.startsWith("file://") || B || "function" != typeof fetch ? Da(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(h) {\n              I("wasm streaming compile failed: " + h);\n              I("falling back to ArrayBuffer instantiation");\n              return Da(c, a, b);\n            }));\n          }\n          var T;\n          function U(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          function Fa(a) {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }\n          function Ga(a) {\n            (a = V.La[a]) || K();\n            V.lb(a);\n          }\n          function Ha(a) {\n            var b = V.fb();\n            if (!b)\n              return 6;\n            V.Oa.push(b);\n            V.La[a.Na] = b;\n            b.Na = a.Na;\n            var c = { cmd: "run", start_routine: a.mb, arg: a.eb, pthread_ptr: a.Na };\n            B && b.unref();\n            b.postMessage(c, a.sb);\n            return 0;\n          }\n          var Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {\n            b >>>= 0;\n            var e = b + c;\n            for (c = b; a[c] && !(c >= e); )\n              ++c;\n            if (16 < c - b && a.buffer && Ia)\n              return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (e = ""; b < c; ) {\n              var h = a[b++];\n              if (h & 128) {\n                var g = a[b++] & 63;\n                if (192 == (h & 224))\n                  e += String.fromCharCode((h & 31) << 6 | g);\n                else {\n                  var k = a[b++] & 63;\n                  h = 224 == (h & 240) ? (h & 15) << 12 | g << 6 | k : (h & 7) << 18 | g << 12 | k << 6 | a[b++] & 63;\n                  65536 > h ? e += String.fromCharCode(h) : (h -= 65536, e += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));\n                }\n              } else\n                e += String.fromCharCode(h);\n            }\n            return e;\n          }, Ka = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "";\n          function La(a) {\n            if (D)\n              return W(1, 1, a);\n            N = a;\n            if (!P()) {\n              V.nb();\n              if (w.onExit)\n                w.onExit(a);\n              M = true;\n            }\n            z(a, new U(a));\n          }\n          var Na = (a) => {\n            N = a;\n            if (D)\n              throw Ma(a), "unwind";\n            La(a);\n          }, V = {\n            Ra: [],\n            Oa: [],\n            Za: [],\n            La: {},\n            Va: function() {\n              D ? V.hb() : V.gb();\n            },\n            gb: function() {\n              ta.unshift(() => {\n                ya();\n                V.ib(() => za());\n              });\n            },\n            hb: function() {\n              V.receiveObjectTransfer = V.kb;\n              V.threadInitTLS = V.Ya;\n              V.setExitStatus = V.Xa;\n              noExitRuntime = false;\n            },\n            Xa: function(a) {\n              N = a;\n            },\n            xb: ["$terminateWorker"],\n            nb: function() {\n              for (var a of V.Oa)\n                Fa(a);\n              for (a of V.Ra)\n                Fa(a);\n              V.Ra = [];\n              V.Oa = [];\n              V.La = [];\n            },\n            lb: function(a) {\n              var b = a.Na;\n              delete V.La[b];\n              V.Ra.push(a);\n              V.Oa.splice(V.Oa.indexOf(a), 1);\n              a.Na = 0;\n              Oa(b);\n            },\n            kb: function() {\n            },\n            Ya: function() {\n              V.Za.forEach((a) => a());\n            },\n            jb: (a) => new Promise((b) => {\n              a.onmessage = (g) => {\n                g = g.data;\n                var k = g.cmd;\n                if (g.targetThread && g.targetThread != X()) {\n                  var t = V.La[g.wb];\n                  t ? t.postMessage(g, g.transferList) : I(\'Internal error! Worker sent a message "\' + k + \'" to target pthread \' + g.targetThread + ", but that thread no longer exists!");\n                } else if ("checkMailbox" === k)\n                  Y();\n                else if ("spawnThread" === k)\n                  Ha(g);\n                else if ("cleanupThread" === k)\n                  Ga(g.thread);\n                else if ("killThread" === k)\n                  g = g.thread, k = V.La[g], delete V.La[g], Fa(k), Oa(g), V.Oa.splice(\n                    V.Oa.indexOf(k),\n                    1\n                  ), k.Na = 0;\n                else if ("cancelThread" === k)\n                  V.La[g.thread].postMessage({ cmd: "cancel" });\n                else if ("loaded" === k)\n                  a.loaded = true, b(a);\n                else if ("alert" === k)\n                  alert("Thread " + g.threadId + ": " + g.text);\n                else if ("setimmediate" === g.target)\n                  a.postMessage(g);\n                else if ("callHandler" === k)\n                  w[g.handler](...g.args);\n                else\n                  k && I("worker sent an unknown command " + k);\n              };\n              a.onerror = (g) => {\n                I("worker sent an error! " + g.filename + ":" + g.lineno + ": " + g.message);\n                throw g;\n              };\n              B && (a.on("message", function(g) {\n                a.onmessage({ data: g });\n              }), a.on("error", function(g) {\n                a.onerror(g);\n              }));\n              var c = [], e = ["onExit", "onAbort", "print", "printErr"], h;\n              for (h of e)\n                w.hasOwnProperty(h) && c.push(h);\n              a.postMessage({ cmd: "load", handlers: c, urlOrBlob: w.mainScriptUrlOrBlob || _scriptDir, wasmMemory: d, wasmModule: ra });\n            }),\n            ib: function(a) {\n              a();\n            },\n            cb: function() {\n              var a = la("ort-wasm-threaded.worker.js");\n              a = new Worker(a);\n              V.Ra.push(a);\n            },\n            fb: function() {\n              0 == V.Ra.length && (V.cb(), V.jb(V.Ra[0]));\n              return V.Ra.pop();\n            }\n          };\n          w.PThread = V;\n          var Pa = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(w);\n          };\n          w.establishStackSpace = function() {\n            var a = X(), b = p()[a + 52 >> 2 >>> 0];\n            a = p()[a + 56 >> 2 >>> 0];\n            Qa(b, b - a);\n            Ra(b);\n          };\n          function Ma(a) {\n            if (D)\n              return W(2, 0, a);\n            Na(a);\n          }\n          var Sa = [];\n          w.invokeEntryPoint = function(a, b) {\n            var c = Sa[a];\n            c || (a >= Sa.length && (Sa.length = a + 1), Sa[a] = c = sa.get(a));\n            a = c(b);\n            P() ? V.Xa(a) : Ta(a);\n          };\n          function Ua(a) {\n            this.Ua = a - 24;\n            this.bb = function(b) {\n              r()[this.Ua + 4 >> 2 >>> 0] = b;\n            };\n            this.ab = function(b) {\n              r()[this.Ua + 8 >> 2 >>> 0] = b;\n            };\n            this.Va = function(b, c) {\n              this.$a();\n              this.bb(b);\n              this.ab(c);\n            };\n            this.$a = function() {\n              r()[this.Ua + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var Va = 0, Wa = 0;\n          function Xa(a, b, c, e) {\n            return D ? W(3, 1, a, b, c, e) : Ya(a, b, c, e);\n          }\n          function Ya(a, b, c, e) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return I("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var h = [];\n            if (D && 0 === h.length)\n              return Xa(a, b, c, e);\n            a = { mb: c, Na: a, eb: e, sb: h };\n            return D ? (a.ub = "spawnThread", postMessage(a, h), 0) : Ha(a);\n          }\n          function Za(a, b, c) {\n            return D ? W(4, 1, a, b, c) : 0;\n          }\n          function $a(a, b) {\n            if (D)\n              return W(5, 1, a, b);\n          }\n          var ab = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var e = a.charCodeAt(c);\n              127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, bb = (a, b, c, e) => {\n            c >>>= 0;\n            if (!(0 < e))\n              return 0;\n            var h = c;\n            e = c + e - 1;\n            for (var g = 0; g < a.length; ++g) {\n              var k = a.charCodeAt(g);\n              if (55296 <= k && 57343 >= k) {\n                var t = a.charCodeAt(++g);\n                k = 65536 + ((k & 1023) << 10) | t & 1023;\n              }\n              if (127 >= k) {\n                if (c >= e)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= e)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= e)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= e)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - h;\n          }, cb = (a, b, c) => bb(a, n(), b, c);\n          function db(a, b) {\n            if (D)\n              return W(6, 1, a, b);\n          }\n          function eb(a, b, c) {\n            if (D)\n              return W(7, 1, a, b, c);\n          }\n          function fb(a, b, c) {\n            return D ? W(8, 1, a, b, c) : 0;\n          }\n          function gb(a, b) {\n            if (D)\n              return W(9, 1, a, b);\n          }\n          function hb(a, b, c) {\n            if (D)\n              return W(10, 1, a, b, c);\n          }\n          function ib(a, b, c, e) {\n            if (D)\n              return W(11, 1, a, b, c, e);\n          }\n          function jb(a, b, c, e) {\n            if (D)\n              return W(12, 1, a, b, c, e);\n          }\n          function kb(a, b, c, e) {\n            if (D)\n              return W(13, 1, a, b, c, e);\n          }\n          function lb(a) {\n            if (D)\n              return W(14, 1, a);\n          }\n          function mb(a, b) {\n            if (D)\n              return W(15, 1, a, b);\n          }\n          function nb(a, b, c) {\n            if (D)\n              return W(16, 1, a, b, c);\n          }\n          var ob = (a) => {\n            if (!M)\n              try {\n                if (a(), !P())\n                  try {\n                    D ? Ta(N) : Na(N);\n                  } catch (b) {\n                    b instanceof U || "unwind" == b || z(1, b);\n                  }\n              } catch (b) {\n                b instanceof U || "unwind" == b || z(1, b);\n              }\n          };\n          function pb(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.tb && (Atomics.tb(p(), a >> 2, a).value.then(Y), a += 128, Atomics.store(p(), a >> 2, 1));\n          }\n          w.__emscripten_thread_mailbox_await = pb;\n          function Y() {\n            var a = X();\n            a && (pb(a), ob(() => qb()));\n          }\n          w.checkMailbox = Y;\n          var Z = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), rb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], sb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function tb(a, b, c, e, h, g, k, t) {\n            return D ? W(17, 1, a, b, c, e, h, g, k, t) : -52;\n          }\n          function ub(a, b, c, e, h, g, k) {\n            if (D)\n              return W(18, 1, a, b, c, e, h, g, k);\n          }\n          var wb = (a) => {\n            var b = ab(a) + 1, c = vb(b);\n            c && cb(a, c, b);\n            return c;\n          }, yb = (a) => {\n            var b = xb();\n            a = a();\n            Ra(b);\n            return a;\n          };\n          function W(a, b) {\n            var c = arguments.length - 2, e = arguments;\n            return yb(() => {\n              for (var h = zb(8 * c), g = h >> 3, k = 0; k < c; k++) {\n                var t = e[2 + k];\n                ea()[g + k >>> 0] = t;\n              }\n              return Ab(a, c, h, b);\n            });\n          }\n          var Bb = [], Cb = {}, Eb = () => {\n            if (!Db) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;\n              for (b in Cb)\n                void 0 === Cb[b] ? delete a[b] : a[b] = Cb[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Db = c;\n            }\n            return Db;\n          }, Db;\n          function Fb(a, b) {\n            if (D)\n              return W(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Eb().forEach(function(e, h) {\n              var g = b + c;\n              h = r()[a + 4 * h >> 2 >>> 0] = g;\n              for (g = 0; g < e.length; ++g)\n                aa()[h++ >> 0 >>> 0] = e.charCodeAt(g);\n              aa()[h >> 0 >>> 0] = 0;\n              c += e.length + 1;\n            });\n            return 0;\n          }\n          function Gb(a, b) {\n            if (D)\n              return W(20, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = Eb();\n            r()[a >> 2 >>> 0] = c.length;\n            var e = 0;\n            c.forEach(function(h) {\n              e += h.length + 1;\n            });\n            r()[b >> 2 >>> 0] = e;\n            return 0;\n          }\n          function Hb(a) {\n            return D ? W(21, 1, a) : 52;\n          }\n          function Lb(a, b, c, e) {\n            return D ? W(22, 1, a, b, c, e) : 52;\n          }\n          function Mb(a, b, c, e, h) {\n            return D ? W(23, 1, a, b, c, e, h) : 70;\n          }\n          var Nb = [null, [], []];\n          function Ob(a, b, c, e) {\n            if (D)\n              return W(24, 1, a, b, c, e);\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            for (var h = 0, g = 0; g < c; g++) {\n              var k = r()[b >> 2 >>> 0], t = r()[b + 4 >> 2 >>> 0];\n              b += 8;\n              for (var C = 0; C < t; C++) {\n                var v = n()[k + C >>> 0], y = Nb[a];\n                0 === v || 10 === v ? ((1 === a ? qa : I)(Ja(y, 0)), y.length = 0) : y.push(v);\n              }\n              h += t;\n            }\n            r()[e >> 2 >>> 0] = h;\n            return 0;\n          }\n          var Pb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Qb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Rb(a) {\n            var b = Array(ab(a) + 1);\n            bb(a, b, 0, b.length);\n            return b;\n          }\n          var Sb = (a, b) => {\n            aa().set(a, b >>> 0);\n          };\n          function Tb(a, b, c, e) {\n            function h(f, q, u) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < q; )\n                f = u[0] + f;\n              return f;\n            }\n            function g(f, q) {\n              return h(f, q, "0");\n            }\n            function k(f, q) {\n              function u(Ib) {\n                return 0 > Ib ? -1 : 0 < Ib ? 1 : 0;\n              }\n              var G;\n              0 === (G = u(f.getFullYear() - q.getFullYear())) && 0 === (G = u(f.getMonth() - q.getMonth())) && (G = u(f.getDate() - q.getDate()));\n              return G;\n            }\n            function t(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function C(f) {\n              var q = f.Pa;\n              for (f = new Date(new Date(f.Qa + 1900, 0, 1).getTime()); 0 < q; ) {\n                var u = f.getMonth(), G = (Z(f.getFullYear()) ? Pb : Qb)[u];\n                if (q > G - f.getDate())\n                  q -= G - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + q);\n                  break;\n                }\n              }\n              u = new Date(f.getFullYear() + 1, 0, 4);\n              q = t(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              u = t(u);\n              return 0 >= k(q, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            var v = p()[e + 40 >> 2 >>> 0];\n            e = { qb: p()[e >> 2 >>> 0], pb: p()[e + 4 >> 2 >>> 0], Sa: p()[e + 8 >> 2 >>> 0], Wa: p()[e + 12 >> 2 >>> 0], Ta: p()[e + 16 >> 2 >>> 0], Qa: p()[e + 20 >> 2 >>> 0], Ma: p()[e + 24 >> 2 >>> 0], Pa: p()[e + 28 >> 2 >>> 0], yb: p()[e + 32 >> 2 >>> 0], ob: p()[e + 36 >> 2 >>> 0], rb: v ? Ka(v) : "" };\n            c = Ka(c);\n            v = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var y in v)\n              c = c.replace(new RegExp(y, "g"), v[y]);\n            var Jb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Kb = "January February March April May June July August September October November December".split(" ");\n            v = {\n              "%a": (f) => Jb[f.Ma].substring(0, 3),\n              "%A": (f) => Jb[f.Ma],\n              "%b": (f) => Kb[f.Ta].substring(0, 3),\n              "%B": (f) => Kb[f.Ta],\n              "%C": (f) => g((f.Qa + 1900) / 100 | 0, 2),\n              "%d": (f) => g(f.Wa, 2),\n              "%e": (f) => h(f.Wa, 2, " "),\n              "%g": (f) => C(f).toString().substring(2),\n              "%G": (f) => C(f),\n              "%H": (f) => g(f.Sa, 2),\n              "%I": (f) => {\n                f = f.Sa;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return g(f, 2);\n              },\n              "%j": (f) => {\n                for (var q = 0, u = 0; u <= f.Ta - 1; q += (Z(f.Qa + 1900) ? Pb : Qb)[u++])\n                  ;\n                return g(f.Wa + q, 3);\n              },\n              "%m": (f) => g(f.Ta + 1, 2),\n              "%M": (f) => g(f.pb, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Sa && 12 > f.Sa ? "AM" : "PM",\n              "%S": (f) => g(f.qb, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Ma || 7,\n              "%U": (f) => g(Math.floor((f.Pa + 7 - f.Ma) / 7), 2),\n              "%V": (f) => {\n                var q = Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7);\n                2 >= (f.Ma + 371 - f.Pa - 2) % 7 && q++;\n                if (q)\n                  53 == q && (u = (f.Ma + 371 - f.Pa) % 7, 4 == u || 3 == u && Z(f.Qa) || (q = 1));\n                else {\n                  q = 52;\n                  var u = (f.Ma + 7 - f.Pa - 1) % 7;\n                  (4 == u || 5 == u && Z(f.Qa % 400 - 1)) && q++;\n                }\n                return g(q, 2);\n              },\n              "%w": (f) => f.Ma,\n              "%W": (f) => g(Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Qa + 1900).toString().substring(2),\n              "%Y": (f) => f.Qa + 1900,\n              "%z": (f) => {\n                f = f.ob;\n                var q = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (q ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.rb,\n              "%%": () => "%"\n            };\n            c = c.replace(\n              /%%/g,\n              "\\0\\0"\n            );\n            for (y in v)\n              c.includes(y) && (c = c.replace(new RegExp(y, "g"), v[y](e)));\n            c = c.replace(/\\0\\0/g, "%");\n            y = Rb(c);\n            if (y.length > b)\n              return 0;\n            Sb(y, a);\n            return y.length - 1;\n          }\n          V.Va();\n          var Ub = [null, La, Ma, Xa, Za, $a, db, eb, fb, gb, hb, ib, jb, kb, lb, mb, nb, tb, ub, Fb, Gb, Hb, Lb, Mb, Ob], Xb = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new Ua(a).Va(b >>> 0, c >>> 0);\n              Va = a;\n              Wa++;\n              throw Va;\n            },\n            N: function(a) {\n              Vb(a >>> 0, !A, 1, !ka, 131072, false);\n              V.Ya();\n            },\n            j: function(a) {\n              a >>>= 0;\n              D ? postMessage({ cmd: "cleanupThread", thread: a }) : Ga(a);\n            },\n            I: Ya,\n            h: Za,\n            T: $a,\n            D: db,\n            F: eb,\n            U: fb,\n            R: gb,\n            J: hb,\n            Q: ib,\n            n: jb,\n            E: kb,\n            B: lb,\n            S: mb,\n            C: nb,\n            q: () => true,\n            z: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => Y()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = V.La[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            L: function() {\n              return -1;\n            },\n            M: pb,\n            p: function(a) {\n              B && V.La[a >>> 0].ref();\n            },\n            t: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getUTCSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              p()[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              p()[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              p()[c + 28 >> 2 >>> 0] = a;\n            },\n            u: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getHours();\n              p()[c + 12 >> 2 >>> 0] = a.getDate();\n              p()[c + 16 >> 2 >>> 0] = a.getMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getDay();\n              b = (Z(a.getFullYear()) ? rb : sb)[a.getMonth()] + a.getDate() - 1 | 0;\n              p()[c + 28 >> 2 >>> 0] = b;\n              p()[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;\n              p()[c + 32 >> 2 >>> 0] = a;\n            },\n            v: function(a) {\n              a >>>= 0;\n              var b = new Date(p()[a + 20 >> 2 >>> 0] + 1900, p()[a + 16 >> 2 >>> 0], p()[a + 12 >> 2 >>> 0], p()[a + 8 >> 2 >>> 0], p()[a + 4 >> 2 >>> 0], p()[a >> 2 >>> 0], 0), c = p()[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), h = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), g = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(g, h);\n              0 > c ? p()[a + 32 >> 2 >>> 0] = Number(h != g && k == e) : 0 < c != (k == e) && (h = Math.max(g, h), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : h) - e)));\n              p()[a + 24 >> 2 >>> 0] = b.getDay();\n              c = (Z(b.getFullYear()) ? rb : sb)[b.getMonth()] + b.getDate() - 1 | 0;\n              p()[a + 28 >> 2 >>> 0] = c;\n              p()[a >> 2 >>> 0] = b.getSeconds();\n              p()[a + 4 >> 2 >>> 0] = b.getMinutes();\n              p()[a + 8 >> 2 >>> 0] = b.getHours();\n              p()[a + 12 >> 2 >>> 0] = b.getDate();\n              p()[a + 16 >> 2 >>> 0] = b.getMonth();\n              p()[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Wb((T = a, 1 <= +Math.abs(T) ? 0 < T ? +Math.floor(T / 4294967296) >>> 0 : ~~+Math.ceil((T - +(~~T >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            r: tb,\n            s: ub,\n            y: function(a, b, c) {\n              function e(v) {\n                return (v = v.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? v[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var h = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(h, 0, 1), k = new Date(h, 6, 1);\n              h = g.getTimezoneOffset();\n              var t = k.getTimezoneOffset(), C = Math.max(h, t);\n              r()[a >> 2 >>> 0] = 60 * C;\n              p()[b >> 2 >>> 0] = Number(h != t);\n              a = e(g);\n              b = e(k);\n              a = wb(a);\n              b = wb(b);\n              t < h ? (r()[c >> 2 >>> 0] = a, r()[c + 4 >> 2 >>> 0] = b) : (r()[c >> 2 >>> 0] = b, r()[c + 4 >> 2 >>> 0] = a);\n            },\n            c: () => {\n              K("");\n            },\n            k: function() {\n            },\n            i: function() {\n              return Date.now();\n            },\n            o: () => {\n              wa += 1;\n              throw "unwind";\n            },\n            A: function() {\n              return 4294901760;\n            },\n            e: () => performance.timeOrigin + performance.now(),\n            f: function() {\n              return B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency;\n            },\n            K: function(a, b, c, e) {\n              V.vb = b >>> 0;\n              Bb.length = c;\n              b = e >>> 0 >> 3;\n              for (e = 0; e < c; e++)\n                Bb[e] = ea()[b + e >>> 0];\n              return Ub[a].apply(null, Bb);\n            },\n            x: function(a) {\n              a >>>= 0;\n              var b = n().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var e = b * (1 + 0.2 / c);\n                e = Math.min(e, a + 100663296);\n                var h = Math;\n                e = Math.max(a, e);\n                a: {\n                  h = h.min.call(h, 4294901760, e + (65536 - e % 65536) % 65536) - d.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    d.grow(h);\n                    m();\n                    var g = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  g = void 0;\n                }\n                if (g)\n                  return true;\n              }\n              return false;\n            },\n            O: Fb,\n            P: Gb,\n            H: Na,\n            g: Hb,\n            m: Lb,\n            w: Mb,\n            l: Ob,\n            a: d || w.wasmMemory,\n            G: Tb,\n            d: function(a, b, c, e) {\n              return Tb(a >>> 0, b >>> 0, c >>> 0, e >>> 0);\n            }\n          };\n          (function() {\n            function a(c, e) {\n              c = c.exports;\n              L = c = Yb(c);\n              V.Za.push(L.ya);\n              sa = L.za;\n              ua.unshift(L.V);\n              ra = e;\n              za();\n              return c;\n            }\n            var b = { a: Xb };\n            ya();\n            if (w.instantiateWasm)\n              try {\n                return w.instantiateWasm(b, a);\n              } catch (c) {\n                I("Module.instantiateWasm callback failed with error: " + c), x(c);\n              }\n            Ea(b, function(c) {\n              a(c.instance, c.module);\n            }).catch(x);\n            return {};\n          })();\n          w._OrtInit = (a, b) => (w._OrtInit = L.W)(a, b);\n          w._OrtGetLastError = (a, b) => (w._OrtGetLastError = L.X)(a, b);\n          w._OrtCreateSessionOptions = (a, b, c, e, h, g, k, t, C, v) => (w._OrtCreateSessionOptions = L.Y)(a, b, c, e, h, g, k, t, C, v);\n          w._OrtAppendExecutionProvider = (a, b) => (w._OrtAppendExecutionProvider = L.Z)(a, b);\n          w._OrtAddFreeDimensionOverride = (a, b, c) => (w._OrtAddFreeDimensionOverride = L._)(a, b, c);\n          w._OrtAddSessionConfigEntry = (a, b, c) => (w._OrtAddSessionConfigEntry = L.$)(a, b, c);\n          w._OrtReleaseSessionOptions = (a) => (w._OrtReleaseSessionOptions = L.aa)(a);\n          w._OrtCreateSession = (a, b, c) => (w._OrtCreateSession = L.ba)(a, b, c);\n          w._OrtReleaseSession = (a) => (w._OrtReleaseSession = L.ca)(a);\n          w._OrtGetInputOutputCount = (a, b, c) => (w._OrtGetInputOutputCount = L.da)(a, b, c);\n          w._OrtGetInputName = (a, b) => (w._OrtGetInputName = L.ea)(a, b);\n          w._OrtGetOutputName = (a, b) => (w._OrtGetOutputName = L.fa)(a, b);\n          w._OrtFree = (a) => (w._OrtFree = L.ga)(a);\n          w._OrtCreateTensor = (a, b, c, e, h, g) => (w._OrtCreateTensor = L.ha)(a, b, c, e, h, g);\n          w._OrtGetTensorData = (a, b, c, e, h) => (w._OrtGetTensorData = L.ia)(a, b, c, e, h);\n          w._OrtReleaseTensor = (a) => (w._OrtReleaseTensor = L.ja)(a);\n          w._OrtCreateRunOptions = (a, b, c, e) => (w._OrtCreateRunOptions = L.ka)(a, b, c, e);\n          w._OrtAddRunConfigEntry = (a, b, c) => (w._OrtAddRunConfigEntry = L.la)(a, b, c);\n          w._OrtReleaseRunOptions = (a) => (w._OrtReleaseRunOptions = L.ma)(a);\n          w._OrtCreateBinding = (a) => (w._OrtCreateBinding = L.na)(a);\n          w._OrtBindInput = (a, b, c) => (w._OrtBindInput = L.oa)(a, b, c);\n          w._OrtBindOutput = (a, b, c, e) => (w._OrtBindOutput = L.pa)(a, b, c, e);\n          w._OrtClearBoundOutputs = (a) => (w._OrtClearBoundOutputs = L.qa)(a);\n          w._OrtReleaseBinding = (a) => (w._OrtReleaseBinding = L.ra)(a);\n          w._OrtRunWithBinding = (a, b, c, e, h) => (w._OrtRunWithBinding = L.sa)(a, b, c, e, h);\n          w._OrtRun = (a, b, c, e, h, g, k, t) => (w._OrtRun = L.ta)(a, b, c, e, h, g, k, t);\n          w._OrtEndProfiling = (a) => (w._OrtEndProfiling = L.ua)(a);\n          var X = w._pthread_self = () => (X = w._pthread_self = L.va)(), vb = w._malloc = (a) => (vb = w._malloc = L.wa)(a);\n          w._free = (a) => (w._free = L.xa)(a);\n          w.__emscripten_tls_init = () => (w.__emscripten_tls_init = L.ya)();\n          var Vb = w.__emscripten_thread_init = (a, b, c, e, h, g) => (Vb = w.__emscripten_thread_init = L.Aa)(a, b, c, e, h, g);\n          w.__emscripten_thread_crashed = () => (w.__emscripten_thread_crashed = L.Ba)();\n          var Ab = (a, b, c, e) => (Ab = L.Ca)(a, b, c, e), Oa = (a) => (Oa = L.Da)(a), Ta = w.__emscripten_thread_exit = (a) => (Ta = w.__emscripten_thread_exit = L.Ea)(a), qb = w.__emscripten_check_mailbox = () => (qb = w.__emscripten_check_mailbox = L.Fa)(), Wb = (a) => (Wb = L.Ga)(a), Qa = (a, b) => (Qa = L.Ha)(a, b), xb = () => (xb = L.Ia)(), Ra = (a) => (Ra = L.Ja)(a), zb = (a) => (zb = L.Ka)(a);\n          function Yb(a) {\n            a = Object.assign({}, a);\n            var b = (e) => () => e() >>> 0, c = (e) => (h) => e(h) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.pthread_self = b(a.pthread_self);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          w.keepRuntimeAlive = P;\n          w.wasmMemory = d;\n          w.stackAlloc = zb;\n          w.stackSave = xb;\n          w.stackRestore = Ra;\n          w.UTF8ToString = Ka;\n          w.stringToUTF8 = cb;\n          w.lengthBytesUTF8 = ab;\n          w.ExitStatus = U;\n          w.PThread = V;\n          var Zb;\n          R = function $b() {\n            Zb || ac();\n            Zb || (R = $b);\n          };\n          function ac() {\n            function a() {\n              if (!Zb && (Zb = true, w.calledRun = true, !M)) {\n                D || Pa(ua);\n                ha(w);\n                if (w.onRuntimeInitialized)\n                  w.onRuntimeInitialized();\n                if (!D) {\n                  if (w.postRun)\n                    for ("function" == typeof w.postRun && (w.postRun = [w.postRun]); w.postRun.length; ) {\n                      var b = w.postRun.shift();\n                      va.unshift(b);\n                    }\n                  Pa(va);\n                }\n              }\n            }\n            if (!(0 < Q))\n              if (D)\n                ha(w), D || Pa(ua), startWorker(w);\n              else {\n                if (w.preRun)\n                  for ("function" == typeof w.preRun && (w.preRun = [w.preRun]); w.preRun.length; )\n                    ta.unshift(w.preRun.shift());\n                Pa(ta);\n                0 < Q || (w.setStatus ? (w.setStatus("Running..."), setTimeout(function() {\n                  setTimeout(\n                    function() {\n                      w.setStatus("");\n                    },\n                    1\n                  );\n                  a();\n                }, 1)) : a());\n              }\n          }\n          if (w.preInit)\n            for ("function" == typeof w.preInit && (w.preInit = [w.preInit]); 0 < w.preInit.length; )\n              w.preInit.pop()();\n          ac();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason??e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (true) {\n    ortWasmFactory = require_ort_training_wasm_simd();\n  } else {\n    ortWasmFactory = true ? null : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = (numThreads) => {\n    if (numThreads === 1) {\n      return false;\n    }\n    if (typeof SharedArrayBuffer === "undefined") {\n      if (typeof self !== "undefined" && !self.crossOriginIsolated) {\n        console.warn(\n          "env.wasm.numThreads is set to " + numThreads + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."\n        );\n      }\n      return false;\n    }\n    if (typeof process !== "undefined" && process.versions && process.versions.node) {\n      console.warn(\n        "env.wasm.numThreads is set to " + numThreads + ", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios."\n      );\n    }\n    try {\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (true) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = isMultiThreadSupported(numThreads);\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        config.numThreads = numThreads;\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.enableGraphCapture !== void 0) {\n        if (typeof sessionOptions.enableGraphCapture !== "boolean") {\n          throw new Error(`enableGraphCapture must be a boolean value: ${sessionOptions.enableGraphCapture}`);\n        }\n        const keyDataOffset = allocWasmString("enableGraphCapture", allocs);\n        const valueDataOffset = allocWasmString(sessionOptions.enableGraphCapture.toString(), allocs);\n        if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n          checkLastError(\n            `Can\'t set a session config entry: \'enableGraphCapture\' - ${sessionOptions.enableGraphCapture}.`\n          );\n        }\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return typeof Float16Array !== "undefined" && Float16Array.from ? Float16Array : Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "float16" || type === "int32" || type === "int64" || type === "uint32" || type === "uint8" || type === "bool";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  init_fs();\n\n  // nodejs-ignore:node:fs/promises\n  var readFile2 = void 0;\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  var loadFile = async (file) => {\n    if (typeof file === "string") {\n      if (typeof process !== "undefined" && process.versions && process.versions.node) {\n        try {\n          return new Uint8Array(await readFile2(file));\n        } catch (e) {\n          if (e.code === "ERR_FS_FILE_TOO_LARGE") {\n            const stream = createReadStream(file);\n            const chunks = [];\n            for await (const chunk of stream) {\n              chunks.push(chunk);\n            }\n            return new Uint8Array(Buffer.concat(chunks));\n          }\n          throw e;\n        }\n      } else {\n        const response = await fetch(file);\n        if (!response.ok) {\n          throw new Error(`failed to load external data file: ${file}`);\n        }\n        const contentLengthHeader = response.headers.get("Content-Length");\n        const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;\n        if (fileSize < 1073741824) {\n          return new Uint8Array(await response.arrayBuffer());\n        } else {\n          if (!response.body) {\n            throw new Error(`failed to load external data file: ${file}, no response body.`);\n          }\n          const reader = response.body.getReader();\n          let buffer;\n          try {\n            buffer = new ArrayBuffer(fileSize);\n          } catch (e) {\n            if (e instanceof RangeError) {\n              const pages = Math.ceil(fileSize / 65536);\n              buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;\n            } else {\n              throw e;\n            }\n          }\n          let offset = 0;\n          while (true) {\n            const { done, value } = await reader.read();\n            if (done) {\n              break;\n            }\n            const chunkSize = value.byteLength;\n            const chunk = new Uint8Array(buffer, offset, chunkSize);\n            chunk.set(value);\n            offset += chunkSize;\n          }\n          return new Uint8Array(buffer, 0, fileSize);\n        }\n      }\n    } else if (file instanceof Blob) {\n      return new Uint8Array(await file.arrayBuffer());\n    } else if (file instanceof Uint8Array) {\n      return file;\n    } else {\n      return new Uint8Array(file);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n  };\n  var initEp = async (env, epName) => {\n    if (false) {\n      const initJsep = null.init;\n      if (epName === "webgpu") {\n        if (typeof navigator === "undefined" || !navigator.gpu) {\n          throw new Error("WebGPU is not supported in current environment");\n        }\n        let adapter = env.webgpu.adapter;\n        if (!adapter) {\n          const powerPreference = env.webgpu.powerPreference;\n          if (powerPreference !== void 0 && powerPreference !== "low-power" && powerPreference !== "high-performance") {\n            throw new Error(`Invalid powerPreference setting: "${powerPreference}"`);\n          }\n          const forceFallbackAdapter = env.webgpu.forceFallbackAdapter;\n          if (forceFallbackAdapter !== void 0 && typeof forceFallbackAdapter !== "boolean") {\n            throw new Error(`Invalid forceFallbackAdapter setting: "${forceFallbackAdapter}"`);\n          }\n          adapter = await navigator.gpu.requestAdapter({ powerPreference, forceFallbackAdapter });\n          if (!adapter) {\n            throw new Error(\n              \'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.\'\n            );\n          }\n        } else {\n          if (typeof adapter.limits !== "object" || typeof adapter.features !== "object" || typeof adapter.requestDevice !== "function") {\n            throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");\n          }\n        }\n        if (!env.wasm.simd) {\n          throw new Error(\n            "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"\n          );\n        }\n        await initJsep("webgpu", getInstance(), env, adapter);\n      }\n      if (epName === "webnn") {\n        if (typeof navigator === "undefined" || !navigator.ml) {\n          throw new Error("WebNN is not supported in current environment");\n        }\n        await initJsep("webnn", getInstance(), env);\n      }\n    }\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var copyFromExternalBuffer = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSession = async (modelData, options) => {\n    let modelDataOffset, modelDataLength;\n    const wasm2 = getInstance();\n    if (Array.isArray(modelData)) {\n      [modelDataOffset, modelDataLength] = modelData;\n    } else if (modelData.buffer === wasm2.HEAPU8.buffer) {\n      [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];\n    } else {\n      [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);\n    }\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      if (options?.externalData && wasm2.mountExternalData) {\n        const loadingPromises = [];\n        for (const file of options.externalData) {\n          const path = typeof file === "string" ? file : file.path;\n          loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {\n            wasm2.mountExternalData(path, data);\n          }));\n        }\n        await Promise.all(loadingPromises);\n      }\n      sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const enableGraphCapture = !!options?.enableGraphCapture;\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          if (enableGraphCapture && options?.preferredOutputLocation === void 0) {\n            outputPreferredLocations.push("gpu-buffer");\n            continue;\n          }\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          if (enableGraphCapture && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}. Only \'gpu-buffer\' location is supported when enableGraphCapture is true.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(\n        sessionHandle,\n        [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState, enableGraphCapture, false]\n      );\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelDataOffset);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      wasm2.unmountExternalData?.();\n    }\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture] = session;\n    if (ioBindingState) {\n      if (enableGraphCapture) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepOnReleaseSession?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index, enableGraphCapture = false) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (enableGraphCapture && location !== "gpu-buffer") {\n      throw new Error(\n        `External buffer must be provided for input/output index ${index} when enableGraphCapture is true.`\n      );\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      const registerBuffer = wasm2.jsepRegisterBuffer;\n      if (!registerBuffer) {\n        throw new Error(\'Tensor location "gpu-buffer" is not supported without using WebGPU.\');\n      }\n      rawData = registerBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const sessionHandle = session[0];\n    const inputNamesUTF8Encoded = session[1];\n    const outputNamesUTF8Encoded = session[2];\n    const ioBindingState = session[3];\n    const enableGraphCapture = session[4];\n    const inputOutputBound = session[5];\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(\n          inputTensors[i],\n          inputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputIndices[i],\n          enableGraphCapture\n        );\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i],\n          enableGraphCapture\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n        activeSessions.set(\n          sessionId,\n          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, true]\n        );\n      }\n      wasm2.jsepOnRunStart?.(sessionHandle);\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const getBuffer = wasm2.jsepGetBuffer;\n              if (!getBuffer) {\n                throw new Error(\'preferredLocation "gpu-buffer" is not supported without using WebGPU.\');\n              }\n              const gpuBuffer = getBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState && !enableGraphCapture) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n        activeSessions.set(\n          sessionId,\n          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, false]\n        );\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    const { type, in: message } = ev.data;\n    try {\n      switch (type) {\n        case "init-wasm":\n          initializeWebAssembly(message.wasm).then(\n            () => {\n              initRuntime(message).then(\n                () => {\n                  postMessage({ type });\n                },\n                (err) => {\n                  postMessage({ type, err });\n                }\n              );\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        case "init-ep": {\n          const { epName, env } = message;\n          initEp(env, epName).then(\n            () => {\n              postMessage({ type });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "copy-from": {\n          const { buffer } = message;\n          const bufferData = copyFromExternalBuffer(buffer);\n          postMessage({ type, out: bufferData });\n          break;\n        }\n        case "create": {\n          const { model, options } = message;\n          createSession(model, options).then(\n            (sessionMetadata) => {\n              postMessage({ type, out: sessionMetadata });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "release":\n          releaseSession(message);\n          postMessage({ type });\n          break;\n        case "run": {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = message;\n          run(sessionId, inputIndices, inputs, outputIndices, new Array(outputIndices.length).fill(null), options).then(\n            (outputs) => {\n              if (outputs.some((o) => o[3] !== "cpu")) {\n                postMessage({ type, err: "Proxy does not support non-cpu tensor location." });\n              } else {\n                postMessage(\n                  { type, out: outputs },\n                  extractTransferableBuffers([...inputs, ...outputs])\n                );\n              }\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "end-profiling":\n          endProfiling(message);\n          postMessage({ type });\n          break;\n        default:\n      }\n    } catch (err) {\n      postMessage({ type, err });\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzIiwgIm5vZGVqcy1pZ25vcmU6d29ya2VyX3RocmVhZHMiLCAibm9kZWpzLWlnbm9yZTpwZXJmX2hvb2tzIiwgIm5vZGVqcy1pZ25vcmU6b3MiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcyIsICIuLi8uLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcyIsICJub2RlanMtaWdub3JlOm5vZGU6cGF0aCIsICIuLi8uLi9saWIvd2FzbS93YXNtLWZhY3RvcnkudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy50cyIsICIuLi8uLi9saWIvd2FzbS9ydW4tb3B0aW9ucy50cyIsICIuLi8uLi9saWIvd2FzbS9zZXNzaW9uLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb21tb24udHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy1sb2FkLWZpbGUudHMiLCAibm9kZWpzLWlnbm9yZTpub2RlOmZzL3Byb21pc2VzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tY29yZS1pbXBsLnRzIiwgIi4uLy4uL2xpYi93YXNtL3Byb3h5LXdvcmtlci9tYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc20gPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxudmFyIGQ9bW9kdWxlQXJnLGssbDtkLnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57az1hO2w9Yn0pO3ZhciByPU9iamVjdC5hc3NpZ24oe30sZCksdj1cIi4vdGhpcy5wcm9ncmFtXCIsYWE9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyx4PVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsYmE9XCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MmJlwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zJiZcInN0cmluZ1wiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLHk9XCJcIixBLEIsQztcbmlmKGJhKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLEQ9cmVxdWlyZShcInBhdGhcIik7eT14P0QuZGlybmFtZSh5KStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7QT0oYSxiKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkQubm9ybWFsaXplKGEpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYSxiP3ZvaWQgMDpcInV0ZjhcIil9O0M9YT0+e2E9QShhLCEwKTthLmJ1ZmZlcnx8KGE9bmV3IFVpbnQ4QXJyYXkoYSkpO3JldHVybiBhfTtCPShhLGIsYyxlPSEwKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkQubm9ybWFsaXplKGEpO2ZzLnJlYWRGaWxlKGEsZT92b2lkIDA6XCJ1dGY4XCIsKGcsaCk9PntnP2MoZyk6YihlP2guYnVmZmVyOmgpfSl9OyFkLnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJih2PXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ZC5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCJ9ZWxzZSBpZihhYXx8XG54KXg/eT1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksX3NjcmlwdERpciYmKHk9X3NjcmlwdERpciksMCE9PXkuaW5kZXhPZihcImJsb2I6XCIpP3k9eS5zdWJzdHIoMCx5LnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOnk9XCJcIixBPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0seCYmKEM9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLEI9KGEsYixjKT0+e3ZhciBlPW5ldyBYTUxIdHRwUmVxdWVzdDtlLm9wZW4oXCJHRVRcIixhLCEwKTtlLnJlc3BvbnNlVHlwZT1cblwiYXJyYXlidWZmZXJcIjtlLm9ubG9hZD0oKT0+ezIwMD09ZS5zdGF0dXN8fDA9PWUuc3RhdHVzJiZlLnJlc3BvbnNlP2IoZS5yZXNwb25zZSk6YygpfTtlLm9uZXJyb3I9YztlLnNlbmQobnVsbCl9O3ZhciBjYT1kLnByaW50fHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLEU9ZC5wcmludEVycnx8Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZCxyKTtyPW51bGw7ZC50aGlzUHJvZ3JhbSYmKHY9ZC50aGlzUHJvZ3JhbSk7dmFyIEY7ZC53YXNtQmluYXJ5JiYoRj1kLndhc21CaW5hcnkpO3ZhciBub0V4aXRSdW50aW1lPWQubm9FeGl0UnVudGltZXx8ITA7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZHKFwibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZFwiKTt2YXIgSCxJLGRhPSExLEosSyxMLE07XG5mdW5jdGlvbiBlYSgpe3ZhciBhPUguYnVmZmVyO2QuSEVBUDg9Sj1uZXcgSW50OEFycmF5KGEpO2QuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO2QuSEVBUDMyPUw9bmV3IEludDMyQXJyYXkoYSk7ZC5IRUFQVTg9Sz1uZXcgVWludDhBcnJheShhKTtkLkhFQVBVMTY9bmV3IFVpbnQxNkFycmF5KGEpO2QuSEVBUFUzMj1NPW5ldyBVaW50MzJBcnJheShhKTtkLkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTtkLkhFQVBGNjQ9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgZmE9W10saGE9W10saWE9W107ZnVuY3Rpb24gamEoKXt2YXIgYT1kLnByZVJ1bi5zaGlmdCgpO2ZhLnVuc2hpZnQoYSl9dmFyIE49MCxPPW51bGwsUD1udWxsO1xuZnVuY3Rpb24gRyhhKXtpZihkLm9uQWJvcnQpZC5vbkFib3J0KGEpO2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7RShhKTtkYT0hMDthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7bChhKTt0aHJvdyBhO31mdW5jdGlvbiBrYShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgUTtRPVwib3J0LXRyYWluaW5nLXdhc20tc2ltZC53YXNtXCI7aWYoIWthKFEpKXt2YXIgbGE9UTtRPWQubG9jYXRlRmlsZT9kLmxvY2F0ZUZpbGUobGEseSk6eStsYX1mdW5jdGlvbiBtYShhKXtpZihhPT1RJiZGKXJldHVybiBuZXcgVWludDhBcnJheShGKTtpZihDKXJldHVybiBDKGEpO3Rocm93XCJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZFwiO31cbmZ1bmN0aW9uIG5hKGEpe2lmKCFGJiYoYWF8fHgpKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmZXRjaCYmIWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93XCJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICdcIithK1wiJ1wiO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+bWEoYSkpO2lmKEIpcmV0dXJuIG5ldyBQcm9taXNlKChiLGMpPT57QihhLGU9PmIobmV3IFVpbnQ4QXJyYXkoZSkpLGMpfSl9cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9Pm1hKGEpKX1mdW5jdGlvbiBvYShhLGIsYyl7cmV0dXJuIG5hKGEpLnRoZW4oZT0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZSxiKSkudGhlbihlPT5lKS50aGVuKGMsZT0+e0UoXCJmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiBcIitlKTtHKGUpfSl9XG5mdW5jdGlvbiBwYShhLGIpe3ZhciBjPVE7cmV0dXJuIEZ8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nfHxrYShjKXx8Yy5zdGFydHNXaXRoKFwiZmlsZTovL1wiKXx8YmF8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP29hKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGU9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGUsYSkudGhlbihiLGZ1bmN0aW9uKGcpe0UoXCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogXCIrZyk7RShcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBvYShjLGEsYil9KSl9dmFyIFIsUz1hPT57Zm9yKDswPGEubGVuZ3RoOylhLnNoaWZ0KCkoZCl9O1xuZnVuY3Rpb24gcWEoYSl7dGhpcy5KYT1hLTI0O3RoaXMuTmE9ZnVuY3Rpb24oYil7TVt0aGlzLkphKzQ+PjI+Pj4wXT1ifTt0aGlzLk1hPWZ1bmN0aW9uKGIpe01bdGhpcy5KYSs4Pj4yPj4+MF09Yn07dGhpcy5LYT1mdW5jdGlvbihiLGMpe3RoaXMuTGEoKTt0aGlzLk5hKGIpO3RoaXMuTWEoYyl9O3RoaXMuTGE9ZnVuY3Rpb24oKXtNW3RoaXMuSmErMTY+PjI+Pj4wXT0wfX1cbnZhciByYT0wLHNhPTAsdGE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLHVhPShhLGIsYyk9PntiPj4+PTA7dmFyIGU9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1lKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJnRhKXJldHVybiB0YS5kZWNvZGUoYS5zdWJhcnJheShiLGMpKTtmb3IoZT1cIlwiO2I8Yzspe3ZhciBnPWFbYisrXTtpZihnJjEyOCl7dmFyIGg9YVtiKytdJjYzO2lmKDE5Mj09KGcmMjI0KSllKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChnJjMxKTw8NnxoKTtlbHNle3ZhciBtPWFbYisrXSY2MztnPTIyND09KGcmMjQwKT8oZyYxNSk8PDEyfGg8PDZ8bTooZyY3KTw8MTh8aDw8MTJ8bTw8NnxhW2IrK10mNjM7NjU1MzY+Zz9lKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpOihnLT02NTUzNixlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGc+PjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGUrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGV9LFxuVD0oYSxiKT0+KGE+Pj49MCk/dWEoSyxhLGIpOlwiXCIsVT1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZT1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1lP2IrKzoyMDQ3Pj1lP2IrPTI6NTUyOTY8PWUmJjU3MzQzPj1lPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sVj0oYSxiLGMsZSk9PntjPj4+PTA7aWYoISgwPGUpKXJldHVybiAwO3ZhciBnPWM7ZT1jK2UtMTtmb3IodmFyIGg9MDtoPGEubGVuZ3RoOysraCl7dmFyIG09YS5jaGFyQ29kZUF0KGgpO2lmKDU1Mjk2PD1tJiY1NzM0Mz49bSl7dmFyIHE9YS5jaGFyQ29kZUF0KCsraCk7bT02NTUzNisoKG0mMTAyMyk8PDEwKXxxJjEwMjN9aWYoMTI3Pj1tKXtpZihjPj1lKWJyZWFrO2JbYysrPj4+MF09bX1lbHNle2lmKDIwNDc+PW0pe2lmKGMrMT49ZSlicmVhaztiW2MrKz4+PjBdPTE5MnxtPj42fWVsc2V7aWYoNjU1MzU+PW0pe2lmKGMrMj49ZSlicmVhaztiW2MrKz4+PjBdPTIyNHxtPj4xMn1lbHNle2lmKGMrMz49XG5lKWJyZWFrO2JbYysrPj4+MF09MjQwfG0+PjE4O2JbYysrPj4+MF09MTI4fG0+PjEyJjYzfWJbYysrPj4+MF09MTI4fG0+PjYmNjN9YltjKys+Pj4wXT0xMjh8bSY2M319YltjPj4+MF09MDtyZXR1cm4gYy1nfSxXPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCksdmE9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sd2E9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sQmE9YT0+e3ZhciBiPVUoYSkrMSxjPUFhKGIpO2MmJlYoYSxLLGMsYik7cmV0dXJuIGN9LFg9e30sQ2E9KCk9PntpZighWSl7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFxuXCJfXCIpK1wiLlVURi04XCIsXzp2fHxcIi4vdGhpcy5wcm9ncmFtXCJ9LGI7Zm9yKGIgaW4gWCl2b2lkIDA9PT1YW2JdP2RlbGV0ZSBhW2JdOmFbYl09WFtiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7WT1jfXJldHVybiBZfSxZLERhPVtudWxsLFtdLFtdXSxFYT1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLEZhPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gR2EoYSl7dmFyIGI9QXJyYXkoVShhKSsxKTtWKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIEhhKGEsYixjLGUpe2Z1bmN0aW9uIGcoZixuLHApe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPG47KWY9cFswXStmO3JldHVybiBmfWZ1bmN0aW9uIGgoZixuKXtyZXR1cm4gZyhmLG4sXCIwXCIpfWZ1bmN0aW9uIG0oZixuKXtmdW5jdGlvbiBwKHhhKXtyZXR1cm4gMD54YT8tMTowPHhhPzE6MH12YXIgejswPT09KHo9cChmLmdldEZ1bGxZZWFyKCktbi5nZXRGdWxsWWVhcigpKSkmJjA9PT0oej1wKGYuZ2V0TW9udGgoKS1uLmdldE1vbnRoKCkpKSYmKHo9cChmLmdldERhdGUoKS1uLmdldERhdGUoKSkpO3JldHVybiB6fWZ1bmN0aW9uIHEoZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiB3KGYpe3ZhciBuPWYuRWE7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuRmErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8bjspe3ZhciBwPWYuZ2V0TW9udGgoKSx6PShXKGYuZ2V0RnVsbFllYXIoKSk/RWE6RmEpW3BdO2lmKG4+ei1mLmdldERhdGUoKSluLT16LWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnA/Zi5zZXRNb250aChwKzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStuKTticmVha319cD1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO249cShuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTtwPXEocCk7cmV0dXJuIDA+PW0obixmKT8wPj1tKHAsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2U+Pj49MDt2YXIgdD1MW2UrNDA+PjI+Pj4wXTtlPXtRYTpMW2U+PjI+Pj4wXSxQYTpMW2UrND4+Mj4+PjBdLEdhOkxbZSs4Pj4yPj4+MF0sSWE6TFtlKzEyPj4yPj4+MF0sSGE6TFtlKzE2Pj4yPj4+MF0sRmE6TFtlKzIwPj4yPj4+MF0semE6TFtlKzI0Pj4yPj4+MF0sRWE6TFtlKzI4Pj4yPj4+MF0sU2E6TFtlKzMyPj4yPj4+MF0sT2E6TFtlKzM2Pj4yPj4+MF0sUmE6dD9UKHQpOlwiXCJ9O2M9VChjKTt0PXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXCIlWFwiOlwiJUg6JU06JVNcIixcIiVFY1wiOlwiJWNcIixcblwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIHUgaW4gdCljPWMucmVwbGFjZShuZXcgUmVnRXhwKHUsXCJnXCIpLHRbdV0pO3ZhciB5YT1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLHphPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTt0PXtcIiVhXCI6Zj0+eWFbZi56YV0uc3Vic3RyaW5nKDAsMyksXCIlQVwiOmY9PnlhW2YuemFdLFwiJWJcIjpmPT5cbnphW2YuSGFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT56YVtmLkhhXSxcIiVDXCI6Zj0+aCgoZi5GYSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6Zj0+aChmLklhLDIpLFwiJWVcIjpmPT5nKGYuSWEsMixcIiBcIiksXCIlZ1wiOmY9PncoZikudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOmY9PncoZiksXCIlSFwiOmY9PmgoZi5HYSwyKSxcIiVJXCI6Zj0+e2Y9Zi5HYTswPT1mP2Y9MTI6MTI8ZiYmKGYtPTEyKTtyZXR1cm4gaChmLDIpfSxcIiVqXCI6Zj0+e2Zvcih2YXIgbj0wLHA9MDtwPD1mLkhhLTE7bis9KFcoZi5GYSsxOTAwKT9FYTpGYSlbcCsrXSk7cmV0dXJuIGgoZi5JYStuLDMpfSxcIiVtXCI6Zj0+aChmLkhhKzEsMiksXCIlTVwiOmY9PmgoZi5QYSwyKSxcIiVuXCI6KCk9PlwiXFxuXCIsXCIlcFwiOmY9PjA8PWYuR2EmJjEyPmYuR2E/XCJBTVwiOlwiUE1cIixcIiVTXCI6Zj0+aChmLlFhLDIpLFwiJXRcIjooKT0+XCJcXHRcIixcIiV1XCI6Zj0+Zi56YXx8NyxcIiVVXCI6Zj0+aChNYXRoLmZsb29yKChmLkVhKzctZi56YSkvNyksMiksXCIlVlwiOmY9Plxue3ZhciBuPU1hdGguZmxvb3IoKGYuRWErNy0oZi56YSs2KSU3KS83KTsyPj0oZi56YSszNzEtZi5FYS0yKSU3JiZuKys7aWYobik1Mz09biYmKHA9KGYuemErMzcxLWYuRWEpJTcsND09cHx8Mz09cCYmVyhmLkZhKXx8KG49MSkpO2Vsc2V7bj01Mjt2YXIgcD0oZi56YSs3LWYuRWEtMSklNzsoND09cHx8NT09cCYmVyhmLkZhJTQwMC0xKSkmJm4rK31yZXR1cm4gaChuLDIpfSxcIiV3XCI6Zj0+Zi56YSxcIiVXXCI6Zj0+aChNYXRoLmZsb29yKChmLkVhKzctKGYuemErNiklNykvNyksMiksXCIleVwiOmY9PihmLkZhKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjpmPT5mLkZhKzE5MDAsXCIlelwiOmY9PntmPWYuT2E7dmFyIG49MDw9ZjtmPU1hdGguYWJzKGYpLzYwO3JldHVybihuP1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKGYvNjAqMTAwK2YlNjApKS5zbGljZSgtNCl9LFwiJVpcIjpmPT5mLlJhLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFwiXFx4MDBcXHgwMFwiKTtmb3IodSBpbiB0KWMuaW5jbHVkZXModSkmJlxuKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodSxcImdcIiksdFt1XShlKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7dT1HYShjKTtpZih1Lmxlbmd0aD5iKXJldHVybiAwO0ouc2V0KHUsYT4+PjApO3JldHVybiB1Lmxlbmd0aC0xfVxudmFyIEphPXthOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBxYShhKSkuS2EoYj4+PjAsYz4+PjApO3JhPWE7c2ErKzt0aHJvdyByYTt9LGU6ZnVuY3Rpb24oKXtyZXR1cm4gMH0sSDpmdW5jdGlvbigpe30seDpmdW5jdGlvbigpe30sejpmdW5jdGlvbigpe30sazpmdW5jdGlvbigpe3JldHVybiAwfSxGOmZ1bmN0aW9uKCl7fSxCOmZ1bmN0aW9uKCl7fSxFOmZ1bmN0aW9uKCl7fSxnOmZ1bmN0aW9uKCl7fSx5OmZ1bmN0aW9uKCl7fSx2OmZ1bmN0aW9uKCl7fSxHOmZ1bmN0aW9uKCl7fSx3OmZ1bmN0aW9uKCl7fSxsOigpPT4hMCxvOmZ1bmN0aW9uKGEsYixjKXthPWIrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtMW2M+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtMW2MrND4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO0xbYys4Pj4yPj4+MF09YS5nZXRVVENIb3VycygpO0xbYysxMj4+Mj4+PlxuMF09YS5nZXRVVENEYXRlKCk7TFtjKzE2Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO0xbYysyMD4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO0xbYysyND4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7TFtjKzI4Pj4yPj4+MF09KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDB9LHA6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0xbYz4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO0xbYys0Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7TFtjKzg+PjI+Pj4wXT1hLmdldEhvdXJzKCk7TFtjKzEyPj4yPj4+MF09YS5nZXREYXRlKCk7TFtjKzE2Pj4yPj4+MF09YS5nZXRNb250aCgpO0xbYysyMD4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO0xbYysyND4+Mj4+PjBdPWEuZ2V0RGF5KCk7TFtjKzI4Pj4yPj4+XG4wXT0oVyhhLmdldEZ1bGxZZWFyKCkpP3ZhOndhKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtMW2MrMzY+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGU9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0xbYyszMj4+Mj4+PjBdPShiIT1lJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGUsYikpfDB9LHE6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKExbYSsyMD4+Mj4+PjBdKzE5MDAsTFthKzE2Pj4yPj4+MF0sTFthKzEyPj4yPj4+MF0sTFthKzg+PjI+Pj4wXSxMW2ErND4+Mj4+PjBdLExbYT4+Mj4+PjBdLDApLGM9TFthKzMyPj4yPj4+MF0sZT1iLmdldFRpbWV6b25lT2Zmc2V0KCksZz0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksXG5oPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxtPU1hdGgubWluKGgsZyk7MD5jP0xbYSszMj4+Mj4+PjBdPU51bWJlcihnIT1oJiZtPT1lKTowPGMhPShtPT1lKSYmKGc9TWF0aC5tYXgoaCxnKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP206ZyktZSkpKTtMW2ErMjQ+PjI+Pj4wXT1iLmdldERheSgpO0xbYSsyOD4+Mj4+PjBdPShXKGIuZ2V0RnVsbFllYXIoKSk/dmE6d2EpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO0xbYT4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO0xbYSs0Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7TFthKzg+PjI+Pj4wXT1iLmdldEhvdXJzKCk7TFthKzEyPj4yPj4+MF09Yi5nZXREYXRlKCk7TFthKzE2Pj4yPj4+MF09Yi5nZXRNb250aCgpO0xbYSsyMD4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCkvMUUzO3JldHVybiBJYSgoUj1hLDE8PStNYXRoLmFicyhSKT8wPFI/K01hdGguZmxvb3IoUi9cbjQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKFItKyh+flI+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApKSxhPj4+MH0sbTpmdW5jdGlvbigpe3JldHVybi01Mn0sbjpmdW5jdGlvbigpe30sdDpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZSh3KXtyZXR1cm4odz13LnRvVGltZVN0cmluZygpLm1hdGNoKC9cXCgoW0EtWmEteiBdKylcXCkkLykpP3dbMV06XCJHTVRcIn1jPj4+PTA7dmFyIGc9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGg9bmV3IERhdGUoZywwLDEpLG09bmV3IERhdGUoZyw2LDEpO2c9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBxPW0uZ2V0VGltZXpvbmVPZmZzZXQoKTtNW2E+Pj4wPj4yPj4+MF09NjAqTWF0aC5tYXgoZyxxKTtMW2I+Pj4wPj4yPj4+MF09TnVtYmVyKGchPXEpO2E9ZShoKTtiPWUobSk7YT1CYShhKTtiPUJhKGIpO3E8Zz8oTVtjPj4yPj4+MF09YSxNW2MrND4+Mj4+PjBdPWIpOihNW2M+PjI+Pj4wXT1iLE1bYys0Pj4yPj4+MF09YSl9LGQ6KCk9PntHKFwiXCIpfSxcbmg6ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX0sdTpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxiOigpPT5wZXJmb3JtYW5jZS5ub3coKSxJOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7cmV0dXJuIEsuY29weVdpdGhpbihhPj4+MD4+PjAsYj4+PjAsYisoYz4+PjApPj4+MCl9LHM6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPUsubGVuZ3RoO2lmKDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBlPWIqKDErLjIvYyk7ZT1NYXRoLm1pbihlLGErMTAwNjYzMjk2KTt2YXIgZz1NYXRoO2U9TWF0aC5tYXgoYSxlKTthOntnPWcubWluLmNhbGwoZyw0Mjk0OTAxNzYwLGUrKDY1NTM2LWUlNjU1MzYpJTY1NTM2KS1ILmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTY7dHJ5e0guZ3JvdyhnKTtlYSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChtKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sQzpmdW5jdGlvbihhLGIpe2E+Pj49XG4wO2I+Pj49MDt2YXIgYz0wO0NhKCkuZm9yRWFjaChmdW5jdGlvbihlLGcpe3ZhciBoPWIrYztnPU1bYSs0Kmc+PjI+Pj4wXT1oO2ZvcihoPTA7aDxlLmxlbmd0aDsrK2gpSltnKys+PjA+Pj4wXT1lLmNoYXJDb2RlQXQoaCk7SltnPj4wPj4+MF09MDtjKz1lLmxlbmd0aCsxfSk7cmV0dXJuIDB9LEQ6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPUNhKCk7TVthPj4yPj4+MF09Yy5sZW5ndGg7dmFyIGU9MDtjLmZvckVhY2goZnVuY3Rpb24oZyl7ZSs9Zy5sZW5ndGgrMX0pO01bYj4+Mj4+PjBdPWU7cmV0dXJuIDB9LGY6KCk9PjUyLGo6ZnVuY3Rpb24oKXtyZXR1cm4gNTJ9LHI6ZnVuY3Rpb24oKXtyZXR1cm4gNzB9LGk6ZnVuY3Rpb24oYSxiLGMsZSl7Yj4+Pj0wO2M+Pj49MDtlPj4+PTA7Zm9yKHZhciBnPTAsaD0wO2g8YztoKyspe3ZhciBtPU1bYj4+Mj4+PjBdLHE9TVtiKzQ+PjI+Pj4wXTtiKz04O2Zvcih2YXIgdz0wO3c8cTt3Kyspe3ZhciB0PUtbbSt3Pj4+MF0sdT1cbkRhW2FdOzA9PT10fHwxMD09PXQ/KCgxPT09YT9jYTpFKSh1YSh1LDApKSx1Lmxlbmd0aD0wKTp1LnB1c2godCl9Zys9cX1NW2U+PjI+Pj4wXT1nO3JldHVybiAwfSxBOkhhLGM6ZnVuY3Rpb24oYSxiLGMsZSl7cmV0dXJuIEhhKGE+Pj4wLGI+Pj4wLGM+Pj4wLGU+Pj4wKX19O1xuKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShjKXtjPWMuZXhwb3J0cztJPWM9S2EoYyk7SD1JLko7ZWEoKTtoYS51bnNoaWZ0KEkuSyk7Ti0tO2QubW9uaXRvclJ1bkRlcGVuZGVuY2llcyYmZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzKE4pO2lmKDA9PU4mJihudWxsIT09TyYmKGNsZWFySW50ZXJ2YWwoTyksTz1udWxsKSxQKSl7dmFyIGU9UDtQPW51bGw7ZSgpfXJldHVybiBjfXZhciBiPXthOkphfTtOKys7ZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZkLm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoTik7aWYoZC5pbnN0YW50aWF0ZVdhc20pdHJ5e3JldHVybiBkLmluc3RhbnRpYXRlV2FzbShiLGEpfWNhdGNoKGMpe0UoXCJNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiBcIitjKSxsKGMpfXBhKGIsZnVuY3Rpb24oYyl7YShjLmluc3RhbmNlKX0pLmNhdGNoKGwpO3JldHVybnt9fSkoKTtcbmQuX09ydEluaXQ9KGEsYik9PihkLl9PcnRJbml0PUkuTCkoYSxiKTtkLl9PcnRHZXRMYXN0RXJyb3I9KGEsYik9PihkLl9PcnRHZXRMYXN0RXJyb3I9SS5NKShhLGIpO2QuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPShhLGIsYyxlLGcsaCxtLHEsdyx0KT0+KGQuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPUkuTikoYSxiLGMsZSxnLGgsbSxxLHcsdCk7ZC5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihkLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1JLk8pKGEsYik7ZC5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShhLGIsYyk9PihkLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9SS5QKShhLGIsYyk7ZC5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9SS5RKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihkLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9SS5SKShhKTtcbmQuX09ydENyZWF0ZVNlc3Npb249KGEsYixjKT0+KGQuX09ydENyZWF0ZVNlc3Npb249SS5TKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVNlc3Npb249YT0+KGQuX09ydFJlbGVhc2VTZXNzaW9uPUkuVCkoYSk7ZC5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD0oYSxiLGMpPT4oZC5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD1JLlUpKGEsYixjKTtkLl9PcnRHZXRJbnB1dE5hbWU9KGEsYik9PihkLl9PcnRHZXRJbnB1dE5hbWU9SS5WKShhLGIpO2QuX09ydEdldE91dHB1dE5hbWU9KGEsYik9PihkLl9PcnRHZXRPdXRwdXROYW1lPUkuVykoYSxiKTtkLl9PcnRGcmVlPWE9PihkLl9PcnRGcmVlPUkuWCkoYSk7ZC5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxlLGcsaCk9PihkLl9PcnRDcmVhdGVUZW5zb3I9SS5ZKShhLGIsYyxlLGcsaCk7ZC5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZSxnKT0+KGQuX09ydEdldFRlbnNvckRhdGE9SS5aKShhLGIsYyxlLGcpO1xuZC5fT3J0UmVsZWFzZVRlbnNvcj1hPT4oZC5fT3J0UmVsZWFzZVRlbnNvcj1JLl8pKGEpO2QuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGEsYixjLGUpPT4oZC5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1JLiQpKGEsYixjLGUpO2QuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRSdW5Db25maWdFbnRyeT1JLmFhKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KGQuX09ydFJlbGVhc2VSdW5PcHRpb25zPUkuYmEpKGEpO2QuX09ydENyZWF0ZUJpbmRpbmc9YT0+KGQuX09ydENyZWF0ZUJpbmRpbmc9SS5jYSkoYSk7ZC5fT3J0QmluZElucHV0PShhLGIsYyk9PihkLl9PcnRCaW5kSW5wdXQ9SS5kYSkoYSxiLGMpO2QuX09ydEJpbmRPdXRwdXQ9KGEsYixjLGUpPT4oZC5fT3J0QmluZE91dHB1dD1JLmVhKShhLGIsYyxlKTtkLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1hPT4oZC5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9SS5mYSkoYSk7XG5kLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oZC5fT3J0UmVsZWFzZUJpbmRpbmc9SS5nYSkoYSk7ZC5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGUsZyk9PihkLl9PcnRSdW5XaXRoQmluZGluZz1JLmhhKShhLGIsYyxlLGcpO2QuX09ydFJ1bj0oYSxiLGMsZSxnLGgsbSxxKT0+KGQuX09ydFJ1bj1JLmlhKShhLGIsYyxlLGcsaCxtLHEpO2QuX09ydEVuZFByb2ZpbGluZz1hPT4oZC5fT3J0RW5kUHJvZmlsaW5nPUkuamEpKGEpO2QuX09ydFRyYWluaW5nTG9hZENoZWNrcG9pbnQ9KGEsYik9PihkLl9PcnRUcmFpbmluZ0xvYWRDaGVja3BvaW50PUkua2EpKGEsYik7ZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1hPT4oZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1JLmxhKShhKTtkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249KGEsYixjLGUsZyxoLG0scSk9PihkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249SS5tYSkoYSxiLGMsZSxnLGgsbSxxKTtcbmQuX09ydFRyYWluaW5nTGF6eVJlc2V0R3JhZD1hPT4oZC5fT3J0VHJhaW5pbmdMYXp5UmVzZXRHcmFkPUkubmEpKGEpO2QuX09ydFRyYWluaW5nUnVuVHJhaW5TdGVwPShhLGIsYyxlLGcsaCk9PihkLl9PcnRUcmFpbmluZ1J1blRyYWluU3RlcD1JLm9hKShhLGIsYyxlLGcsaCk7ZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPShhLGIpPT4oZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPUkucGEpKGEsYik7ZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD0oYSxiLGMsZSxnLGgpPT4oZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD1JLnFhKShhLGIsYyxlLGcsaCk7ZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT0oYSxiLGMpPT4oZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT1JLnJhKShhLGIsYyk7ZC5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc1RvQnVmZmVyPShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNUb0J1ZmZlcj1JLnNhKShhLGIsYyxlKTtcbmQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPUkudGEpKGEsYixjLGUpO2QuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dENvdW50PShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dENvdW50PUkudWEpKGEsYixjLGUpO2QuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dE5hbWU9KGEsYixjLGUpPT4oZC5fT3J0VHJhaW5pbmdHZXRNb2RlbElucHV0T3V0cHV0TmFtZT1JLnZhKShhLGIsYyxlKTtkLl9PcnRUcmFpbmluZ1JlbGVhc2VTZXNzaW9uPWE9PihkLl9PcnRUcmFpbmluZ1JlbGVhc2VTZXNzaW9uPUkud2EpKGEpO3ZhciBBYT1kLl9tYWxsb2M9YT0+KEFhPWQuX21hbGxvYz1JLnhhKShhKTtkLl9mcmVlPWE9PihkLl9mcmVlPUkueWEpKGEpO1xudmFyIElhPWE9PihJYT1JLkFhKShhKSxMYT0oKT0+KExhPUkuQmEpKCksTWE9YT0+KE1hPUkuQ2EpKGEpLE5hPWE9PihOYT1JLkRhKShhKTtmdW5jdGlvbiBLYShhKXthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZT0+KCk9PmUoKT4+PjAsYz1lPT5nPT5lKGcpPj4+MDthLl9fZXJybm9fbG9jYXRpb249YihhLl9fZXJybm9fbG9jYXRpb24pO2EubWFsbG9jPWMoYS5tYWxsb2MpO2Euc3RhY2tTYXZlPWIoYS5zdGFja1NhdmUpO2Euc3RhY2tBbGxvYz1jKGEuc3RhY2tBbGxvYyk7cmV0dXJuIGF9ZC5zdGFja0FsbG9jPU5hO2Quc3RhY2tTYXZlPUxhO2Quc3RhY2tSZXN0b3JlPU1hO2QuVVRGOFRvU3RyaW5nPVQ7ZC5zdHJpbmdUb1VURjg9KGEsYixjKT0+VihhLEssYixjKTtkLmxlbmd0aEJ5dGVzVVRGOD1VO3ZhciBaO1A9ZnVuY3Rpb24gT2EoKXtafHxQYSgpO1p8fChQPU9hKX07XG5mdW5jdGlvbiBQYSgpe2Z1bmN0aW9uIGEoKXtpZighWiYmKFo9ITAsZC5jYWxsZWRSdW49ITAsIWRhKSl7UyhoYSk7ayhkKTtpZihkLm9uUnVudGltZUluaXRpYWxpemVkKWQub25SdW50aW1lSW5pdGlhbGl6ZWQoKTtpZihkLnBvc3RSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIGQucG9zdFJ1biYmKGQucG9zdFJ1bj1bZC5wb3N0UnVuXSk7ZC5wb3N0UnVuLmxlbmd0aDspe3ZhciBiPWQucG9zdFJ1bi5zaGlmdCgpO2lhLnVuc2hpZnQoYil9UyhpYSl9fWlmKCEoMDxOKSl7aWYoZC5wcmVSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIGQucHJlUnVuJiYoZC5wcmVSdW49W2QucHJlUnVuXSk7ZC5wcmVSdW4ubGVuZ3RoOylqYSgpO1MoZmEpOzA8Tnx8KGQuc2V0U3RhdHVzPyhkLnNldFN0YXR1cyhcIlJ1bm5pbmcuLi5cIiksc2V0VGltZW91dChmdW5jdGlvbigpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtkLnNldFN0YXR1cyhcIlwiKX0sMSk7YSgpfSwxKSk6YSgpKX19XG5pZihkLnByZUluaXQpZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIGQucHJlSW5pdCYmKGQucHJlSW5pdD1bZC5wcmVJbml0XSk7MDxkLnByZUluaXQubGVuZ3RoOylkLnByZUluaXQucG9wKCkoKTtQYSgpO1xuXG5cbiAgcmV0dXJuIG1vZHVsZUFyZy5yZWFkeVxufVxuXG4pO1xufSkoKTtcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbTtcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSlcbiAgZGVmaW5lKFtdLCAoKSA9PiBvcnRXYXNtKTtcbiIsICIiLCAiIiwgImV4cG9ydCBjb25zdCBjcHVzID0gdW5kZWZpbmVkOyIsICJcbnZhciBvcnRXYXNtVGhyZWFkZWQgPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxuZnVuY3Rpb24gYWEoKXtkLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gbH1mdW5jdGlvbiBuKCl7ZC5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGJhfWZ1bmN0aW9uIHAoKXtkLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gY2F9ZnVuY3Rpb24gcigpe2QuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBkYX1mdW5jdGlvbiBlYSgpe2QuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBmYX12YXIgdz1tb2R1bGVBcmcsaGEseDt3LnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57aGE9YTt4PWJ9KTtcbnZhciBpYT1PYmplY3QuYXNzaWduKHt9LHcpLGphPVwiLi90aGlzLnByb2dyYW1cIix6PShhLGIpPT57dGhyb3cgYjt9LGthPVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3csQT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpbXBvcnRTY3JpcHRzLEI9XCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MmJlwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zJiZcInN0cmluZ1wiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLEQ9dy5FTlZJUk9OTUVOVF9JU19QVEhSRUFEfHwhMSxFPVwiXCI7ZnVuY3Rpb24gbGEoYSl7cmV0dXJuIHcubG9jYXRlRmlsZT93LmxvY2F0ZUZpbGUoYSxFKTpFK2F9dmFyIG1hLEYsSDtcbmlmKEIpe3ZhciBmcz1yZXF1aXJlKFwiZnNcIiksbmE9cmVxdWlyZShcInBhdGhcIik7RT1BP25hLmRpcm5hbWUoRSkrXCIvXCI6X19kaXJuYW1lK1wiL1wiO21hPShiLGMpPT57Yj1iLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpP25ldyBVUkwoYik6bmEubm9ybWFsaXplKGIpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYixjP3ZvaWQgMDpcInV0ZjhcIil9O0g9Yj0+e2I9bWEoYiwhMCk7Yi5idWZmZXJ8fChiPW5ldyBVaW50OEFycmF5KGIpKTtyZXR1cm4gYn07Rj0oYixjLGUsaD0hMCk9PntiPWIuc3RhcnRzV2l0aChcImZpbGU6Ly9cIik/bmV3IFVSTChiKTpuYS5ub3JtYWxpemUoYik7ZnMucmVhZEZpbGUoYixoP3ZvaWQgMDpcInV0ZjhcIiwoZyxrKT0+e2c/ZShnKTpjKGg/ay5idWZmZXI6ayl9KX07IXcudGhpc1Byb2dyYW0mJjE8cHJvY2Vzcy5hcmd2Lmxlbmd0aCYmKGphPXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ej0oYixjKT0+e3Byb2Nlc3MuZXhpdENvZGU9XG5iO3Rocm93IGM7fTt3Lmluc3BlY3Q9KCk9PlwiW0Vtc2NyaXB0ZW4gTW9kdWxlIG9iamVjdF1cIjtsZXQgYTt0cnl7YT1yZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIil9Y2F0Y2goYil7dGhyb3cgY29uc29sZS5lcnJvcignVGhlIFwid29ya2VyX3RocmVhZHNcIiBtb2R1bGUgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIG5vZGUuanMgYnVpbGQgLSBwZXJoYXBzIGEgbmV3ZXIgdmVyc2lvbiBpcyBuZWVkZWQ/JyksYjt9Z2xvYmFsLldvcmtlcj1hLldvcmtlcn1lbHNlIGlmKGthfHxBKUE/RT1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoRT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksKHR5cGVvZiBfc2NyaXB0RGlyICE9PSBcInVuZGVmaW5lZFwiICYmIF9zY3JpcHREaXIpJiYoRT1fc2NyaXB0RGlyKSwwIT09RS5pbmRleE9mKFwiYmxvYjpcIik/RT1FLnN1YnN0cigwLEUucmVwbGFjZSgvWz8jXS4qLyxcIlwiKS5sYXN0SW5kZXhPZihcIi9cIikrMSk6RT1cIlwiLEJ8fChtYT1hPT57dmFyIGI9XG5uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0sQSYmKEg9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLEY9KGEsYixjKT0+e3ZhciBlPW5ldyBYTUxIdHRwUmVxdWVzdDtlLm9wZW4oXCJHRVRcIixhLCEwKTtlLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7ZS5vbmxvYWQ9KCk9PnsyMDA9PWUuc3RhdHVzfHwwPT1lLnN0YXR1cyYmZS5yZXNwb25zZT9iKGUucmVzcG9uc2UpOmMoKX07ZS5vbmVycm9yPWM7ZS5zZW5kKG51bGwpfSk7QiYmXCJ1bmRlZmluZWRcIj09dHlwZW9mIHBlcmZvcm1hbmNlJiYoZ2xvYmFsLnBlcmZvcm1hbmNlPXJlcXVpcmUoXCJwZXJmX2hvb2tzXCIpLnBlcmZvcm1hbmNlKTtcbnZhciBvYT1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLHBhPWNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtCJiYob2E9KC4uLmEpPT5mcy53cml0ZVN5bmMoMSxhLmpvaW4oXCIgXCIpK1wiXFxuXCIpLHBhPSguLi5hKT0+ZnMud3JpdGVTeW5jKDIsYS5qb2luKFwiIFwiKStcIlxcblwiKSk7dmFyIHFhPXcucHJpbnR8fG9hLEk9dy5wcmludEVycnx8cGE7T2JqZWN0LmFzc2lnbih3LGlhKTtpYT1udWxsO3cudGhpc1Byb2dyYW0mJihqYT13LnRoaXNQcm9ncmFtKTt3LnF1aXQmJih6PXcucXVpdCk7dmFyIEo7dy53YXNtQmluYXJ5JiYoSj13Lndhc21CaW5hcnkpO3ZhciBub0V4aXRSdW50aW1lPXcubm9FeGl0UnVudGltZXx8ITA7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZLKFwibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZFwiKTt2YXIgZCxMLHJhLE09ITEsTixsLGJhLGNhLGRhLGZhO1xuZnVuY3Rpb24gbSgpe3ZhciBhPWQuYnVmZmVyO3cuSEVBUDg9bD1uZXcgSW50OEFycmF5KGEpO3cuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO3cuSEVBUDMyPWNhPW5ldyBJbnQzMkFycmF5KGEpO3cuSEVBUFU4PWJhPW5ldyBVaW50OEFycmF5KGEpO3cuSEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYSk7dy5IRUFQVTMyPWRhPW5ldyBVaW50MzJBcnJheShhKTt3LkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTt3LkhFQVBGNjQ9ZmE9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgTz13LklOSVRJQUxfTUVNT1JZfHwxNjc3NzIxNjs1MjQyODgwPD1PfHxLKFwiSU5JVElBTF9NRU1PUlkgc2hvdWxkIGJlIGxhcmdlciB0aGFuIFNUQUNLX1NJWkUsIHdhcyBcIitPK1wiISAoU1RBQ0tfU0laRT01MjQyODgwKVwiKTtcbmlmKEQpZD13Lndhc21NZW1vcnk7ZWxzZSBpZih3Lndhc21NZW1vcnkpZD13Lndhc21NZW1vcnk7ZWxzZSBpZihkPW5ldyBXZWJBc3NlbWJseS5NZW1vcnkoe2luaXRpYWw6Ty82NTUzNixtYXhpbXVtOjY1NTM2LHNoYXJlZDohMH0pLCEoZC5idWZmZXIgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcikpdGhyb3cgSShcInJlcXVlc3RlZCBhIHNoYXJlZCBXZWJBc3NlbWJseS5NZW1vcnkgYnV0IHRoZSByZXR1cm5lZCBidWZmZXIgaXMgbm90IGEgU2hhcmVkQXJyYXlCdWZmZXIsIGluZGljYXRpbmcgdGhhdCB3aGlsZSB0aGUgYnJvd3NlciBoYXMgU2hhcmVkQXJyYXlCdWZmZXIgaXQgZG9lcyBub3QgaGF2ZSBXZWJBc3NlbWJseSB0aHJlYWRzIHN1cHBvcnQgLSB5b3UgbWF5IG5lZWQgdG8gc2V0IGEgZmxhZ1wiKSxCJiZJKFwiKG9uIG5vZGUgeW91IG1heSBuZWVkOiAtLWV4cGVyaW1lbnRhbC13YXNtLXRocmVhZHMgLS1leHBlcmltZW50YWwtd2FzbS1idWxrLW1lbW9yeSBhbmQvb3IgcmVjZW50IHZlcnNpb24pXCIpLFxuRXJyb3IoXCJiYWQgbWVtb3J5XCIpO20oKTtPPWQuYnVmZmVyLmJ5dGVMZW5ndGg7dmFyIHNhLHRhPVtdLHVhPVtdLHZhPVtdLHdhPTA7ZnVuY3Rpb24gUCgpe3JldHVybiBub0V4aXRSdW50aW1lfHwwPHdhfXZhciBRPTAseGE9bnVsbCxSPW51bGw7ZnVuY3Rpb24geWEoKXtRKys7dy5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZ3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoUSl9ZnVuY3Rpb24gemEoKXtRLS07dy5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZ3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoUSk7aWYoMD09USYmKG51bGwhPT14YSYmKGNsZWFySW50ZXJ2YWwoeGEpLHhhPW51bGwpLFIpKXt2YXIgYT1SO1I9bnVsbDthKCl9fVxuZnVuY3Rpb24gSyhhKXtpZih3Lm9uQWJvcnQpdy5vbkFib3J0KGEpO2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7SShhKTtNPSEwO049MTthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7eChhKTt0aHJvdyBhO31mdW5jdGlvbiBBYShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgUztTPVwib3J0LXdhc20tdGhyZWFkZWQud2FzbVwiO0FhKFMpfHwoUz1sYShTKSk7ZnVuY3Rpb24gQmEoYSl7aWYoYT09UyYmSilyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoSik7aWYoSClyZXR1cm4gSChhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiBDYShhKXtpZighSiYmKGthfHxBKSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiFhLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9PkJhKGEpKTtpZihGKXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e0YoYSxlPT5iKG5ldyBVaW50OEFycmF5KGUpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5CYShhKSl9ZnVuY3Rpb24gRGEoYSxiLGMpe3JldHVybiBDYShhKS50aGVuKGU9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGUsYikpLnRoZW4oZT0+ZSkudGhlbihjLGU9PntJKFwiZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogXCIrZSk7SyhlKX0pfVxuZnVuY3Rpb24gRWEoYSxiKXt2YXIgYz1TO3JldHVybiBKfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8QWEoYyl8fGMuc3RhcnRzV2l0aChcImZpbGU6Ly9cIil8fEJ8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP0RhKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGU9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGUsYSkudGhlbihiLGZ1bmN0aW9uKGgpe0koXCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogXCIraCk7SShcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBEYShjLGEsYil9KSl9dmFyIFQ7ZnVuY3Rpb24gVShhKXt0aGlzLm5hbWU9XCJFeGl0U3RhdHVzXCI7dGhpcy5tZXNzYWdlPWBQcm9ncmFtIHRlcm1pbmF0ZWQgd2l0aCBleGl0KCR7YX0pYDt0aGlzLnN0YXR1cz1hfVxuZnVuY3Rpb24gRmEoYSl7YS50ZXJtaW5hdGUoKTthLm9ubWVzc2FnZT0oKT0+e319ZnVuY3Rpb24gR2EoYSl7KGE9Vi5MYVthXSl8fEsoKTtWLmxiKGEpfWZ1bmN0aW9uIEhhKGEpe3ZhciBiPVYuZmIoKTtpZighYilyZXR1cm4gNjtWLk9hLnB1c2goYik7Vi5MYVthLk5hXT1iO2IuTmE9YS5OYTt2YXIgYz17Y21kOlwicnVuXCIsc3RhcnRfcm91dGluZTphLm1iLGFyZzphLmViLHB0aHJlYWRfcHRyOmEuTmF9O0ImJmIudW5yZWYoKTtiLnBvc3RNZXNzYWdlKGMsYS5zYik7cmV0dXJuIDB9XG52YXIgSWE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLEphPShhLGIsYyk9PntiPj4+PTA7dmFyIGU9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1lKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJklhKXJldHVybiBJYS5kZWNvZGUoYS5idWZmZXIgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcj9hLnNsaWNlKGIsYyk6YS5zdWJhcnJheShiLGMpKTtmb3IoZT1cIlwiO2I8Yzspe3ZhciBoPWFbYisrXTtpZihoJjEyOCl7dmFyIGc9YVtiKytdJjYzO2lmKDE5Mj09KGgmMjI0KSllKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChoJjMxKTw8NnxnKTtlbHNle3ZhciBrPWFbYisrXSY2MztoPTIyND09KGgmMjQwKT8oaCYxNSk8PDEyfGc8PDZ8azooaCY3KTw8MTh8Zzw8MTJ8azw8NnxhW2IrK10mNjM7NjU1MzY+aD9lKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGgpOihoLT02NTUzNixlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGg+PlxuMTAsNTYzMjB8aCYxMDIzKSl9fWVsc2UgZSs9U3RyaW5nLmZyb21DaGFyQ29kZShoKX1yZXR1cm4gZX0sS2E9KGEsYik9PihhPj4+PTApP0phKG4oKSxhLGIpOlwiXCI7ZnVuY3Rpb24gTGEoYSl7aWYoRClyZXR1cm4gVygxLDEsYSk7Tj1hO2lmKCFQKCkpe1YubmIoKTtpZih3Lm9uRXhpdCl3Lm9uRXhpdChhKTtNPSEwfXooYSxuZXcgVShhKSl9XG52YXIgTmE9YT0+e049YTtpZihEKXRocm93IE1hKGEpLFwidW53aW5kXCI7TGEoYSl9LFY9e1JhOltdLE9hOltdLFphOltdLExhOnt9LFZhOmZ1bmN0aW9uKCl7RD9WLmhiKCk6Vi5nYigpfSxnYjpmdW5jdGlvbigpe3RhLnVuc2hpZnQoKCk9Pnt5YSgpO1YuaWIoKCk9PnphKCkpfSl9LGhiOmZ1bmN0aW9uKCl7Vi5yZWNlaXZlT2JqZWN0VHJhbnNmZXI9Vi5rYjtWLnRocmVhZEluaXRUTFM9Vi5ZYTtWLnNldEV4aXRTdGF0dXM9Vi5YYTtub0V4aXRSdW50aW1lPSExfSxYYTpmdW5jdGlvbihhKXtOPWF9LHhiOltcIiR0ZXJtaW5hdGVXb3JrZXJcIl0sbmI6ZnVuY3Rpb24oKXtmb3IodmFyIGEgb2YgVi5PYSlGYShhKTtmb3IoYSBvZiBWLlJhKUZhKGEpO1YuUmE9W107Vi5PYT1bXTtWLkxhPVtdfSxsYjpmdW5jdGlvbihhKXt2YXIgYj1hLk5hO2RlbGV0ZSBWLkxhW2JdO1YuUmEucHVzaChhKTtWLk9hLnNwbGljZShWLk9hLmluZGV4T2YoYSksMSk7YS5OYT0wO09hKGIpfSxrYjpmdW5jdGlvbigpe30sXG5ZYTpmdW5jdGlvbigpe1YuWmEuZm9yRWFjaChhPT5hKCkpfSxqYjphPT5uZXcgUHJvbWlzZShiPT57YS5vbm1lc3NhZ2U9Zz0+e2c9Zy5kYXRhO3ZhciBrPWcuY21kO2lmKGcudGFyZ2V0VGhyZWFkJiZnLnRhcmdldFRocmVhZCE9WCgpKXt2YXIgdD1WLkxhW2cud2JdO3Q/dC5wb3N0TWVzc2FnZShnLGcudHJhbnNmZXJMaXN0KTpJKCdJbnRlcm5hbCBlcnJvciEgV29ya2VyIHNlbnQgYSBtZXNzYWdlIFwiJytrKydcIiB0byB0YXJnZXQgcHRocmVhZCAnK2cudGFyZ2V0VGhyZWFkK1wiLCBidXQgdGhhdCB0aHJlYWQgbm8gbG9uZ2VyIGV4aXN0cyFcIil9ZWxzZSBpZihcImNoZWNrTWFpbGJveFwiPT09aylZKCk7ZWxzZSBpZihcInNwYXduVGhyZWFkXCI9PT1rKUhhKGcpO2Vsc2UgaWYoXCJjbGVhbnVwVGhyZWFkXCI9PT1rKUdhKGcudGhyZWFkKTtlbHNlIGlmKFwia2lsbFRocmVhZFwiPT09aylnPWcudGhyZWFkLGs9Vi5MYVtnXSxkZWxldGUgVi5MYVtnXSxGYShrKSxPYShnKSxWLk9hLnNwbGljZShWLk9hLmluZGV4T2YoayksXG4xKSxrLk5hPTA7ZWxzZSBpZihcImNhbmNlbFRocmVhZFwiPT09aylWLkxhW2cudGhyZWFkXS5wb3N0TWVzc2FnZSh7Y21kOlwiY2FuY2VsXCJ9KTtlbHNlIGlmKFwibG9hZGVkXCI9PT1rKWEubG9hZGVkPSEwLGIoYSk7ZWxzZSBpZihcImFsZXJ0XCI9PT1rKWFsZXJ0KFwiVGhyZWFkIFwiK2cudGhyZWFkSWQrXCI6IFwiK2cudGV4dCk7ZWxzZSBpZihcInNldGltbWVkaWF0ZVwiPT09Zy50YXJnZXQpYS5wb3N0TWVzc2FnZShnKTtlbHNlIGlmKFwiY2FsbEhhbmRsZXJcIj09PWspd1tnLmhhbmRsZXJdKC4uLmcuYXJncyk7ZWxzZSBrJiZJKFwid29ya2VyIHNlbnQgYW4gdW5rbm93biBjb21tYW5kIFwiK2spfTthLm9uZXJyb3I9Zz0+e0koXCJ3b3JrZXIgc2VudCBhbiBlcnJvciEgXCIrZy5maWxlbmFtZStcIjpcIitnLmxpbmVubytcIjogXCIrZy5tZXNzYWdlKTt0aHJvdyBnO307QiYmKGEub24oXCJtZXNzYWdlXCIsZnVuY3Rpb24oZyl7YS5vbm1lc3NhZ2Uoe2RhdGE6Z30pfSksYS5vbihcImVycm9yXCIsZnVuY3Rpb24oZyl7YS5vbmVycm9yKGcpfSkpO1xudmFyIGM9W10sZT1bXCJvbkV4aXRcIixcIm9uQWJvcnRcIixcInByaW50XCIsXCJwcmludEVyclwiXSxoO2ZvcihoIG9mIGUpdy5oYXNPd25Qcm9wZXJ0eShoKSYmYy5wdXNoKGgpO2EucG9zdE1lc3NhZ2Uoe2NtZDpcImxvYWRcIixoYW5kbGVyczpjLHVybE9yQmxvYjp3Lm1haW5TY3JpcHRVcmxPckJsb2J8fF9zY3JpcHREaXIsd2FzbU1lbW9yeTpkLHdhc21Nb2R1bGU6cmF9KX0pLGliOmZ1bmN0aW9uKGEpe2EoKX0sY2I6ZnVuY3Rpb24oKXt2YXIgYT1sYShcIm9ydC13YXNtLXRocmVhZGVkLndvcmtlci5qc1wiKTthPW5ldyBXb3JrZXIoYSk7Vi5SYS5wdXNoKGEpfSxmYjpmdW5jdGlvbigpezA9PVYuUmEubGVuZ3RoJiYoVi5jYigpLFYuamIoVi5SYVswXSkpO3JldHVybiBWLlJhLnBvcCgpfX07dy5QVGhyZWFkPVY7dmFyIFBhPWE9Pntmb3IoOzA8YS5sZW5ndGg7KWEuc2hpZnQoKSh3KX07XG53LmVzdGFibGlzaFN0YWNrU3BhY2U9ZnVuY3Rpb24oKXt2YXIgYT1YKCksYj1wKClbYSs1Mj4+Mj4+PjBdO2E9cCgpW2ErNTY+PjI+Pj4wXTtRYShiLGItYSk7UmEoYil9O2Z1bmN0aW9uIE1hKGEpe2lmKEQpcmV0dXJuIFcoMiwwLGEpO05hKGEpfXZhciBTYT1bXTt3Lmludm9rZUVudHJ5UG9pbnQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz1TYVthXTtjfHwoYT49U2EubGVuZ3RoJiYoU2EubGVuZ3RoPWErMSksU2FbYV09Yz1zYS5nZXQoYSkpO2E9YyhiKTtQKCk/Vi5YYShhKTpUYShhKX07ZnVuY3Rpb24gVWEoYSl7dGhpcy5VYT1hLTI0O3RoaXMuYmI9ZnVuY3Rpb24oYil7cigpW3RoaXMuVWErND4+Mj4+PjBdPWJ9O3RoaXMuYWI9ZnVuY3Rpb24oYil7cigpW3RoaXMuVWErOD4+Mj4+PjBdPWJ9O3RoaXMuVmE9ZnVuY3Rpb24oYixjKXt0aGlzLiRhKCk7dGhpcy5iYihiKTt0aGlzLmFiKGMpfTt0aGlzLiRhPWZ1bmN0aW9uKCl7cigpW3RoaXMuVWErMTY+PjI+Pj4wXT0wfX1cbnZhciBWYT0wLFdhPTA7ZnVuY3Rpb24gWGEoYSxiLGMsZSl7cmV0dXJuIEQ/VygzLDEsYSxiLGMsZSk6WWEoYSxiLGMsZSl9ZnVuY3Rpb24gWWEoYSxiLGMsZSl7YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZT4+Pj0wO2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlcilyZXR1cm4gSShcIkN1cnJlbnQgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCBTaGFyZWRBcnJheUJ1ZmZlciwgcHRocmVhZHMgYXJlIG5vdCBhdmFpbGFibGUhXCIpLDY7dmFyIGg9W107aWYoRCYmMD09PWgubGVuZ3RoKXJldHVybiBYYShhLGIsYyxlKTthPXttYjpjLE5hOmEsZWI6ZSxzYjpofTtyZXR1cm4gRD8oYS51Yj1cInNwYXduVGhyZWFkXCIscG9zdE1lc3NhZ2UoYSxoKSwwKTpIYShhKX1mdW5jdGlvbiBaYShhLGIsYyl7cmV0dXJuIEQ/Vyg0LDEsYSxiLGMpOjB9ZnVuY3Rpb24gJGEoYSxiKXtpZihEKXJldHVybiBXKDUsMSxhLGIpfVxudmFyIGFiPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBlPWEuY2hhckNvZGVBdChjKTsxMjc+PWU/YisrOjIwNDc+PWU/Yis9Mjo1NTI5Njw9ZSYmNTczNDM+PWU/KGIrPTQsKytjKTpiKz0zfXJldHVybiBifSxiYj0oYSxiLGMsZSk9PntjPj4+PTA7aWYoISgwPGUpKXJldHVybiAwO3ZhciBoPWM7ZT1jK2UtMTtmb3IodmFyIGc9MDtnPGEubGVuZ3RoOysrZyl7dmFyIGs9YS5jaGFyQ29kZUF0KGcpO2lmKDU1Mjk2PD1rJiY1NzM0Mz49ayl7dmFyIHQ9YS5jaGFyQ29kZUF0KCsrZyk7az02NTUzNisoKGsmMTAyMyk8PDEwKXx0JjEwMjN9aWYoMTI3Pj1rKXtpZihjPj1lKWJyZWFrO2JbYysrPj4+MF09a31lbHNle2lmKDIwNDc+PWspe2lmKGMrMT49ZSlicmVhaztiW2MrKz4+PjBdPTE5MnxrPj42fWVsc2V7aWYoNjU1MzU+PWspe2lmKGMrMj49ZSlicmVhaztiW2MrKz4+PjBdPTIyNHxrPj4xMn1lbHNle2lmKGMrMz49ZSlicmVhaztiW2MrKz4+PjBdPTI0MHxrPj5cbjE4O2JbYysrPj4+MF09MTI4fGs+PjEyJjYzfWJbYysrPj4+MF09MTI4fGs+PjYmNjN9YltjKys+Pj4wXT0xMjh8ayY2M319YltjPj4+MF09MDtyZXR1cm4gYy1ofSxjYj0oYSxiLGMpPT5iYihhLG4oKSxiLGMpO2Z1bmN0aW9uIGRiKGEsYil7aWYoRClyZXR1cm4gVyg2LDEsYSxiKX1mdW5jdGlvbiBlYihhLGIsYyl7aWYoRClyZXR1cm4gVyg3LDEsYSxiLGMpfWZ1bmN0aW9uIGZiKGEsYixjKXtyZXR1cm4gRD9XKDgsMSxhLGIsYyk6MH1mdW5jdGlvbiBnYihhLGIpe2lmKEQpcmV0dXJuIFcoOSwxLGEsYil9ZnVuY3Rpb24gaGIoYSxiLGMpe2lmKEQpcmV0dXJuIFcoMTAsMSxhLGIsYyl9ZnVuY3Rpb24gaWIoYSxiLGMsZSl7aWYoRClyZXR1cm4gVygxMSwxLGEsYixjLGUpfWZ1bmN0aW9uIGpiKGEsYixjLGUpe2lmKEQpcmV0dXJuIFcoMTIsMSxhLGIsYyxlKX1mdW5jdGlvbiBrYihhLGIsYyxlKXtpZihEKXJldHVybiBXKDEzLDEsYSxiLGMsZSl9XG5mdW5jdGlvbiBsYihhKXtpZihEKXJldHVybiBXKDE0LDEsYSl9ZnVuY3Rpb24gbWIoYSxiKXtpZihEKXJldHVybiBXKDE1LDEsYSxiKX1mdW5jdGlvbiBuYihhLGIsYyl7aWYoRClyZXR1cm4gVygxNiwxLGEsYixjKX12YXIgb2I9YT0+e2lmKCFNKXRyeXtpZihhKCksIVAoKSl0cnl7RD9UYShOKTpOYShOKX1jYXRjaChiKXtiIGluc3RhbmNlb2YgVXx8XCJ1bndpbmRcIj09Ynx8eigxLGIpfX1jYXRjaChiKXtiIGluc3RhbmNlb2YgVXx8XCJ1bndpbmRcIj09Ynx8eigxLGIpfX07ZnVuY3Rpb24gcGIoYSl7YT4+Pj0wO1wiZnVuY3Rpb25cIj09PXR5cGVvZiBBdG9taWNzLnRiJiYoQXRvbWljcy50YihwKCksYT4+MixhKS52YWx1ZS50aGVuKFkpLGErPTEyOCxBdG9taWNzLnN0b3JlKHAoKSxhPj4yLDEpKX13Ll9fZW1zY3JpcHRlbl90aHJlYWRfbWFpbGJveF9hd2FpdD1wYjtmdW5jdGlvbiBZKCl7dmFyIGE9WCgpO2EmJihwYihhKSxvYigoKT0+cWIoKSkpfXcuY2hlY2tNYWlsYm94PVk7XG52YXIgWj1hPT4wPT09YSU0JiYoMCE9PWElMTAwfHwwPT09YSU0MDApLHJiPVswLDMxLDYwLDkxLDEyMSwxNTIsMTgyLDIxMywyNDQsMjc0LDMwNSwzMzVdLHNiPVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdO2Z1bmN0aW9uIHRiKGEsYixjLGUsaCxnLGssdCl7cmV0dXJuIEQ/VygxNywxLGEsYixjLGUsaCxnLGssdCk6LTUyfWZ1bmN0aW9uIHViKGEsYixjLGUsaCxnLGspe2lmKEQpcmV0dXJuIFcoMTgsMSxhLGIsYyxlLGgsZyxrKX12YXIgd2I9YT0+e3ZhciBiPWFiKGEpKzEsYz12YihiKTtjJiZjYihhLGMsYik7cmV0dXJuIGN9LHliPWE9Pnt2YXIgYj14YigpO2E9YSgpO1JhKGIpO3JldHVybiBhfTtcbmZ1bmN0aW9uIFcoYSxiKXt2YXIgYz1hcmd1bWVudHMubGVuZ3RoLTIsZT1hcmd1bWVudHM7cmV0dXJuIHliKCgpPT57Zm9yKHZhciBoPXpiKDgqYyksZz1oPj4zLGs9MDtrPGM7aysrKXt2YXIgdD1lWzIra107ZWEoKVtnK2s+Pj4wXT10fXJldHVybiBBYihhLGMsaCxiKX0pfVxudmFyIEJiPVtdLENiPXt9LEViPSgpPT57aWYoIURiKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXCJfXCIpK1wiLlVURi04XCIsXzpqYXx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIENiKXZvaWQgMD09PUNiW2JdP2RlbGV0ZSBhW2JdOmFbYl09Q2JbYl07dmFyIGM9W107Zm9yKGIgaW4gYSljLnB1c2goYCR7Yn09JHthW2JdfWApO0RiPWN9cmV0dXJuIERifSxEYjtcbmZ1bmN0aW9uIEZiKGEsYil7aWYoRClyZXR1cm4gVygxOSwxLGEsYik7YT4+Pj0wO2I+Pj49MDt2YXIgYz0wO0ViKCkuZm9yRWFjaChmdW5jdGlvbihlLGgpe3ZhciBnPWIrYztoPXIoKVthKzQqaD4+Mj4+PjBdPWc7Zm9yKGc9MDtnPGUubGVuZ3RoOysrZylhYSgpW2grKz4+MD4+PjBdPWUuY2hhckNvZGVBdChnKTthYSgpW2g+PjA+Pj4wXT0wO2MrPWUubGVuZ3RoKzF9KTtyZXR1cm4gMH1mdW5jdGlvbiBHYihhLGIpe2lmKEQpcmV0dXJuIFcoMjAsMSxhLGIpO2E+Pj49MDtiPj4+PTA7dmFyIGM9RWIoKTtyKClbYT4+Mj4+PjBdPWMubGVuZ3RoO3ZhciBlPTA7Yy5mb3JFYWNoKGZ1bmN0aW9uKGgpe2UrPWgubGVuZ3RoKzF9KTtyKClbYj4+Mj4+PjBdPWU7cmV0dXJuIDB9ZnVuY3Rpb24gSGIoYSl7cmV0dXJuIEQ/VygyMSwxLGEpOjUyfWZ1bmN0aW9uIExiKGEsYixjLGUpe3JldHVybiBEP1coMjIsMSxhLGIsYyxlKTo1Mn1cbmZ1bmN0aW9uIE1iKGEsYixjLGUsaCl7cmV0dXJuIEQ/VygyMywxLGEsYixjLGUsaCk6NzB9dmFyIE5iPVtudWxsLFtdLFtdXTtmdW5jdGlvbiBPYihhLGIsYyxlKXtpZihEKXJldHVybiBXKDI0LDEsYSxiLGMsZSk7Yj4+Pj0wO2M+Pj49MDtlPj4+PTA7Zm9yKHZhciBoPTAsZz0wO2c8YztnKyspe3ZhciBrPXIoKVtiPj4yPj4+MF0sdD1yKClbYis0Pj4yPj4+MF07Yis9ODtmb3IodmFyIEM9MDtDPHQ7QysrKXt2YXIgdj1uKClbaytDPj4+MF0seT1OYlthXTswPT09dnx8MTA9PT12PygoMT09PWE/cWE6SSkoSmEoeSwwKSkseS5sZW5ndGg9MCk6eS5wdXNoKHYpfWgrPXR9cigpW2U+PjI+Pj4wXT1oO3JldHVybiAwfXZhciBQYj1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLFFiPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gUmIoYSl7dmFyIGI9QXJyYXkoYWIoYSkrMSk7YmIoYSxiLDAsYi5sZW5ndGgpO3JldHVybiBifVxudmFyIFNiPShhLGIpPT57YWEoKS5zZXQoYSxiPj4+MCl9O1xuZnVuY3Rpb24gVGIoYSxiLGMsZSl7ZnVuY3Rpb24gaChmLHEsdSl7Zm9yKGY9XCJudW1iZXJcIj09dHlwZW9mIGY/Zi50b1N0cmluZygpOmZ8fFwiXCI7Zi5sZW5ndGg8cTspZj11WzBdK2Y7cmV0dXJuIGZ9ZnVuY3Rpb24gZyhmLHEpe3JldHVybiBoKGYscSxcIjBcIil9ZnVuY3Rpb24gayhmLHEpe2Z1bmN0aW9uIHUoSWIpe3JldHVybiAwPkliPy0xOjA8SWI/MTowfXZhciBHOzA9PT0oRz11KGYuZ2V0RnVsbFllYXIoKS1xLmdldEZ1bGxZZWFyKCkpKSYmMD09PShHPXUoZi5nZXRNb250aCgpLXEuZ2V0TW9udGgoKSkpJiYoRz11KGYuZ2V0RGF0ZSgpLXEuZ2V0RGF0ZSgpKSk7cmV0dXJuIEd9ZnVuY3Rpb24gdChmKXtzd2l0Y2goZi5nZXREYXkoKSl7Y2FzZSAwOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwyOSk7Y2FzZSAxOnJldHVybiBmO2Nhc2UgMjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLDAsMyk7Y2FzZSAzOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDIpO2Nhc2UgNDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLDAsMSk7Y2FzZSA1OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwzMSk7Y2FzZSA2OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwzMCl9fWZ1bmN0aW9uIEMoZil7dmFyIHE9Zi5QYTtmb3IoZj1uZXcgRGF0ZSgobmV3IERhdGUoZi5RYSsxOTAwLDAsMSkpLmdldFRpbWUoKSk7MDxxOyl7dmFyIHU9Zi5nZXRNb250aCgpLEc9KFooZi5nZXRGdWxsWWVhcigpKT9QYjpRYilbdV07aWYocT5HLWYuZ2V0RGF0ZSgpKXEtPUctZi5nZXREYXRlKCkrMSxmLnNldERhdGUoMSksMTE+dT9mLnNldE1vbnRoKHUrMSk6KGYuc2V0TW9udGgoMCksZi5zZXRGdWxsWWVhcihmLmdldEZ1bGxZZWFyKCkrMSkpO2Vsc2V7Zi5zZXREYXRlKGYuZ2V0RGF0ZSgpK3EpO2JyZWFrfX11PW5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSsxLDAsNCk7cT10KG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSxcbjAsNCkpO3U9dCh1KTtyZXR1cm4gMD49ayhxLGYpPzA+PWsodSxmKT9mLmdldEZ1bGxZZWFyKCkrMTpmLmdldEZ1bGxZZWFyKCk6Zi5nZXRGdWxsWWVhcigpLTF9YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZT4+Pj0wO3ZhciB2PXAoKVtlKzQwPj4yPj4+MF07ZT17cWI6cCgpW2U+PjI+Pj4wXSxwYjpwKClbZSs0Pj4yPj4+MF0sU2E6cCgpW2UrOD4+Mj4+PjBdLFdhOnAoKVtlKzEyPj4yPj4+MF0sVGE6cCgpW2UrMTY+PjI+Pj4wXSxRYTpwKClbZSsyMD4+Mj4+PjBdLE1hOnAoKVtlKzI0Pj4yPj4+MF0sUGE6cCgpW2UrMjg+PjI+Pj4wXSx5YjpwKClbZSszMj4+Mj4+PjBdLG9iOnAoKVtlKzM2Pj4yPj4+MF0scmI6dj9LYSh2KTpcIlwifTtjPUthKGMpO3Y9e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcblwiJVhcIjpcIiVIOiVNOiVTXCIsXCIlRWNcIjpcIiVjXCIsXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgeSBpbiB2KWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAoeSxcImdcIiksdlt5XSk7dmFyIEpiPVwiU3VuZGF5IE1vbmRheSBUdWVzZGF5IFdlZG5lc2RheSBUaHVyc2RheSBGcmlkYXkgU2F0dXJkYXlcIi5zcGxpdChcIiBcIiksS2I9XCJKYW51YXJ5IEZlYnJ1YXJ5IE1hcmNoIEFwcmlsIE1heSBKdW5lIEp1bHkgQXVndXN0IFNlcHRlbWJlciBPY3RvYmVyIE5vdmVtYmVyIERlY2VtYmVyXCIuc3BsaXQoXCIgXCIpO3Y9e1wiJWFcIjpmPT5KYltmLk1hXS5zdWJzdHJpbmcoMCwzKSxcblwiJUFcIjpmPT5KYltmLk1hXSxcIiViXCI6Zj0+S2JbZi5UYV0uc3Vic3RyaW5nKDAsMyksXCIlQlwiOmY9PktiW2YuVGFdLFwiJUNcIjpmPT5nKChmLlFhKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpmPT5nKGYuV2EsMiksXCIlZVwiOmY9PmgoZi5XYSwyLFwiIFwiKSxcIiVnXCI6Zj0+QyhmKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zj0+QyhmKSxcIiVIXCI6Zj0+ZyhmLlNhLDIpLFwiJUlcIjpmPT57Zj1mLlNhOzA9PWY/Zj0xMjoxMjxmJiYoZi09MTIpO3JldHVybiBnKGYsMil9LFwiJWpcIjpmPT57Zm9yKHZhciBxPTAsdT0wO3U8PWYuVGEtMTtxKz0oWihmLlFhKzE5MDApP1BiOlFiKVt1KytdKTtyZXR1cm4gZyhmLldhK3EsMyl9LFwiJW1cIjpmPT5nKGYuVGErMSwyKSxcIiVNXCI6Zj0+ZyhmLnBiLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zj0+MDw9Zi5TYSYmMTI+Zi5TYT9cIkFNXCI6XCJQTVwiLFwiJVNcIjpmPT5nKGYucWIsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpmPT5mLk1hfHw3LFwiJVVcIjpmPT5nKE1hdGguZmxvb3IoKGYuUGErXG43LWYuTWEpLzcpLDIpLFwiJVZcIjpmPT57dmFyIHE9TWF0aC5mbG9vcigoZi5QYSs3LShmLk1hKzYpJTcpLzcpOzI+PShmLk1hKzM3MS1mLlBhLTIpJTcmJnErKztpZihxKTUzPT1xJiYodT0oZi5NYSszNzEtZi5QYSklNyw0PT11fHwzPT11JiZaKGYuUWEpfHwocT0xKSk7ZWxzZXtxPTUyO3ZhciB1PShmLk1hKzctZi5QYS0xKSU3Oyg0PT11fHw1PT11JiZaKGYuUWElNDAwLTEpKSYmcSsrfXJldHVybiBnKHEsMil9LFwiJXdcIjpmPT5mLk1hLFwiJVdcIjpmPT5nKE1hdGguZmxvb3IoKGYuUGErNy0oZi5NYSs2KSU3KS83KSwyKSxcIiV5XCI6Zj0+KGYuUWErMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmY9PmYuUWErMTkwMCxcIiV6XCI6Zj0+e2Y9Zi5vYjt2YXIgcT0wPD1mO2Y9TWF0aC5hYnMoZikvNjA7cmV0dXJuKHE/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZi82MCoxMDArZiU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmY9PmYucmIsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXG5cIlxceDAwXFx4MDBcIik7Zm9yKHkgaW4gdiljLmluY2x1ZGVzKHkpJiYoYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh5LFwiZ1wiKSx2W3ldKGUpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt5PVJiKGMpO2lmKHkubGVuZ3RoPmIpcmV0dXJuIDA7U2IoeSxhKTtyZXR1cm4geS5sZW5ndGgtMX1WLlZhKCk7XG52YXIgVWI9W251bGwsTGEsTWEsWGEsWmEsJGEsZGIsZWIsZmIsZ2IsaGIsaWIsamIsa2IsbGIsbWIsbmIsdGIsdWIsRmIsR2IsSGIsTGIsTWIsT2JdLFhiPXtiOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBVYShhKSkuVmEoYj4+PjAsYz4+PjApO1ZhPWE7V2ErKzt0aHJvdyBWYTt9LE46ZnVuY3Rpb24oYSl7VmIoYT4+PjAsIUEsMSwha2EsMTMxMDcyLCExKTtWLllhKCl9LGo6ZnVuY3Rpb24oYSl7YT4+Pj0wO0Q/cG9zdE1lc3NhZ2Uoe2NtZDpcImNsZWFudXBUaHJlYWRcIix0aHJlYWQ6YX0pOkdhKGEpfSxJOllhLGg6WmEsVDokYSxEOmRiLEY6ZWIsVTpmYixSOmdiLEo6aGIsUTppYixuOmpiLEU6a2IsQjpsYixTOm1iLEM6bmIscTooKT0+ITAsejpmdW5jdGlvbihhLGIpe2E+Pj49MDthPT1iPj4+MD9zZXRUaW1lb3V0KCgpPT5ZKCkpOkQ/cG9zdE1lc3NhZ2Uoe3RhcmdldFRocmVhZDphLGNtZDpcImNoZWNrTWFpbGJveFwifSk6KGE9Vi5MYVthXSkmJmEucG9zdE1lc3NhZ2Uoe2NtZDpcImNoZWNrTWFpbGJveFwifSl9LFxuTDpmdW5jdGlvbigpe3JldHVybi0xfSxNOnBiLHA6ZnVuY3Rpb24oYSl7QiYmVi5MYVthPj4+MF0ucmVmKCl9LHQ6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3AoKVtjPj4yPj4+MF09YS5nZXRVVENTZWNvbmRzKCk7cCgpW2MrND4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO3AoKVtjKzg+PjI+Pj4wXT1hLmdldFVUQ0hvdXJzKCk7cCgpW2MrMTI+PjI+Pj4wXT1hLmdldFVUQ0RhdGUoKTtwKClbYysxNj4+Mj4+PjBdPWEuZ2V0VVRDTW9udGgoKTtwKClbYysyMD4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO3AoKVtjKzI0Pj4yPj4+MF09YS5nZXRVVENEYXkoKTthPShhLmdldFRpbWUoKS1EYXRlLlVUQyhhLmdldFVUQ0Z1bGxZZWFyKCksMCwxLDAsMCwwLDApKS84NjRFNXwwO3AoKVtjKzI4Pj4yPj4+MF09YX0sdTpmdW5jdGlvbihhLGIsYyl7YT1iK1xuMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtwKClbYz4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO3AoKVtjKzQ+PjI+Pj4wXT1hLmdldE1pbnV0ZXMoKTtwKClbYys4Pj4yPj4+MF09YS5nZXRIb3VycygpO3AoKVtjKzEyPj4yPj4+MF09YS5nZXREYXRlKCk7cCgpW2MrMTY+PjI+Pj4wXT1hLmdldE1vbnRoKCk7cCgpW2MrMjA+PjI+Pj4wXT1hLmdldEZ1bGxZZWFyKCktMTkwMDtwKClbYysyND4+Mj4+PjBdPWEuZ2V0RGF5KCk7Yj0oWihhLmdldEZ1bGxZZWFyKCkpP3JiOnNiKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtwKClbYysyOD4+Mj4+PjBdPWI7cCgpW2MrMzY+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGU9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO1xuYT0oYiE9ZSYmYS5nZXRUaW1lem9uZU9mZnNldCgpPT1NYXRoLm1pbihlLGIpKXwwO3AoKVtjKzMyPj4yPj4+MF09YX0sdjpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9bmV3IERhdGUocCgpW2ErMjA+PjI+Pj4wXSsxOTAwLHAoKVthKzE2Pj4yPj4+MF0scCgpW2ErMTI+PjI+Pj4wXSxwKClbYSs4Pj4yPj4+MF0scCgpW2ErND4+Mj4+PjBdLHAoKVthPj4yPj4+MF0sMCksYz1wKClbYSszMj4+Mj4+PjBdLGU9Yi5nZXRUaW1lem9uZU9mZnNldCgpLGg9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGc9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGs9TWF0aC5taW4oZyxoKTswPmM/cCgpW2ErMzI+PjI+Pj4wXT1OdW1iZXIoaCE9ZyYmaz09ZSk6MDxjIT0oaz09ZSkmJihoPU1hdGgubWF4KGcsaCksYi5zZXRUaW1lKGIuZ2V0VGltZSgpKzZFNCooKDA8Yz9rOmgpLWUpKSk7cCgpW2ErMjQ+PjI+Pj5cbjBdPWIuZ2V0RGF5KCk7Yz0oWihiLmdldEZ1bGxZZWFyKCkpP3JiOnNiKVtiLmdldE1vbnRoKCldK2IuZ2V0RGF0ZSgpLTF8MDtwKClbYSsyOD4+Mj4+PjBdPWM7cCgpW2E+PjI+Pj4wXT1iLmdldFNlY29uZHMoKTtwKClbYSs0Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7cCgpW2ErOD4+Mj4+PjBdPWIuZ2V0SG91cnMoKTtwKClbYSsxMj4+Mj4+PjBdPWIuZ2V0RGF0ZSgpO3AoKVthKzE2Pj4yPj4+MF09Yi5nZXRNb250aCgpO3AoKVthKzIwPj4yPj4+MF09Yi5nZXRZZWFyKCk7YT1iLmdldFRpbWUoKS8xRTM7cmV0dXJuIFdiKChUPWEsMTw9K01hdGguYWJzKFQpPzA8VD8rTWF0aC5mbG9vcihULzQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKFQtKyh+flQ+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApKSxhPj4+MH0scjp0YixzOnViLHk6ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGUodil7cmV0dXJuKHY9di50b1RpbWVTdHJpbmcoKS5tYXRjaCgvXFwoKFtBLVphLXogXSspXFwpJC8pKT9cbnZbMV06XCJHTVRcIn1hPj4+PTA7Yj4+Pj0wO2M+Pj49MDt2YXIgaD0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCksZz1uZXcgRGF0ZShoLDAsMSksaz1uZXcgRGF0ZShoLDYsMSk7aD1nLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIHQ9ay5nZXRUaW1lem9uZU9mZnNldCgpLEM9TWF0aC5tYXgoaCx0KTtyKClbYT4+Mj4+PjBdPTYwKkM7cCgpW2I+PjI+Pj4wXT1OdW1iZXIoaCE9dCk7YT1lKGcpO2I9ZShrKTthPXdiKGEpO2I9d2IoYik7dDxoPyhyKClbYz4+Mj4+PjBdPWEscigpW2MrND4+Mj4+PjBdPWIpOihyKClbYz4+Mj4+PjBdPWIscigpW2MrND4+Mj4+PjBdPWEpfSxjOigpPT57SyhcIlwiKX0sazpmdW5jdGlvbigpe30saTpmdW5jdGlvbigpe3JldHVybiBEYXRlLm5vdygpfSxvOigpPT57d2ErPTE7dGhyb3dcInVud2luZFwiO30sQTpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxlOigpPT5wZXJmb3JtYW5jZS50aW1lT3JpZ2luK3BlcmZvcm1hbmNlLm5vdygpLGY6ZnVuY3Rpb24oKXtyZXR1cm4gQj9cbnJlcXVpcmUoXCJvc1wiKS5jcHVzKCkubGVuZ3RoOm5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5fSxLOmZ1bmN0aW9uKGEsYixjLGUpe1YudmI9Yj4+PjA7QmIubGVuZ3RoPWM7Yj1lPj4+MD4+Mztmb3IoZT0wO2U8YztlKyspQmJbZV09ZWEoKVtiK2U+Pj4wXTtyZXR1cm4gVWJbYV0uYXBwbHkobnVsbCxCYil9LHg6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW4oKS5sZW5ndGg7aWYoYTw9Ynx8NDI5NDkwMTc2MDxhKXJldHVybiExO2Zvcih2YXIgYz0xOzQ+PWM7Yyo9Mil7dmFyIGU9YiooMSsuMi9jKTtlPU1hdGgubWluKGUsYSsxMDA2NjMyOTYpO3ZhciBoPU1hdGg7ZT1NYXRoLm1heChhLGUpO2E6e2g9aC5taW4uY2FsbChoLDQyOTQ5MDE3NjAsZSsoNjU1MzYtZSU2NTUzNiklNjU1MzYpLWQuYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzU+Pj4xNjt0cnl7ZC5ncm93KGgpO20oKTt2YXIgZz0xO2JyZWFrIGF9Y2F0Y2goayl7fWc9dm9pZCAwfWlmKGcpcmV0dXJuITB9cmV0dXJuITF9LFxuTzpGYixQOkdiLEg6TmEsZzpIYixtOkxiLHc6TWIsbDpPYixhOmR8fHcud2FzbU1lbW9yeSxHOlRiLGQ6ZnVuY3Rpb24oYSxiLGMsZSl7cmV0dXJuIFRiKGE+Pj4wLGI+Pj4wLGM+Pj4wLGU+Pj4wKX19OyhmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYyxlKXtjPWMuZXhwb3J0cztMPWM9WWIoYyk7Vi5aYS5wdXNoKEwueWEpO3NhPUwuemE7dWEudW5zaGlmdChMLlYpO3JhPWU7emEoKTtyZXR1cm4gY312YXIgYj17YTpYYn07eWEoKTtpZih3Lmluc3RhbnRpYXRlV2FzbSl0cnl7cmV0dXJuIHcuaW5zdGFudGlhdGVXYXNtKGIsYSl9Y2F0Y2goYyl7SShcIk1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6IFwiK2MpLHgoYyl9RWEoYixmdW5jdGlvbihjKXthKGMuaW5zdGFuY2UsYy5tb2R1bGUpfSkuY2F0Y2goeCk7cmV0dXJue319KSgpO3cuX09ydEluaXQ9KGEsYik9Pih3Ll9PcnRJbml0PUwuVykoYSxiKTtcbncuX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KHcuX09ydEdldExhc3RFcnJvcj1MLlgpKGEsYik7dy5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9KGEsYixjLGUsaCxnLGssdCxDLHYpPT4ody5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9TC5ZKShhLGIsYyxlLGgsZyxrLHQsQyx2KTt3Ll9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj0oYSxiKT0+KHcuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPUwuWikoYSxiKTt3Ll9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9KGEsYixjKT0+KHcuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT1MLl8pKGEsYixjKTt3Ll9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGEsYixjKT0+KHcuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1MLiQpKGEsYixjKTt3Ll9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9YT0+KHcuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1MLmFhKShhKTtcbncuX09ydENyZWF0ZVNlc3Npb249KGEsYixjKT0+KHcuX09ydENyZWF0ZVNlc3Npb249TC5iYSkoYSxiLGMpO3cuX09ydFJlbGVhc2VTZXNzaW9uPWE9Pih3Ll9PcnRSZWxlYXNlU2Vzc2lvbj1MLmNhKShhKTt3Ll9PcnRHZXRJbnB1dE91dHB1dENvdW50PShhLGIsYyk9Pih3Ll9PcnRHZXRJbnB1dE91dHB1dENvdW50PUwuZGEpKGEsYixjKTt3Ll9PcnRHZXRJbnB1dE5hbWU9KGEsYik9Pih3Ll9PcnRHZXRJbnB1dE5hbWU9TC5lYSkoYSxiKTt3Ll9PcnRHZXRPdXRwdXROYW1lPShhLGIpPT4ody5fT3J0R2V0T3V0cHV0TmFtZT1MLmZhKShhLGIpO3cuX09ydEZyZWU9YT0+KHcuX09ydEZyZWU9TC5nYSkoYSk7dy5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxlLGgsZyk9Pih3Ll9PcnRDcmVhdGVUZW5zb3I9TC5oYSkoYSxiLGMsZSxoLGcpO3cuX09ydEdldFRlbnNvckRhdGE9KGEsYixjLGUsaCk9Pih3Ll9PcnRHZXRUZW5zb3JEYXRhPUwuaWEpKGEsYixjLGUsaCk7XG53Ll9PcnRSZWxlYXNlVGVuc29yPWE9Pih3Ll9PcnRSZWxlYXNlVGVuc29yPUwuamEpKGEpO3cuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGEsYixjLGUpPT4ody5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1MLmthKShhLGIsYyxlKTt3Ll9PcnRBZGRSdW5Db25maWdFbnRyeT0oYSxiLGMpPT4ody5fT3J0QWRkUnVuQ29uZmlnRW50cnk9TC5sYSkoYSxiLGMpO3cuX09ydFJlbGVhc2VSdW5PcHRpb25zPWE9Pih3Ll9PcnRSZWxlYXNlUnVuT3B0aW9ucz1MLm1hKShhKTt3Ll9PcnRDcmVhdGVCaW5kaW5nPWE9Pih3Ll9PcnRDcmVhdGVCaW5kaW5nPUwubmEpKGEpO3cuX09ydEJpbmRJbnB1dD0oYSxiLGMpPT4ody5fT3J0QmluZElucHV0PUwub2EpKGEsYixjKTt3Ll9PcnRCaW5kT3V0cHV0PShhLGIsYyxlKT0+KHcuX09ydEJpbmRPdXRwdXQ9TC5wYSkoYSxiLGMsZSk7dy5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9YT0+KHcuX09ydENsZWFyQm91bmRPdXRwdXRzPUwucWEpKGEpO1xudy5fT3J0UmVsZWFzZUJpbmRpbmc9YT0+KHcuX09ydFJlbGVhc2VCaW5kaW5nPUwucmEpKGEpO3cuX09ydFJ1bldpdGhCaW5kaW5nPShhLGIsYyxlLGgpPT4ody5fT3J0UnVuV2l0aEJpbmRpbmc9TC5zYSkoYSxiLGMsZSxoKTt3Ll9PcnRSdW49KGEsYixjLGUsaCxnLGssdCk9Pih3Ll9PcnRSdW49TC50YSkoYSxiLGMsZSxoLGcsayx0KTt3Ll9PcnRFbmRQcm9maWxpbmc9YT0+KHcuX09ydEVuZFByb2ZpbGluZz1MLnVhKShhKTt2YXIgWD13Ll9wdGhyZWFkX3NlbGY9KCk9PihYPXcuX3B0aHJlYWRfc2VsZj1MLnZhKSgpLHZiPXcuX21hbGxvYz1hPT4odmI9dy5fbWFsbG9jPUwud2EpKGEpO3cuX2ZyZWU9YT0+KHcuX2ZyZWU9TC54YSkoYSk7dy5fX2Vtc2NyaXB0ZW5fdGxzX2luaXQ9KCk9Pih3Ll9fZW1zY3JpcHRlbl90bHNfaW5pdD1MLnlhKSgpO1xudmFyIFZiPXcuX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PShhLGIsYyxlLGgsZyk9PihWYj13Ll9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdD1MLkFhKShhLGIsYyxlLGgsZyk7dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQ9KCk9Pih3Ll9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD1MLkJhKSgpO3ZhciBBYj0oYSxiLGMsZSk9PihBYj1MLkNhKShhLGIsYyxlKSxPYT1hPT4oT2E9TC5EYSkoYSksVGE9dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9YT0+KFRhPXcuX19lbXNjcmlwdGVuX3RocmVhZF9leGl0PUwuRWEpKGEpLHFiPXcuX19lbXNjcmlwdGVuX2NoZWNrX21haWxib3g9KCk9PihxYj13Ll9fZW1zY3JpcHRlbl9jaGVja19tYWlsYm94PUwuRmEpKCksV2I9YT0+KFdiPUwuR2EpKGEpLFFhPShhLGIpPT4oUWE9TC5IYSkoYSxiKSx4Yj0oKT0+KHhiPUwuSWEpKCksUmE9YT0+KFJhPUwuSmEpKGEpLHpiPWE9Pih6Yj1MLkthKShhKTtcbmZ1bmN0aW9uIFliKGEpe2E9T2JqZWN0LmFzc2lnbih7fSxhKTt2YXIgYj1lPT4oKT0+ZSgpPj4+MCxjPWU9Pmg9PmUoaCk+Pj4wO2EuX19lcnJub19sb2NhdGlvbj1iKGEuX19lcnJub19sb2NhdGlvbik7YS5wdGhyZWFkX3NlbGY9YihhLnB0aHJlYWRfc2VsZik7YS5tYWxsb2M9YyhhLm1hbGxvYyk7YS5zdGFja1NhdmU9YihhLnN0YWNrU2F2ZSk7YS5zdGFja0FsbG9jPWMoYS5zdGFja0FsbG9jKTtyZXR1cm4gYX13LmtlZXBSdW50aW1lQWxpdmU9UDt3Lndhc21NZW1vcnk9ZDt3LnN0YWNrQWxsb2M9emI7dy5zdGFja1NhdmU9eGI7dy5zdGFja1Jlc3RvcmU9UmE7dy5VVEY4VG9TdHJpbmc9S2E7dy5zdHJpbmdUb1VURjg9Y2I7dy5sZW5ndGhCeXRlc1VURjg9YWI7dy5FeGl0U3RhdHVzPVU7dy5QVGhyZWFkPVY7dmFyIFpiO1I9ZnVuY3Rpb24gJGIoKXtaYnx8YWMoKTtaYnx8KFI9JGIpfTtcbmZ1bmN0aW9uIGFjKCl7ZnVuY3Rpb24gYSgpe2lmKCFaYiYmKFpiPSEwLHcuY2FsbGVkUnVuPSEwLCFNKSl7RHx8UGEodWEpO2hhKHcpO2lmKHcub25SdW50aW1lSW5pdGlhbGl6ZWQpdy5vblJ1bnRpbWVJbml0aWFsaXplZCgpO2lmKCFEKXtpZih3LnBvc3RSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIHcucG9zdFJ1biYmKHcucG9zdFJ1bj1bdy5wb3N0UnVuXSk7dy5wb3N0UnVuLmxlbmd0aDspe3ZhciBiPXcucG9zdFJ1bi5zaGlmdCgpO3ZhLnVuc2hpZnQoYil9UGEodmEpfX19aWYoISgwPFEpKWlmKEQpaGEodyksRHx8UGEodWEpLHN0YXJ0V29ya2VyKHcpO2Vsc2V7aWYody5wcmVSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIHcucHJlUnVuJiYody5wcmVSdW49W3cucHJlUnVuXSk7dy5wcmVSdW4ubGVuZ3RoOyl0YS51bnNoaWZ0KHcucHJlUnVuLnNoaWZ0KCkpO1BhKHRhKTswPFF8fCh3LnNldFN0YXR1cz8ody5zZXRTdGF0dXMoXCJSdW5uaW5nLi4uXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dy5zZXRTdGF0dXMoXCJcIil9LFxuMSk7YSgpfSwxKSk6YSgpKX19aWYody5wcmVJbml0KWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiB3LnByZUluaXQmJih3LnByZUluaXQ9W3cucHJlSW5pdF0pOzA8dy5wcmVJbml0Lmxlbmd0aDspdy5wcmVJbml0LnBvcCgpKCk7YWMoKTtcblxuXG4gIHJldHVybiBtb2R1bGVBcmcucmVhZHlcbn1cblxuKTtcbn0pKCk7XG5pZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuICBtb2R1bGUuZXhwb3J0cyA9IG9ydFdhc21UaHJlYWRlZDtcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSlcbiAgZGVmaW5lKFtdLCAoKSA9PiBvcnRXYXNtVGhyZWFkZWQpO1xuIiwgIlwidXNlIHN0cmljdFwiO3ZhciBNb2R1bGU9e307dmFyIEVOVklST05NRU5UX0lTX05PREU9dHlwZW9mIHByb2Nlc3M9PVwib2JqZWN0XCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zPT1cIm9iamVjdFwiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlPT1cInN0cmluZ1wiO2lmKEVOVklST05NRU5UX0lTX05PREUpe3ZhciBub2RlV29ya2VyVGhyZWFkcz1yZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7dmFyIHBhcmVudFBvcnQ9bm9kZVdvcmtlclRocmVhZHMucGFyZW50UG9ydDtwYXJlbnRQb3J0Lm9uKFwibWVzc2FnZVwiLGRhdGE9Pm9ubWVzc2FnZSh7ZGF0YTpkYXRhfSkpO3ZhciBmcz1yZXF1aXJlKFwiZnNcIik7T2JqZWN0LmFzc2lnbihnbG9iYWwse3NlbGY6Z2xvYmFsLHJlcXVpcmU6cmVxdWlyZSxNb2R1bGU6TW9kdWxlLGxvY2F0aW9uOntocmVmOl9fZmlsZW5hbWV9LFdvcmtlcjpub2RlV29ya2VyVGhyZWFkcy5Xb3JrZXIsaW1wb3J0U2NyaXB0czpmPT4oMCxldmFsKShmcy5yZWFkRmlsZVN5bmMoZixcInV0ZjhcIikrXCIvLyMgc291cmNlVVJMPVwiK2YpLHBvc3RNZXNzYWdlOm1zZz0+cGFyZW50UG9ydC5wb3N0TWVzc2FnZShtc2cpLHBlcmZvcm1hbmNlOmdsb2JhbC5wZXJmb3JtYW5jZXx8e25vdzpEYXRlLm5vd319KX12YXIgaW5pdGlhbGl6ZWRKUz1mYWxzZTtmdW5jdGlvbiB0aHJlYWRQcmludEVycigpe3ZhciB0ZXh0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbihcIiBcIik7aWYoRU5WSVJPTk1FTlRfSVNfTk9ERSl7ZnMud3JpdGVTeW5jKDIsdGV4dCtcIlxcblwiKTtyZXR1cm59Y29uc29sZS5lcnJvcih0ZXh0KX1mdW5jdGlvbiB0aHJlYWRBbGVydCgpe3ZhciB0ZXh0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbihcIiBcIik7cG9zdE1lc3NhZ2Uoe2NtZDpcImFsZXJ0XCIsdGV4dDp0ZXh0LHRocmVhZElkOk1vZHVsZVtcIl9wdGhyZWFkX3NlbGZcIl0oKX0pfXZhciBlcnI9dGhyZWFkUHJpbnRFcnI7c2VsZi5hbGVydD10aHJlYWRBbGVydDtNb2R1bGVbXCJpbnN0YW50aWF0ZVdhc21cIl09KGluZm8scmVjZWl2ZUluc3RhbmNlKT0+e3ZhciBtb2R1bGU9TW9kdWxlW1wid2FzbU1vZHVsZVwiXTtNb2R1bGVbXCJ3YXNtTW9kdWxlXCJdPW51bGw7dmFyIGluc3RhbmNlPW5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShtb2R1bGUsaW5mbyk7cmV0dXJuIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSl9O3NlbGYub251bmhhbmRsZWRyZWplY3Rpb249ZT0+e3Rocm93IGUucmVhc29uPz9lfTtmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKGUpe3RyeXtpZihlLmRhdGEuY21kPT09XCJsb2FkXCIpe2xldCBtZXNzYWdlUXVldWU9W107c2VsZi5vbm1lc3NhZ2U9ZT0+bWVzc2FnZVF1ZXVlLnB1c2goZSk7c2VsZi5zdGFydFdvcmtlcj1pbnN0YW5jZT0+e01vZHVsZT1pbnN0YW5jZTtwb3N0TWVzc2FnZSh7XCJjbWRcIjpcImxvYWRlZFwifSk7Zm9yKGxldCBtc2cgb2YgbWVzc2FnZVF1ZXVlKXtoYW5kbGVNZXNzYWdlKG1zZyl9c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZX07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1lLmRhdGEud2FzbU1vZHVsZTtmb3IoY29uc3QgaGFuZGxlciBvZiBlLmRhdGEuaGFuZGxlcnMpe01vZHVsZVtoYW5kbGVyXT0oLi4uYXJncyk9Pntwb3N0TWVzc2FnZSh7Y21kOlwiY2FsbEhhbmRsZXJcIixoYW5kbGVyOmhhbmRsZXIsYXJnczphcmdzfSl9fU1vZHVsZVtcIndhc21NZW1vcnlcIl09ZS5kYXRhLndhc21NZW1vcnk7TW9kdWxlW1wiYnVmZmVyXCJdPU1vZHVsZVtcIndhc21NZW1vcnlcIl0uYnVmZmVyO01vZHVsZVtcIkVOVklST05NRU5UX0lTX1BUSFJFQURcIl09dHJ1ZTtpZih0eXBlb2YgZS5kYXRhLnVybE9yQmxvYj09XCJzdHJpbmdcIil7aW1wb3J0U2NyaXB0cyhlLmRhdGEudXJsT3JCbG9iKX1lbHNle3ZhciBvYmplY3RVcmw9VVJMLmNyZWF0ZU9iamVjdFVSTChlLmRhdGEudXJsT3JCbG9iKTtpbXBvcnRTY3JpcHRzKG9iamVjdFVybCk7VVJMLnJldm9rZU9iamVjdFVSTChvYmplY3RVcmwpfW9ydFdhc21UaHJlYWRlZChNb2R1bGUpfWVsc2UgaWYoZS5kYXRhLmNtZD09PVwicnVuXCIpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdFwiXShlLmRhdGEucHRocmVhZF9wdHIsLyppc01haW5Ccm93c2VyVGhyZWFkPSovMCwvKmlzTWFpblJ1bnRpbWVUaHJlYWQ9Ki8wLC8qY2FuQmxvY2s9Ki8xKTtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXRcIl0oZS5kYXRhLnB0aHJlYWRfcHRyKTtNb2R1bGVbXCJlc3RhYmxpc2hTdGFja1NwYWNlXCJdKCk7TW9kdWxlW1wiUFRocmVhZFwiXS5yZWNlaXZlT2JqZWN0VHJhbnNmZXIoZS5kYXRhKTtNb2R1bGVbXCJQVGhyZWFkXCJdLnRocmVhZEluaXRUTFMoKTtpZighaW5pdGlhbGl6ZWRKUyl7aW5pdGlhbGl6ZWRKUz10cnVlfXRyeXtNb2R1bGVbXCJpbnZva2VFbnRyeVBvaW50XCJdKGUuZGF0YS5zdGFydF9yb3V0aW5lLGUuZGF0YS5hcmcpfWNhdGNoKGV4KXtpZihleCE9XCJ1bndpbmRcIil7dGhyb3cgZXh9fX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNhbmNlbFwiKXtpZihNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCkpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdFwiXSgtMSl9fWVsc2UgaWYoZS5kYXRhLnRhcmdldD09PVwic2V0aW1tZWRpYXRlXCIpe31lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNoZWNrTWFpbGJveFwiKXtpZihpbml0aWFsaXplZEpTKXtNb2R1bGVbXCJjaGVja01haWxib3hcIl0oKX19ZWxzZSBpZihlLmRhdGEuY21kKXtlcnIoXCJ3b3JrZXIuanMgcmVjZWl2ZWQgdW5rbm93biBjb21tYW5kIFwiK2UuZGF0YS5jbWQpO2VycihlLmRhdGEpfX1jYXRjaChleCl7aWYoTW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkXCJdKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWRcIl0oKX10aHJvdyBleH19c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZTtcbiIsICJleHBvcnQgY29uc3Qgam9pbiA9IHVuZGVmaW5lZDsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7RW52fSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge09ydFdhc21Nb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbSc7XG5pbXBvcnQge09ydFdhc21UaHJlYWRlZE1vZHVsZX0gZnJvbSAnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkJztcblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xubGV0IG9ydFdhc21GYWN0b3J5OiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPjtcblxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcbiAgb3J0V2FzbUZhY3RvcnkgPSByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXRyYWluaW5nLXdhc20tc2ltZC5qcycpO1xufSBlbHNlIHtcbiAgb3J0V2FzbUZhY3RvcnkgPVxuICAgICAgQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS5qcycpIDogcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQuanNlcC5qcycpO1xufVxuXG5jb25zdCBvcnRXYXNtRmFjdG9yeVRocmVhZGVkOiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPiA9ICFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgP1xuICAgIChCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVID8gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLmpzJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC5qcycpKSA6XG4gICAgb3J0V2FzbUZhY3Rvcnk7XG4vKiBlc2xpbnQtZW5hYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cblxubGV0IHdhc206IE9ydFdhc21Nb2R1bGV8dW5kZWZpbmVkO1xubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG5sZXQgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG5sZXQgYWJvcnRlZCA9IGZhbHNlO1xuXG5jb25zdCBpc011bHRpVGhyZWFkU3VwcG9ydGVkID0gKG51bVRocmVhZHM6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAvLyBXZWJBc3NlbWJseSB0aHJlYWRzIGFyZSBzZXQgdG8gMSAoc2luZ2xlIHRocmVhZCkuXG4gIGlmIChudW1UaHJlYWRzID09PSAxKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgJ1NoYXJlZEFycmF5QnVmZmVyJyBpcyBub3QgYXZhaWxhYmxlLCBXZWJBc3NlbWJseSB0aHJlYWRzIHdpbGwgbm90IHdvcmsuXG4gIGlmICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJiAhc2VsZi5jcm9zc09yaWdpbklzb2xhdGVkKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICdlbnYud2FzbS5udW1UaHJlYWRzIGlzIHNldCB0byAnICsgbnVtVGhyZWFkcyArXG4gICAgICAgICAgJywgYnV0IHRoaXMgd2lsbCBub3Qgd29yayB1bmxlc3MgeW91IGVuYWJsZSBjcm9zc09yaWdpbklzb2xhdGVkIG1vZGUuICcgK1xuICAgICAgICAgICdTZWUgaHR0cHM6Ly93ZWIuZGV2L2Nyb3NzLW9yaWdpbi1pc29sYXRpb24tZ3VpZGUvIGZvciBtb3JlIGluZm8uJyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIG9ubnhydW50aW1lLXdlYiBkb2VzIG5vdCBzdXBwb3J0IG11bHRpLXRocmVhZHMgaW4gTm9kZS5qcy5cbiAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS53YXJuKFxuICAgICAgICAnZW52Lndhc20ubnVtVGhyZWFkcyBpcyBzZXQgdG8gJyArIG51bVRocmVhZHMgK1xuICAgICAgICAnLCBob3dldmVyLCBjdXJyZW50bHkgb25ueHJ1bnRpbWUtd2ViIGRvZXMgbm90IHN1cHBvcnQgbXVsdGktdGhyZWFkcyBpbiBOb2RlLmpzLiAnICtcbiAgICAgICAgJ1BsZWFzZSBjb25zaWRlciB1c2luZyBvbm54cnVudGltZS1ub2RlIGZvciBwZXJmb3JtYW5jZSBjcml0aWNhbCBzY2VuYXJpb3MuJyk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIFRlc3QgZm9yIHRyYW5zZmVyYWJpbGl0eSBvZiBTQUJzIChmb3IgYnJvd3NlcnMuIG5lZWRlZCBmb3IgRmlyZWZveClcbiAgICAvLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhbXNnL21vemlsbGEuZGV2LnBsYXRmb3JtL0lIa0JabEhFVHBBL2R3c01OY2hXRVFBSlxuICAgIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBuZXcgTWVzc2FnZUNoYW5uZWwoKS5wb3J0MS5wb3N0TWVzc2FnZShuZXcgU2hhcmVkQXJyYXlCdWZmZXIoMSkpO1xuICAgIH1cblxuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IHRocmVhZHMgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXG4gICAgLy8gVGhpcyB0eXBlZCBhcnJheSBpcyBhIFdlYkFzc2VtYmx5IHByb2dyYW0gY29udGFpbmluZyB0aHJlYWRlZCBpbnN0cnVjdGlvbnMuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDAsIDk3LCAxMTUsIDEwOSwgMSwgMCwgIDAsICAwLCAxLCA0LCAxLCAgOTYsIDAsICAgMCwgIDMsIDIsIDEsICAwLCA1LFxuICAgICAgNCwgMSwgIDMsICAgMSwgICAxLCAxMCwgMTEsIDEsIDksIDAsIDY1LCAwLCAgMjU0LCAxNiwgMiwgMCwgMjYsIDExXG4gICAgXSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBpc1NpbWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgU0lNRCBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIFNJTUQgaW5zdHJ1Y3Rpb25zLlxuXG4gICAgLy8gVGhlIGJpbmFyeSBkYXRhIGlzIGdlbmVyYXRlZCBmcm9tIHRoZSBmb2xsb3dpbmcgY29kZSBieSB3YXQyd2FzbTpcbiAgICAvL1xuICAgIC8vIChtb2R1bGVcbiAgICAvLyAgICh0eXBlICR0MCAoZnVuYykpXG4gICAgLy8gICAoZnVuYyAkZjAgKHR5cGUgJHQwKVxuICAgIC8vICAgICAoZHJvcFxuICAgIC8vICAgICAgIChpMzJ4NC5kb3RfaTE2eDhfc1xuICAgIC8vICAgICAgICAgKGk4eDE2LnNwbGF0XG4gICAgLy8gICAgICAgICAgIChpMzIuY29uc3QgMCkpXG4gICAgLy8gICAgICAgICAodjEyOC5jb25zdCBpMzJ4NCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwKSkpKSlcblxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShuZXcgVWludDhBcnJheShbXG4gICAgICAwLCAgIDk3LCAxMTUsIDEwOSwgMSwgMCwgMCwgMCwgMSwgNCwgMSwgOTYsIDAsIDAsIDMsIDIsIDEsIDAsIDEwLCAzMCwgMSwgICAyOCwgIDAsIDY1LCAwLFxuICAgICAgMjUzLCAxNSwgMjUzLCAxMiwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgIDI1MywgMTg2LCAxLCAyNiwgMTFcbiAgICBdKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGdldFdhc21GaWxlTmFtZSA9ICh1c2VTaW1kOiBib29sZWFuLCB1c2VUaHJlYWRzOiBib29sZWFuKSA9PiB7XG4gIGlmICh1c2VTaW1kKSB7XG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcbiAgICAgIHJldHVybiAnb3J0LXRyYWluaW5nLXdhc20tc2ltZC53YXNtJztcbiAgICB9XG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS1zaW1kLndhc20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB1c2VUaHJlYWRzID8gJ29ydC13YXNtLXRocmVhZGVkLndhc20nIDogJ29ydC13YXNtLndhc20nO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5ID0gYXN5bmMoZmxhZ3M6IEVudi5XZWJBc3NlbWJseUZsYWdzKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmIChpbml0aWFsaXplZCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuICBpZiAoaW5pdGlhbGl6aW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtdWx0aXBsZSBjYWxscyB0byBcXCdpbml0aWFsaXplV2ViQXNzZW1ibHkoKVxcJyBkZXRlY3RlZC4nKTtcbiAgfVxuICBpZiAoYWJvcnRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJldmlvdXMgY2FsbCB0byBcXCdpbml0aWFsaXplV2ViQXNzZW1ibHkoKVxcJyBmYWlsZWQuJyk7XG4gIH1cblxuICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gIC8vIHdhc20gZmxhZ3MgYXJlIGFscmVhZHkgaW5pdGlhbGl6ZWRcbiAgY29uc3QgdGltZW91dCA9IGZsYWdzLmluaXRUaW1lb3V0ITtcbiAgY29uc3QgbnVtVGhyZWFkcyA9IGZsYWdzLm51bVRocmVhZHMhO1xuICBjb25zdCBzaW1kID0gZmxhZ3Muc2ltZCE7XG5cbiAgY29uc3QgdXNlVGhyZWFkcyA9IGlzTXVsdGlUaHJlYWRTdXBwb3J0ZWQobnVtVGhyZWFkcyk7XG4gIGNvbnN0IHVzZVNpbWQgPSBzaW1kICYmIGlzU2ltZFN1cHBvcnRlZCgpO1xuXG4gIGNvbnN0IHdhc21QYXRocyA9IGZsYWdzLndhc21QYXRocztcbiAgY29uc3Qgd2FzbVByZWZpeE92ZXJyaWRlID0gdHlwZW9mIHdhc21QYXRocyA9PT0gJ3N0cmluZycgPyB3YXNtUGF0aHMgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHdhc21GaWxlTmFtZSA9IGdldFdhc21GaWxlTmFtZSh1c2VTaW1kLCB1c2VUaHJlYWRzKTtcbiAgY29uc3Qgd2FzbVBhdGhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdvYmplY3QnID8gd2FzbVBhdGhzW3dhc21GaWxlTmFtZV0gOiB1bmRlZmluZWQ7XG5cbiAgbGV0IGlzVGltZW91dCA9IGZhbHNlO1xuXG4gIGNvbnN0IHRhc2tzOiBBcnJheTxQcm9taXNlPHZvaWQ+PiA9IFtdO1xuXG4gIC8vIHByb21pc2UgZm9yIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgPiAwKSB7XG4gICAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlzVGltZW91dCA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH0pKTtcbiAgfVxuXG4gIC8vIHByb21pc2UgZm9yIG1vZHVsZSBpbml0aWFsaXphdGlvblxuICB0YXNrcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBmYWN0b3J5ID0gdXNlVGhyZWFkcyA/IG9ydFdhc21GYWN0b3J5VGhyZWFkZWQgOiBvcnRXYXNtRmFjdG9yeTtcbiAgICBjb25zdCBjb25maWc6IFBhcnRpYWw8T3J0V2FzbU1vZHVsZT4gPSB7XG4gICAgICBsb2NhdGVGaWxlOiAoZmlsZU5hbWU6IHN0cmluZywgc2NyaXB0RGlyZWN0b3J5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcyAmJiBmaWxlTmFtZS5lbmRzV2l0aCgnLndvcmtlci5qcycpICYmXG4gICAgICAgICAgICB0eXBlb2YgQmxvYiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgcmVxdWlyZSgpIGZ1bmN0aW9uIGlzIGhhbmRsZWQgYnkgZXNidWlsZCBwbHVnaW4gdG8gbG9hZCBmaWxlIGNvbnRlbnQgYXMgc3RyaW5nLlxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzXG4gICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcycpXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHt0eXBlOiAndGV4dC9qYXZhc2NyaXB0J30pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLndhc20nKSkge1xuICAgICAgICAgIGlmICh3YXNtUGF0aE92ZXJyaWRlKSB7XG4gICAgICAgICAgICByZXR1cm4gd2FzbVBhdGhPdmVycmlkZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBwcmVmaXggPSB3YXNtUHJlZml4T3ZlcnJpZGUgPz8gc2NyaXB0RGlyZWN0b3J5O1xuXG4gICAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgICAgICAgICBpZiAod2FzbUZpbGVOYW1lID09PSAnb3J0LXdhc20tc2ltZC53YXNtJykge1xuICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgJ29ydC13YXNtLXNpbWQuanNlcC53YXNtJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2FzbUZpbGVOYW1lID09PSAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJykge1xuICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ICsgJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC53YXNtJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcHJlZml4ICsgd2FzbUZpbGVOYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjcmlwdERpcmVjdG9yeSArIGZpbGVOYW1lO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCAmJiB1c2VUaHJlYWRzKSB7XG4gICAgICBjb25maWcubnVtVGhyZWFkcyA9IG51bVRocmVhZHM7XG4gICAgICBpZiAodHlwZW9mIEJsb2IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbmZpZy5tYWluU2NyaXB0VXJsT3JCbG9iID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ29ydC13YXNtLXRocmVhZGVkLmpzJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzY3JpcHRTb3VyY2VDb2RlID0gYHZhciBvcnRXYXNtVGhyZWFkZWQ9JHtmYWN0b3J5LnRvU3RyaW5nKCl9O2A7XG4gICAgICAgIGNvbmZpZy5tYWluU2NyaXB0VXJsT3JCbG9iID0gbmV3IEJsb2IoW3NjcmlwdFNvdXJjZUNvZGVdLCB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmYWN0b3J5KGNvbmZpZykudGhlbihcbiAgICAgICAgLy8gd2FzbSBtb2R1bGUgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgIG1vZHVsZSA9PiB7XG4gICAgICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHdhc20gPSBtb2R1bGU7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9LFxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBmYWlsZWQgdG8gaW5pdGlhbGl6ZVxuICAgICAgICAod2hhdCkgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGFib3J0ZWQgPSB0cnVlO1xuICAgICAgICAgIHJlamVjdCh3aGF0KTtcbiAgICAgICAgfSk7XG4gIH0pKTtcblxuICBhd2FpdCBQcm9taXNlLnJhY2UodGFza3MpO1xuXG4gIGlmIChpc1RpbWVvdXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFdlYkFzc2VtYmx5IGJhY2tlbmQgaW5pdGlhbGl6aW5nIGZhaWxlZCBkdWUgdG8gdGltZW91dDogJHt0aW1lb3V0fW1zYCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRJbnN0YW5jZSA9ICgpOiBPcnRXYXNtTW9kdWxlID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmIHdhc20pIHtcbiAgICByZXR1cm4gd2FzbTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignV2ViQXNzZW1ibHkgaXMgbm90IGluaXRpYWxpemVkIHlldC4nKTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNwb3NlID0gKCk6IHZvaWQgPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQgJiYgIWluaXRpYWxpemluZyAmJiAhYWJvcnRlZCkge1xuICAgIGluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgICAod2FzbSBhcyBPcnRXYXNtVGhyZWFkZWRNb2R1bGUpLlBUaHJlYWQ/LnRlcm1pbmF0ZUFsbFRocmVhZHMoKTtcbiAgICB3YXNtID0gdW5kZWZpbmVkO1xuXG4gICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuXG5leHBvcnQgY29uc3QgYWxsb2NXYXNtU3RyaW5nID0gKGRhdGE6IHN0cmluZywgYWxsb2NzOiBudW1iZXJbXSk6IG51bWJlciA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gIGNvbnN0IGRhdGFMZW5ndGggPSB3YXNtLmxlbmd0aEJ5dGVzVVRGOChkYXRhKSArIDE7XG4gIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLl9tYWxsb2MoZGF0YUxlbmd0aCk7XG4gIHdhc20uc3RyaW5nVG9VVEY4KGRhdGEsIGRhdGFPZmZzZXQsIGRhdGFMZW5ndGgpO1xuICBhbGxvY3MucHVzaChkYXRhT2Zmc2V0KTtcblxuICByZXR1cm4gZGF0YU9mZnNldDtcbn07XG5cbmludGVyZmFjZSBFeHRyYU9wdGlvbnNIYW5kbGVyIHtcbiAgKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBpdGVyYXRlRXh0cmFPcHRpb25zID1cbiAgICAob3B0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHByZWZpeDogc3RyaW5nLCBzZWVuOiBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PixcbiAgICAgaGFuZGxlcjogRXh0cmFPcHRpb25zSGFuZGxlcik6IHZvaWQgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdvYmplY3QnICYmIG9wdGlvbnMgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKHNlZW4uaGFzKG9wdGlvbnMpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaXJjdWxhciByZWZlcmVuY2UgaW4gb3B0aW9ucycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlZW4uYWRkKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gKHByZWZpeCkgPyBwcmVmaXggKyBrZXkgOiBrZXk7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgbmFtZSArICcuJywgc2VlbiwgaGFuZGxlcik7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgaGFuZGxlcihuYW1lLCB2YWx1ZS50b1N0cmluZygpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIGhhbmRsZXIobmFtZSwgKHZhbHVlKSA/ICcxJyA6ICcwJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBoYW5kbGUgZXh0cmEgY29uZmlnIHR5cGU6ICR7dHlwZW9mIHZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4vKipcbiAqIGNoZWNrIHdlYiBhc3NlbWJseSBBUEkncyBsYXN0IGVycm9yIGFuZCB0aHJvdyBlcnJvciBpZiBhbnkgZXJyb3Igb2NjdXJyZWQuXG4gKiBAcGFyYW0gbWVzc2FnZSBhIG1lc3NhZ2UgdXNlZCB3aGVuIGFuIGVycm9yIG9jY3VycmVkLlxuICovXG5leHBvcnQgY29uc3QgY2hlY2tMYXN0RXJyb3IgPSAobWVzc2FnZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJhbXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoOCk7XG4gICAgd2FzbS5fT3J0R2V0TGFzdEVycm9yKHBhcmFtc09mZnNldCwgcGFyYW1zT2Zmc2V0ICsgNCk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5IRUFQMzJbcGFyYW1zT2Zmc2V0IC8gNF07XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlUG9pbnRlciA9IHdhc20uSEVBUFUzMltwYXJhbXNPZmZzZXQgLyA0ICsgMV07XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlUG9pbnRlciA/IHdhc20uVVRGOFRvU3RyaW5nKGVycm9yTWVzc2FnZVBvaW50ZXIpIDogJyc7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke21lc3NhZ2V9IEVSUk9SX0NPREU6ICR7ZXJyb3JDb2RlfSwgRVJST1JfTUVTU0FHRTogJHtlcnJvck1lc3NhZ2V9YCk7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuZXhwb3J0IGNvbnN0IHNldFJ1bk9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBydW5PcHRpb25zSGFuZGxlID0gMDtcbiAgY29uc3QgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IHJ1bk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdHJ5IHtcbiAgICBpZiAob3B0aW9ucz8ubG9nU2V2ZXJpdHlMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPSAyOyAgLy8gRGVmYXVsdCB0byB3YXJuaW5nXG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgdHlwZW9mIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sb2dTZXZlcml0eUxldmVsKSB8fFxuICAgICAgICBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPCAwIHx8IG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dTZXZlcml0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5sb2dWZXJib3NpdHlMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID0gMDsgIC8vIERlZmF1bHQgdG8gMFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LnRlcm1pbmF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLnRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGxldCB0YWdEYXRhT2Zmc2V0ID0gMDtcbiAgICBpZiAob3B0aW9ucz8udGFnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhZ0RhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcob3B0aW9ucy50YWcsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgcnVuT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVJ1bk9wdGlvbnMoXG4gICAgICAgIHJ1bk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCEsIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwhLCAhIXJ1bk9wdGlvbnMudGVybWluYXRlISwgdGFnRGF0YU9mZnNldCk7XG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBydW4gb3B0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8uZXh0cmEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyhvcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFJ1bkNvbmZpZ0VudHJ5KHJ1bk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgcnVuIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbcnVuT3B0aW9uc0hhbmRsZSwgYWxsb2NzXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgYWxsb2NzLmZvckVhY2goYWxsb2MgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7SW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yLCBpdGVyYXRlRXh0cmFPcHRpb25zfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuXG5jb25zdCBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwgPSAoZ3JhcGhPcHRpbWl6YXRpb25MZXZlbDogc3RyaW5nfHVua25vd24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwpIHtcbiAgICBjYXNlICdkaXNhYmxlZCc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICdleHRlbmRlZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICdhbGwnOlxuICAgICAgcmV0dXJuIDk5O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGdyYXBoIG9wdGltaXphdGlvbiBsZXZlbDogJHtncmFwaE9wdGltaXphdGlvbkxldmVsfWApO1xuICB9XG59O1xuXG5jb25zdCBnZXRFeGVjdXRpb25Nb2RlID0gKGV4ZWN1dGlvbk1vZGU6ICdzZXF1ZW50aWFsJ3wncGFyYWxsZWwnKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChleGVjdXRpb25Nb2RlKSB7XG4gICAgY2FzZSAnc2VxdWVudGlhbCc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdwYXJhbGxlbCc6XG4gICAgICByZXR1cm4gMTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBleGVjdXRpb24gbW9kZTogJHtleGVjdXRpb25Nb2RlfWApO1xuICB9XG59O1xuXG5jb25zdCBhcHBlbmREZWZhdWx0T3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogdm9pZCA9PiB7XG4gIGlmICghb3B0aW9ucy5leHRyYSkge1xuICAgIG9wdGlvbnMuZXh0cmEgPSB7fTtcbiAgfVxuICBpZiAoIW9wdGlvbnMuZXh0cmEuc2Vzc2lvbikge1xuICAgIG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiA9IHt9O1xuICB9XG4gIGNvbnN0IHNlc3Npb24gPSBvcHRpb25zLmV4dHJhLnNlc3Npb24gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgaWYgKCFzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5ID0gJzEnO1xuICB9XG5cbiAgLy8gaWYgdXNpbmcgSlNFUCB3aXRoIFdlYkdQVSwgYWx3YXlzIGRpc2FibGUgbWVtb3J5IHBhdHRlcm5cbiAgaWYgKG9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzICYmXG4gICAgICBvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycy5zb21lKGVwID0+ICh0eXBlb2YgZXAgPT09ICdzdHJpbmcnID8gZXAgOiBlcC5uYW1lKSA9PT0gJ3dlYmdwdScpKSB7XG4gICAgb3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuID0gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IHNldEV4ZWN1dGlvblByb3ZpZGVycyA9XG4gICAgKHNlc3Npb25PcHRpb25zSGFuZGxlOiBudW1iZXIsIGV4ZWN1dGlvblByb3ZpZGVyczogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbi5FeGVjdXRpb25Qcm92aWRlckNvbmZpZ1tdLFxuICAgICBhbGxvY3M6IG51bWJlcltdKTogdm9pZCA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGVwIG9mIGV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgICBsZXQgZXBOYW1lID0gdHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZTtcblxuICAgICAgICAvLyBjaGVjayBFUCBuYW1lXG4gICAgICAgIHN3aXRjaCAoZXBOYW1lKSB7XG4gICAgICAgICAgY2FzZSAnd2Vibm4nOlxuICAgICAgICAgICAgZXBOYW1lID0gJ1dFQk5OJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYm5uT3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8uZGV2aWNlVHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ2RldmljZVR5cGUnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJubk9wdGlvbnMuZGV2aWNlVHlwZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdkZXZpY2VUeXBlJyAtICR7d2Vibm5PcHRpb25zLmRldmljZVR5cGV9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAod2Vibm5PcHRpb25zPy5udW1UaHJlYWRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVRocmVhZHMgPSB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcztcbiAgICAgICAgICAgICAgICAvLyBKdXN0IGlnbm9yZSBpbnZhbGlkIHdlYm5uT3B0aW9ucy5udW1UaHJlYWRzLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbnVtVGhyZWFkcyAhPSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihudW1UaHJlYWRzKSB8fCBudW1UaHJlYWRzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgbnVtVGhyZWFkcyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ251bVRocmVhZHMnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhudW1UaHJlYWRzLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnbnVtVGhyZWFkcycgLSAke3dlYm5uT3B0aW9ucy5udW1UaHJlYWRzfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ucG93ZXJQcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncG93ZXJQcmVmZXJlbmNlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwb3dlclByZWZlcmVuY2UnIC0gJHt3ZWJubk9wdGlvbnMucG93ZXJQcmVmZXJlbmNlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYmdwdSc6XG4gICAgICAgICAgICBlcE5hbWUgPSAnSlMnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2ViZ3B1T3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJncHVPcHRpb25zPy5wcmVmZXJyZWRMYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOQ0hXJyAmJiB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05IV0MnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHByZWZlcnJlZExheW91dCBtdXN0IGJlIGVpdGhlciAnTkNIVycgb3IgJ05IV0MnOiAke3dlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdwcmVmZXJyZWRMYXlvdXQnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwcmVmZXJyZWRMYXlvdXQnIC0gJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3YXNtJzpcbiAgICAgICAgICBjYXNlICdjcHUnOlxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXBOYW1lRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhlcE5hbWUsIGFsbG9jcyk7XG4gICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcihzZXNzaW9uT3B0aW9uc0hhbmRsZSwgZXBOYW1lRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYXBwZW5kIGV4ZWN1dGlvbiBwcm92aWRlcjogJHtlcE5hbWV9LmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHNldFNlc3Npb25PcHRpb25zID0gKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBzZXNzaW9uT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGFwcGVuZERlZmF1bHRPcHRpb25zKHNlc3Npb25PcHRpb25zKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPSBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwoc2Vzc2lvbk9wdGlvbnMuZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA/PyAnYWxsJyk7XG4gICAgY29uc3QgZXhlY3V0aW9uTW9kZSA9IGdldEV4ZWN1dGlvbk1vZGUoc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uTW9kZSA/PyAnc2VxdWVudGlhbCcpO1xuICAgIGNvbnN0IGxvZ0lkRGF0YU9mZnNldCA9XG4gICAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5sb2dJZCA9PT0gJ3N0cmluZycgPyBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMubG9nSWQsIGFsbG9jcykgOiAwO1xuXG4gICAgY29uc3QgbG9nU2V2ZXJpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPz8gMjsgIC8vIERlZmF1bHQgdG8gMiAtIHdhcm5pbmdcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobG9nU2V2ZXJpdHlMZXZlbCkgfHwgbG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgbG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7bG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dWZXJib3NpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID8/IDA7ICAvLyBEZWZhdWx0IHRvIDAgLSB2ZXJib3NlXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1ZlcmJvc2l0eUxldmVsKSB8fCBsb2dWZXJib3NpdHlMZXZlbCA8IDAgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQgPSB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCA9PT0gJ3N0cmluZycgP1xuICAgICAgICBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCwgYWxsb2NzKSA6XG4gICAgICAgIDA7XG5cbiAgICBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVNlc3Npb25PcHRpb25zKFxuICAgICAgICBncmFwaE9wdGltaXphdGlvbkxldmVsLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZUNwdU1lbUFyZW5hLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4sIGV4ZWN1dGlvbk1vZGUsXG4gICAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlUHJvZmlsaW5nLCAwLCBsb2dJZERhdGFPZmZzZXQsIGxvZ1NldmVyaXR5TGV2ZWwsIGxvZ1ZlcmJvc2l0eUxldmVsLFxuICAgICAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBzZXNzaW9uIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgc2V0RXhlY3V0aW9uUHJvdmlkZXJzKHNlc3Npb25PcHRpb25zSGFuZGxlLCBzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIHNlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZW5hYmxlR3JhcGhDYXB0dXJlIG11c3QgYmUgYSBib29sZWFuIHZhbHVlOiAke3Nlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZX1gKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ2VuYWJsZUdyYXBoQ2FwdHVyZScsIGFsbG9jcyk7XG4gICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMuZW5hYmxlR3JhcGhDYXB0dXJlLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICBpZiAod2FzbS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKFxuICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnZW5hYmxlR3JhcGhDYXB0dXJlJyAtICR7c2Vzc2lvbk9wdGlvbnMuZW5hYmxlR3JhcGhDYXB0dXJlfS5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZnJlZURpbWVuc2lvbk92ZXJyaWRlcykge1xuICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGZyZWUgZGltZW5zaW9uIG92ZXJyaWRlIG5hbWUgbXVzdCBiZSBhIHN0cmluZzogJHtuYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGZyZWUgZGltZW5zaW9uIG92ZXJyaWRlIHZhbHVlIG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcjogJHt2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuYW1lT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG5hbWUsIGFsbG9jcyk7XG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGUoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIG5hbWVPZmZzZXQsIHZhbHVlKSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZTogJHtuYW1lfSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4dHJhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnMoc2Vzc2lvbk9wdGlvbnMuZXh0cmEsICcnLCBuZXcgV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oKSwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhrZXksIGFsbG9jcyk7XG4gICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh2YWx1ZSwgYWxsb2NzKTtcblxuICAgICAgICBpZiAod2FzbS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAke2tleX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtzZXNzaW9uT3B0aW9uc0hhbmRsZSwgYWxsb2NzXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChzZXNzaW9uT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zKHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgYWxsb2NzLmZvckVhY2goYWxsb2MgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7VGVuc29yfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG4vLyBhIGR1bW15IHR5cGUgZGVjbGFyYXRpb24gZm9yIEZsb2F0MTZBcnJheSBpbiBjYXNlIGFueSBwb2x5ZmlsbCBpcyBhdmFpbGFibGUuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24sIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgY29uc3QgRmxvYXQxNkFycmF5OiBhbnk7XG59XG5cbi8vIFRoaXMgZmlsZSBpbmNsdWRlcyBjb21tb24gZGVmaW5pdGlvbnMuIFRoZXkgZG8gTk9UIGhhdmUgZGVwZW5kZW5jeSBvbiB0aGUgV2ViQXNzZW1ibHkgaW5zdGFuY2UuXG5cbi8qKlxuICogQ29waWVkIGZyb20gT05OWCBkZWZpbml0aW9uLiBVc2UgdGhpcyB0byBkcm9wIGRlcGVuZGVuY3kgJ29ubnhfcHJvdG8nIHRvIGRlY3JlYXNlIGNvbXBpbGVkIC5qcyBmaWxlIHNpemUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIERhdGFUeXBlIHtcbiAgdW5kZWZpbmVkID0gMCxcbiAgZmxvYXQgPSAxLFxuICB1aW50OCA9IDIsXG4gIGludDggPSAzLFxuICB1aW50MTYgPSA0LFxuICBpbnQxNiA9IDUsXG4gIGludDMyID0gNixcbiAgaW50NjQgPSA3LFxuICBzdHJpbmcgPSA4LFxuICBib29sID0gOSxcbiAgZmxvYXQxNiA9IDEwLFxuICBkb3VibGUgPSAxMSxcbiAgdWludDMyID0gMTIsXG4gIHVpbnQ2NCA9IDEzLFxuICBjb21wbGV4NjQgPSAxNCxcbiAgY29tcGxleDEyOCA9IDE1LFxuICBiZmxvYXQxNiA9IDE2XG59XG5cbi8qKlxuICogTWFwIHN0cmluZyB0ZW5zb3IgZGF0YSB0byBlbnVtIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSA9ICh0eXBlOiBzdHJpbmcpOiBEYXRhVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2ludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDg7XG4gICAgY2FzZSAndWludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ4O1xuICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmJvb2w7XG4gICAgY2FzZSAnaW50MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDE2O1xuICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDE2O1xuICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQzMjtcbiAgICBjYXNlICd1aW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQzMjtcbiAgICBjYXNlICdmbG9hdDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5mbG9hdDE2O1xuICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0O1xuICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmRvdWJsZTtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnN0cmluZztcbiAgICBjYXNlICdpbnQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50NjQ7XG4gICAgY2FzZSAndWludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50NjQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgZW51bSB2YWx1ZSB0byBzdHJpbmcgdGVuc29yIGRhdGFcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nID0gKHR5cGVQcm90bzogRGF0YVR5cGUpOiBUZW5zb3IuVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZVByb3RvKSB7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ4OlxuICAgICAgcmV0dXJuICdpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ4OlxuICAgICAgcmV0dXJuICd1aW50OCc7XG4gICAgY2FzZSBEYXRhVHlwZS5ib29sOlxuICAgICAgcmV0dXJuICdib29sJztcbiAgICBjYXNlIERhdGFUeXBlLmludDE2OlxuICAgICAgcmV0dXJuICdpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MTY6XG4gICAgICByZXR1cm4gJ3VpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQzMjpcbiAgICAgIHJldHVybiAnaW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDMyOlxuICAgICAgcmV0dXJuICd1aW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUuZmxvYXQxNjpcbiAgICAgIHJldHVybiAnZmxvYXQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDpcbiAgICAgIHJldHVybiAnZmxvYXQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5kb3VibGU6XG4gICAgICByZXR1cm4gJ2Zsb2F0NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUuc3RyaW5nOlxuICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50NjQ6XG4gICAgICByZXR1cm4gJ2ludDY0JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ2NDpcbiAgICAgIHJldHVybiAndWludDY0JztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlUHJvdG99YCk7XG4gIH1cbn07XG5cbi8qKlxuICogZ2V0IHRlbnNvciBlbGVtZW50IHNpemUgaW4gYnl0ZXMgYnkgdGhlIGdpdmVuIGRhdGEgdHlwZVxuICogQHJldHVybnMgc2l6ZSBpbiBpbnRlZ2VyIG9yIHVuZGVmaW5lZCBpZiB0aGUgZGF0YSB0eXBlIGlzIG5vdCBzdXBwb3J0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFRlbnNvckVsZW1lbnRTaXplID0gKGRhdGVUeXBlOiBudW1iZXIpOiBudW1iZXJ8XG4gICAgdW5kZWZpbmVkID0+IFt1bmRlZmluZWQsIDQsIDEsIDEsIDIsIDIsIDQsIDgsIHVuZGVmaW5lZCwgMSwgMiwgOCwgNCwgOCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1bZGF0ZVR5cGVdO1xuXG4vKipcbiAqIGdldCB0eXBlZCBhcnJheSBjb25zdHJ1Y3RvciBieSB0aGUgZ2l2ZW4gdGVuc29yIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3RvciA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yfFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxcbiAgICBJbnQ4QXJyYXlDb25zdHJ1Y3RvcnxVaW50MTZBcnJheUNvbnN0cnVjdG9yfEludDE2QXJyYXlDb25zdHJ1Y3RvcnxJbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnSW50NjRBcnJheUNvbnN0cnVjdG9yfFxuICAgIFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxGbG9hdDY0QXJyYXlDb25zdHJ1Y3RvcnxVaW50MzJBcnJheUNvbnN0cnVjdG9yfEJpZ1VpbnQ2NEFycmF5Q29uc3RydWN0b3IgPT4ge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgICAgIC8vIGFsbG93IEZsb2F0MTZBcnJheSBwb2x5ZmlsbC5cbiAgICAgICAgICByZXR1cm4gdHlwZW9mIEZsb2F0MTZBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgRmxvYXQxNkFycmF5LmZyb20gPyBGbG9hdDE2QXJyYXkgOiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICAgICAgcmV0dXJuIEZsb2F0MzJBcnJheTtcbiAgICAgICAgY2FzZSAndWludDgnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdpbnQ4JzpcbiAgICAgICAgICByZXR1cm4gSW50OEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MTYnOlxuICAgICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnaW50MTYnOlxuICAgICAgICAgIHJldHVybiBJbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIEludDMyQXJyYXk7XG4gICAgICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDY0JzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MzInOlxuICAgICAgICAgIHJldHVybiBVaW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnaW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdJbnQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdVaW50NjRBcnJheTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGU6ICR7dHlwZX1gKTtcbiAgICAgIH1cbiAgICB9O1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgbG9nIGxldmVsIHRvIGludGVnZXIgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvZ0xldmVsU3RyaW5nVG9FbnVtID0gKGxvZ0xldmVsPzogJ3ZlcmJvc2UnfCdpbmZvJ3wnd2FybmluZyd8J2Vycm9yJ3wnZmF0YWwnKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2dMZXZlbCkge1xuICAgIGNhc2UgJ3ZlcmJvc2UnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnaW5mbyc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2ZhdGFsJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGxvZ2dpbmcgbGV2ZWw6ICR7bG9nTGV2ZWx9YCk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdGVuc29yIHR5cGUgaXMgc3VwcG9ydGVkIGJ5IEdQVSBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IHR5cGUgaXMgVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlcyA9PiB0eXBlID09PSAnZmxvYXQzMicgfHxcbiAgICB0eXBlID09PSAnZmxvYXQxNicgfHwgdHlwZSA9PT0gJ2ludDMyJyB8fCB0eXBlID09PSAnaW50NjQnIHx8IHR5cGUgPT09ICd1aW50MzInIHx8IHR5cGUgPT09ICd1aW50OCcgfHxcbiAgICB0eXBlID09PSAnYm9vbCc7XG5cbi8qKlxuICogTWFwIHN0cmluZyBkYXRhIGxvY2F0aW9uIHRvIGludGVnZXIgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGRhdGFMb2NhdGlvblN0cmluZ1RvRW51bSA9IChsb2NhdGlvbjogVGVuc29yLkRhdGFMb2NhdGlvbik6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAobG9jYXRpb24pIHtcbiAgICBjYXNlICdub25lJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ2NwdSc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICdjcHUtcGlubmVkJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ3RleHR1cmUnOlxuICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAnZ3B1LWJ1ZmZlcic6XG4gICAgICByZXR1cm4gNDtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIGxvY2F0aW9uOiAke2xvY2F0aW9ufWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBpbnRlZ2VyIGRhdGEgbG9jYXRpb24gdG8gc3RyaW5nIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25FbnVtVG9TdHJpbmcgPSAobG9jYXRpb246IG51bWJlcik6IFRlbnNvci5EYXRhTG9jYXRpb258dW5kZWZpbmVkID0+XG4gICAgKFsnbm9uZScsICdjcHUnLCAnY3B1LXBpbm5lZCcsICd0ZXh0dXJlJywgJ2dwdS1idWZmZXInXSBhcyBjb25zdClbbG9jYXRpb25dO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQge3JlYWRGaWxlfSBmcm9tICdub2RlOmZzL3Byb21pc2VzJztcblxuLyoqXG4gKiBMb2FkIGEgZmlsZSBpbnRvIGEgVWludDhBcnJheS5cbiAqXG4gKiBAcGFyYW0gZmlsZSAtIHRoZSBmaWxlIHRvIGxvYWQuIENhbiBiZSBhIFVSTC9wYXRoLCBhIEJsb2IsIGFuIEFycmF5QnVmZmVyLCBvciBhIFVpbnQ4QXJyYXkuXG4gKiBAcmV0dXJucyBhIFVpbnQ4QXJyYXkgY29udGFpbmluZyB0aGUgZmlsZSBkYXRhLlxuICovXG5leHBvcnQgY29uc3QgbG9hZEZpbGUgPSBhc3luYyhmaWxlOiBzdHJpbmd8QmxvYnxBcnJheUJ1ZmZlckxpa2V8VWludDhBcnJheSk6IFByb21pc2U8VWludDhBcnJheT4gPT4ge1xuICBpZiAodHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZSkge1xuICAgICAgLy8gbG9hZCBmaWxlIGludG8gQXJyYXlCdWZmZXIgaW4gTm9kZS5qc1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IHJlYWRGaWxlKGZpbGUpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUuY29kZSA9PT0gJ0VSUl9GU19GSUxFX1RPT19MQVJHRScpIHtcbiAgICAgICAgICAvLyBmaWxlIGlzIHRvbyBsYXJnZSwgdXNlIGZzLmNyZWF0ZVJlYWRTdHJlYW0gaW5zdGVhZFxuICAgICAgICAgIGNvbnN0IHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSk7XG4gICAgICAgICAgY29uc3QgY2h1bmtzOiBVaW50OEFycmF5W10gPSBbXTtcbiAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHN0cmVhbSkge1xuICAgICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoQnVmZmVyLmNvbmNhdChjaHVua3MpKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBsb2FkIGZpbGUgaW50byBBcnJheUJ1ZmZlciBpbiBicm93c2Vyc1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChmaWxlKTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmYWlsZWQgdG8gbG9hZCBleHRlcm5hbCBkYXRhIGZpbGU6ICR7ZmlsZX1gKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbnRlbnRMZW5ndGhIZWFkZXIgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1MZW5ndGgnKTtcbiAgICAgIGNvbnN0IGZpbGVTaXplID0gY29udGVudExlbmd0aEhlYWRlciA/IHBhcnNlSW50KGNvbnRlbnRMZW5ndGhIZWFkZXIsIDEwKSA6IDA7XG4gICAgICBpZiAoZmlsZVNpemUgPCAxMDczNzQxODI0IC8qIDFHQiAqLykge1xuICAgICAgICAvLyB3aGVuIENvbnRlbnQtTGVuZ3RoIGhlYWRlciBpcyBub3Qgc2V0LCB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHRoZSBmaWxlIHNpemUuIFdlIGFzc3VtZSBpdCBpcyBzbWFsbCBlbm91Z2ggdG9cbiAgICAgICAgLy8gbG9hZCBpbnRvIG1lbW9yeS5cbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IHJlc3BvbnNlLmFycmF5QnVmZmVyKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZmlsZSBpcyB0b28gbGFyZ2UsIHVzZSBzdHJlYW0gaW5zdGVhZFxuICAgICAgICBpZiAoIXJlc3BvbnNlLmJvZHkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGZhaWxlZCB0byBsb2FkIGV4dGVybmFsIGRhdGEgZmlsZTogJHtmaWxlfSwgbm8gcmVzcG9uc2UgYm9keS5gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZS5ib2R5LmdldFJlYWRlcigpO1xuXG4gICAgICAgIGxldCBidWZmZXI7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gdHJ5IHRvIGNyZWF0ZSBBcnJheUJ1ZmZlciBkaXJlY3RseVxuICAgICAgICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihmaWxlU2l6ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFJhbmdlRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIHVzZSBXZWJBc3NlbWJseSBNZW1vcnkgdG8gYWxsb2NhdGUgbGFyZ2VyIEFycmF5QnVmZmVyXG4gICAgICAgICAgICBjb25zdCBwYWdlcyA9IE1hdGguY2VpbChmaWxlU2l6ZSAvIDY1NTM2KTtcbiAgICAgICAgICAgIGJ1ZmZlciA9IG5ldyBXZWJBc3NlbWJseS5NZW1vcnkoe2luaXRpYWw6IHBhZ2VzLCBtYXhpbXVtOiBwYWdlc30pLmJ1ZmZlcjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGNvbnN0IHtkb25lLCB2YWx1ZX0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY2h1bmtTaXplID0gdmFsdWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgICBjb25zdCBjaHVuayA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgb2Zmc2V0LCBjaHVua1NpemUpO1xuICAgICAgICAgIGNodW5rLnNldCh2YWx1ZSk7XG4gICAgICAgICAgb2Zmc2V0ICs9IGNodW5rU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCAwLCBmaWxlU2l6ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH0gZWxzZSBpZiAoZmlsZSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpKTtcbiAgfSBlbHNlIGlmIChmaWxlIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIHJldHVybiBmaWxlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShmaWxlKTtcbiAgfVxufTtcbiIsICJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7RW52LCBJbmZlcmVuY2VTZXNzaW9uLCBUZW5zb3J9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7U2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXIsIFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGEsIFRlbnNvck1ldGFkYXRhfSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7c2V0UnVuT3B0aW9uc30gZnJvbSAnLi9ydW4tb3B0aW9ucyc7XG5pbXBvcnQge3NldFNlc3Npb25PcHRpb25zfSBmcm9tICcuL3Nlc3Npb24tb3B0aW9ucyc7XG5pbXBvcnQge2RhdGFMb2NhdGlvblN0cmluZ1RvRW51bSwgZ2V0VGVuc29yRWxlbWVudFNpemUsIGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSwgbG9nTGV2ZWxTdHJpbmdUb0VudW0sIHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nLCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSwgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yfSBmcm9tICcuL3dhc20tY29tbW9uJztcbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvcn0gZnJvbSAnLi93YXNtLXV0aWxzJztcbmltcG9ydCB7bG9hZEZpbGV9IGZyb20gJy4vd2FzbS11dGlscy1sb2FkLWZpbGUnO1xuXG4vLyAjcmVnaW9uIEluaXRpYWxpemF0aW9uc1xuXG4vKipcbiAqIFRoZXJlIGFyZSA0IGRpZmZlcmVudCBcImluaXRpYWxpemF0aW9uXCIgc3RlcHMgZm9yIE9SVC4gVGhleSBoYXBwZW4gaW4gZGlmZmVyZW50IHBsYWNlcyBhbmQgZGlmZmVyZW50IHRpbWUuXG4gKlxuICogMS4gSmF2YVNjcmlwdCBpbml0aWFsaXphdGlvbiBmb3Igb25ueHJ1bnRpbWUtY29tbW9uIGFuZCBvbm54cnVudGltZS13ZWIuXG4gKiAgICBUaGlzIGlzIHRoZSBmaXJzdCBpbml0aWFsaXphdGlvbiBzdGVwLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBjYWxscyBvbm54cnVudGltZS1jb21tb24ncyByZWdpc3RlckJhY2tlbmQoKVxuICogZnVuY3Rpb24gbXVsdGlwbGUgdGltZXMgdG8gcmVnaXN0ZXIgYWxsIHRoZSBhdmFpbGFibGUgYmFja2VuZHMuIFRoZSBiYWNrZW5kIHJlZ2lzdHJhdGlvbiBpcyB2ZXJ5IGZhc3QuIEl0IG9ubHlcbiAqIHJlZ2lzdGVycyB0aGUgYmFja2VuZCBuYW1lIHdpdGggdGhlIHVuaW5pdGlhbGl6ZWQgYmFja2VuZCBvYmplY3QuIE5vIGhlYXZ5IGluaXRpYWxpemF0aW9uIGlzIGRvbmUgaW4gdGhpcyBzdGVwLlxuICogICAgUmVmZXIgdG8gd2ViL2xpYi9pbmRleC50cyBmb3IgdGhlIGJhY2tlbmQgcmVnaXN0cmF0aW9uLlxuICpcbiAqIDIuIFdlYkFzc2VtYmx5IGFydGlmYWN0IGluaXRpYWxpemF0aW9uLlxuICogICAgVGhpcyBoYXBwZW5zIHdoZW4gYW55IHJlZ2lzdGVyZWQgd2FzbSBiYWNrZW5kIGlzIHVzZWQgZm9yIHRoZSBmaXJzdCB0aW1lIChpZS4gYG9ydC5JbmZlcmVuY2VTZXNzaW9uLmNyZWF0ZSgpYCBvclxuICogYG9ydC5UcmFpbmluZ1Nlc3Npb24uY3JlYXRlKClgIGlzIGNhbGxlZCkuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGRvZXMgdGhlIGZvbGxvd2luZ3M6XG4gKiAgICAgLSBjcmVhdGUgYSBwcm94eSB3b3JrZXIgYW5kIG1ha2Ugc3VyZSB0aGUgcHJveHkgd29ya2VyIGlzIHJlYWR5IHRvIHJlY2VpdmUgbWVzc2FnZXMsIGlmIHByb3h5IGlzIGVuYWJsZWQuXG4gKiAgICAgLSBwZXJmb3JtIGZlYXR1cmUgZGV0ZWN0aW9uLCBsb2NhdGUgY29ycmVjdCBXZWJBc3NlbWJseSBhcnRpZmFjdCBwYXRoIGFuZCBjYWxsIHRoZSBFbXNjcmlwdGVuIGdlbmVyYXRlZFxuICogSmF2YVNjcmlwdCBjb2RlIHRvIGluaXRpYWxpemUgdGhlIFdlYkFzc2VtYmx5IHJ1bnRpbWUuXG4gKiAgICAgICAgIC0gaWYgcHJveHkgaXMgZW5hYmxlZCwgdGhpcyBzdGVwIGhhcHBlbnMgaW4gdGhlIHByb3h5IHdvcmtlciB1c2luZyBtZXNzYWdlICdpbml0LXdhc20nLlxuICogICAgICAgICAtIGRvd25sb2FkaW5nIHRoZSAnb3J0LXdhc217Li4ufS53YXNtJyBmaWxlIGlzIGRvbmUgaW4gdGhpcyBzdGVwLlxuICogICAgICAgICAtIGlmIG11bHRpLXRocmVhZCBpcyBlbmFibGVkLCBvbmUgb3IgbW9yZSB3ZWJ3b3JrZXIgd2lsbCBiZSBjcmVhdGVkIHRvIGluaXRpYWxpemUgdGhlIFBUaHJlYWQgdGhyZWFkcG9vbC5cbiAqXG4gKiAzLiBPUlQgZW52aXJvbm1lbnQgaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgYWZ0ZXIgc3RlcCAyLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBwZXJmb3JtcyBPTk5YIFJ1bnRpbWUgZW52aXJvbm1lbnQgaW5pdGlhbGl6YXRpb24uXG4gKiBGdW5jdGlvbiBgX09ydEluaXQoKWAgaXMgY2FsbGVkIGluIHRoaXMgc3RlcC5cbiAqICAgICAtIGlmIHByb3h5IGlzIGVuYWJsZWQsIHRoaXMgc3RlcCBoYXBwZW5zIGluIHRoZSBwcm94eSB3b3JrZXIgdXNpbmcgbWVzc2FnZSAnaW5pdC1vcnQnLlxuICogICAgIC0gbG9nZ2luZyBsZXZlbCAob3J0LmVudi5sb2dMZXZlbCkgYW5kIHRocmVhZCBudW1iZXIgKG9ydC5lbnYud2FzbS5udW1UaHJlYWRzKSBhcmUgc2V0IGluIHRoaXMgc3RlcC5cbiAqXG4gKiA0LiBTZXNzaW9uIGluaXRpYWxpemF0aW9uLlxuICogICAgVGhpcyBoYXBwZW5zIHdoZW4gYG9ydC5JbmZlcmVuY2VTZXNzaW9uLmNyZWF0ZSgpYCBvciBgb3J0LlRyYWluaW5nU2Vzc2lvbi5jcmVhdGUoKWAgaXMgY2FsbGVkLiBVbmxpa2UgdGhlIGZpcnN0IDNcbiAqIHN0ZXBzICh0aGV5IG9ubHkgY2FsbGVkIG9uY2UpLCB0aGlzIHN0ZXAgd2lsbCBiZSBkb25lIGZvciBlYWNoIHNlc3Npb24uIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGRvZXMgdGhlXG4gKiBmb2xsb3dpbmdzOlxuICogICAgSWYgdGhlIHBhcmFtZXRlciBpcyBhIFVSTDpcbiAqICAgIC0gZG93bmxvYWQgdGhlIG1vZGVsIGRhdGEgZnJvbSB0aGUgVVJMLlxuICogICAgLSBjb3B5IHRoZSBtb2RlbCBkYXRhIHRvIHRoZSBXQVNNIGhlYXAuIChwcm94eTogJ2NvcHktZnJvbScpXG4gKiAgICAtIGRlcmVmZXJlbmNlIHRoZSBtb2RlbCBidWZmZXIuIFRoaXMgc3RlcCBhbGxvd3MgdGhlIG9yaWdpbmFsIEFycmF5QnVmZmVyIHRvIGJlIGdhcmJhZ2UgY29sbGVjdGVkLlxuICogICAgLSBjYWxsIGBfT3J0Q3JlYXRlU2Vzc2lvbigpYCB0byBjcmVhdGUgdGhlIHNlc3Npb24uIChwcm94eTogJ2NyZWF0ZScpXG4gKlxuICogICAgSWYgdGhlIHBhcmFtZXRlciBpcyBhIFVpbnQ4QXJyYXkgb2JqZWN0OlxuICogICAgLSBjb3B5IHRoZSBtb2RlbCBkYXRhIHRvIHRoZSBXQVNNIGhlYXAuIChwcm94eTogJ2NvcHktZnJvbScpXG4gKiAgICAtIGNhbGwgYF9PcnRDcmVhdGVTZXNzaW9uKClgIHRvIGNyZWF0ZSB0aGUgc2Vzc2lvbi4gKHByb3h5OiAnY3JlYXRlJylcbiAqXG4gKlxuICovXG5cbi8qKlxuICogaW5pdGlhbGl6ZSBPUlQgZW52aXJvbm1lbnQuXG4gKlxuICogQHBhcmFtIG51bVRocmVhZHMgU2V0R2xvYmFsSW50cmFPcE51bVRocmVhZHMobnVtVGhyZWFkcylcbiAqIEBwYXJhbSBsb2dnaW5nTGV2ZWwgQ3JlYXRlRW52KHN0YXRpY19jYXN0PE9ydExvZ2dpbmdMZXZlbD4obG9nZ2luZ19sZXZlbCkpXG4gKi9cbmNvbnN0IGluaXRPcnQgPSAobnVtVGhyZWFkczogbnVtYmVyLCBsb2dnaW5nTGV2ZWw6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCBlcnJvckNvZGUgPSBnZXRJbnN0YW5jZSgpLl9PcnRJbml0KG51bVRocmVhZHMsIGxvZ2dpbmdMZXZlbCk7XG4gIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBpbml0aWFsaXplIG9ubnhydW50aW1lLicpO1xuICB9XG59O1xuXG4vKipcbiAqIGludGlhbGl6ZSBydW50aW1lIGVudmlyb25tZW50LlxuICogQHBhcmFtIGVudiBwYXNzZWQgaW4gdGhlIGVudmlyb25tZW50IGNvbmZpZyBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0UnVudGltZSA9IGFzeW5jKGVudjogRW52KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIGluaXQgT1JUXG4gIGluaXRPcnQoZW52Lndhc20ubnVtVGhyZWFkcyEsIGxvZ0xldmVsU3RyaW5nVG9FbnVtKGVudi5sb2dMZXZlbCkpO1xufTtcblxuLyoqXG4gKiBwZXJmb3JtIEVQIHNwZWNpZmljIGluaXRpYWxpemF0aW9uLlxuICpcbiAqIEBwYXJhbSBlbnZcbiAqIEBwYXJhbSBlcE5hbWVcbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRFcCA9IGFzeW5jKGVudjogRW52LCBlcE5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICAgIGNvbnN0IGluaXRKc2VwID0gcmVxdWlyZSgnLi9qc2VwL2luaXQnKS5pbml0O1xuXG4gICAgaWYgKGVwTmFtZSA9PT0gJ3dlYmdwdScpIHtcbiAgICAgIC8vIHBlcmZvcm0gV2ViR1BVIGF2YWlsYWJpbGl0eSBjaGVja1xuICAgICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnIHx8ICFuYXZpZ2F0b3IuZ3B1KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViR1BVIGlzIG5vdCBzdXBwb3J0ZWQgaW4gY3VycmVudCBlbnZpcm9ubWVudCcpO1xuICAgICAgfVxuXG4gICAgICBsZXQgYWRhcHRlciA9IGVudi53ZWJncHUuYWRhcHRlciBhcyBHUFVBZGFwdGVyIHwgbnVsbDtcbiAgICAgIGlmICghYWRhcHRlcikge1xuICAgICAgICAvLyBpZiBhZGFwdGVyIGlzIG5vdCBzZXQsIHJlcXVlc3QgYSBuZXcgYWRhcHRlci5cbiAgICAgICAgY29uc3QgcG93ZXJQcmVmZXJlbmNlID0gZW52LndlYmdwdS5wb3dlclByZWZlcmVuY2U7XG4gICAgICAgIGlmIChwb3dlclByZWZlcmVuY2UgIT09IHVuZGVmaW5lZCAmJiBwb3dlclByZWZlcmVuY2UgIT09ICdsb3ctcG93ZXInICYmXG4gICAgICAgICAgICBwb3dlclByZWZlcmVuY2UgIT09ICdoaWdoLXBlcmZvcm1hbmNlJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwb3dlclByZWZlcmVuY2Ugc2V0dGluZzogXCIke3Bvd2VyUHJlZmVyZW5jZX1cImApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvcmNlRmFsbGJhY2tBZGFwdGVyID0gZW52LndlYmdwdS5mb3JjZUZhbGxiYWNrQWRhcHRlcjtcbiAgICAgICAgaWYgKGZvcmNlRmFsbGJhY2tBZGFwdGVyICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGZvcmNlRmFsbGJhY2tBZGFwdGVyICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZm9yY2VGYWxsYmFja0FkYXB0ZXIgc2V0dGluZzogXCIke2ZvcmNlRmFsbGJhY2tBZGFwdGVyfVwiYCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIoe3Bvd2VyUHJlZmVyZW5jZSwgZm9yY2VGYWxsYmFja0FkYXB0ZXJ9KTtcbiAgICAgICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnRmFpbGVkIHRvIGdldCBHUFUgYWRhcHRlci4gJyArXG4gICAgICAgICAgICAgICdZb3UgbWF5IG5lZWQgdG8gZW5hYmxlIGZsYWcgXCItLWVuYWJsZS11bnNhZmUtd2ViZ3B1XCIgaWYgeW91IGFyZSB1c2luZyBDaHJvbWUuJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIGFkYXB0ZXIgaXMgc2V0LCB2YWxpZGF0ZSBpdC5cbiAgICAgICAgaWYgKHR5cGVvZiBhZGFwdGVyLmxpbWl0cyAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIGFkYXB0ZXIuZmVhdHVyZXMgIT09ICdvYmplY3QnIHx8XG4gICAgICAgICAgICB0eXBlb2YgYWRhcHRlci5yZXF1ZXN0RGV2aWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEdQVSBhZGFwdGVyIHNldCBpbiBgZW52LndlYmdwdS5hZGFwdGVyYC4gSXQgbXVzdCBiZSBhIEdQVUFkYXB0ZXIgb2JqZWN0LicpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghZW52Lndhc20uc2ltZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnTm90IHN1cHBvcnRlZCBmb3IgV2ViR1BVPU9OIGFuZCBTSU1EPU9GRi4gUGxlYXNlIHNldCBgZW52Lndhc20uc2ltZGAgdG8gdHJ1ZSB3aGVuIHVzaW5nIGB3ZWJncHVgIEVQJyk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IGluaXRKc2VwKCd3ZWJncHUnLCBnZXRJbnN0YW5jZSgpLCBlbnYsIGFkYXB0ZXIpO1xuICAgIH1cbiAgICBpZiAoZXBOYW1lID09PSAnd2Vibm4nKSB7XG4gICAgICAvLyBwZXJmb3JtIFdlYk5OIGF2YWlsYWJpbGl0eSBjaGVja1xuICAgICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnIHx8ICEobmF2aWdhdG9yIGFzIHVua25vd24gYXMge21sOiB1bmtub3dufSkubWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJOTiBpcyBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnQnKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgaW5pdEpzZXAoJ3dlYm5uJywgZ2V0SW5zdGFuY2UoKSwgZW52KTtcbiAgICB9XG4gIH1cbn07XG5cbi8vICNlbmRyZWdpb24gSW5pdGlhbGl6YXRpb25zXG5cbi8qKlxuICogdmFsaWQgZGF0YSBsb2NhdGlvbnMgZm9yIGlucHV0L291dHB1dCB0ZW5zb3JzLlxuICovXG50eXBlIFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0ID0gJ2NwdSd8J2NwdS1waW5uZWQnfCdncHUtYnVmZmVyJztcblxudHlwZSBJT0JpbmRpbmdTdGF0ZSA9IHtcbiAgLyoqXG4gICAqIHRoZSBoYW5kbGUgb2YgSU8gYmluZGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGhhbmRsZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXG4gICAqXG4gICAqIHZhbHVlIGlzIG9uZSBvZiAnY3B1JywgJ2NwdS1waW5uZWQnLCAnZ3B1LWJ1ZmZlcicuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IHJlYWRvbmx5IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W107XG5cbiAgLyoqXG4gICAqIGVudW0gdmFsdWUgb2YgdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG4vKipcbiAqICB0dXBsZSBlbGVtZW50cyBhcmU6IEluZmVyZW5jZVNlc3Npb24gSUQ7IGlucHV0TmFtZXNVVEY4RW5jb2RlZDsgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDsgYmluZGluZ1N0YXRlXG4gKi9cbnR5cGUgU2Vzc2lvbk1ldGFkYXRhID0gW1xuICBpbmZlcmVuY2VTZXNzaW9uSWQ6IG51bWJlciwgaW5wdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sXG4gIGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGV8bnVsbCwgZW5hYmxlR3JhcGhDYXB0dXJlOiBib29sZWFuLCBpbnB1dE91dHB1dEJvdW5kOiBib29sZWFuXG5dO1xuXG5jb25zdCBhY3RpdmVTZXNzaW9ucyA9IG5ldyBNYXA8bnVtYmVyLCBTZXNzaW9uTWV0YWRhdGE+KCk7XG5cbi8qKlxuICogZ2V0IHRoZSBpbnB1dC9vdXRwdXQgY291bnQgb2YgdGhlIHNlc3Npb24uXG4gKiBAcGFyYW0gc2Vzc2lvbkhhbmRsZSB0aGUgaGFuZGxlIHJlcHJlc2VudGluZyB0aGUgc2Vzc2lvbi4gc2hvdWxkIGJlIG5vbi16ZXJvLlxuICogQHJldHVybnMgYSB0dXBsZSBpbmNsdWRpbmcgMiBudW1iZXJzLCByZXByZXNlbnRpbmcgdGhlIGlucHV0IGNvdW50IGFuZCBvdXRwdXQgY291bnQuXG4gKi9cbmNvbnN0IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50ID0gKHNlc3Npb25IYW5kbGU6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoOCk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlLCBkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgNCk7XG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IHNlc3Npb24gaW5wdXQvb3V0cHV0IGNvdW50LicpO1xuICAgIH1cbiAgICByZXR1cm4gW3dhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0XSwgd2FzbS5IRUFQMzJbZGF0YU9mZnNldCAvIDQgKyAxXV07XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuXG4vKipcbiAqIGFsbG9jYXRlIHRoZSBtZW1vcnkgYW5kIG1lbWNweSB0aGUgZXh0ZXJuYWwgYnVmZmVyLlxuICpcbiAqIEBwYXJhbSBtb2RlbCAtIHRoZSBleHRlcm5hbCBidWZmZXIgY29udGFpbmluZyB0aGUgbW9kZWwgZGF0YS4gTXVzdCBub3QgYmUgdGhlIHNhbWUgYnVmZmVyIGFzIHRoZSBXQVNNIGhlYXAuXG4gKiBAcmV0dXJucyBhIDItZWxlbWVudHMgdHVwbGUgLSB0aGUgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgYWxsb2NhdGVkIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgY29weUZyb21FeHRlcm5hbEJ1ZmZlciA9IChtb2RlbDogVWludDhBcnJheSk6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3QgbW9kZWxEYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKG1vZGVsLmJ5dGVMZW5ndGgpO1xuICBpZiAobW9kZWxEYXRhT2Zmc2V0ID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBjcmVhdGUgYSBzZXNzaW9uLiBmYWlsZWQgdG8gYWxsb2NhdGUgYSBidWZmZXIgb2Ygc2l6ZSAke21vZGVsLmJ5dGVMZW5ndGh9LmApO1xuICB9XG4gIHdhc20uSEVBUFU4LnNldChtb2RlbCwgbW9kZWxEYXRhT2Zmc2V0KTtcbiAgcmV0dXJuIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsLmJ5dGVMZW5ndGhdO1xufTtcblxuLyoqXG4gKiBjcmVhdGUgYW4gaW5mZXJlbmNlIHNlc3Npb24gZnJvbSBhIG1vZGVsIGRhdGEgYnVmZmVyLlxuICpcbiAqIEBwYXJhbSBtb2RlbERhdGEgLSBlaXRoZXIgYSBVaW50OEFycmF5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG1vZGVsIGRhdGEsIG9yIGEgMi1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIHRoZVxuICogICAgIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGEgYnVmZmVyLlxuICogQHBhcmFtIG9wdGlvbnMgYW4gb3B0aW9uYWwgc2Vzc2lvbiBvcHRpb25zIG9iamVjdC5cbiAqIEByZXR1cm5zIGEgMy1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIFtzZXNzaW9uIGhhbmRsZSwgaW5wdXQgbmFtZXMsIG91dHB1dCBuYW1lc11cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb24gPSBhc3luYyhcbiAgICBtb2RlbERhdGE6IFVpbnQ4QXJyYXl8U2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXIsXG4gICAgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YT4gPT4ge1xuICBsZXQgbW9kZWxEYXRhT2Zmc2V0OiBudW1iZXIsIG1vZGVsRGF0YUxlbmd0aDogbnVtYmVyO1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBpZiAoQXJyYXkuaXNBcnJheShtb2RlbERhdGEpKSB7XG4gICAgLy8gaWYgbW9kZWwgZGF0YSBpcyBhbiBhcnJheSwgaXQgbXVzdCBiZSBhIDItZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyB0aGUgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgbW9kZWwgZGF0YVxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBtb2RlbERhdGE7XG4gIH0gZWxzZSBpZiAobW9kZWxEYXRhLmJ1ZmZlciA9PT0gd2FzbS5IRUFQVTguYnVmZmVyKSB7XG4gICAgLy8gaWYgbW9kZWwgZGF0YSB1c2VzIHRoZSBzYW1lIGJ1ZmZlciBhcyB0aGUgV0FTTSBoZWFwLCB3ZSBkb24ndCBuZWVkIHRvIGNvcHkgaXQuXG4gICAgW21vZGVsRGF0YU9mZnNldCwgbW9kZWxEYXRhTGVuZ3RoXSA9IFttb2RlbERhdGEuYnl0ZU9mZnNldCwgbW9kZWxEYXRhLmJ5dGVMZW5ndGhdO1xuICB9IGVsc2Uge1xuICAgIC8vIG90aGVyd2lzZSwgY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLlxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBjb3B5RnJvbUV4dGVybmFsQnVmZmVyKG1vZGVsRGF0YSk7XG4gIH1cblxuICBsZXQgc2Vzc2lvbkhhbmRsZSA9IDA7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBpb0JpbmRpbmdIYW5kbGUgPSAwO1xuICBsZXQgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbnB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuXG4gIHRyeSB7XG4gICAgW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdID0gc2V0U2Vzc2lvbk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBpZiAob3B0aW9ucz8uZXh0ZXJuYWxEYXRhICYmIHdhc20ubW91bnRFeHRlcm5hbERhdGEpIHtcbiAgICAgIGNvbnN0IGxvYWRpbmdQcm9taXNlcyA9IFtdO1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIG9wdGlvbnMuZXh0ZXJuYWxEYXRhKSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSB0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycgPyBmaWxlIDogZmlsZS5wYXRoO1xuICAgICAgICBsb2FkaW5nUHJvbWlzZXMucHVzaChsb2FkRmlsZSh0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycgPyBmaWxlIDogZmlsZS5kYXRhKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgIHdhc20ubW91bnRFeHRlcm5hbERhdGEhKHBhdGgsIGRhdGEpO1xuICAgICAgICB9KSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHdhaXQgZm9yIGFsbCBleHRlcm5hbCBkYXRhIGZpbGVzIHRvIGJlIGxvYWRlZFxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwobG9hZGluZ1Byb21pc2VzKTtcbiAgICB9XG5cbiAgICBzZXNzaW9uSGFuZGxlID0gYXdhaXQgd2FzbS5fT3J0Q3JlYXRlU2Vzc2lvbihtb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aCwgc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgIGlmIChzZXNzaW9uSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgYSBzZXNzaW9uLicpO1xuICAgIH1cblxuICAgIGNvbnN0IFtpbnB1dENvdW50LCBvdXRwdXRDb3VudF0gPSBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlKTtcblxuICAgIGNvbnN0IGVuYWJsZUdyYXBoQ2FwdHVyZSA9ICEhb3B0aW9ucz8uZW5hYmxlR3JhcGhDYXB0dXJlO1xuXG4gICAgY29uc3QgaW5wdXROYW1lcyA9IFtdO1xuICAgIGNvbnN0IG91dHB1dE5hbWVzID0gW107XG4gICAgY29uc3Qgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IG5hbWUgPSB3YXNtLl9PcnRHZXRJbnB1dE5hbWUoc2Vzc2lvbkhhbmRsZSwgaSk7XG4gICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gaW5wdXQgbmFtZS4nKTtcbiAgICAgIH1cbiAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xuICAgICAgaW5wdXROYW1lcy5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0T3V0cHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgIGlmIChuYW1lID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBvdXRwdXQgbmFtZS4nKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQucHVzaChuYW1lKTtcbiAgICAgIGNvbnN0IG5hbWVTdHJpbmcgPSB3YXNtLlVURjhUb1N0cmluZyhuYW1lKTtcbiAgICAgIG91dHB1dE5hbWVzLnB1c2gobmFtZVN0cmluZyk7XG5cbiAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlICYmIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMucHVzaCgnZ3B1LWJ1ZmZlcicpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdHlwZW9mIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICBvcHRpb25zLnByZWZlcnJlZE91dHB1dExvY2F0aW9uIDpcbiAgICAgICAgICAgIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uPy5bbmFtZVN0cmluZ10gPz8gJ2NwdSc7XG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gJ2NwdScgJiYgbG9jYXRpb24gIT09ICdjcHUtcGlubmVkJyAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOb3Qgc3VwcG9ydGVkIHByZWZlcnJlZCBvdXRwdXQgbG9jYXRpb246ICR7bG9jYXRpb259LmApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbmFibGVHcmFwaENhcHR1cmUgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke1xuICAgICAgICAgICAgICBsb2NhdGlvbn0uIE9ubHkgJ2dwdS1idWZmZXInIGxvY2F0aW9uIGlzIHN1cHBvcnRlZCB3aGVuIGVuYWJsZUdyYXBoQ2FwdHVyZSBpcyB0cnVlLmApO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB1c2UgSU8gYmluZGluZyBvbmx5IHdoZW4gYXQgbGVhc3Qgb25lIG91dHB1dCBpcyBwcmVmZmVyZWQgdG8gYmUgb24gR1BVLlxuICAgIGxldCBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGwgPSBudWxsO1xuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMuc29tZShsID0+IGwgPT09ICdncHUtYnVmZmVyJykpIHtcbiAgICAgIGlvQmluZGluZ0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZUJpbmRpbmcoc2Vzc2lvbkhhbmRsZSk7XG4gICAgICBpZiAoaW9CaW5kaW5nSGFuZGxlID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBJTyBiaW5kaW5nLicpO1xuICAgICAgfVxuXG4gICAgICBiaW5kaW5nU3RhdGUgPSB7XG4gICAgICAgIGhhbmRsZTogaW9CaW5kaW5nSGFuZGxlLFxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsXG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5tYXAobCA9PiBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obCkpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBhY3RpdmVTZXNzaW9ucy5zZXQoXG4gICAgICAgIHNlc3Npb25IYW5kbGUsXG4gICAgICAgIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGJpbmRpbmdTdGF0ZSwgZW5hYmxlR3JhcGhDYXB0dXJlLCBmYWxzZV0pO1xuICAgIHJldHVybiBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lcywgb3V0cHV0TmFtZXNdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuXG4gICAgaWYgKGlvQmluZGluZ0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZUJpbmRpbmcoaW9CaW5kaW5nSGFuZGxlKTtcbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbkhhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5fZnJlZShtb2RlbERhdGFPZmZzZXQpO1xuICAgIGlmIChzZXNzaW9uT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zKHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgYWxsb2NzLmZvckVhY2goYWxsb2MgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuXG4gICAgLy8gdW5tb3VudCBleHRlcm5hbCBkYXRhIGlmIG5lY2Vzc2FyeVxuICAgIHdhc20udW5tb3VudEV4dGVybmFsRGF0YT8uKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCByZWxlYXNlU2Vzc2lvbiA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCByZWxlYXNlIHNlc3Npb24uIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGUsIGVuYWJsZUdyYXBoQ2FwdHVyZV0gPSBzZXNzaW9uO1xuXG4gIGlmIChpb0JpbmRpbmdTdGF0ZSkge1xuICAgIGlmIChlbmFibGVHcmFwaENhcHR1cmUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgfVxuICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gIH1cblxuICB3YXNtLmpzZXBPblJlbGVhc2VTZXNzaW9uPy4oc2Vzc2lvbklkKTtcblxuICBpbnB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbihzZXNzaW9uSGFuZGxlKTtcbiAgYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25JZCk7XG59O1xuXG5leHBvcnQgY29uc3QgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yID1cbiAgICAodGVuc29yOiBUZW5zb3JNZXRhZGF0YXxudWxsLCB0ZW5zb3JIYW5kbGVzOiBudW1iZXJbXSwgYWxsb2NzOiBudW1iZXJbXSwgc2Vzc2lvbklkOiBudW1iZXIsIGluZGV4OiBudW1iZXIsXG4gICAgIGVuYWJsZUdyYXBoQ2FwdHVyZSA9IGZhbHNlKTogdm9pZCA9PiB7XG4gICAgICBpZiAoIXRlbnNvcikge1xuICAgICAgICB0ZW5zb3JIYW5kbGVzLnB1c2goMCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgICAgIGNvbnN0IGRhdGFUeXBlID0gdGVuc29yWzBdO1xuICAgICAgY29uc3QgZGltcyA9IHRlbnNvclsxXTtcbiAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGVuc29yWzNdO1xuXG4gICAgICBsZXQgcmF3RGF0YTogbnVtYmVyO1xuICAgICAgbGV0IGRhdGFCeXRlTGVuZ3RoOiBudW1iZXI7XG5cbiAgICAgIGlmIChkYXRhVHlwZSA9PT0gJ3N0cmluZycgJiYgbG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmFibGVHcmFwaENhcHR1cmUgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRXh0ZXJuYWwgYnVmZmVyIG11c3QgYmUgcHJvdmlkZWQgZm9yIGlucHV0L291dHB1dCBpbmRleCAke2luZGV4fSB3aGVuIGVuYWJsZUdyYXBoQ2FwdHVyZSBpcyB0cnVlLmApO1xuICAgICAgfVxuXG4gICAgICBpZiAobG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICBjb25zdCBncHVCdWZmZXIgPSB0ZW5zb3JbMl0uZ3B1QnVmZmVyIGFzIEdQVUJ1ZmZlcjtcbiAgICAgICAgY29uc3QgZWxlbWVudFNpemVJbkJ5dGVzID0gZ2V0VGVuc29yRWxlbWVudFNpemUodGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpKSE7XG4gICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKSAqIGVsZW1lbnRTaXplSW5CeXRlcztcblxuICAgICAgICBjb25zdCByZWdpc3RlckJ1ZmZlciA9IHdhc20uanNlcFJlZ2lzdGVyQnVmZmVyO1xuICAgICAgICBpZiAoIXJlZ2lzdGVyQnVmZmVyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZW5zb3IgbG9jYXRpb24gXCJncHUtYnVmZmVyXCIgaXMgbm90IHN1cHBvcnRlZCB3aXRob3V0IHVzaW5nIFdlYkdQVS4nKTtcbiAgICAgICAgfVxuICAgICAgICByYXdEYXRhID0gcmVnaXN0ZXJCdWZmZXIoc2Vzc2lvbklkLCBpbmRleCwgZ3B1QnVmZmVyLCBkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkYXRhID0gdGVuc29yWzJdO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgLy8gc3RyaW5nIHRlbnNvclxuICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gNCAqIGRhdGEubGVuZ3RoO1xuICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGFsbG9jcy5wdXNoKHJhd0RhdGEpO1xuICAgICAgICAgIGxldCBkYXRhSW5kZXggPSByYXdEYXRhIC8gNDtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YVtpXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdGVuc29yIGRhdGEgYXQgaW5kZXggJHtpfSBpcyBub3QgYSBzdHJpbmdgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK10gPSBhbGxvY1dhc21TdHJpbmcoZGF0YVtpXSwgYWxsb2NzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSBkYXRhLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgcmF3RGF0YSA9IHdhc20uX21hbGxvYyhkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgd2FzbS5IRUFQVTguc2V0KG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGFCeXRlTGVuZ3RoKSwgcmF3RGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgY29uc3QgZGltc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg0ICogZGltcy5sZW5ndGgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGRpbUluZGV4ID0gZGltc09mZnNldCAvIDQ7XG4gICAgICAgIGRpbXMuZm9yRWFjaChkID0+IHdhc20uSEVBUDMyW2RpbUluZGV4KytdID0gZCk7XG4gICAgICAgIGNvbnN0IHRlbnNvciA9IHdhc20uX09ydENyZWF0ZVRlbnNvcihcbiAgICAgICAgICAgIHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSwgcmF3RGF0YSwgZGF0YUJ5dGVMZW5ndGgsIGRpbXNPZmZzZXQsIGRpbXMubGVuZ3RoLFxuICAgICAgICAgICAgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGxvY2F0aW9uKSk7XG4gICAgICAgIGlmICh0ZW5zb3IgPT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgY3JlYXRlIHRlbnNvciBmb3IgaW5wdXQvb3V0cHV0LiBzZXNzaW9uPSR7c2Vzc2lvbklkfSwgaW5kZXg9JHtpbmRleH0uYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKHRlbnNvcik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gICAgICB9XG4gICAgfTtcblxuLyoqXG4gKiBwZXJmb3JtIGluZmVyZW5jZSBydW5cbiAqL1xuZXhwb3J0IGNvbnN0IHJ1biA9IGFzeW5jKFxuICAgIHNlc3Npb25JZDogbnVtYmVyLCBpbnB1dEluZGljZXM6IG51bWJlcltdLCBpbnB1dFRlbnNvcnM6IFRlbnNvck1ldGFkYXRhW10sIG91dHB1dEluZGljZXM6IG51bWJlcltdLFxuICAgIG91dHB1dFRlbnNvcnM6IEFycmF5PFRlbnNvck1ldGFkYXRhfG51bGw+LCBvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPFRlbnNvck1ldGFkYXRhW10+ID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgaWYgKCFzZXNzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgcnVuIGluZmVyZW5jZS4gaW52YWxpZCBzZXNzaW9uIGlkOiAke3Nlc3Npb25JZH1gKTtcbiAgfVxuICBjb25zdCBzZXNzaW9uSGFuZGxlID0gc2Vzc2lvblswXTtcbiAgY29uc3QgaW5wdXROYW1lc1VURjhFbmNvZGVkID0gc2Vzc2lvblsxXTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCA9IHNlc3Npb25bMl07XG4gIGNvbnN0IGlvQmluZGluZ1N0YXRlID0gc2Vzc2lvblszXTtcbiAgY29uc3QgZW5hYmxlR3JhcGhDYXB0dXJlID0gc2Vzc2lvbls0XTtcbiAgY29uc3QgaW5wdXRPdXRwdXRCb3VuZCA9IHNlc3Npb25bNV07XG5cbiAgY29uc3QgaW5wdXRDb3VudCA9IGlucHV0SW5kaWNlcy5sZW5ndGg7XG4gIGNvbnN0IG91dHB1dENvdW50ID0gb3V0cHV0SW5kaWNlcy5sZW5ndGg7XG5cbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xuICBsZXQgcnVuT3B0aW9uc0FsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBpbnB1dFRlbnNvckhhbmRsZXM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IG91dHB1dFRlbnNvckhhbmRsZXM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGlucHV0T3V0cHV0QWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGJlZm9yZVJ1blN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgY29uc3QgaW5wdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBpbnB1dE5hbWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKGlucHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0VmFsdWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKG91dHB1dENvdW50ICogNCk7XG4gIGNvbnN0IG91dHB1dE5hbWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKG91dHB1dENvdW50ICogNCk7XG5cbiAgdHJ5IHtcbiAgICBbcnVuT3B0aW9uc0hhbmRsZSwgcnVuT3B0aW9uc0FsbG9jc10gPSBzZXRSdW5PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgLy8gY3JlYXRlIGlucHV0IHRlbnNvcnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKFxuICAgICAgICAgIGlucHV0VGVuc29yc1tpXSwgaW5wdXRUZW5zb3JIYW5kbGVzLCBpbnB1dE91dHB1dEFsbG9jcywgc2Vzc2lvbklkLCBpbnB1dEluZGljZXNbaV0sIGVuYWJsZUdyYXBoQ2FwdHVyZSk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIG91dHB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoXG4gICAgICAgICAgb3V0cHV0VGVuc29yc1tpXSwgb3V0cHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRDb3VudCArIG91dHB1dEluZGljZXNbaV0sXG4gICAgICAgICAgZW5hYmxlR3JhcGhDYXB0dXJlKTtcbiAgICB9XG5cbiAgICBsZXQgaW5wdXRWYWx1ZXNJbmRleCA9IGlucHV0VmFsdWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgaW5wdXROYW1lc0luZGV4ID0gaW5wdXROYW1lc09mZnNldCAvIDQ7XG4gICAgbGV0IG91dHB1dFZhbHVlc0luZGV4ID0gb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0TmFtZXNJbmRleCA9IG91dHB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5IRUFQVTMyW2lucHV0VmFsdWVzSW5kZXgrK10gPSBpbnB1dFRlbnNvckhhbmRsZXNbaV07XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXROYW1lc0luZGV4KytdID0gaW5wdXROYW1lc1VURjhFbmNvZGVkW2lucHV0SW5kaWNlc1tpXV07XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dFZhbHVlc0luZGV4KytdID0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltvdXRwdXROYW1lc0luZGV4KytdID0gb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtvdXRwdXRJbmRpY2VzW2ldXTtcbiAgICB9XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUgJiYgIWlucHV0T3V0cHV0Qm91bmQpIHtcbiAgICAgIGNvbnN0IHtoYW5kbGUsIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucywgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZH0gPSBpb0JpbmRpbmdTdGF0ZTtcblxuICAgICAgaWYgKGlucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGggIT09IGlucHV0Q291bnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnB1dCBjb3VudCBmcm9tIGZlZWRzICgke1xuICAgICAgICAgICAgaW5wdXRDb3VudH0pIGlzIGV4cGVjdGVkIHRvIGJlIGFsd2F5cyBlcXVhbCB0byBtb2RlbCdzIGlucHV0IGNvdW50ICgke2lucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGh9KS5gKTtcbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBpbnB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gaW5wdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRCaW5kSW5wdXQoaGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBpbnB1dFRlbnNvckhhbmRsZXNbaV0pO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgaW5wdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgcHJlLWFsbG9jYXRlZCBvdXRwdXRzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBvdXRwdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IG91dHB1dFRlbnNvcnNbaV0/LlszXTsgIC8vIHVuZGVmaW5lZCBtZWFucyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuXG5cbiAgICAgICAgaWYgKGxvY2F0aW9uKSB7XG4gICAgICAgICAgLy8gb3V0cHV0IGlzIHByZS1hbGxvY2F0ZWQuIGJpbmQgdGhlIHRlbnNvci5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIG91dHB1dFRlbnNvckhhbmRsZXNbaV0sIDApO1xuICAgICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIHByZS1hbGxvY2F0ZWQgb3V0cHV0WyR7aX1dIGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gb3V0cHV0IGlzIG5vdCBwcmUtYWxsb2NhdGVkLiByZXNldCBwcmVmZXJyZWQgbG9jYXRpb24uXG4gICAgICAgICAgY29uc3QgZXJyb3JDb2RlID1cbiAgICAgICAgICAgICAgd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCAwLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkW2luZGV4XSk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgb3V0cHV0WyR7aX1dIHRvICR7b3V0cHV0UHJlZmVycmVkTG9jYXRpb25zW2ldfSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhY3RpdmVTZXNzaW9ucy5zZXQoXG4gICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlLCBlbmFibGVHcmFwaENhcHR1cmUsIHRydWVdKTtcbiAgICB9XG5cbiAgICB3YXNtLmpzZXBPblJ1blN0YXJ0Py4oc2Vzc2lvbkhhbmRsZSk7XG4gICAgbGV0IGVycm9yQ29kZTogbnVtYmVyO1xuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBpb0JpbmRpbmdTdGF0ZSkge1xuICAgICAgZXJyb3JDb2RlID0gYXdhaXQgd2FzbS5fT3J0UnVuV2l0aEJpbmRpbmcoXG4gICAgICAgICAgc2Vzc2lvbkhhbmRsZSwgaW9CaW5kaW5nU3RhdGUuaGFuZGxlLCBvdXRwdXRDb3VudCwgb3V0cHV0VmFsdWVzT2Zmc2V0LCBydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JDb2RlID0gYXdhaXQgd2FzbS5fT3J0UnVuKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNPZmZzZXQsIGlucHV0VmFsdWVzT2Zmc2V0LCBpbnB1dENvdW50LCBvdXRwdXROYW1lc09mZnNldCwgb3V0cHV0Q291bnQsXG4gICAgICAgICAgb3V0cHV0VmFsdWVzT2Zmc2V0LCBydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignZmFpbGVkIHRvIGNhbGwgT3J0UnVuKCkuJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0cHV0OiBUZW5zb3JNZXRhZGF0YVtdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IHRlbnNvciA9IHdhc20uSEVBUFUzMltvdXRwdXRWYWx1ZXNPZmZzZXQgLyA0ICsgaV07XG4gICAgICBpZiAodGVuc29yID09PSBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldKSB7XG4gICAgICAgIC8vIG91dHB1dCB0ZW5zb3IgaXMgcHJlLWFsbG9jYXRlZC4gbm8gbmVlZCB0byBjb3B5IGRhdGEuXG4gICAgICAgIG91dHB1dC5wdXNoKG91dHB1dFRlbnNvcnNbaV0hKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gICAgICAvLyBzdGFjayBhbGxvY2F0ZSA0IHBvaW50ZXIgdmFsdWVcbiAgICAgIGNvbnN0IHRlbnNvckRhdGFPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoNCAqIDQpO1xuXG4gICAgICBsZXQga2VlcE91dHB1dFRlbnNvciA9IGZhbHNlO1xuICAgICAgbGV0IHR5cGU6IFRlbnNvci5UeXBlfHVuZGVmaW5lZCwgZGF0YU9mZnNldCA9IDA7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRHZXRUZW5zb3JEYXRhKFxuICAgICAgICAgICAgdGVuc29yLCB0ZW5zb3JEYXRhT2Zmc2V0LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgNCwgdGVuc29yRGF0YU9mZnNldCArIDgsIHRlbnNvckRhdGFPZmZzZXQgKyAxMik7XG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYWNjZXNzIG91dHB1dCB0ZW5zb3IgZGF0YSBvbiBpbmRleCAke2l9LmApO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0ZW5zb3JEYXRhSW5kZXggPSB0ZW5zb3JEYXRhT2Zmc2V0IC8gNDtcbiAgICAgICAgY29uc3QgZGF0YVR5cGUgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBkYXRhT2Zmc2V0ID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltc09mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNMZW5ndGggPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGltc0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZGltcy5wdXNoKHdhc20uSEVBUFUzMltkaW1zT2Zmc2V0IC8gNCArIGldKTtcbiAgICAgICAgfVxuICAgICAgICB3YXNtLl9PcnRGcmVlKGRpbXNPZmZzZXQpO1xuXG4gICAgICAgIGNvbnN0IHNpemUgPSBkaW1zLnJlZHVjZSgoYSwgYikgPT4gYSAqIGIsIDEpO1xuICAgICAgICB0eXBlID0gdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcoZGF0YVR5cGUpO1xuXG4gICAgICAgIGNvbnN0IHByZWZlcnJlZExvY2F0aW9uID0gaW9CaW5kaW5nU3RhdGU/Lm91dHB1dFByZWZlcnJlZExvY2F0aW9uc1tvdXRwdXRJbmRpY2VzW2ldXTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdHJpbmcgdGVuc29yIGlzIG5vdCBzdXBwb3J0ZWQgb24gR1BVLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBzdHJpbmdEYXRhOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgIGxldCBkYXRhSW5kZXggPSBkYXRhT2Zmc2V0IC8gNDtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gd2FzbS5IRUFQVTMyW2RhdGFJbmRleCsrXTtcbiAgICAgICAgICAgIGNvbnN0IG1heEJ5dGVzVG9SZWFkID0gaSA9PT0gc2l6ZSAtIDEgPyB1bmRlZmluZWQgOiB3YXNtLkhFQVBVMzJbZGF0YUluZGV4XSAtIG9mZnNldDtcbiAgICAgICAgICAgIHN0cmluZ0RhdGEucHVzaCh3YXNtLlVURjhUb1N0cmluZyhvZmZzZXQsIG1heEJ5dGVzVG9SZWFkKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dHB1dC5wdXNoKFt0eXBlLCBkaW1zLCBzdHJpbmdEYXRhLCAnY3B1J10pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIGEgY2VydGFpbiBvdXRwdXQncyBwcmVmZXJyZWQgbG9jYXRpb24gaXMgR1BVIGJ1dCB0aGUgdGVuc29yIGlzIGVtcHR5LCB3ZSBzdGlsbCBuZWVkIHRvIGNyZWF0ZSBhIENQVVxuICAgICAgICAgIC8vIHRlbnNvciBmb3IgaXQuIFRoZXJlIGlzIG5vIG1hcHBpbmcgR1BVIGJ1ZmZlciBmb3IgYW4gZW1wdHkgdGVuc29yLlxuICAgICAgICAgIGlmIChwcmVmZXJyZWRMb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInICYmIHNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBnZXRCdWZmZXIgPSB3YXNtLmpzZXBHZXRCdWZmZXI7XG4gICAgICAgICAgICBpZiAoIWdldEJ1ZmZlcikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZWZlcnJlZExvY2F0aW9uIFwiZ3B1LWJ1ZmZlclwiIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCB1c2luZyBXZWJHUFUuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBncHVCdWZmZXIgPSBnZXRCdWZmZXIoZGF0YU9mZnNldCk7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50U2l6ZSA9IGdldFRlbnNvckVsZW1lbnRTaXplKGRhdGFUeXBlKTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50U2l6ZSA9PT0gdW5kZWZpbmVkIHx8ICFpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUodHlwZSkpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZG8gbm90IHJlbGVhc2UgdGhlIHRlbnNvciByaWdodCBub3cuIGl0IHdpbGwgYmUgcmVsZWFzZWQgd2hlbiB1c2VyIGNhbGxzIHRlbnNvci5kaXNwb3NlKCkuXG4gICAgICAgICAgICBrZWVwT3V0cHV0VGVuc29yID0gdHJ1ZTtcblxuICAgICAgICAgICAgb3V0cHV0LnB1c2goW1xuICAgICAgICAgICAgICB0eXBlLCBkaW1zLCB7XG4gICAgICAgICAgICAgICAgZ3B1QnVmZmVyLFxuICAgICAgICAgICAgICAgIGRvd25sb2FkOiB3YXNtLmpzZXBDcmVhdGVEb3dubG9hZGVyIShncHVCdWZmZXIsIHNpemUgKiBlbGVtZW50U2l6ZSwgdHlwZSksXG4gICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2dwdS1idWZmZXInXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpXG4gICAgICAgICAgICAgICAgLnNldCh3YXNtLkhFQVBVOC5zdWJhcnJheShkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgZGF0YS5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBkYXRhT2Zmc2V0KSB7XG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBPdXRwdXRUZW5zb3IpIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW9CaW5kaW5nU3RhdGUgJiYgIWVuYWJsZUdyYXBoQ2FwdHVyZSkge1xuICAgICAgd2FzbS5fT3J0Q2xlYXJCb3VuZE91dHB1dHMoaW9CaW5kaW5nU3RhdGUuaGFuZGxlKTtcbiAgICAgIGFjdGl2ZVNlc3Npb25zLnNldChcbiAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGUsIGVuYWJsZUdyYXBoQ2FwdHVyZSwgZmFsc2VdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVSdW5TdGFjayk7XG5cbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIG91dHB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIGlucHV0T3V0cHV0QWxsb2NzLmZvckVhY2gocCA9PiB3YXNtLl9mcmVlKHApKTtcblxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgcnVuT3B0aW9uc0FsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG4gIH1cbn07XG5cbi8qKlxuICogZW5kIHByb2ZpbGluZ1xuICovXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG5cbiAgLy8gcHJvZmlsZSBmaWxlIG5hbWUgaXMgbm90IHVzZWQgeWV0LCBidXQgaXQgbXVzdCBiZSBmcmVlZC5cbiAgY29uc3QgcHJvZmlsZUZpbGVOYW1lID0gd2FzbS5fT3J0RW5kUHJvZmlsaW5nKHNlc3Npb25IYW5kbGUpO1xuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIHByb2ZpbGUgZmlsZSBuYW1lLicpO1xuICB9XG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xuICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlckxpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHRlbnNvciBvZiB0ZW5zb3JzKSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgJ2J1ZmZlcicgaW4gZGF0YSkge1xuICAgICAgYnVmZmVycy5wdXNoKGRhdGEuYnVmZmVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBsaWI9XCJ3ZWJ3b3JrZXJcIiAvPlxuXG4vL1xuLy8gKiB0eXBlIGhhY2sgZm9yIFwiSFRNTEltYWdlRWxlbWVudFwiXG4vL1xuLy8gaW4gdHlwZXNjcmlwdCwgdGhlIHR5cGUgb2YgXCJIVE1MSW1hZ2VFbGVtZW50XCIgaXMgZGVmaW5lZCBpbiBsaWIuZG9tLmQudHMsIHdoaWNoIGlzIGNvbmZsaWN0IHdpdGggbGliLndlYndvcmtlci5kLnRzLlxuLy8gd2hlbiB3ZSB1c2Ugd2Vid29ya2VyLCB0aGUgbGliLndlYndvcmtlci5kLnRzIHdpbGwgYmUgdXNlZCwgd2hpY2ggZG9lcyBub3QgaGF2ZSBIVE1MSW1hZ2VFbGVtZW50IGRlZmluZWQuXG4vL1xuLy8gd2Ugd2lsbCBnZXQgdGhlIGZvbGxvd2luZyBlcnJvcnMgY29tcGxhaW5pbmcgdGhhdCBIVE1MSW1hZ2VFbGVtZW50IGlzIG5vdCBkZWZpbmVkOlxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vL1xuLy8gLi4vY29tbW9uL2Rpc3QvY2pzL3RlbnNvci1mYWN0b3J5LmQudHM6MTg3OjI5IC0gZXJyb3IgVFMyNTUyOiBDYW5ub3QgZmluZCBuYW1lICdIVE1MSW1hZ2VFbGVtZW50Jy4gRGlkIHlvdSBtZWFuXG4vLyAnSFRNTExJRWxlbWVudCc/XG4vL1xuLy8gMTg3ICAgICBmcm9tSW1hZ2UoaW1hZ2VFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50LCBvcHRpb25zPzogVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnMpOlxuLy8gUHJvbWlzZTxUeXBlZFRlbnNvcjwnZmxvYXQzMic+IHwgVHlwZWRUZW5zb3I8J3VpbnQ4Jz4+O1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB+fn5+fn5+fn5+fn5+fn5+XG4vL1xuLy8gbm9kZV9tb2R1bGVzL0B3ZWJncHUvdHlwZXMvZGlzdC9pbmRleC5kLnRzOjgzOjcgLSBlcnJvciBUUzI1NTI6IENhbm5vdCBmaW5kIG5hbWUgJ0hUTUxJbWFnZUVsZW1lbnQnLiBEaWQgeW91IG1lYW5cbi8vICdIVE1MTElFbGVtZW50Jz9cbi8vXG4vLyA4MyAgICAgfCBIVE1MSW1hZ2VFbGVtZW50XG4vLyAgICAgICAgICB+fn5+fn5+fn5+fn5+fn5+XG4vL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vXG4vLyBgSFRNTEltYWdlRWxlbWVudGAgaXMgb25seSB1c2VkIGluIHR5cGUgZGVjbGFyYXRpb24gYW5kIG5vdCBpbiByZWFsIGNvZGUuIFNvIHdlIGRlZmluZSBpdCBhcyBgdW5rbm93bmAgaGVyZSB0b1xuLy8gYnlwYXNzIHRoZSB0eXBlIGNoZWNrLlxuLy9cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdHlwZSBIVE1MSW1hZ2VFbGVtZW50ID0gdW5rbm93bjtcbn1cblxuaW1wb3J0IHtPcnRXYXNtTWVzc2FnZSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGF9IGZyb20gJy4uL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7Y3JlYXRlU2Vzc2lvbiwgY29weUZyb21FeHRlcm5hbEJ1ZmZlciwgZW5kUHJvZmlsaW5nLCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycywgaW5pdEVwLCBpbml0UnVudGltZSwgcmVsZWFzZVNlc3Npb24sIHJ1bn0gZnJvbSAnLi4vd2FzbS1jb3JlLWltcGwnO1xuaW1wb3J0IHtpbml0aWFsaXplV2ViQXNzZW1ibHl9IGZyb20gJy4uL3dhc20tZmFjdG9yeSc7XG5cbnNlbGYub25tZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQ8T3J0V2FzbU1lc3NhZ2U+KTogdm9pZCA9PiB7XG4gIGNvbnN0IHt0eXBlLCBpbiA6IG1lc3NhZ2V9ID0gZXYuZGF0YTtcbiAgdHJ5IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ2luaXQtd2FzbSc6XG4gICAgICAgIGluaXRpYWxpemVXZWJBc3NlbWJseShtZXNzYWdlIS53YXNtKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaW5pdFJ1bnRpbWUobWVzc2FnZSEpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGV9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2luaXQtZXAnOiB7XG4gICAgICAgIGNvbnN0IHtlcE5hbWUsIGVudn0gPSBtZXNzYWdlITtcbiAgICAgICAgaW5pdEVwKGVudiwgZXBOYW1lKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGV9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnY29weS1mcm9tJzoge1xuICAgICAgICBjb25zdCB7YnVmZmVyfSA9IG1lc3NhZ2UhO1xuICAgICAgICBjb25zdCBidWZmZXJEYXRhID0gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihidWZmZXIpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgb3V0OiBidWZmZXJEYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnY3JlYXRlJzoge1xuICAgICAgICBjb25zdCB7bW9kZWwsIG9wdGlvbnN9ID0gbWVzc2FnZSE7XG4gICAgICAgIGNyZWF0ZVNlc3Npb24obW9kZWwsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICBzZXNzaW9uTWV0YWRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIG91dDogc2Vzc2lvbk1ldGFkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ3JlbGVhc2UnOlxuICAgICAgICByZWxlYXNlU2Vzc2lvbihtZXNzYWdlISk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncnVuJzoge1xuICAgICAgICBjb25zdCB7c2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3B0aW9uc30gPSBtZXNzYWdlITtcbiAgICAgICAgcnVuKHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG5ldyBBcnJheShvdXRwdXRJbmRpY2VzLmxlbmd0aCkuZmlsbChudWxsKSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIG91dHB1dHMgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dHMuc29tZShvID0+IG9bM10gIT09ICdjcHUnKSkge1xuICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyOiAnUHJveHkgZG9lcyBub3Qgc3VwcG9ydCBub24tY3B1IHRlbnNvciBsb2NhdGlvbi4nfSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0eXBlLCBvdXQ6IG91dHB1dHN9IGFzIE9ydFdhc21NZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMoWy4uLmlucHV0cywgLi4ub3V0cHV0c10gYXMgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXSkpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdlbmQtcHJvZmlsaW5nJzpcbiAgICAgICAgZW5kUHJvZmlsaW5nKG1lc3NhZ2UhKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGV9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICB9XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7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QUUsU0FBUyxHQUFFLEtBQUcsRUFBRSxFQUFFLFlBQVksQ0FBQyxJQUFFLEtBQUcsSUFBSSxDQUFDO0FBQUUsb0JBQUcsSUFBRSxJQUFFLEVBQUUsUUFBUTtBQUFFLHVCQUFHLElBQUUsRUFBRSxRQUFRLElBQUUsR0FBRSxFQUFFLFFBQVEsQ0FBQyxHQUFFLEtBQUcsSUFBRSxFQUFFLFNBQVMsSUFBRSxDQUFDLEtBQUcsRUFBRSxTQUFTLENBQUMsR0FBRSxFQUFFLFlBQVksRUFBRSxZQUFZLElBQUUsQ0FBQztBQUFBLHFCQUFPO0FBQUMsb0JBQUUsUUFBUSxFQUFFLFFBQVEsSUFBRSxDQUFDO0FBQUU7QUFBQSxnQkFBSztBQUFBLGNBQUM7QUFBQyxrQkFBRSxJQUFJLEtBQUssRUFBRSxZQUFZLElBQUUsR0FBRSxHQUFFLENBQUM7QUFBRSxrQkFBRSxFQUFFLElBQUk7QUFBQSxnQkFBSyxFQUFFLFlBQVk7QUFBQSxnQkFDbmY7QUFBQSxnQkFBRTtBQUFBLGNBQUMsQ0FBQztBQUFFLGtCQUFFLEVBQUUsQ0FBQztBQUFFLHFCQUFPLEtBQUcsRUFBRSxHQUFFLENBQUMsSUFBRSxLQUFHLEVBQUUsR0FBRSxDQUFDLElBQUUsRUFBRSxZQUFZLElBQUUsSUFBRSxFQUFFLFlBQVksSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFBLFlBQUM7QUFBQyxtQkFBSztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDO0FBQUUsZ0JBQUUsRUFBQyxJQUFHLEVBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLElBQUUsRUFBRSxDQUFDLElBQUUsR0FBRTtBQUFFLGdCQUFFLEVBQUUsQ0FBQztBQUFFLGdCQUFFO0FBQUEsY0FBQyxNQUFLO0FBQUEsY0FBdUIsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQUssTUFBSztBQUFBLGNBQWMsTUFBSztBQUFBLGNBQVEsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQVcsTUFBSztBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQ25mLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFXLE9BQU07QUFBQSxjQUFXLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxZQUFJO0FBQUUscUJBQVEsS0FBSztBQUFFLGtCQUFFLEVBQUUsUUFBUSxJQUFJLE9BQU8sR0FBRSxHQUFHLEdBQUUsRUFBRSxDQUFDLENBQUM7QUFBRSxnQkFBSSxLQUFHLDJEQUEyRCxNQUFNLEdBQUcsR0FBRSxLQUFHLHdGQUF3RixNQUFNLEdBQUc7QUFBRSxnQkFBRSxFQUFDLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUUsTUFBSyxPQUNsZixHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxLQUFHLFFBQU0sTUFBSSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUcsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssT0FBRztBQUFDLGtCQUFFLEVBQUU7QUFBRyxtQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHFCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxHQUFFLE1BQUssT0FBRztBQUFDLHVCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBRyxFQUFFLEtBQUcsR0FBRSxNQUFJLEVBQUUsRUFBRSxLQUFHLElBQUksSUFBRSxLQUFHLElBQUksR0FBRztBQUFFO0FBQUMscUJBQU8sRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDO0FBQUEsWUFBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssTUFBSSxNQUFLLE1BQUssT0FBRyxLQUFHLEVBQUUsTUFBSSxLQUFHLEVBQUUsS0FBRyxPQUFLLE1BQUssTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE1BQUksS0FBSyxNQUFLLE9BQUcsRUFBRSxNQUFJLEdBQUUsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxJQUFFLEVBQUUsTUFBSSxDQUFDLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FDcmY7QUFBQyxrQkFBSSxJQUFFLEtBQUssT0FBTyxFQUFFLEtBQUcsS0FBRyxFQUFFLEtBQUcsS0FBRyxLQUFHLENBQUM7QUFB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QUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsS0FBRyxFQUFFLGtCQUFrQjtBQUFHLGtCQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0I7QUFBRSxrQkFBSSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0I7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEtBQUcsS0FBRyxLQUFHLEVBQUUsa0JBQWtCLEtBQUcsS0FBSyxJQUFJLEdBQUUsQ0FBQyxLQUFHO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxxQkFBSztBQUFFLGtCQUFJLElBQUUsSUFBSSxLQUFLLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLE1BQUssRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsRUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLENBQUMsR0FBRSxJQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBRSxrQkFBa0IsR0FBRSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0IsR0FDcGYsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRSxLQUFLLElBQUksR0FBRSxDQUFDO0FBQUUsa0JBQUUsSUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxPQUFPLEtBQUcsS0FBRyxLQUFHLENBQUMsSUFBRSxJQUFFLE1BQUksS0FBRyxPQUFLLElBQUUsS0FBSyxJQUFJLEdBQUUsQ0FBQyxHQUFF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TUFBSSxDQUFDO0FBQUUsZUFBRyxHQUFFLElBQUUsQ0FBQztBQUFFLGVBQUcsQ0FBQztBQUFBLFVBQUM7QUFBRSxtQkFBUyxHQUFHLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLENBQUM7QUFBRSxlQUFHLENBQUM7QUFBQSxVQUFDO0FBQUMsY0FBSSxLQUFHLENBQUM7QUFBRSxZQUFFLG1CQUFpQixTQUFTLEdBQUUsR0FBRTtBQUFDLGdCQUFJLElBQUUsR0FBRyxDQUFDO0FBQUUsa0JBQUksS0FBRyxHQUFHLFdBQVMsR0FBRyxTQUFPLElBQUUsSUFBRyxHQUFHLENBQUMsSUFBRSxJQUFFLEdBQUcsSUFBSSxDQUFDO0FBQUcsZ0JBQUUsRUFBRSxDQUFDO0FBQUUsY0FBRSxJQUFFLEVBQUUsR0FBRyxDQUFDLElBQUUsR0FBRyxDQUFDO0FBQUEsVUFBQztBQUFFLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGlCQUFLLEtBQUcsSUFBRTtBQUFHLGlCQUFLLEtBQUcsU0FBUyxHQUFFO0FBQUMsZ0JBQUUsRUFBRSxLQUFLLEtBQUcsS0FBRyxNQUFJLENBQUMsSUFBRTtBQUFBLFlBQUM7QUFBRSxpQkFBSyxLQUFHLFNBQVMsR0FBRTtBQUFDLGdCQUFFLEVBQUUsS0FBSyxLQUFHLEtBQUcsTUFBSSxDQUFDLElBQUU7QUFBQSxZQUFDO0FBQUUsaUJBQUssS0FBRyxTQUFTLEdBQUUsR0FBRTtBQUFDLG1CQUFLLEdBQUc7QUFBRSxtQkFBSyxHQUFHLENBQUM7QUFBRSxtQkFBSyxHQUFHLENBQUM7QUFBQSxZQUFDO0FBQUUsaUJBQUssS0FBRyxXQUFVO0FBQUMsZ0JBQUUsRUFBRSxLQUFLLEtBQUcsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQzNlLGNBQUksS0FBRyxHQUFFLEtBQUc7QUFBRSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRSxHQUFHLEdB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RSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsbUJBQU8sSUFBRSxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQzlkLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFD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QUFDLElBQUU7QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsSUFBRyxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUU7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUU7QUFDamQsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUFDLGNBQUksS0FBRyxDQUFDLE1BQUssQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUFFLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLHFCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUk7QUFBQyxrQkFBSSxJQUFFLEVBQUUsRUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUM7QUFBRSxtQkFBRztBQUFFLHVCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBSTtBQUFDLG9CQUFJLElBQUUsRUFBRSxFQUFFLElBQUUsTUFBSSxDQUFDLEdBQUUsSUFBRSxHQUFHLENBQUM7QUFBRSxzQkFBSSxLQUFHLE9BQUssTUFBSSxNQUFJLElBQUUsS0FBRyxHQUFHLEdBQUcsR0FBRSxDQUFDLENBQUMsR0FBRSxFQUFFLFNBQU8sS0FBRyxFQUFFLEtBQUssQ0FBQztBQUFBLGNBQUM7QUFBQyxtQkFBRztBQUFBLFlBQUM7QUFBQyxjQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFP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QUUsUUFBUSxJQUFFLENBQUM7QUFBRTtBQUFBLGdCQUFLO0FBQUEsY0FBQztBQUFDLGtCQUFFLElBQUksS0FBSyxFQUFFLFlBQVksSUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLGtCQUFFLEVBQUUsSUFBSTtBQUFBLGdCQUFLLEVBQUUsWUFBWTtBQUFBLGdCQUNuZjtBQUFBLGdCQUFFO0FBQUEsY0FBQyxDQUFDO0FBQUUsa0JBQUUsRUFBRSxDQUFDO0FBQUUscUJBQU8sS0FBRyxFQUFFLEdBQUUsQ0FBQyxJQUFFLEtBQUcsRUFBRSxHQUFFLENBQUMsSUFBRSxFQUFFLFlBQVksSUFBRSxJQUFFLEVBQUUsWUFBWSxJQUFFLEVBQUUsWUFBWSxJQUFFO0FBQUEsWUFBQztBQUFDLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUsZ0JBQUksSUFBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQztBQUFFLGdCQUFFLEVBQUMsSUFBRyxFQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLElBQUUsR0FBRyxDQUFDLElBQUUsR0FBRTtBQUFFLGdCQUFFLEdBQUcsQ0FBQztBQUFFLGdCQUFFO0FBQUEsY0FBQyxNQUFLO0FBQUEs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QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUFJO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBRztBQUFBLFFBQ25FO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSztBQUFBLFFBQUk7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxNQUNsRSxDQUFDLENBQUM7QUFBQSxJQUNKLFNBQVMsR0FBRztBQUNWLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUVBLE1BQU0sa0JBQWtCLE1BQWU7QUFDckMsUUFBSTtBQWVGLGFBQU8sWUFBWSxTQUFTLElBQUksV0FBVztBQUFBLFFBQ3pDO0FBQUEsUUFBSztBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFDdkY7QUFBQSxRQUFLO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFB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QUFDLEtBQUksQ0FBQztBQUNsQjtBQUFBLFFBQ0YsS0FBSyxPQUFPO0FBQ1YsZ0JBQU0sRUFBQyxXQUFXLGNBQWMsUUFBUSxlQUFlLFFBQU8sSUFBSTtBQUNsRSxjQUFJLFdBQVcsY0FBYyxRQUFRLGVBQWUsSUFBSSxNQUFNLGNBQWMsTUFBTSxFQUFFLEtBQUssSUFBSSxHQUFHLE9BQU8sRUFDbEc7QUFBQSxZQUNHLGFBQVc7QUFDVCxrQkFBSSxRQUFRLEtBQUssT0FBSyxFQUFFLENBQUMsTUFBTSxLQUFLLEdBQUc7QUFDckMsNEJBQVksRUFBQyxNQUFNLEtBQUssa0RBQWlELENBQUM7QUFBQSxjQUM1RSxPQUFPO0FBQ0w7QUFBQSxrQkFDSSxFQUFDLE1BQU0sS0FBSyxRQUFPO0FBQUEsa0JBQ25CLDJCQUEyQixDQUFDLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBaUM7QUFBQSxnQkFBQztBQUFBLGNBQ3pGO0FBQUEsWUFDRjtBQUFBLFlBQ0EsU0FBTztBQUNMLDBCQUFZLEVBQUMsTUFBTSxJQUFHLENBQUM7QUFBQSxZQUN6QjtBQUFBLFVBQUM7QUFDVDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLEtBQUs7QUFDSCx1QkFBYSxPQUFRO0FBQ3JCLHNCQUFZLEVBQUMsS0FBSSxDQUFDO0FBQ2xCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLFNBQVMsS0FBSztBQUNaLGtCQUFZLEVBQUMsTUFBTSxJQUFHLENBQW1CO0FBQUEsSUFDM0M7QUFBQSxFQUNGOyIsCiAgIm5hbWVzIjogWyJqb2luIiwgIndhc20iLCAid2FzbSIsICJ3YXNtIiwgInJlYWRGaWxlIiwgInJlYWRGaWxlIiwgIndhc20iLCAidGVuc29yIiwgImVycm9yQ29kZSIsICJpIl0KfQo=\n';
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
          const message = { type: "create", in: { model, options: { ...options } } };
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