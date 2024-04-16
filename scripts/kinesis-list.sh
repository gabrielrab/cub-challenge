stream_name="notification"
endpoint_url="http://localhost:4566"
profile="localstack"

shard_id=$(aws kinesis describe-stream --stream-name $stream_name --endpoint-url $endpoint_url --profile $profile --query "StreamDescription.Shards[0].ShardId" --output text)

shard_iterator=$(aws kinesis get-shard-iterator --stream-name $stream_name --shard-id $shard_id --shard-iterator-type TRIM_HORIZON --endpoint-url $endpoint_url --profile $profile --query 'ShardIterator' --output text)

aws kinesis get-records --shard-iterator $shard_iterator --endpoint-url $endpoint_url --profile $profile
