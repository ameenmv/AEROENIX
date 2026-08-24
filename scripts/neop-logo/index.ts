import chalk from 'chalk'

const N = [
  '▄████▄ ',
  '██  ██ ',
  '██  ██ ',
  '██  ██ ',
  '       ',
]

const E = [
  ' ▄███▄ ',
  '██▄▄▄██',
  '██▀▀▀▀ ',
  ' ▀███▀ ',
  '       ',
]

const O = [
  ' ▄███▄ ',
  '███████',
  '███████',
  ' ▀███▀ ',
  '       ',
]

const P = [
  '▄████▄ ',
  '██  ██ ',
  '█████▀ ',
  '██     ',
  '██     ',
]

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function renderAnimatedLogo(): Promise<void> {
  const ROWS = 5
  const SIDE_PAD = '  '

  console.log()
  console.log() // Spacing

  const letters = [
    { art: N, color: chalk.whiteBright },
    { art: E, color: chalk.whiteBright },
    { art: O, color: chalk.red },
    { art: P, color: chalk.whiteBright },
  ]

  // We will print character by character.
  // Frame 1: N
  // Frame 2: NE
  // Frame 3: NEO
  // Frame 4: NEOP
  for (let frame = 1; frame <= letters.length; frame++) {
    // If not the first frame, move cursor up ROWS to overwrite
    if (frame > 1) {
      process.stdout.write(`\x1B[${ROWS}A`)
    }

    for (let r = 0; r < ROWS; r++) {
      let line = SIDE_PAD
      for (let i = 0; i < frame; i++) {
        const letter = letters[i]
        line += `${letter.color(letter.art[r])} `
      }
      // Print the line. We use clear to the end of the line just in case, though it's growing.
      console.log(`${line}\x1B[0K`)
    }

    await sleep(150) // Delay between letters
  }

  console.log() // Bottom spacing
}
