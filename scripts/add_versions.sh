#!/bin/bash
set -ex

PACKAGE_NAME=$(cat package.json | jq -r '.name')
PUBLISH_VERSION=$(cat package.json | jq -r '.version')


npm dist-tag add "$PACKAGE_NAME@$PUBLISH_VERSION" buildnet
npm rm "$PACKAGE_NAME@2.3.0" testnet

