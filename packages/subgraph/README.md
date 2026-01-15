`sov` is a working name, subject to replace.

```shell
npm install -g @graphprotocol/graph-cli
docker compose up -d
export NODE=http://localhost:8020
graph create -g $NODE sov
yarn codegen
graph deploy -g $NODE --ipfs http://localhost:5001 -l v0.0.1 sov
```
