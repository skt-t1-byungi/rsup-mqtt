export default function (paho, pahoOpts = {}) {
  return new Promise((resolve, reject) => {
    paho.connect({
      ...pahoOpts,
      onSuccess: resolve,
      onFailure: error => reject(error)
    })
  })
}
