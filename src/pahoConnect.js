import deepExtend from 'deep-extend'

export default function (paho, opts = {}) {
    return new Promise((resolve, reject) => {
        paho.connect(
            deepExtend(opts, {
                onSuccess: resolve,
                onFailure: error => reject(error)
            })
        )
    })
}
