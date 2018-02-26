#!/bin/bash
#java
mkdir ../../java
cd ../../java
#wget --no-check-certificate -c --header "Cookie: oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/8u161-b12/2f38c3b165be4555a1fa6e98c45e0808/jdk-8u161-linux-i586.tar.gz
#tar -xvf jdk-8u161-linux-i586.tar.gz
cd jdk1.8.0_161
path_java=$(pwd)
echo $path_java
JAVA_HOME=$path_java
export JAVA_HOME
#env JAVA_HOME=$path_java
#export JAVA_HOME=$path_java
#export PATH=$ JAVA_HOME /bin:$PATH
echo "JAVA_HOME" $JAVA_HOME


