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
    <div v-if="status === 'playing'">
      <button @click="reset">Stop</button>
    </div>
  </div>
</template>

<!--/////////////////////////////////////////////////////////////////////////-->

<script>
import Cell from '@/components/Cell'

const PLAYING = 'playing'
const LOSE = 'you lose'
const WIN = 'you win'

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
      total_checked: 0
    }
  },
  mounted() {
    window.reveal = this.revealRemainingBombs
  },
  computed: {
    is_final_cell() {
      return this.total_cells - this.total_bombs === this.total_checked
    },
    total_cells() {
      return this.rows * this.cols
    },
    total_bombs() {
      return this.matrix.reduce((acc, row) => {
        return acc + row.reduce((acc, col) => {
          return col ? acc + 1 : acc
        }, 0)
      }, 0)
    }
  },
  methods: {
    reset() {
      this.status = null
      this.grid = null
      this.matrix = null
    },
    startNewGame() {
      this.grid = this.generateMatrix(this.rows, this.cols)
      this.matrix = this.generateBombMatrix(this.difficulty)
      this.total_checked = 0
      this.status = PLAYING
    },
    revealRemainingBombs() {
      this.grid = this.grid.map((row, row_index) => {
        return row.map((col, col_index) => {
          return this.matrix[row_index][col_index]
            ? 'X'
            : col
        })
      })
    },
    generateMatrix(rows, cols) {
      return [
        ...new Array(+rows).fill([
          ...new Array(+cols).fill('_')
        ])
      ]
    },
    generateBombMatrix(difficulty) {
      const dec = difficulty / 10
      const matrix = this.grid.map(row => {
        return row.map(item => {
          return Math.round(Math.random() <= dec) ? 1 : 0
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
      if (this.status === LOSE) return
      const cell = this.getCell(row, col)
      this.setCell(row, col, cell.new_value)
      if (cell.bomb) {
        this.status = LOSE
        return this
      }
      if (this.is_final_cell) {
        this.status = WIN
        this.revealRemainingBombs()
        return this
      }
      if (!cell.new_value) {
        cell.surrounding_coords.map(point => {
          if (this.grid[point[0]][point[1]] === '_') {
            this.checkCell({ row: point[0], col: point[1] })
          }
        })
      }
      return this
    },
    getCell(row, col) {
      const bomb = this.matrix[row][col]
      const surrounding_coords = this.getSurroundingCoords(row, col)
      const new_value = bomb
        ? 'X'
        : this.getSurroundingsCount(surrounding_coords)
      return {
        bomb,
        surrounding_coords,
        new_value
      }
    },
    getSurroundingCoords(row, col) {
      const surroundings = [
        [row - 1, col - 1],
        [row - 1, col],
        [row - 1, col + 1],
        [row, col + 1],
        [row + 1, col + 1],
        [row + 1, col],
        [row + 1, col - 1],
        [row, col - 1]
      ].filter(item => {
        return item[0] > -1
          && item[1] > -1
          && item[0] < this.matrix.length
          && item[1] < this.matrix[0].length
      })
      return surroundings
    },
    getSurroundingsCount(coords) {
      const bombsCount = coords.reduce((acc, item) => {
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
.main {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
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
