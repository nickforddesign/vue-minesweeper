<template>
  <div class="main">
    <div class="row" v-for="(row, row_index) in this.grid" :key="row_index">
      <cell
        v-for="(cell, cell_index) in row"
        @click="checkCell"
        :key="cell_index"
        :data="{
          cell,
          row_index,
          cell_index
        }" />
    </div>
    <h2>{{ status }}</h2>
    <div v-if="!status">
      <div>
        <label>
          <div>Difficulty</div>
          <select v-model="difficulty">
            <option value="2" selected>2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          <div>Rows</div>
          <select v-model="rows">
            <option value="5" selected>5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          <div>Columns</div>
          <select v-model="cols">
            <option value="5" selected>5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
          </select>
        </label>
      </div>
      <button @click="startNewGame">Play Minesweeper</button>
    </div>
    <div v-if="status && status.includes('you')">
      <button @click="startNewGame">Start Over</button>
    </div>
    <!-- <pre>{{this.grid}}</pre> -->
  </div>
</template>

<!--/////////////////////////////////////////////////////////////////////////-->

<script>
import Cell from '@/components/Cell'

export default {
  name: 'game',
  data() {
    return {
      difficulty: 2,
      rows: 5,
      cols: 5,
      status: null,
      grid: null,
      matrix: null,
      total_bombs: 0,
      total_cells: 0,
      total_checked: 0
    }
  },
  methods: {
    startNewGame() {
      this.grid = this.generateMatrix(this.rows, this.cols)
      this.matrix = this.generateBombMatrix(this.difficulty)
      this.total_bombs = this.getTotalBombs()
      this.total_cells = this.getTotalCells()
      this.total_checked = 0
      this.status = 'playing'
    },
    revealRemainingBombs() {
      this.grid = this.grid.map(row => {
        return row.map(col => {
          return col === '_'
            ? 'X'
            : col
        })
      })
    },
    getTotalBombs() {
      return this.matrix.reduce((acc, row) => {
        return acc + row.reduce((acc, col) => {
          return col ? acc + 1 : acc
        }, 0)
      }, 0)
    },
    getTotalCells() {
      return this.rows * this.cols
    },
    generateMatrix(rows, cols) {
      const matrix = []
      for (let i = 0; i < rows; i++) {
        matrix.push([])
        for (let j = 0; j < cols; j++) {
          matrix[i].push('_')
        }
      }
      return matrix
    },
    generateBombMatrix(difficulty) {
      const dec = difficulty / 10
      const matrix = this.grid.map(row => {
        return row.map(item => {
          item = 0
          if (Math.round(Math.random() <= dec)) {
            item = 1
          }
          return item
        })
      })
      return matrix
    },
    setCell(row, col, value) {
      const current_row = [...this.grid[row]]
      current_row[col] = value
      this.total_checked++
      this.$set(this.grid, row, current_row)
    },
    checkCell({ row, col }) {
      if (this.status === 'lose') return
      const selectedRow = this.matrix[row]
      const selectedSpot = selectedRow[col]
      if (selectedSpot) {
        this.setCell(row, col, 'X')
        this.status = 'you lose'
        return this
      }
      // spot clicked
      const count = this.lookAround(row, col, selectedSpot)
      this.setCell(row, col, count)
      if (this.total_cells - this.total_bombs === this.total_checked) {
        this.status = 'you win'
        this.revealRemainingBombs()
        return this
      }
      if (!count) {
        const surroundings = this.getSurroundings(row, col)
        surroundings.map(point => {
          if (this.grid[point[0]][point[1]] === '_') {
            this.checkCell({ row: point[0], col: point[1] })
          }
        })
      }
      return this
    },
    getSurroundings(row, col) {
      let surroundings = [
        [row - 1, col - 1],
        [row - 1, col],
        [row - 1, col + 1],
        [row, col + 1],
        [row + 1, col + 1],
        [row + 1, col],
        [row + 1, col - 1],
        [row, col - 1]
      ]
      surroundings = surroundings.filter(item => {
        return item[0] >= 0
          && item[1] >= 0
          && item[0] < this.matrix.length
          && item[1] < this.matrix[0].length
      })
      return surroundings
    },
    lookAround(row, col, value) {
      const surroundings = this.getSurroundings(row, col)
      const bombsCount = surroundings.reduce((acc, item) => {
        const spot = this.matrix[item[0]][item[1]]
        return acc + spot
      }, 0)
      return bombsCount
    }
  },
  components: {
    Cell
  }
}
</script>

<style lang="scss">
pre {
  width: 200px;
  font-family: 'Courier New', Courier, monospace;
}
.row {
  button {
    width: 25px;
  }
}
</style>
