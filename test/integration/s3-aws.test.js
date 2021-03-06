const { S3 } = require('../../index')
const { s3: s3AwsClient } = require('../../src/aws-client')

const assert = require('assert').strict
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const BUCKET_NAME = 'bucket-test-integration'
const FILE_PATH = path.join(__dirname, '/assets/index.csv')
const FILE2_PATH = path.join(__dirname, '/assets/index2.csv')
const FILE_KEY = 'index.csv'
const LOCAL_PATH = '/data/tmp/'

describe('Integration tests for s3', function () {
  beforeEach(async function () {
    await S3.createBucket(BUCKET_NAME)
  })

  afterEach(async function () {
    await S3.deleteAnyFilesInBucket(BUCKET_NAME)

    await S3.deleteBucket(BUCKET_NAME)
  })

  it('should create bucket', async function () {
    const bucketName = 'my-bucket-test-integration'
    await assert.doesNotReject(S3.createBucket(bucketName))
    const listBuckets = await s3AwsClient.listBuckets({}).promise()
    const bucketsNames = listBuckets.Buckets.map((item) => item.Name)

    assert(bucketsNames.includes(bucketName))

    const params = {
      Bucket: bucketName
    }

    await s3AwsClient.deleteBucket(params).promise()
  })

  it('should delete bucket', async function () {
    const bucketName = 'my-bucket-test-integration'

    const params = {
      Bucket: bucketName
    }

    await s3AwsClient.createBucket(params).promise()

    await assert.doesNotReject(S3.deleteBucket(bucketName))
  })

  it('should upload file', async function () {
    await assert.doesNotReject(S3.uploadFile(BUCKET_NAME, FILE_PATH))

    const files = await S3.listFilesInBucket(BUCKET_NAME)

    assert(files.includes(FILE_KEY))
  })

  it('should upload file with another name', async function () {
    const filename = 'integration-test-another-name.csv'
    await assert.doesNotReject(S3.uploadFile(BUCKET_NAME, FILE_PATH, filename))

    const files = await S3.listFilesInBucket(BUCKET_NAME)

    assert(files.includes(filename))
  })

  it('should delete any files in bucket', async function () {
    await S3.uploadFile(BUCKET_NAME, FILE_PATH)
    await S3.uploadFile(BUCKET_NAME, FILE2_PATH)

    await assert.doesNotReject(S3.deleteAnyFilesInBucket(BUCKET_NAME))

    const files = await S3.listFilesInBucket(BUCKET_NAME)

    assert(files.length === 0)
  })

  it('should list files in bucket', async function () {
    await S3.uploadFile(BUCKET_NAME, FILE_PATH)

    let files = []

    await assert.doesNotReject(async () => {
      files = await S3.listFilesInBucket(BUCKET_NAME)
    })

    assert(files.includes(FILE_KEY))
  })

  it('should read file', async function () {
    await S3.uploadFile(BUCKET_NAME, FILE_PATH)

    let content = {}

    await assert.doesNotReject(async () => {
      content = await S3.readFile({
        bucketName: BUCKET_NAME,
        filename: FILE_KEY
      })
    })

    const localContent = fs.readFileSync(FILE_PATH)

    assert.equal(content.Body.toString(), localContent.toString())
  })

  it('should download file', async function () {
    const hashAfterUpload = _getHashFile(FILE_PATH)
    await S3.uploadFile(BUCKET_NAME, FILE_PATH)

    await assert.doesNotReject(S3.downloadFile(BUCKET_NAME, FILE_KEY, LOCAL_PATH))

    assert(fs.existsSync(LOCAL_PATH + FILE_KEY))

    const hashAfterDownload = _getHashFile(LOCAL_PATH + FILE_KEY)

    assert.equal(hashAfterDownload, hashAfterUpload)

    fs.unlinkSync(LOCAL_PATH + FILE_KEY)
  })

  it('should return bucket exists', async function () {
    await assert.doesNotReject(S3.checkBucketExists(BUCKET_NAME))
  })

  it('should return error in bucket exists when bucket doesnt exist', async function () {
    await assert.rejects(S3.checkBucketExists('another-bucket'))
  })
})

const _getHashFile = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath)
  const hashSum = crypto.createHash('sha256')
  hashSum.update(fileBuffer)

  return hashSum.digest('hex')
}
