<template>
  <div style="height:calc(100% - 30px);">
    <pre class="term">
      {{ upgardeRes }}
    </pre>
  </div>
</template>

<script>
export default {
  props: {
    upgardeRes: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
.term{
  width: 100%;
  height: 100%;
  padding: 5px;
  border: 1px dashed #888585;
  border-radius: 5px;
  white-space: pre-wrap;
}
</style>
