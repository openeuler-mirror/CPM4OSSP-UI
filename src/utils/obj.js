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