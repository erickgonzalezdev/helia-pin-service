// Mocks for helia-ipfs-node module

class HeliaNodeMock {
  constructor () {}
  async start () {}

  async pinCid(){ return 'cid'}
  async uploadFile(){ return 'cid'}
}

class HeliaServerMock {
  constructor () {}
  async start () {}
}


const  FileMock = {
  size : 1,
  mimetype: 'text/plain',
  path :'some path',
  name : 'text.txt'
}

export { HeliaNodeMock, HeliaServerMock , FileMock }
