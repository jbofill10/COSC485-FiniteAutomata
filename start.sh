#!/bin/sh

/bin/cat <<EOM >.env
REACT_APP_file1=$1
REACT_APP_file2=$2
REACT_APP_file3=$3
EOM

yarn electron-dev
