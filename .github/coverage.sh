#!/bin/bash

color="red"

if [ "$coverage" -ge 80 ]; then
    color="green"
elif [ "$coverage" -ge 70 ]; then
    color="orange"
fi

filename="README.md"

coverageLine=$(sed -n '3p' $filename)

regex="coverage-([0-9]+)%"

if [[ $coverageLine =~ $regex ]]; then
    oldCoverage="${BASH_REMATCH[1]}"
    echo "Coverage is $coverage%"
else
    echo "No coverage found"
fi

if [ "$oldCoverage" != "$coverage" ] || [ -z "$oldCoverage" ]; then
    echo "Updating badge"
    newLine="![check-code-coverage](https://img.shields.io/badge/coverage-$coverage%25-$color)"
    sed -i "3s#.*#${newLine}#" $filename
fi