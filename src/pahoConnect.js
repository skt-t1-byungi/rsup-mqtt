import xtend from 'xtend/immutable'

export default function (paho, opts = {}) {
    return new Promise((resolve, reject) => {
        paho.connect(
            xtend(opts, {
                onSuccess: resolve,
                onFailure: error => reject(error)
            })
        )
    })
}
