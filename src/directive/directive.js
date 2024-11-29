const CUSTOMIZE_CLASS_NAME = 'customize';
let formElementCache;

function checkValue(el, binding) {
  if (!formElementCache) {
    formElementCache = document.getElementsByClassName('table-form')[0];
    if (!formElementCache) {
      console.error('Element with class "table-form" not found');
      return;
    }
  }

  if (!binding.value) {
    el.classList.add(CUSTOMIZE_CLASS_NAME);
    formElementCache['validate'] = () => {
      return false;
    }
  } else {
    el.classList.remove(CUSTOMIZE_CLASS_NAME);
    formElementCache['validate'] = () => {
      return true;
    }
  }
}

let validator = {
  inserted: function(el, binding) {
    checkValue(el, binding)
  },
  update: function(el, binding) {
    checkValue(el, binding)
  }
}


function isBoolean(value) {
  return typeof value === 'boolean';
}

let cachedCanvasId = null;

/**
 * 控制加载状态的显示与隐藏
 * @param {boolean} value - 是否显示加载状态
 * @param {function} [onError] - 错误处理回调函数
 */
function loading(value, onError) {
  if (!isBoolean(value)) {
    const error = new Error(`Expected a Boolean value but got one ${typeof value}`);
    console.error(error);
    if (onError && typeof onError === 'function') {
      onError(error);
    }
    return;
  }
  if (!cachedCanvasId) {
    cachedCanvasId = document.getElementById('canvas-box');
  }
  cachedCanvasId.style.display = value ? 'block' : 'none';
}

let waiting = {
  inserted: function(el, binding) {
    loading(binding.value.value)
    let waitingText = document.getElementById('waiting-text')
    binding.value.text && (waitingText.innerText = binding.value.text)
    /*
	 *  参数详解:
	 *	upTime			上移的时间
	 *	downTime		下落的时间
	 *	beatHeight		上移高度
	 *	isAuth			是否自动
	 *	isRotate		是否旋转
	*/
    window.$(waitingText).beatText({ isAuth: true, beatHeight: '1em', isRotate: false, upTime: 100, downTime: 100 })
  },
  update: function(el, binding) {
    loading(binding.value.value)
    let waitingText = document.getElementById('waiting-text')
    binding.value.text && (waitingText.innerText = binding.value.text)
    window.$(waitingText).beatText({ isAuth: true, beatHeight: '1em', isRotate: false, upTime: 100, downTime: 100 })
  }
}

export { validator, waiting }