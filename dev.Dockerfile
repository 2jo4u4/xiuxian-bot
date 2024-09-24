ARG DENO_VERSION="1.46.3"

FROM denoland/deno:${DENO_VERSION}
LABEL author="BYS"
LABEL image.version="0.1.0" image.title="The deno of development"
# USER deno
WORKDIR /workspace
CMD [ "sleep", "infinity"]