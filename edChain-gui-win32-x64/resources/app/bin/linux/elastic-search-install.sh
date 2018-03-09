#!/bin/bash
#install and start elastic search
cd ../../
mkdir elastic-search
cd elastic-search
curl -L -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.2.0.tar.gz
tar -xvf elasticsearch-6.2.0.tar.gz
cd elasticsearch-6.2.0/bin
./elasticsearch