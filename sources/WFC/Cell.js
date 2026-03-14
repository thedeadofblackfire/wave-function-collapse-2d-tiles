export default class Cell
{
    collapsed = false
    needsCheck = false

    constructor(random, index, x, y)
    {
        this.random = random
        this.index = index
        this.x = x
        this.y = y

        this.neighbours = { yNeg: null, yPos: null, xNeg: null, xPos: null }
    }

    setModules(modules)
    {
        this.modules = [...modules.values()]
    }

    collapse(module = null)
    {
        this.collapsed = true

        // Forced module
        if(module !== null)
        {
            if(!this.modules.includes(module))
            {
                console.log('module', module, 'not available in', this.modules)
            }
            else
            {
                this.modules = [module]
            }
        }

        // Random module
        else
        {
            const randomIndex = Math.floor(this.random.next() * this.modules.length)

            this.modules = [this.modules[randomIndex]]
            if(this.x === 0 && this.y === 2)
            {
                console.log(this.modules[randomIndex])
                console.log(this.modules)
            }
        }

        this.propagate()
    }

    propagate()
    {
        const queue = [this]
        const oppositeDirections = { xPos: 'xNeg', xNeg: 'xPos', yPos: 'yNeg', yNeg: 'yPos' }

        while(queue.length > 0)
        {
            const currentCell = queue.shift()

            for(const direction in currentCell.neighbours)
            {
                const neighbour = currentCell.neighbours[direction]

                if(neighbour && !neighbour.collapsed)
                {
                    const oppositeDirection = oppositeDirections[direction]
                    const filteredModules = []

                    for(const neighbourModule of neighbour.modules)
                    {
                        let isCompatible = false
                        for(const currentModule of currentCell.modules)
                        {
                            if(neighbourModule.check(oppositeDirection, currentModule.sockets[direction]))
                            {
                                isCompatible = true
                                break
                            }
                        }

                        if(isCompatible)
                            filteredModules.push(neighbourModule)
                    }

                    if(filteredModules.length < neighbour.modules.length)
                    {
                        neighbour.modules = filteredModules
                        if(!queue.includes(neighbour))
                            queue.push(neighbour)
                    }
                }
            }
        }
    }
}