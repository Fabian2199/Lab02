#!/bin/bash

echo Running server...;docker run -p $1:8100 -d server-v1;

exit