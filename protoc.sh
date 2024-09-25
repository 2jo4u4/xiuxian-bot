#!/usr/bin/env bash
SRCPATH=protobuf
OUTPATH=src/definition
rm -rf $OUTPATH/*
pb gen ts --entry-path $SRCPATH --proto-path $SRCPATH --out-dir $OUTPATH `ls $SRCPATH`