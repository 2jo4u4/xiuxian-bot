ARG DENO_VERSION="1.46.3"

FROM denoland/deno:${DENO_VERSION}
LABEL author="BYS"
LABEL image.version="0.1.0" image.title="The deno of execute"
USER deno
WORKDIR /app
COPY ./src/deps.ts .
RUN deno cache deps.ts
COPY . .
RUN deno cache ./src/main.ts
# ENTRYPOINT [ "sleep", "infinity"]
# CMD [ "run","--allow-net","--allow-read","--allow-write","--allow-env","./src/main.ts" ]
CMD ["task","start"]