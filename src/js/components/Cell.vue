<template>
  <div class="cell">
    <button @click="emitClick">{{ data.cell }}</button>
  </div>
</template>

<!--/////////////////////////////////////////////////////////////////////////-->

<script>
export default {
  name: 'cell',
  props: {
    data: Object
  },
  methods: {
    emitClick(e) {
      this.$emit('click', {
        row: this.data.row_index,
        col: this.data.cell_index
      })
    }
  }
}
</script>

<!--/////////////////////////////////////////////////////////////////////////-->

<style scoped lang="scss">
.cell {
  display: inline-block;
}
</style>
