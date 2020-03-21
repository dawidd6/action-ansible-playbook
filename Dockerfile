FROM alpine

RUN apk -U add ansible bind-tools

COPY main.sh /

ENTRYPOINT ["/main.sh"]
