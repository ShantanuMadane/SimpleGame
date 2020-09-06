#!/bin/bash

pm2 flush > /dev/null
echo "flush logs OK"
pm2 reload 1 > /dev/null
echo "reload 1 OK"
sleep 1.1s
pm2 reload 4 > /dev/null
echo "reload 4 OK"
#sleep 0.1s
pm2 status
#sleep 0.2s
pm2 logs