#!/bin/bash

pm2 flush > /dev/null
echo "flush logs OK"
pm2 reload all > /dev/null
echo "reload OK"
#sleep 0.1s
pm2 status
#sleep 0.2s
pm2 logs