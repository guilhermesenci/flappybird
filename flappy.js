function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')

    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHight = hight => body.style.height = `${hight}px`
}

// const b = new Barrier(true)
// b.setHight(200)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function DoubleBarrier(hight, opening, x) {
    this.element = newElement('div', 'doublebarrier')

    this.top = new Barrier(true)
    this.bottom = new Barrier(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)

    this.raffleOpening = () => {
        const topHight = Math.random() * (hight - opening)
        const bottomHight = hight - opening - topHight

        this.top.setHight(topHight)
        this.bottom.setHight(bottomHight)

    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.raffleOpening()
    this.setX(x)
}

// const b = new DoubleBarrier(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function Barriers(hight, width, opening, spaceBetween, pointAlert) {
    this.pairs = [
        new DoubleBarrier(hight, opening, width),
        new DoubleBarrier(hight, opening, width + spaceBetween),
        new DoubleBarrier(hight, opening, width + spaceBetween * 2),
        new DoubleBarrier(hight, opening, width + spaceBetween * 3),
    ]

    const displacement = 3
    this.animation = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            //animation
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + spaceBetween * this.pairs.length)
                pair.raffleOpening()
            }

            const middle = width / 2
            const acrossMiddle = pair.getX() + displacement >= middle && pair.getX() < middle
            if (acrossMiddle) pointAlert()
        })
    }
}

function Bird(gameWidth) {
    let fly = false

    this.element = newElement('img', 'bird')
    this.element.src = 'image/flappy.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => fly = true
    window.onkeyup = e => fly = false

    this.animation = () => {
        const newY = this.getY() + (fly ? 8 : -5 )
        const maxWidth = gameWidth - this.element.clientWidth

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxWidth) {
            this.setY(maxWidth)
        } else {
            this.setY(newY)
        }
    }
    this.setY(gameWidth / 2)
}

// const barrier = new Barriers(700, 1200, 200, 400)
// const bird = new Bird(700)
// const gameArea = document.querySelector('[wm-flappy]')

// gameArea.appendChild(bird.element)
// barrier.pairs.forEach(pair => gameArea.appendChild(pair.element))
// setInterval(() => {
//     barrier.animation()
//     bird.animation()
// }, 20)

function Progress() {
    this.element = newElement('span', 'progress')
    this.refreshPoint = points => {
        this.element.innerHTML = points
    }
    this.refreshPoint(0)
}

// const barrier = new Barriers(700, 1200, 200, 400)
// const bird = new Bird(700)
// const gameArea = document.querySelector('[wm-flappy]')

// gameArea.appendChild(bird.element)
// gameArea.appendChild(new Progress().element)
// barrier.pairs.forEach(pair => gameArea.appendChild(pair.element))
// setInterval(() => {
//     barrier.animation()
//     bird.animation()
// }, 20)

function overLaid(elementA, elementB) {
    const a= elementA.getBoundingClientRect()
    const b= elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left +b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top +b.height >= a.top
    return horizontal && vertical 
}

function collision(bird, barriers){
    let collision = false
    barriers.pairs.forEach(pairBarriers => {
        if (!collision) {
            const top = pairBarriers.top.element
            const bottom = pairBarriers.bottom.element
            collision = overLaid(bird.element, top) || overLaid(bird.element, bottom)
        }
    })
    return collision
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const hight = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(hight, width, 200, 400, 
        () => progress.refreshPoint(++points))
    const bird = new Bird(hight)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        //game loop
        const timer = setInterval(() => {
            barriers.animation()
            bird.animation()

            if (collision(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()