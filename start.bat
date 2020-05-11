call yarn

@echo off
echo REACT_APP_file1=%1 >.env
echo REACT_APP_file2=%2 >>.env
echo REACT_APP_file3=%3 >>.env

call yarn electron-dev-windows
