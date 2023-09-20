#!/bin/bash
set -ex

PACKAGE_NAME=$(cat package.json | jq -r '.name')
PUBLISH_VERSION=$(cat package.json | jq -r '.version')


npm dist-tag add "$PACKAGE_NAME@$PUBLISH_VERSION" buildnet
# npm dist-tag rm "$PACKAGE_NAME@2.3.0" testnet
# npm dist-tag rm "$PACKAGE_NAME@2.1.1-dev.20230626132010" buildnet-dev
