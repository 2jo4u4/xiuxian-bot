
### exec the program
```
deno task start
```

### create development on docker
1. build the iamge
```
    docker build --rm -t xiuian-dev -f dev.Dockerfile .
```
2. run the container
```
    docker run -dit -v `pwd`/:/workspace --name xiuianC  xiuian-dev
```

### run the program on docker
1. build the image
```
    docker build --rm -t xiuian -f Dockerfile .
```
2. run the container
```
    docker run  xiuian
```