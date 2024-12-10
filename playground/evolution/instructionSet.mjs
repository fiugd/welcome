export const instructionSet = {
    0: () => {
        /* No-op */
    },
    1: (arg1, arg2, storage, resultObj) => {
        if (
            arg1 >= 0 &&
            arg2 >= 0 &&
            arg1 < storage.length &&
            arg2 < storage.length
        ) {
            resultObj.result += storage.charAt(arg1) + storage.charAt(arg2)
            return
        }
        resultObj.result +=
            storage.charAt(0) + storage.charAt(storage.length - 1)
    },
    2: (arg1, arg2, storage, resultObj) => {
        if (arg1 >= 0 && arg1 < storage.length) {
            resultObj.result += storage.charAt(arg1)
        }
    },
    3: (arg1, arg2, storage, resultObj) => {
        if (arg1 >= 0 && arg1 < storage.length) {
            resultObj.result = storage.slice(0, arg1) + storage.slice(arg1 + 1)
        }
    },
    4: (arg1, arg2, storage, resultObj) => {
        const maxResultSize = 256
        resultObj.result += storage.slice(
            0,
            maxResultSize - resultObj.result.length
        )
        resultObj.storage = ''
    },
    5: (arg1, arg2, storage, resultObj) => {
        if (
            arg1 >= 0 &&
            arg2 >= 0 &&
            arg1 < storage.length &&
            arg2 < storage.length
        ) {
            const segment = storage
                .slice(arg1, arg2 + 1)
                .split('')
                .reverse()
                .join('')
            const maxResultSize = 256
            resultObj.result += segment.slice(
                0,
                maxResultSize - resultObj.result.length
            )
        }
    },
    6: (arg1, arg2, storage, resultObj) => {
        const randomCount = Math.min(arg1 + 1, 256 - resultObj.result.length)
        for (let k = 0; k < randomCount; k++) {
            resultObj.result += String.fromCharCode(
                Math.floor(Math.random() * 95) + 32
            )
        }
    },
    7: (arg1, arg2, storage, resultObj) => {
        if (resultObj.result.length > 0) {
            const repeatCount = Math.max(
                0,
                Math.min(arg1 + 1, 256 - resultObj.result.length)
            )
            resultObj.result += resultObj.result
                .charAt(resultObj.result.length - 1)
                .repeat(repeatCount)
        }
    },
    8: (arg1, arg2, storage, resultObj) => {
        if (
            arg1 >= 0 &&
            arg2 >= 0 &&
            arg1 < storage.length &&
            arg2 < storage.length
        ) {
            const chars = storage.split('')
            const temp = chars[arg1]
            chars[arg1] = chars[arg2]
            chars[arg2] = temp
            resultObj.storage = chars.join('')
        }
    },
    9: (arg1, arg2, storage, resultObj) => {
        if (arg1 >= 0 && arg1 < storage.length) {
            resultObj.result += storage.charAt(arg1)
        }
    },
    10: (arg1, arg2, storage, resultObj) => {
        //resultObj.storage = storage.slice(0, arg1 + 1)
    },
    11: (arg1, arg2, storage, resultObj) => {
        if (arg1 >= 0 && arg1 < storage.length) {
            resultObj.result += storage
                .charAt(arg1)
                .repeat(Math.min(arg2 + 1, 256 - resultObj.result.length))
        }
    },
}
