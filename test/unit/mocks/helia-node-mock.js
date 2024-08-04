// Mocks for helia-ipfs-node module

class HeliaNodeMock {
  constructor (config = {}) { this.condig = config }
  async start () {}

  async pinCid () { return 'cid' }
  async uploadFile () { return 'cid' }
}

class HeliaServerMock {
  constructor (config = {}) { this.condig = config }
  async start () {}
}

const FileMock = {
  size: 1,
  mimetype: 'text/plain',
  path: 'some path',
  name: 'text.txt'
}

export { HeliaNodeMock, HeliaServerMock, FileMock }
