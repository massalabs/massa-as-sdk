#!/bin/bash
set -ex

PACKAGE_NAME=$(cat package.json | jq -r '.name')
PUBLISH_VERSION=$(cat package.json | jq -r '.version')

npm dist-tag add "$PACKAGE_NAME@2.1.0" buildnet
npm dist-tag add "$PACKAGE_NAME@2.1.0" testnet
