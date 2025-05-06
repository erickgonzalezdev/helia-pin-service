// Mocks for helia-ipfs-node module

// Mocks for libp2p js package node module.
class Pubsub {
  constructor (config) { this.config = config }

  async subscribe () { return true }
  async publish () { return true }
  async addEventListener () { return true }
}
class ContentRoutingMock {
  constructor (config) { this.config = config }

  async findProviders () { return true }
  async getConnections () { return [] }
}

class Libp2pMock {
  constructor () {
    this.contentRouting = new ContentRoutingMock()
    this.services = {
      pubsub: new Pubsub()
    }
    this.addEventListener = () => {}
  }

  getMultiaddrs () { return [] }
  async dial () { return true }
  async getConnections () { return [] }
  async handle () { return true }
}

class HeliaNodeMock {
  constructor (config = {}) {
    this.peerId = 'testPeerId'
    this.config = config
    this.helia = {
      libp2p: new Libp2pMock(),
      gc: () => {}
    }
    this.opts = {
    }
    this.addresses = ['/ip4/127.0.0.1/tcp/4001/p2p/QmHash']
  }

  async start () {}

  async pinCid () { return 'cid' }
  async unPinCid () { return 'cid' }
  async uploadFile () { return 'cid' }
  async getDiskSize () { return 0 }
  async getStat () { return { fileSize: 10 } }
  async lazyDownload () { return 'cid' }
  async getContent () { return 'cid' }
}

class PinRPCMock {
  constructor (config = {}) {
    this.config = config
  }

  async start () {}

  async requestRemotePin () { return 'cid' }
  async requestRemoteUnpin () { return 'cid' }
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

export { HeliaNodeMock, HeliaServerMock, PinRPCMock, FileMock }
