FROM alpine

RUN apk -U add ansible bash

COPY main.sh /

ENTRYPOINT ["/main.sh"]
