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

export { validator }