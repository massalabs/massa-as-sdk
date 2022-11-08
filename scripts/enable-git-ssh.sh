#!/bin/bash

set-git-ssh () {
    if [[ -n "$CI" ]];then
        ssh -o StrictHostKeyChecking=no git@github.com || echo "connected"
        git config user.email "massa-as-sdk-ci@massa.net"
        git config user.name "massa-as-sdk-ci"
    fi
}

