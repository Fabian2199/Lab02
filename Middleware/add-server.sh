#!/bin/bash

echo Running server...;docker run -p $1:4000 -d server-01;

exit