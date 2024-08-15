export default class FilesController {
  constructor (config = {}) {
    this.useCases = config.useCases

    if (!this.useCases) { throw new Error('Uses cases must be provided when instantiate a Controller') }

    this.handleError = config.errorHandler.handleCtxError

    // Bind function to this class.
    this.uploadFile = this.uploadFile.bind(this)
    this.getFiles = this.getFiles.bind(this)
    this.getFile = this.getFile.bind(this)
  }

  /**
 * @api {post} /files Upload file.
 * @apiPermission user
 * @apiName UploadFile
 * @apiGroup File
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Authorization: Bearer <JWT Token>" --form upload=@image.jpeg localhost:5001/files
 *
 * @apiParam {FILE} File to upload.
 *
 * @apiSuccess {String}   CID  content id.
 *
 */
  async uploadFile (ctx) {
    try {
      const file = ctx.request.files.file || ctx.request.files.upload

      const result = await this.useCases.files.uploadFile({ file })
      ctx.body = result
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
 * @api {get} /files Get Files
 * @apiPermission user
 * @apiName GetFiles
 * @apiGroup File
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/files
 *
 */
  async getFiles (ctx) {
    try {
      const files = await this.useCases.files.getFiles()
      ctx.body = files
    } catch (error) {
      this.handleError(ctx, error)
    }
  }

  /**
 * @api {get} /files/:id Get File.
 * @apiPermission user
 * @apiName GetFile
 * @apiGroup File
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <JWT Token>" -X GET localhost:5001/files/<id>
 *
 */
  async getFile (ctx) {
    try {
      const file = await this.useCases.files.getFile(ctx.params)
      ctx.body = file
    } catch (error) {
      this.handleError(ctx, error)
    }
  }
}
