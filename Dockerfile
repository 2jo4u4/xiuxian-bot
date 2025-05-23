ARG DENO_VERSION="2.3.3"

FROM denoland/deno:${DENO_VERSION}
LABEL author="BYS"
LABEL image.version="0.1.0" image.title="The deno of execute"
WORKDIR /app
COPY ./src/deps.ts .
RUN deno cache --allow-import deps.ts
COPY . .
RUN deno cache --allow-import ./src/main.ts
RUN chown -R deno:deno /app
USER deno
# ENTRYPOINT [ "sleep", "infinity"]
# CMD [ "run","--allow-net","--allow-read","--allow-write","--allow-env","./src/main.ts" ]
CMD ["task","exec"]