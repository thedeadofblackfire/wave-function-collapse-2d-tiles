export default class UI
{
    constructor(solver)
    {
        this.solver = solver

        // DOM Elements
        this.$ui = document.querySelector('.js-ui')
        this.$grid = this.$ui.querySelector('.js-grid')
        this.$resetButton = this.$ui.querySelector('.js-reset-button')
        this.$solveButton = this.$ui.querySelector('.js-solve-button')
        this.$progressiveSolveButton = this.$ui.querySelector('.js-progressive-solve-button')
        this.$stepButton = this.$ui.querySelector('.js-step-button')
        this.$seedInput = this.$ui.querySelector('.js-seed-input')

        this.options = {
            lowestEntropies: false,
            lastChange: false,
            entropy: false,
            xy: false,
            availableModules: false
        }

        this.$optionLowestEntropies = this.$ui.querySelector('.js-option-lowest-entropies')
        this.$optionLastChange = this.$ui.querySelector('.js-option-last-change')
        this.$optionEntropy = this.$ui.querySelector('.js-option-entropy')
        this.$optionXy = this.$ui.querySelector('.js-option-xy')
        this.$optionAvailableModules = this.$ui.querySelector('.js-option-available-modules')

        // lines and cells
        this.cells = []

        for(let y = 0; y < this.solver.grid.height; y++)
        {
            const $line = document.createElement('div')
            $line.classList.add('line')
            this.$grid.append($line)

            for(let x = 0; x < this.solver.grid.width; x++)
            {
                const cell = {}
                cell.instance = this.solver.grid.cells[this.solver.grid.coordToIndex(x, y)]
                
                cell.$container = document.createElement('div')
                cell.$container.classList.add('cell')
                $line.append(cell.$container)

                cell.$content = document.createElement('div')
                cell.$content.classList.add('content')
                cell.$container.append(cell.$content)

                cell.$container.addEventListener('click', () => {
                    if(!cell.instance.collapsed && !this.solver.solved)
                    {
                        cell.instance.collapse()
                        this.solver.dispatchEvent(new CustomEvent('collapse', { detail: { cell: cell.instance } }))
                        this.solver.dispatchEvent(new CustomEvent('step'))
                        this.update()
                    }
                })

                this.cells.push(cell)
            }
        }

        // Interactions
        this.$resetButton.addEventListener('click', () =>
        {
            if (this.progressiveSolve.timeout) {
                window.clearTimeout(this.progressiveSolve.timeout)
                this.progressiveSolve.running = false
            }
            this.solver.reset()
            for(let i = 0; i < this.cells.length; i++) {
                this.cells[i].instance = this.solver.grid.cells[i]
            }
            this.update()
        })

        this.$solveButton.addEventListener('click', () =>
        {
            this.solver.solve()
            this.update()
        })

        this.$progressiveSolveButton.addEventListener('click', () =>
        {
            this.progressiveSolve.start()
        })

        this.$stepButton.addEventListener('click', () =>
        {
            this.solver.step()
            this.update()
        })

        this.$seedInput.addEventListener('input', () =>
        {
            this.solver.seed = this.$seedInput.value
        })

        this.$optionLowestEntropies.addEventListener('change', () => { this.options.lowestEntropies = this.$optionLowestEntropies.checked; this.update() })
        this.$optionLastChange.addEventListener('change', () => { this.options.lastChange = this.$optionLastChange.checked; this.update() })
        this.$optionEntropy.addEventListener('change', () => { this.options.entropy = this.$optionEntropy.checked; this.update() })
        this.$optionXy.addEventListener('change', () => { this.options.xy = this.$optionXy.checked; this.update() })
        this.$optionAvailableModules.addEventListener('change', () => { this.options.availableModules = this.$optionAvailableModules.checked; this.update() })

        this.setProgressiveSolve()

        this.solver.addEventListener('collapse', (event) => {
            this.lastCollapsedCell = event.detail.cell
        })

        // Update
        this.update()
    }

    setProgressiveSolve()
    {
        this.progressiveSolve = {}
        this.progressiveSolve.running = false
        this.progressiveSolve.duration = 50
        this.progressiveSolve.timeout = null
        this.progressiveSolve.update = () =>
        {
            if(!this.solver.solved)
            {
                this.solver.step()
                this.update()

                this.progressiveSolve.timeout = window.setTimeout(this.progressiveSolve.update, this.progressiveSolve.duration)
            }
            else
            {
                this.progressiveSolve.running = false
            }
        }
        this.progressiveSolve.start = () =>
        {
            this.progressiveSolve.running = true
            this.progressiveSolve.update()
        }
        this.progressiveSolve.pause = () =>
        {

        }
    }

    update()
    {
        const lowestEntropyCells = this.solver.grid.getSmallestEntropyCells() || []

        for(const cell of this.cells)
        {
            if(cell.instance.collapsed)
            {
                cell.$container.style.backgroundImage = `url(${cell.instance.modules[0].data.tileSource})`
            }

            if(this.options.lowestEntropies && !cell.instance.collapsed && lowestEntropyCells.includes(cell.instance))
            {
                cell.$container.classList.add('is-lowest-entropy')
            }
            else
            {
                cell.$container.classList.remove('is-lowest-entropy')
            }

            if(this.options.lastChange && this.lastCollapsedCell === cell.instance)
            {
                cell.$container.classList.add('is-last-change')
            }
            else
            {
                cell.$container.classList.remove('is-last-change')
            }

            let contentHtml = ''
            if(!cell.instance.collapsed)
            {
                if(this.options.entropy)
                {
                    contentHtml += `<div>E: ${cell.instance.modules.length}</div>`
                }

                if(this.options.availableModules)
                {
                    contentHtml += `<div class="available-modules">`
                    for(const module of cell.instance.modules)
                    {
                        contentHtml += `<div class="available-module" style="background-image: url(${module.data.tileSource})"></div>`
                    }
                    contentHtml += `</div>`
                }
            }

            if(this.options.xy)
            {
                contentHtml += `<div>X: ${cell.instance.x}, Y: ${cell.instance.y}</div>`
            }

            cell.$content.innerHTML = contentHtml
        }
    }
}
