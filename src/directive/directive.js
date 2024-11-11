function checkValue(el, binding) {
  const oldClassName = 'ant-row ant-form-item'
  if (binding.value === '' || !binding.value) {
    el.className = oldClassName + ' customize'
    document.getElementsByClassName('table-form')[0]['validate'] = () => {
      return false
    }
  } else {
    el.className = oldClassName
    document.getElementsByClassName('table-form')[0]['validate'] = () => {
      return true
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


function loading(value) {
  let type = typeof value
  if (type !== 'boolean') {
    console.error(new Error(`Expected a Boolean value but got one ${type}`))
  }
  let canvasId = document.getElementById('canvas-box')
  if (!!value) {
    canvasId.style.display = 'block'
  } else {
    canvasId.style.display = 'none'
  }
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