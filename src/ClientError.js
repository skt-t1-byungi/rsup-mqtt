export default class ClientError extends Error {
    constructor (code, message) {
        super(message)
        this.code = code
        this.is = code => this.code === code
        this.occurred = () => this.code !== 0
    }
}
