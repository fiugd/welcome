import fs from 'fs/promises'
import path from 'path'
import { instructionSet } from './instructionSet.mjs'

const dataPath = path.resolve('./data.mjs')

function encodeDataURI(data) {
    const flatData = data.flat() // Flatten 2D array
    const binaryBuffer = Buffer.from(flatData) // Create binary-safe buffer
    return `data:application/octet-stream;base64,${binaryBuffer.toString(
        'base64'
    )}`
}

function decodeDataURI(uri) {
    const base64 = uri.split(',')[1] // Extract Base64 part of Data URI
    const binaryBuffer = Buffer.from(base64, 'base64') // Decode Base64
    const bytes = [...binaryBuffer] // Convert buffer to array of bytes
    const array = []
    while (bytes.length) array.push(bytes.splice(0, 128)) // Chunk into 128x128 array
    return array.slice(0, 128) // Ensure the array stays 128x128
}

// Helper function: convert a large byte array to a string in chunks
function arrayToString(byteArray) {
    const chunkSize = 10000 // Process in chunks to avoid stack overflow
    let result = ''
    for (let i = 0; i < byteArray.length; i += chunkSize) {
        let chunk = byteArray.slice(i, i + chunkSize)
        result += String.fromCharCode(...chunk)
    }
    return result
}

function interpretData(data) {
    let result = ''
    let storage = ''
    const stack = []

    // Process the data into storage and stack
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; ) {
            const byte = data[i][j]

            // ASCII values (32-127) are stored as characters
            if (byte >= 32 && byte <= 127) {
                storage += String.fromCharCode(byte)
                j++
                continue
            }

            if (
                byte >= 128 &&
                byte <= 128 + Object.keys(instructionSet).length
            ) {
                // Treat bytes outside ASCII range as operations
                stack.push({
                    operation: byte,
                    arg1: data[i][j + 1] & 0b00000111,
                    arg2: data[i][j + 2] & 0b00000111,
                })
                j += 3
                continue
            }
            j++
        }
    }

    console.log({ storage: storage.length, stack: stack.length })

    // Execute the instructions from the stack
    while (stack.length > 0) {
        const { operation, arg1, arg2 } = stack.pop()

        // Decode operation into opcode and arguments
        // const opcode = (operation & 0b11100000) >> 5 // First 3 bits for opcode
        // const arg1 = (operation & 0b00011000) >> 3 // Next 2 bits for first argument
        // const arg2 = operation & 0b00000111 // Last 3 bits for second argument
        const opcode = operation & 0b00000111

        // Safeguard arguments to avoid out-of-range issues
        const safeArg1 = Math.min(arg1, storage.length - 1)
        const safeArg2 = Math.min(arg2, storage.length - 1)

        // Execute the corresponding instruction
        // console.log(
        //     `operation: ${operation} - [${opcode}](${safeArg1}, ${safeArg2})`
        // )
        if (instructionSet[opcode]) {
            const resultObj = {
                result,
                storage,
            }
            instructionSet[opcode](safeArg1, safeArg2, storage, resultObj)
            result = resultObj.result
        } else {
            console.log(`Unsupported operation: ${opcode}`)
        }
    }

    return result
}

// Randomly mutate a single byte
// function mutateByte(byte) {
//     return (byte + (Math.random() > 0.5 ? 1 : -1)) & 0xff // Ensure byte stays within 0-255
// }
function mutateByte(byte) {
    // return byte
    if (byte >= 32 && byte <= 127) {
        return byte
        const byteChange = Math.random() < 0.5 ? 10 : -10
        let newByte = byte + byteChange
        // Handle overflow by wrapping around
        if (newByte > 127) {
            newByte = 32 + (newByte - 127 - 1) // Wrap to the lower end of range
        } else if (newByte < 32) {
            newByte = 127 - (32 - newByte - 1) // Wrap to the upper end of range
        }
        return newByte
    }
    if (Math.random() < 0.95) {
        return byte
    }
    return Math.floor(Math.random() * Object.keys(instructionSet).length) + 128
}

async function saveGridAsPPM(grid, filePath) {
    const width = grid.length
    const height = grid[0].length

    // Header for PPM file
    const header = `P3\n${width} ${height}\n255\n`

    // Generate pixel data
    let pixelData = ''
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = grid[y][x] & 0xff // Ensure value is 0–255
            pixelData += `${value} ${value} ${value} ` // Grayscale (R=G=B)
        }
        pixelData += '\n'
    }

    // Combine header and pixel data
    const ppmContent = header + pixelData

    // Write to file
    await fs.writeFile(filePath, ppmContent, 'utf8')
    //console.log(`PPM image saved to ${filePath}`)
}

async function mutateAndInterpret() {
    let dataUri

    // Dynamically import the data module
    try {
        ;({ dataUri } = await import(`file://${dataPath}?t=${Date.now()}`))
    } catch (e) {}

    // Decode Data URI or initialize new array if no data exists
    const data =
        (dataUri && decodeDataURI(dataUri)) ||
        Array.from({ length: 128 }, () =>
            Array.from({ length: 128 }, () => Math.floor(Math.random() * 256))
        )

    dataUri = dataUri || encodeDataURI(data)

    // Initialize mutationCounts to track mutations
    const mutationCounts = Array.from({ length: 128 }, () =>
        Array.from({ length: 128 }, () => 0)
    )

    const interpreted = interpretData(data)

    if (interpreted.trim()) {
        const totalBytes = 128 * 128
        const maxMutationsPerByte = 5 // Limit how often a single byte can mutate

        const mutatedData = data.map((row, rowIndex) =>
            row.map((byte, colIndex) => {
                // Calculate mutation likelihood based on local mutation count
                const mutationLikelihood =
                    1 - mutationCounts[rowIndex][colIndex] / maxMutationsPerByte

                // Allow mutation if within likelihood threshold
                if (Math.random() < mutationLikelihood) {
                    mutationCounts[rowIndex][colIndex]++
                    return mutateByte(byte)
                }
                return byte
            })
        )

        // Ensure mutated data remains 128x128
        const truncatedData = mutatedData
        // .slice(0, 128)
        // .map((row) => row.slice(0, 128))

        // Encode the mutated data back into a Data URI
        const mutatedDataURI = encodeDataURI(truncatedData)

        await saveGridAsPPM(truncatedData, './grid.ppm')

        // console.log({
        //     source: data[0].slice(0, 10),
        //     mutated: mutatedData[0].slice(0, 10),
        //     sourceURI: dataUri.slice(30, 60),
        //     mutatedURI: mutatedDataURI.slice(30, 60),
        // })

        // Write the mutated data back to the data module
        const dataModuleContent = `export const dataUri = \`${mutatedDataURI}\`;\n`
        await fs.writeFile(dataPath, dataModuleContent)
    }

    // Interpret the mutated data
    return interpreted.trim() || 'no results'
}

;(async () => {
    const interpretation = await mutateAndInterpret()
    console.log({ interpretation, length: interpretation.length / 128 })
})()
