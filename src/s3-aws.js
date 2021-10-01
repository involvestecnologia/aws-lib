'use_strict'

const fs = require('fs')
const path = require('path')
const { s3 } = require('./aws-client')

class S3Aws {
  static createBucket (name) {
    const params = {
      Bucket: name
    }

    return s3.createBucket(params).promise()
  }

  static deleteBucket (name) {
    const params = {
      Bucket: name
    }

    return s3.deleteBucket(params).promise()
  }

  static async deleteAnyFilesInBucket (bucketName) {
    const files = await this.listFilesInBucket(bucketName)

    if (!files.length) return

    const objects = files.map((key) => ({ Key: key }))

    const params = { Bucket: bucketName, Delete: { Objects: objects } }

    await s3.deleteObjects(params).promise()
  }

  static uploadFile (bucketName, filePath) {
    const filename = path.parse(filePath).base

    const fileContent = fs.readFileSync(filePath)
    const params = {
      Body: fileContent,
      Bucket: bucketName,
      Key: filename
    }

    return s3.upload(params).promise()
  }

  static async downladFile (bucketName, filename, localPath) {
    const params = {
      Bucket: bucketName,
      Key: filename
    }

    const data = await s3.getObject(params).promise()
    fs.writeFileSync(localPath + filename, data.Body)
  }

  static async listFilesInBucket (name) {
    const params = {
      Bucket: name
    }

    const result = await s3.listObjectsV2(params).promise()
    return result.Contents.map((item) => item.Key)
  }
}

module.exports = S3Aws
