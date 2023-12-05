const { customAlphabet } = require('nanoid')

export const renderUid = () => {
    return customAlphabet(
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        32
    )
}
