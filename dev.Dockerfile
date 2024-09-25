ARG DENO_VERSION="1.46.3"
FROM denoland/deno:${DENO_VERSION}
LABEL author="BYS"
LABEL image.version="0.1.0" image.title="The deno of development"
# install pb toolkit
RUN apt update && apt install -y git
WORKDIR /
RUN git clone https://github.com/pbkit/pbkit.git
RUN deno install -n pb -A --unstable pbkit/cli/pb/entrypoint.ts
# USER deno
WORKDIR /workspace
CMD [ "sleep", "infinity"]