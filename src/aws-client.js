const AWS = require('aws-sdk')

module.exports = {
  s3: new AWS.S3({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    endpoint: process.env.LOCALSTACK_URL || undefined,
    s3ForcePathStyle: true
  })
}
