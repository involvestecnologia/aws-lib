const { S3 } = require('../../index')

const assert = require('assert').strict

describe('Integration tests for s3', function () {
  it('should upload file', function () {
    assert.doesNotReject(S3.upload)
  })
})
