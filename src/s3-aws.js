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

  static uploadFile (bucketName, filePath, filename) {
    const key = filename || path.parse(filePath).base

    const fileContent = fs.readFileSync(filePath)
    const params = {
      Body: fileContent,
      Bucket: bucketName,
      Key: key
    }

    return s3.upload(params).promise()
  }

  static readFile ({ bucketName, filename }) {
    const params = {
      Bucket: bucketName,
      Key: filename
    }

    return s3.getObject(params).promise()
  }

  static async downloadFile (bucketName, filename, localPath) {
    const data = await this.readFile({ bucketName, filename })
    const pathFile = path.join(localPath, filename)
    fs.writeFileSync(pathFile, data.Body)
  }

  static async listFilesInBucket (name) {
    const params = {
      Bucket: name
    }

    const result = await s3.listObjectsV2(params).promise()
    return result.Contents.map((item) => item.Key)
  }

  static checkBucketExists (bucketName) {
    const options = {
      Bucket: bucketName
    }

    return s3.headBucket(options).promise()
  }
}

module.exports = S3Aws
