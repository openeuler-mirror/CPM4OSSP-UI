<template>
  <div id="canvas-box">
    <canvas id="canvas" />
    <p id="waiting-text">加载中...</p>
    <defs>
      <filter id="shadowed-goo">
        <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
        <feGaussianBlur in="goo" stdDeviation="3" result="shadow" />
        <feColorMatrix in="shadow" mode="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 -0.2" result="shadow" />
        <feOffset in="shadow" dx="1" dy="1" result="shadow" />
        <feBlend in2="shadow" in="goo" result="goo" />
        <feBlend in2="goo" in="SourceGraphic" result="mix" />
      </filter>
      <filter id="goo">
        <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
        <feBlend in2="goo" in="SourceGraphic" result="mix" />
      </filter>
    </defs>
  </div>
</template>

<script>
export default {
  mounted() {
    this.initCanvas()
  },
  methods: {
    initCanvas() {
      var canvas = document.getElementById('canvas')
      var ctx = canvas.getContext('2d')
      var particle = []
      var angle = Math.PI / 4
      canvas.width = 600
      canvas.height = 600
      var width = canvas.width
      var height = canvas.height

      function getRandomInt(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1))
      }

      function retinaReady() {
        var pixelRatio = window.devicePixelRatio || 1
        var backingStore = ctx.webkitBackingStorePixelRatio || 1
        var ratio = pixelRatio / backingStore
        if (pixelRatio !== backingStore) {
          var oldWidth = canvas.width
          var oldHeight = canvas.height
          canvas.width = oldWidth * ratio
          canvas.height = oldHeight * ratio
          canvas.style.width = oldWidth + 'px'
          canvas.style.height = oldHeight + 'px'
          ctx.scale(window.ratio, window.ratio)
        }
      }
      retinaReady()
      function run(a) {
        // 半径
        var r = 90
        var x = r * Math.sin(a) + width / 2
        var y = r * Math.cos(a) + ((height / 2) - 80)
        var p
        p = new Particle(x, y)
        particle.push(p)
      }

      function Particle(x, y) {
        this.x = x
        this.y = y
        this.r = getRandomInt(10, 10)
        this.v = {
          x: 0,
          y: 0
        }
        this.a = {
          x: 0,
          y: 0
        }
        this.al = 1
      }

      Particle.prototype.update = function() {
        this.a.x = getRandomInt(-0.001, 0.001)
        this.a.y = getRandomInt(0.01, 0.02)
        this.v.x += this.a.x
        this.v.y += this.a.y
        this.x += this.v.x
        this.y += this.v.y

        if (this.r >= 0.01) {
          this.r -= 0.2
          this.al -= 0.001
        } else {
          this.r = 0
          this.al = 0
        }
      }
      Particle.prototype.draw = function() {
        ctx.fillStyle = 'rgba(94,156,231,' + this.al + ')'
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false)
        ctx.fill()
      }
      function animate() {
        ctx.clearRect(0, 0, width, height)
        run(angle)
        requestAnimationFrame(animate)
        for (var j = 0; j < particle.length; j++) {
          var p = particle[j]
          p.update()
          p.draw()
        }

        if (angle <= 2 * Math.PI) {
          angle += 0.04
        } else {
          angle = 0
        }
      }
      animate()
    }
  }
}
</script>

<style scoped lang="scss">
#canvas-box {
    display: none;
    height: 100%;
    width: 100%;
    position: absolute;
    background-color: rgba($color: #c0c0c0, $alpha: 0.5);
    z-index: 9999;
    top: 0;
    left: 0;
}
#canvas {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    display: block;
    filter: url("#shadowed-goo");
}
#waiting-text{
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 200%);

}
</style>
