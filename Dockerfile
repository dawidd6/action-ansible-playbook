FROM alpine

RUN apk -U add ansible

COPY main.sh /

ENTRYPOINT ["/main.sh"]
