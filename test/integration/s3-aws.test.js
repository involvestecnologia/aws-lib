const { S3 } = require('../../index')
const { s3: s3AwsClient } = require('../../src/aws-client')

const assert = require('assert').strict
const path = require('path')
const fs = require('fs')

const BUCKET_NAME = 'bucket-test-integration'
const FILE_PATH = path.join(__dirname, '/assets/index.csv')
const FILE_KEY = 'index.csv'
const LOCAL_PATH = '/data/tmp/'

describe('Integration tests for s3', function () {
  beforeEach(async function () {
    await S3.createBucket(BUCKET_NAME)
  })

  afterEach(async function () {
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

    const params = { Bucket: BUCKET_NAME, Key: FILE_KEY }

    await s3AwsClient.deleteObject(params).promise()
  })

  it('should list files in bucket', async function () {
    const files = await S3.listFilesInBucket(BUCKET_NAME)

    await S3.uploadFile(BUCKET_NAME, FILE_PATH)

    let filesAfter = []

    await assert.doesNotReject(async () => {
      filesAfter = await S3.listFilesInBucket(BUCKET_NAME)
    })

    assert(files.length < filesAfter.length)

    const params = { Bucket: BUCKET_NAME, Key: FILE_KEY }

    await s3AwsClient.deleteObject(params).promise()
  })

  it('should delete file', async function () {
    await S3.uploadFile(BUCKET_NAME, FILE_PATH)

    const files = await S3.listFilesInBucket(BUCKET_NAME)

    await assert.doesNotReject(S3.deleteFile(BUCKET_NAME, FILE_KEY))

    const filesAfter = await S3.listFilesInBucket(BUCKET_NAME)

    assert(files.length > filesAfter.length)
  })

  it('should download file', async function () {
    await S3.uploadFile(BUCKET_NAME, FILE_PATH)

    await assert.doesNotReject(S3.downladFile(BUCKET_NAME, FILE_KEY, LOCAL_PATH))

    assert(fs.existsSync(LOCAL_PATH + FILE_KEY))

    fs.unlinkSync(LOCAL_PATH + FILE_KEY)

    await S3.deleteFile(BUCKET_NAME, FILE_KEY)
  })
})
