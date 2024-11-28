// 深拷贝简单的对象或数组
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

/**
 * 深度克隆对象(针对复杂的对象或数组)
 * @param {any} obj - 需要克隆的对象
 * @returns {any} 克隆后的对象
 */
function isObject(obj) {
  return (typeof obj === 'object' && obj !== null) || typeof obj === 'function';
}

export function deepCloneV2(obj, seen = new WeakMap()) {
  if (!isObject(obj)) {
      return obj;
  }

  if (seen.has(obj)) {
      return seen.get(obj);
  }

  let cloneObj;

  if (obj instanceof Date) {
      cloneObj = new Date(obj);
  } else if (obj instanceof RegExp) {
      cloneObj = new RegExp(obj);
  } else {
      cloneObj = Array.isArray(obj) ? [] : {};
  }

  seen.set(obj, cloneObj);

  for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
          cloneObj[key] = deepClone(obj[key], seen);
      }
  }

  return cloneObj;
}

// 数组去重
export function unique(arr) {
    return [...new Set(arr)];
  }

/**
 * 深度比较两个对象是否相等
 * @param {Object} a - 第一个对象
 * @param {Object} b - 第二个对象
 * @returns {boolean} 两个对象是否相等
 */  
export function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  
    let keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
  
    for (let key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

/**
 * 将多维数组转换为一维数组
 * @param {Array} arr - 多维数组
 * @returns {Array} 一维数组
 */
export function flattenArray(arr) {
  return arr.reduce((flat, item) => flat.concat(Array.isArray(item) ? flattenArray(item) : item), []);
}